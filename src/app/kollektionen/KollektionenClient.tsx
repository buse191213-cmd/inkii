"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export type KollektionProduct = {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  priceCents: number;
  image: string;
  sizes: string[];
  stock: number;
  category: string;
  isNew: boolean;
  isBestseller: boolean;
};

export default function KollektionenClient({
  products,
  categories,
}: {
  products: KollektionProduct[];
  categories: { key: string; label: string; image?: string }[];
}) {
  const [activeCat, setActiveCat] = useState<string>("all");

  // URL ?cat=slug → o kategoriyi seç (mega-menüden gelince)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat && categories.some((c) => c.key === cat)) {
      setActiveCat(cat);
    }
  }, [categories]);

  const filtered = useMemo(() => {
    if (activeCat === "all") return products;
    return products.filter((p) => p.category === activeCat);
  }, [products, activeCat]);

  return (
    <section className="koll-section">
      <div className="wrap-wide">
        {/* Kategorie-Filter */}
        {categories.length > 0 && (
          <div className="koll-cats">
            <button
              className={`koll-cat${activeCat === "all" ? " active" : ""}`}
              onClick={() => setActiveCat("all")}
            >
              Alle
            </button>
            {categories.map((c) => (
              <button
                key={c.key}
                className={`koll-cat${activeCat === c.key ? " active" : ""}`}
                onClick={() => setActiveCat(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="koll-empty">Bald finden Sie hier unsere neuesten Designs.</p>
        ) : (
          <div className="koll-grid">
            {filtered.map((p) => {
              const soldOut = p.stock <= 0;
              return (
                <Link
                  key={p.id}
                  href={`/kollektionen/${p.id}`}
                  className={`koll-card${soldOut ? " sold" : ""}`}
                >
                  <div className="koll-card-img">
                    {p.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.image} alt={p.name} loading="lazy" />
                    ) : (
                      <div className="koll-card-noimg" />
                    )}
                    {p.isNew && <span className="koll-badge koll-badge-new">Neu</span>}
                    {p.isBestseller && !p.isNew && (
                      <span className="koll-badge koll-badge-best">Bestseller</span>
                    )}
                    {soldOut && <span className="koll-badge koll-badge-sold">Ausverkauft</span>}
                  </div>
                  <div className="koll-card-body">
                    <h3 className="koll-card-name">{p.name}</h3>
                    {p.subtitle && <p className="koll-card-sub">{p.subtitle}</p>}
                    <div className="koll-card-price">{formatPrice(p.priceCents)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
