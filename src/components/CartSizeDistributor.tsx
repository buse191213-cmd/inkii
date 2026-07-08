"use client";

import { useCart } from "@/components/CartProvider";

type Props = {
  itemId: string;
  availableSizes: string[];
  sizeBreakdown: Record<string, number>;
  quantity: number;
  minOrderQty: number;
  sizePrices?: Record<string, number>;
  basePriceCents: number;
};

/**
 * Sepette beden dağıtımı — Merchery tarzı.
 * Kullanıcı toplam adedi bedenlere dağıtır (S:5, M:10, L:10...).
 * Beden özel fiyatı varsa gösterir, yoksa base (Staffel) fiyat.
 */
export default function CartSizeDistributor({
  itemId,
  availableSizes,
  sizeBreakdown,
  quantity,
  minOrderQty,
  sizePrices,
  basePriceCents,
}: Props) {
  const { updateSizeBreakdown } = useCart();

  const currentTotal = Object.values(sizeBreakdown).reduce((s, n) => s + (n || 0), 0);
  const remaining = quantity - currentTotal;
  const belowMin = currentTotal < minOrderQty;

  function setSize(size: string, value: number) {
    const next = { ...sizeBreakdown, [size]: Math.max(0, value) };
    updateSizeBreakdown(itemId, next);
  }

  function euro(c: number): string {
    return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="csd">
      <div className="csd-head">
        <span className="csd-title">Größen verteilen</span>
        <span className={`csd-counter${remaining !== 0 ? " off" : " ok"}`}>
          {currentTotal} / {quantity} Stk
          {remaining > 0 && <span className="csd-remaining"> · noch {remaining}</span>}
          {remaining < 0 && <span className="csd-over"> · {Math.abs(remaining)} zu viel</span>}
        </span>
      </div>

      <div className="csd-grid">
        {availableSizes.map((size) => {
          const specialPrice = sizePrices?.[size];
          const effectivePrice = (specialPrice && specialPrice > 0) ? specialPrice : basePriceCents;
          const isSpecial = Boolean(specialPrice && specialPrice > 0);
          return (
            <div key={size} className="csd-cell">
              <span className="csd-size-label">{size}</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={sizeBreakdown[size] || ""}
                onChange={(e) => setSize(size, parseInt(e.target.value || "0", 10))}
                placeholder="0"
                className="csd-input"
              />
              {effectivePrice > 0 && (
                <span className={`csd-price${isSpecial ? " special" : ""}`}>
                  {euro(effectivePrice)} €
                </span>
              )}
            </div>
          );
        })}
      </div>

      {belowMin && (
        <div className="csd-warn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4M12 17h.01"/>
          </svg>
          Für dieses Produkt beträgt die Mindestmenge {minOrderQty}. Bitte aktualisieren Sie die Menge oder die Größen.
        </div>
      )}
      {!belowMin && remaining !== 0 && (
        <div className="csd-hint">
          {remaining > 0
            ? `Bitte verteilen Sie noch ${remaining} Stück auf die Größen.`
            : `Sie haben ${Math.abs(remaining)} Stück zu viel verteilt.`}
        </div>
      )}

      <style jsx>{`
        .csd {
          margin-top: 10px;
          padding: 12px;
          background: #fafbf9;
          border: 1px solid #e3e6df;
          border-radius: 8px;
        }
        .csd-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .csd-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f1a16;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .csd-counter {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .csd-counter.ok {
          background: #dcfce7;
          color: #065f46;
        }
        .csd-counter.off {
          background: #fef3c7;
          color: #92400e;
        }
        .csd-remaining { font-weight: 600; }
        .csd-over { color: #dc2626; font-weight: 700; }
        .csd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
          gap: 8px;
        }
        .csd-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .csd-size-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #0f1a16;
        }
        .csd-input {
          width: 100%;
          padding: 8px 4px;
          text-align: center;
          border: 1.5px solid #d9ddd5;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f1a16;
          transition: border-color 0.15s;
        }
        .csd-input:focus {
          outline: none;
          border-color: #004537;
        }
        .csd-price {
          font-size: 0.68rem;
          color: #5a6660;
          font-weight: 600;
          margin-top: 1px;
        }
        .csd-price.special {
          color: #b45309;
        }
        .csd-warn {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 10px;
          padding: 9px 11px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 6px;
          font-size: 0.78rem;
          color: #92400e;
          line-height: 1.4;
        }
        .csd-warn svg { color: #d97706; flex-shrink: 0; margin-top: 1px; }
        .csd-hint {
          margin-top: 8px;
          font-size: 0.76rem;
          color: #5a6660;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
