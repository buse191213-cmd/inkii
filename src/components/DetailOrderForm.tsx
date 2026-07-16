"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useMerkliste } from "@/components/MerklisteProvider";
import { useCart } from "@/components/CartProvider";
import { colorHex, colorLabel } from "@/lib/catalog-options";
import type { ProductSize } from "@/lib/sizes";
import type { PriceTier } from "@/lib/price-tiers";

import type { Dictionary } from "@/dictionaries/types";

type Props = {
  productId: string;
  productCode: string;
  productName: string;
  productImage: string | null;
  colors: string[];
  sizes: ProductSize[];
  tiers: PriceTier[];
  basePriceCents: number | null;
  transferPriceCents?: number;
  minOrderQty?: number;
  colorImages?: Record<string, string[]>;
  t?: Dictionary["detailForm"];
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

// Fallback (Almanca) — prop gelmezse
const DEFAULT_T: Dictionary["detailForm"] = {
  title: "Farbe, Menge & Design wählen",
  subtitle: "Sie können die Größen in Ihrem Warenkorb auswählen.",
  color: "Farbe", colorTip: "", quantity: "{t.quantity}", sizesInCart: "Größen wählen Sie im Warenkorb",
  staffelpreise: "Staffelpreise", inklTransfer: "inkl. Transfer", current: "Aktuell", perStueck: "/ Stück",
  spart: "Spart", pricesInklTransfer: "Preise inkl. Transfer", choosePersonalization: "Personalisierungstechnik auswählen",
  transfer: "Transfer", dtfDruck: "(DTF-Druck)", transferDesc: "Hochwertiger Textiltransfer",
  uploadDesignFirst: "Bitte laden Sie oben ein Design hoch.", front: "Vorderseite", back: "Rückseite",
  productionTime: "Produktionszeit:", productionDays: "5–10 Werktage", gesamt: "Gesamt:",
  uploadForPrice: "Laden Sie Ihr Design hoch.", inklMwst: "inkl. MwSt.", notesPlaceholder: "Anmerkungen … (optional)",
  addToCart: "In den Warenkorb", updateVariant: "Variante aktualisieren", addedToCart: "Zum Warenkorb hinzugefügt.",
  openCart: "Warenkorb öffnen →", minQtyEnter: "Bitte eine Menge eintragen.", enterQty: "Bitte eine Menge eintragen.",
  minQtyWarn: "Mindestmenge {n}.", minOrderQty: "Mindestbestellmenge:", stueck: "Stück", noch: "noch",
};

export default function DetailOrderForm({
  productId,
  productCode,
  productName,
  productImage,
  colors,
  sizes,
  tiers,
  basePriceCents,
  transferPriceCents = 900,
  minOrderQty = 1,
  colorImages,
  t = DEFAULT_T,
}: Props) {
  const { addOrUpdate, has } = useMerkliste();
  const { addItem: addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Seçili renge göre ürün görseli (renk değişince sepete doğru görsel gider)
  const effectiveImage = useMemo(() => {
    if (selectedColor && colorImages) {
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const target = norm(selectedColor);
      const key = Object.keys(colorImages).find((k) => norm(k) === target);
      const imgs = key ? colorImages[key] : null;
      if (imgs && imgs.length > 0) return imgs[0];
    }
    return productImage;
  }, [selectedColor, colorImages, productImage]);
  const [qty, setQty] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    // Startmenge = Mindestbestellmenge (oder 1) — so ist „Gesamt" sofort
    // gefüllt statt leer („—"), was den ersten Eindruck verbessert.
    const startQty = minOrderQty > 1 ? minOrderQty : 1;
    sizes.forEach((s) => (init[s.name] = 0));
    if (sizes.length === 0) init["__default"] = startQty;
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
  const [designMockups, setDesignMockups] = useState<{ front: string | null; back: string | null }>({ front: null, back: null });
  const [designSizes, setDesignSizes] = useState<{ front: { widthCm: number; heightCm: number } | null; back: { widthCm: number; heightCm: number } | null }>({ front: null, back: null });

  // Galeriden design güncellemelerini dinle
  useEffect(() => {
    function onDesigns(e: Event) {
      const ce = e as CustomEvent<{
        front: { imageDataUrl: string; sizeCm?: { widthCm: number; heightCm: number }; mockupDataUrl?: string | null; placement?: { x: number; y: number; width: number; rotation: number } } | null;
        back: { imageDataUrl: string; sizeCm?: { widthCm: number; heightCm: number }; mockupDataUrl?: string | null } | null;
      }>;
      if (ce.detail) {
        setDesigns({ front: !!ce.detail.front, back: !!ce.detail.back });
        setDesignUrls({
          front: ce.detail.front?.imageDataUrl || null,
          back: ce.detail.back?.imageDataUrl || null,
        });
        setDesignMockups({
          front: ce.detail.front?.mockupDataUrl || null,
          back: ce.detail.back?.mockupDataUrl || null,
        });
        setDesignSizes({
          front: ce.detail.front?.sizeCm || null,
          back: ce.detail.back?.sizeCm || null,
        });
        // Design eklendiyse transfer otomatik aktif
        if (ce.detail.front || ce.detail.back) {
          setTransferEnabled(true);
        }
        // Vorschau auf „Das könnte Ihnen gefallen"-Karten aktualisieren
        // (Vorderseiten-Logo an derselben Position wie im Konfigurator)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("inkii-design-preview", {
              detail: {
                logoUrl: ce.detail.front?.imageDataUrl || null,
                placement: ce.detail.front?.placement || null,
              },
            })
          );
        }
      }
    }
    window.addEventListener("designs-updated", onDesigns as EventListener);
    return () => window.removeEventListener("designs-updated", onDesigns as EventListener);
  }, []);

  // Transfer maliyeti: her taraf için 9€
  const transferSidesCount = (designs.front ? 1 : 0) + (designs.back ? 1 : 0);
  const transferCostCents = transferEnabled ? transferSidesCount * transferPriceCents : 0;

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

  // Fiyatı olmayan ürün (Preis auf Anfrage) sepete eklenemez — sadece Angebot.
  // Aksi halde müşteri sadece DTF+Versand ödeyip ürünü bedava alabilirdi.
  const hasPrice = (basePriceCents != null && basePriceCents > 0) ||
                   (tiers.length > 0 && tiers.some((tier) => tier.cents > 0));

  const subtotalCents = useMemo(() => {
    if (unitCents == null) return null;
    // YENİ AKIŞ (2026): Bedenler sepette dağıtılıyor, formda TEK adet var.
    // Bu yüzden Gesamt = toplam adet × aktif tier fiyatı (base).
    // Beden özel fiyatları sepette hesaplanır (burada henüz beden yok).
    return totalQty * unitCents;
  }, [totalQty, unitCents]);

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
      setErr(t.minQtyEnter);
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
      image: effectiveImage,
      qty: totalQty,
      sizes: sizeList,
      note: note.trim() || undefined,
      color: selectedColor,
      colorLabel: selectedColor ? colorLabel(selectedColor) : null,
    });
    setAdded(true);
    // Header informieren → Warenkorb-Drawer öffnet sich als Bestätigung
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("inkii-cart-added"));
    }
  }

  function handleAddToCart() {
    setErr("");
    if (totalQty === 0) {
      setErr(t.enterQty);
      return;
    }
    if (totalQty < minOrderQty) {
      setErr(t.minQtyWarn.replace("{n}", String(minOrderQty)));
      return;
    }
    // HAM base fiyat (priceCents) — ratio uygulanmadan. Sepet dinamik hesaplar.
    const rawBaseCents = basePriceCents ?? unitCents ?? 0;

    // Transfer bilgisi (design + fiyat)
    const dtfSizeLabel = transferEnabled && transferSidesCount > 0
      ? [designs.front ? t.front : null, designs.back ? t.back : null].filter(Boolean).join(" + ")
      : "";
    const dtfDesignCombined = transferEnabled
      ? JSON.stringify({
          front: designUrls.front,
          back: designUrls.back,
          frontSize: designSizes.front,
          backSize: designSizes.back,
          frontMockup: designMockups.front,
          backMockup: designMockups.back,
        })
      : "";

    // TEK cart item — bedenler sepette girilecek
    const availableSizes = sizes.map((s) => s.name);
    // Beden HAM özel fiyatları (extraCents > 0 olanlar): {"2XL": 2500}
    const sizePrices: Record<string, number> = {};
    for (const s of sizes) {
      if (s.extraCents && s.extraCents > 0) {
        sizePrices[s.name] = s.extraCents;
      }
    }
    addToCart({
      productId,
      productCode,
      productName,
      productImage: effectiveImage ?? "",
      color: selectedColor ?? "",
      size: "",
      quantity: totalQty,
      unitPriceCents: rawBaseCents, // HAM base — sepet tier'ı kendi hesaplar
      minOrderQty,
      availableSizes: availableSizes.length > 0 ? availableSizes : undefined,
      sizePrices: Object.keys(sizePrices).length > 0 ? sizePrices : undefined,
      sizeBreakdown: undefined, // sepette doldurulacak
      priceTiers: tiers.length > 0 ? tiers.map((tr) => ({ qty: tr.qty, cents: tr.cents })) : undefined,
      hasDtf: transferEnabled && transferSidesCount > 0,
      dtfSize: dtfSizeLabel,
      dtfPriceCents: transferCostCents,
      dtfDesignUrl: dtfDesignCombined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 6000);
  }

  const alreadyOn = has(productId, selectedColor);

  return (
    <div className="det-order">
      <div className="det-order-head">
        <h3>{t.title}</h3>
        <p>{t.subtitle}</p>
      </div>

      {/* Farbauswahl */}
      {colors.length > 0 && (
        <div className="det-order-colors">
          <div className="det-order-colors-head">
            <span className="det-order-colors-label">{t.color}</span>
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
              {t.colorTip}
            </p>
          )}
        </div>
      )}

      {/* Menge — tek adet girişi (bedenler sepette dağıtılır) */}
      <div className="det-order-qty-single">
        <label>
          <span className="det-order-qty-label">
            {t.quantity}
            {sizes.length > 0 && (
              <span className="det-order-qty-hint">{t.sizesInCart}</span>
            )}
          </span>
          <div
            className="det-order-qty-input"
            style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, width: "100%" }}
          >
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={qty["__default"] || ""}
              onChange={(e) => setSizeQty("__default", parseInt(e.target.value || "0", 10))}
              placeholder={minOrderQty > 1 ? `min. ${minOrderQty}` : "0"}
              style={{ flex: "1 1 auto", minWidth: 0 }}
            />
            <span
              className="det-order-qty-unit"
              style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            >
              Stück
            </span>
          </div>
        </label>
      </div>

      {/* Staffelpreise — aktif tier işaretli */}
      {tiers.length > 0 && (
        <div className="det-staffel">
          <div className="det-staffel-head">
            <span>{t.staffelpreise}{transferCostCents > 0 ? ` ${t.inklTransfer}` : ""}</span>
            {totalQty > 0 && activeTier && (
              <span className="det-staffel-active-hint">
                {t.current}: ab {activeTier.qty} {t.stueck}
              </span>
            )}
          </div>
          <div className="det-staffel-list">
            {tiers.map((tier, i) => {
              const isActive = activeTier?.qty === tier.qty;
              // Transfer aktifse stück fiyatına ekle
              const unitWithTransfer = tier.cents + transferCostCents;
              // Aktif tier ise kullanıcının GERÇEK adedi, diğerleri tier referans adedi
              const rowQty = isActive && totalQty > 0 ? totalQty : tier.qty;
              const total = rowQty * unitWithTransfer;
              const base = basePriceCents && basePriceCents > 0 ? basePriceCents : tiers[0].cents;
              const discount = base > 0 && tier.cents < base
                ? Math.round(((base - tier.cents) / base) * 100)
                : 0;
              return (
                <div key={i} className={`det-staffel-row${isActive ? " active" : ""}`}>
                  <div className="det-staffel-check" aria-hidden>
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                  <div className="det-staffel-qty">{isActive && totalQty > 0 ? `${totalQty}` : tier.qty} {t.stueck}</div>
                  <div className="det-staffel-unit">€{euro(unitWithTransfer)} {t.perStueck}</div>
                  <div className="det-staffel-spart">
                    {discount > 0 && <span className="det-staffel-badge">{t.spart} {discount}%</span>}
                  </div>
                  <div className="det-staffel-total">€{euro(total)}</div>
                </div>
              );
            })}
          </div>
          {transferCostCents > 0 && (
            <div className="det-staffel-transfer-note">
              {t.pricesInklTransfer} ({[designs.front ? t.front : null, designs.back ? t.back : null].filter(Boolean).join(" + ")})
            </div>
          )}
        </div>
      )}

      {/* Personalisierungstechnik — Transfer (DTF) */}
      <div className="det-transfer">
        <div className="det-transfer-head">
          <span className="det-transfer-title">{t.choosePersonalization}</span>
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
              {t.transfer} <span className="det-transfer-tech">{t.dtfDruck}</span>
            </span>
            <span className="det-transfer-desc">
              {t.transferDesc}
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
                <span>{t.uploadDesignFirst}</span>
              </div>
            ) : (
              <>
                {designs.front && (
                  <div className="det-transfer-side-row">
                    <span className="det-transfer-side-label">
                      <span className="det-transfer-side-dot" />
                      Vorderseite
                    </span>
                    <span className="det-transfer-side-check" aria-hidden>✓</span>
                  </div>
                )}
                {designs.back && (
                  <div className="det-transfer-side-row">
                    <span className="det-transfer-side-label">
                      <span className="det-transfer-side-dot" />
                      Rückseite
                    </span>
                    <span className="det-transfer-side-check" aria-hidden>✓</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Totalanzeige — Produktionszeit + Gesamt (inkl. MwSt) */}
      <div className="det-order-summary">
        {minOrderQty > 1 && (
          <div className={`det-summary-min${totalQty > 0 && totalQty < minOrderQty ? " warn" : ""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            {t.minOrderQty} <strong>{minOrderQty} {t.stueck}</strong>
            {totalQty > 0 && totalQty < minOrderQty && (
              <span className="det-summary-min-need"> · {t.noch} {minOrderQty - totalQty} {t.stueck}</span>
            )}
          </div>
        )}
        <div className="det-summary-row">
          <span className="det-summary-lbl">{t.productionTime}</span>
          <span className="det-summary-val">{t.productionDays}</span>
        </div>
        <div className="det-summary-row det-summary-total">
          <span className="det-summary-lbl">{t.gesamt}</span>
          <span className="det-summary-val-big">
            {totalQty > 0 && subtotalCents != null
              ? `${euro(subtotalCents + transferCostCents * totalQty)} €`
              : "—"}
          </span>
        </div>
        {transferEnabled && transferSidesCount === 0 && (
          <div className="det-summary-hint">
            {t.uploadForPrice}
          </div>
        )}
        <div className="det-summary-vat">{t.inklMwst}</div>
      </div>

      {/* Anmerkungen */}
      <textarea
        className="det-order-input det-order-textarea"
        placeholder={t.notesPlaceholder}
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
          <span>{t.addedToCart}</span>
          <Link href="/warenkorb" className="det-order-success-link">{t.openCart}</Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Fiyatlı ürün → normal sepete ekle.
            Fiyatsız ürün → yine sepete eklenir, ama „Angebot" akışı için:
            Kunde stellt im Warenkorb eine Anfrage (mit Design/Mockup),
            Kauf ist serverseitig blockiert. */}
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
          {hasPrice ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="20" cy="21" r="1.5" />
              <path d="M3 3h2l3 13h12l3-9H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v12H5.17L4 17.17V4z" />
              <path d="M8 9h8M8 12h5" />
            </svg>
          )}
          {hasPrice
            ? (alreadyOn ? t.updateVariant : t.addToCart)
            : "Zum Angebot hinzufügen"}
          {totalQty > 0 ? ` · ${totalQty} Stk` : ""}
          {selectedColor ? ` · ${colorLabel(selectedColor)}` : ""}
        </button>

        {!hasPrice && (
          <p style={{ fontSize: ".72rem", color: "#9ea7a2", margin: 0, textAlign: "center", lineHeight: 1.4 }}>
            Preis auf Anfrage — im Warenkorb erstellen wir Ihnen ein individuelles Angebot.
          </p>
        )}
      </div>
    </div>
  );
}
