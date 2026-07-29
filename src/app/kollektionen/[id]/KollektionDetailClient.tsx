"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export type KollektionDetail = {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  priceCents: number;
  images: string[];
  sizes: string[];
  stock: number;
};

export default function KollektionDetailClient({ product }: { product: KollektionDetail }) {
  const { addItem } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string>(product.sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;
  const needsSize = product.sizes.length > 0;

  function handleAdd() {
    if (soldOut) return;
    if (needsSize && !size) return;
    addItem({
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      productImage: product.images[0] ?? "",
      color: "",
      size: size,
      quantity: qty,
      unitPriceCents: product.priceCents,
      minOrderQty: 1,
      availableSizes: product.sizes.length > 0 ? product.sizes : undefined,
      sizeBreakdown: needsSize ? { [size]: qty } : undefined,
      hasDtf: false,
      dtfSize: "",
      dtfPriceCents: 0,
      dtfDesignUrl: "",
    });
    setAdded(true);
    window.dispatchEvent(new CustomEvent("inkii-cart-added"));
    setTimeout(() => setAdded(false), 4000);
  }

  return (
    <div className="wrap-wide koll-detail">
      <div className="koll-detail-grid">
        {/* Galerie */}
        <div className="koll-detail-gallery">
          <div className="koll-detail-main">
            {product.images[activeImg] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={product.images[activeImg]} alt={product.name} />
            ) : (
              <div className="koll-detail-noimg" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="koll-detail-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`koll-thumb${i === activeImg ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Bild ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info + Kauf */}
        <div className="koll-detail-info">
          <h1 className="koll-detail-name">{product.name}</h1>
          {product.subtitle && <p className="koll-detail-sub">{product.subtitle}</p>}
          <div className="koll-detail-price">{formatPrice(product.priceCents)}</div>

          {soldOut && <div className="koll-detail-soldout">Ausverkauft</div>}

          {!soldOut && (
            <>
              {needsSize && (
                <div className="koll-detail-sizes">
                  <span className="koll-detail-label">Größe wählen</span>
                  <div className="koll-size-btns">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        className={`koll-size-btn${size === s ? " active" : ""}`}
                        onClick={() => setSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="koll-detail-qty">
                <span className="koll-detail-label">Menge</span>
                <div className="koll-qty-ctrl">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="weniger">−</button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(product.stock, parseInt(e.target.value || "1", 10))))}
                  />
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} aria-label="mehr">+</button>
                </div>
                {product.stock <= 10 && (
                  <span className="koll-stock-hint">Nur noch {product.stock} verfügbar</span>
                )}
              </div>

              <button className="koll-add-btn" onClick={handleAdd}>
                {added ? "✓ Zum Warenkorb hinzugefügt" : "In den Warenkorb"}
              </button>
            </>
          )}

          {product.description && (
            <div className="koll-detail-desc">
              <h2>Beschreibung</h2>
              <div className="koll-desc-html" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
