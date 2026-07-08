"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useMerkliste } from "@/components/MerklisteProvider";
import { useCart } from "@/components/CartProvider";
import { colorHex, colorLabel } from "@/lib/catalog-options";
import type { ProductSize } from "@/lib/sizes";
import type { PriceTier } from "@/lib/price-tiers";

type Props = {
  productId: string;
  productCode: string;
  productName: string;
  productImage: string | null;
  colors: string[];
  sizes: ProductSize[];
  tiers: PriceTier[];
  basePriceCents: number | null;
};

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function findTier(tiers: PriceTier[], qty: number): PriceTier | null {
  if (qty <= 0 || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.qty - b.qty);
  let match: PriceTier | null = null;
  for (const t of sorted) {
    if (qty >= t.qty) match = t;
  }
  return match;
}

// Transfer (DTF) fiyatı — sabit, taraf başına
const TRANSFER_PRICE_CENTS = 900; // 9,00 € pro Seite (Vorder-/Rückseite)

export default function DetailOrderForm({
  productId,
  productCode,
  productName,
  productImage,
  colors,
  sizes,
  tiers,
  basePriceCents,
}: Props) {
  const { addOrUpdate, has } = useMerkliste();
  const { addItem: addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    sizes.forEach((s) => (init[s.name] = 0));
    if (sizes.length === 0) init["__default"] = 0;
    return init;
  });
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState("");

  // Transfer (Personalisierung) — kullanıcı seçebilir
  const [transferEnabled, setTransferEnabled] = useState(false);
  // Galeriden gelen design'lar (Vorderseite/Rückseite)
  const [designs, setDesigns] = useState<{ front: boolean; back: boolean }>({ front: false, back: false });
  const [designUrls, setDesignUrls] = useState<{ front: string | null; back: string | null }>({ front: null, back: null });

  // Galeriden design güncellemelerini dinle
  useEffect(() => {
    function onDesigns(e: Event) {
      const ce = e as CustomEvent<{ front: { imageDataUrl: string } | null; back: { imageDataUrl: string } | null }>;
      if (ce.detail) {
        setDesigns({ front: !!ce.detail.front, back: !!ce.detail.back });
        setDesignUrls({
          front: ce.detail.front?.imageDataUrl || null,
          back: ce.detail.back?.imageDataUrl || null,
        });
        // Design eklendiyse transfer otomatik aktif
        if (ce.detail.front || ce.detail.back) {
          setTransferEnabled(true);
        }
      }
    }
    window.addEventListener("designs-updated", onDesigns as EventListener);
    return () => window.removeEventListener("designs-updated", onDesigns as EventListener);
  }, []);

  // Transfer maliyeti: her taraf için 9€
  const transferSidesCount = (designs.front ? 1 : 0) + (designs.back ? 1 : 0);
  const transferCostCents = transferEnabled ? transferSidesCount * TRANSFER_PRICE_CENTS : 0;

  // Galery'deki renk butonlarından gelen event'i dinle - state'i güncelle
  useEffect(() => {
    function onExternalColor(e: Event) {
      const ce = e as CustomEvent<{ color: string | null }>;
      if (ce.detail?.color) setSelectedColor(ce.detail.color);
    }
    window.addEventListener("external-color-select", onExternalColor as EventListener);
    return () => window.removeEventListener("external-color-select", onExternalColor as EventListener);
  }, []);

  // Wenn die Farbe wechselt, soll die Erfolgsmeldung verschwinden — Nutzer
  // beginnt eine neue Auswahl für die andere Farbvariante.
  useEffect(() => {
    setAdded(false);
    // ProductGallery'a renk değişikliğini bildir (scroll YAPMA - sticky galery yeterli)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("product-color-change", { detail: { color: selectedColor } })
      );
    }
  }, [selectedColor]);

  const totalQty = useMemo(
    () => Object.values(qty).reduce((s, n) => s + (n || 0), 0),
    [qty]
  );

  const activeTier = useMemo(() => findTier(tiers, totalQty), [tiers, totalQty]);
  const unitCents = activeTier?.cents ?? basePriceCents ?? null;

  const subtotalCents = useMemo(() => {
    if (unitCents == null) return null;
    // NEUE LOGIK (Mai 2026):
    // Das Feld `extraCents` einer Größe ist jetzt der ABSOLUTE Stückpreis dieser Größe.
    //   0  → wie Basispreis (kein Unterschied)
    //   >0 → eigener Stückpreis (z. B. XL kostet €1,50 statt €1,00 Basis)
    // Der Mengenrabatt aus den PriceTiers (z. B. 30 Stk → €0,85 statt €1,00)
    // wird ANTEILIG (Faktor = unitCents/basePriceCents) auf jeden Größen-Stückpreis übertragen.
    // Beispiel: Basis €1,00, 30-Stk-Staffel €0,85 (Faktor 0,85), XL Stückpreis €1,50
    //   → XL effektiv: €1,50 × 0,85 = €1,28/Stk
    const baseCents = basePriceCents ?? unitCents;
    const ratio = baseCents > 0 ? unitCents / baseCents : 1;
    let sum = 0;
    if (sizes.length === 0) {
      sum = (qty["__default"] || 0) * unitCents;
    } else {
      for (const s of sizes) {
        const q = qty[s.name] || 0;
        if (q > 0) {
          // Wenn extraCents=0 → Basispreis verwenden; sonst dieser absolute Stückpreis
          const sizePrice = s.extraCents > 0 ? s.extraCents : baseCents;
          const effectivePrice = Math.round(sizePrice * ratio);
          sum += q * effectivePrice;
        }
      }
    }
    return sum;
  }, [qty, sizes, unitCents, basePriceCents]);

  const baseCents = basePriceCents ?? unitCents ?? 0;
  const effectiveRatio =
    baseCents > 0 && unitCents != null ? unitCents / baseCents : 1;

  function setSizeQty(name: string, value: number) {
    setSizeQtyState(name, Math.max(0, Math.floor(value || 0)));
  }
  function setSizeQtyState(name: string, v: number) {
    setQty((cur) => ({ ...cur, [name]: v }));
    setAdded(false);
    setErr("");
  }

  function handleAdd() {
    setErr("");
    if (totalQty === 0) {
      setErr("Bitte mindestens eine Menge eintragen.");
      return;
    }
    const sizeList = sizes.length > 0
      ? sizes.filter((s) => (qty[s.name] || 0) > 0).map((s) => ({
          name: s.name,
          qty: qty[s.name] || 0,
          extraCents: s.extraCents || 0,
        }))
      : undefined;
    addOrUpdate({
      id: productId,
      code: productCode,
      name: productName,
      image: productImage,
      qty: totalQty,
      sizes: sizeList,
      note: note.trim() || undefined,
      color: selectedColor,
      colorLabel: selectedColor ? colorLabel(selectedColor) : null,
    });
    setAdded(true);
  }

  function handleAddToCart() {
    setErr("");
    if (totalQty === 0) {
      setErr("Bitte mindestens eine Menge eintragen.");
      return;
    }
    const priceCents = unitCents ?? 0; // null = 0 (Angebot wird erstellt)
    // Transfer bilgisi (design + fiyat)
    const dtfSizeLabel = transferEnabled && transferSidesCount > 0
      ? [designs.front ? "Vorne" : null, designs.back ? "Hinten" : null].filter(Boolean).join(" + ")
      : "";
    const dtfDesignCombined = transferEnabled
      ? JSON.stringify({ front: designUrls.front, back: designUrls.back })
      : "";
    // Pro Größe (oder Standard) eine Cart-Position anlegen
    if (sizes.length === 0) {
      addToCart({
        productId,
        productCode,
        productName,
        productImage: productImage ?? "",
        color: selectedColor ?? "",
        size: "",
        quantity: qty["__default"] || 0,
        unitPriceCents: priceCents,
        hasDtf: transferEnabled && transferSidesCount > 0,
        dtfSize: dtfSizeLabel,
        dtfPriceCents: transferCostCents,
        dtfDesignUrl: dtfDesignCombined,
      });
    } else {
      for (const s of sizes) {
        const q = qty[s.name] || 0;
        if (q > 0) {
          const sizePrice = s.extraCents > 0 ? s.extraCents : (basePriceCents ?? 0);
          const effective = priceCents > 0 ? Math.round(sizePrice * effectiveRatio) : 0;
          addToCart({
            productId,
            productCode,
            productName,
            productImage: productImage ?? "",
            color: selectedColor ?? "",
            size: s.name,
            quantity: q,
            unitPriceCents: effective,
            hasDtf: transferEnabled && transferSidesCount > 0,
            dtfSize: dtfSizeLabel,
            dtfPriceCents: transferCostCents,
            dtfDesignUrl: dtfDesignCombined,
          });
        }
      }
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  }

  const alreadyOn = has(productId, selectedColor);

  return (
    <div className="det-order">
      <div className="det-order-head">
        <h3>Variante wählen & merken</h3>
        <p>Wählen Sie Farbe und Wunschmengen — sammeln Sie alle Varianten auf dem Merkzettel. Die finale Anfrage senden Sie dort gebündelt ab.</p>
      </div>

      {/* Farbauswahl */}
      {colors.length > 0 && (
        <div className="det-order-colors">
          <div className="det-order-colors-head">
            <span className="det-order-colors-label">Farbe</span>
            {selectedColor && (
              <span className="det-order-color-name">{colorLabel(selectedColor)}</span>
            )}
          </div>
          <div className="det-order-colors-grid">
            {colors.map((c) => {
              const isActive = selectedColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  className={`det-color-tile${isActive ? " active" : ""}`}
                  style={{ background: colorHex(c) }}
                  title={colorLabel(c)}
                  aria-label={colorLabel(c)}
                  aria-pressed={isActive}
                  onClick={() => setSelectedColor(c)}
                >
                  {isActive && (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" className="det-color-check">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {colors.length > 1 && (
            <p className="det-order-colors-hint">
              Tipp: Andere Farben? Wählen Sie eine, fügen Sie sie hinzu, dann wechseln Sie die Farbe und fügen die nächste Variante hinzu.
            </p>
          )}
        </div>
      )}

      {/* Größen + Mengen */}
      {sizes.length > 0 ? (
        <div className="det-order-sizes">
          {sizes.map((s) => (
            <label key={s.name} className="det-order-size">
              <span className="det-order-size-name">{s.name}</span>
              {s.extraCents > 0 && s.extraCents !== baseCents && (
                <span className={`det-order-size-extra${s.extraCents < baseCents ? " neg" : ""}`}>
                  €{euro(s.extraCents)}<em>/Stk</em>
                  {effectiveRatio < 1 && (
                    <em className="det-extra-eff">
                      bei Menge: €{euro(Math.round(s.extraCents * effectiveRatio))}
                    </em>
                  )}
                </span>
              )}
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={qty[s.name] || ""}
                onChange={(e) => setSizeQty(s.name, parseInt(e.target.value || "0", 10))}
                placeholder="0"
              />
            </label>
          ))}
        </div>
      ) : (
        <div className="det-order-sizes single">
          <label className="det-order-size">
            <span className="det-order-size-name">Menge</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={qty["__default"] || ""}
              onChange={(e) => setSizeQty("__default", parseInt(e.target.value || "0", 10))}
              placeholder="0"
            />
          </label>
        </div>
      )}

      {/* Mengenstaffel Hinweis */}
      {tiers.length > 0 && (
        <div className="det-order-tier-hint">
          {tiers.map((t, i) => {
            const isActive = activeTier?.qty === t.qty;
            return (
              <div key={i} className={`det-tier-pill${isActive ? " active" : ""}`}>
                <span className="det-tier-qty">ab {t.qty} Stk</span>
                <span className="det-tier-price">€{euro(t.cents)}/Stk</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Personalisierungstechnik — Transfer (DTF) */}
      <div className="det-transfer">
        <div className="det-transfer-head">
          <span className="det-transfer-title">Personalisierungstechnik auswählen</span>
          {transferSidesCount > 0 && (
            <span className="det-transfer-badge">
              {transferSidesCount} × {euro(TRANSFER_PRICE_CENTS)} €
            </span>
          )}
        </div>

        <label className={`det-transfer-option${transferEnabled ? " active" : ""}`}>
          <input
            type="checkbox"
            checked={transferEnabled}
            onChange={(e) => setTransferEnabled(e.target.checked)}
          />
          <span className="det-transfer-check" aria-hidden>
            {transferEnabled ? "✓" : ""}
          </span>
          <span className="det-transfer-body">
            <span className="det-transfer-name">
              Transfer <span className="det-transfer-tech">(DTF-Druck)</span>
            </span>
            <span className="det-transfer-desc">
              Hochwertiger Textiltransfer · {euro(TRANSFER_PRICE_CENTS)} € pro Seite
            </span>
          </span>
        </label>

        {transferEnabled && (
          <div className="det-transfer-sides">
            {transferSidesCount === 0 ? (
              <div className="det-transfer-empty">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
                <span>Bitte laden Sie oben ein Design für Vorder- oder Rückseite hoch.</span>
              </div>
            ) : (
              <>
                {designs.front && (
                  <div className="det-transfer-side-row">
                    <span className="det-transfer-side-label">
                      <span className="det-transfer-side-dot" />
                      Vorderseite
                    </span>
                    <span className="det-transfer-side-price">{euro(TRANSFER_PRICE_CENTS)} €</span>
                  </div>
                )}
                {designs.back && (
                  <div className="det-transfer-side-row">
                    <span className="det-transfer-side-label">
                      <span className="det-transfer-side-dot" />
                      Rückseite
                    </span>
                    <span className="det-transfer-side-price">{euro(TRANSFER_PRICE_CENTS)} €</span>
                  </div>
                )}
                <div className="det-transfer-side-row det-transfer-side-total">
                  <span>Transfer gesamt (pro Stück)</span>
                  <span>{euro(transferCostCents)} €</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Totalanzeige */}
      <div className="det-order-total">
        <div>
          <span className="det-order-total-lbl">Gesamtmenge</span>
          <span className="det-order-total-val">{totalQty} Stück</span>
        </div>
        {subtotalCents != null && totalQty > 0 && (
          <div>
            <span className="det-order-total-lbl">Voraussichtl. Summe</span>
            <span className="det-order-total-val">
              €{euro(subtotalCents + transferCostCents * totalQty)}
            </span>
          </div>
        )}
      </div>

      {/* Anmerkungen */}
      <textarea
        className="det-order-input det-order-textarea"
        placeholder="Anmerkungen, Wunschveredelung, Logoplatzierung … (optional)"
        value={note}
        onChange={(e) => { setNote(e.target.value); setAdded(false); }}
        rows={3}
      />

      {err && <div className="det-order-err">{err}</div>}
      {added && (
        <div className="det-order-success-inline">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Auf den Merkzettel gelegt.</span>
          <Link href="/merkzettel" className="det-order-success-link">Merkzettel öffnen →</Link>
        </div>
      )}

      {addedToCart && (
        <div className="det-order-success-inline" style={{ background: "#dcfce7", borderColor: "#86efac" }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Zum Warenkorb hinzugefügt.</span>
          <Link href="/warenkorb" className="det-order-success-link">Warenkorb öffnen →</Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* TEK BUTON — sepete ekle (B2B: liste yap, sonra teklif veya satın al) */}
        <button
          type="button"
          className="det-order-submit"
          onClick={handleAddToCart}
          style={{
            background: "#004537",
            color: "#fff",
            border: "1px solid #004537",
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1.5" />
            <circle cx="20" cy="21" r="1.5" />
            <path d="M3 3h2l3 13h12l3-9H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {alreadyOn ? "Variante aktualisieren" : "In den Warenkorb"}
          {totalQty > 0 ? ` · ${totalQty} Stk` : ""}
          {selectedColor ? ` · ${colorLabel(selectedColor)}` : ""}
        </button>
      </div>
    </div>
  );
}
