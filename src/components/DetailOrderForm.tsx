"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useMerkliste } from "@/components/MerklisteProvider";
import type { ProductSize } from "@/lib/sizes";
import type { PriceTier } from "@/lib/price-tiers";

type Props = {
  productId: string;
  productCode: string;
  productName: string;
  productImage: string | null;
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
  sizes,
  tiers,
  basePriceCents,
}: Props) {
  const { addOrUpdate, has } = useMerkliste();
  const [qty, setQty] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    sizes.forEach((s) => (init[s.name] = 0));
    if (sizes.length === 0) init["__default"] = 0;
    return init;
  });
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState("");

  const totalQty = useMemo(
    () => Object.values(qty).reduce((s, n) => s + (n || 0), 0),
    [qty]
  );

  const activeTier = useMemo(() => findTier(tiers, totalQty), [tiers, totalQty]);
  const unitCents = activeTier?.cents ?? basePriceCents ?? null;

  const subtotalCents = useMemo(() => {
    if (unitCents == null) return null;
    let sum = 0;
    for (const s of sizes) {
      const q = qty[s.name] || 0;
      sum += q * (unitCents + (s.extraCents || 0));
    }
    if (sizes.length === 0) sum = (qty["__default"] || 0) * unitCents;
    return sum;
  }, [qty, sizes, unitCents]);

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
    });
    setAdded(true);
  }

  const alreadyOn = has(productId);

  return (
    <div className="det-order">
      <div className="det-order-head">
        <h3>Mengen festlegen & merken</h3>
        <p>Wählen Sie Ihre Wunschmengen und sammeln Sie sie auf dem Merkzettel. Die finale Anfrage senden Sie dort gebündelt ab.</p>
      </div>

      {/* Größen + Mengen */}
      {sizes.length > 0 ? (
        <div className="det-order-sizes">
          {sizes.map((s) => (
            <label key={s.name} className="det-order-size">
              <span className="det-order-size-name">{s.name}</span>
              {s.extraCents > 0 && (
                <span className="det-order-size-extra">+€{euro(s.extraCents)}</span>
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
        {alreadyOn ? "Merkzettel aktualisieren" : "Auf Merkzettel hinzufügen"}
        {totalQty > 0 ? ` (${totalQty} Stück)` : ""}
      </button>

      <p className="det-order-foot">
        Tipp: Sie können beliebig viele Produkte sammeln und in einer einzigen Anfrage gemeinsam senden.
      </p>
    </div>
  );
}
