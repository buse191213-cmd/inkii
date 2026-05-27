"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useMerkliste } from "@/components/MerklisteProvider";
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
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length > 0 ? colors[0] : null
  );
  const [qty, setQty] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    sizes.forEach((s) => (init[s.name] = 0));
    if (sizes.length === 0) init["__default"] = 0;
    return init;
  });
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState("");

  // Wenn die Farbe wechselt, soll die Erfolgsmeldung verschwinden — Nutzer
  // beginnt eine neue Auswahl für die andere Farbvariante.
  useEffect(() => {
    setAdded(false);
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

      {/* Totalanzeige */}
      <div className="det-order-total">
        <div>
          <span className="det-order-total-lbl">Gesamtmenge</span>
          <span className="det-order-total-val">{totalQty} Stück</span>
        </div>
        {subtotalCents != null && totalQty > 0 && (
          <div>
            <span className="det-order-total-lbl">Voraussichtl. Summe</span>
            <span className="det-order-total-val">€{euro(subtotalCents)}</span>
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

      <button type="button" className="det-order-submit" onClick={handleAdd}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {alreadyOn ? "Variante aktualisieren" : "Auf Merkzettel hinzufügen"}
        {totalQty > 0 ? ` · ${totalQty} Stk` : ""}
        {selectedColor ? ` · ${colorLabel(selectedColor)}` : ""}
      </button>

      <p className="det-order-foot">
        Tipp: Sie können beliebig viele Produkte sammeln und in einer einzigen Anfrage gemeinsam senden.
      </p>
    </div>
  );
}
