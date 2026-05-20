"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductIcon } from "@/lib/icons";
import { formatPrice, formatNumber } from "@/lib/format";
import { colorHex, colorLabel, materialLabel } from "@/lib/catalog-options";
import { useMerkliste } from "./MerklisteProvider";
import type { Dictionary } from "@/dictionaries/types";

export type CatalogProduct = {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  icon: string;
  images: string[];
  priceCents: number | null;
  stock: number;
  isNew: boolean;
  isEco: boolean;
  colors: string[];
  material: string[];
  categorySlug: string;
};

export type CatalogCategory = { slug: string; name: string; count: number };

type SortKey = "standard" | "preis-auf" | "preis-ab" | "neu";

/** Preisvergleich – Artikel ohne Preis ("auf Anfrage") immer ans Ende. */
function cmpPrice(a: CatalogProduct, b: CatalogProduct, dir: 1 | -1): number {
  if (a.priceCents == null && b.priceCents == null) return 0;
  if (a.priceCents == null) return 1;
  if (b.priceCents == null) return -1;
  return (a.priceCents - b.priceCents) * dir;
}

export default function CatalogClient({
  products,
  categories,
  t,
  nav,
  c,
}: {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  t: Dictionary["catalog"];
  nav: Dictionary["nav"];
  c: Dictionary["common"];
}) {
  const [cat, setCat] = useState("all");
  const [color, setColor] = useState<string | null>(null);
  const [selMaterials, setSelMaterials] = useState<string[]>([]);
  const [minStock, setMinStock] = useState(0);
  const [sort, setSort] = useState<SortKey>("standard");
  const { has, toggle } = useMerkliste();

  const total = products.length;

  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.colors.forEach((x) => set.add(x)));
    return [...set];
  }, [products]);

  const allMaterials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.material.forEach((m) => set.add(m)));
    return [...set];
  }, [products]);

  const list = useMemo(() => {
    let arr = products.filter(
      (p) =>
        (cat === "all" || p.categorySlug === cat) &&
        (!color || p.colors.includes(color)) &&
        (selMaterials.length === 0 ||
          selMaterials.some((m) => p.material.includes(m))) &&
        (minStock <= 0 || p.stock >= minStock)
    );
    if (sort === "preis-auf") arr = [...arr].sort((a, b) => cmpPrice(a, b, 1));
    else if (sort === "preis-ab") arr = [...arr].sort((a, b) => cmpPrice(a, b, -1));
    else if (sort === "neu")
      arr = [...arr].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return arr;
  }, [products, cat, color, selMaterials, minStock, sort]);

  function toggleMaterial(m: string) {
    setSelMaterials((cur) =>
      cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]
    );
  }

  const activeFilters =
    (color ? 1 : 0) + selMaterials.length + (minStock > 0 ? 1 : 0);

  function resetFilters() {
    setColor(null);
    setSelMaterials([]);
    setMinStock(0);
    setCat("all");
  }

  const catLabel =
    cat === "all" ? t.allItems : categories.find((x) => x.slug === cat)?.name ?? "";
  const catCount =
    cat === "all" ? total : categories.find((x) => x.slug === cat)?.count ?? 0;

  return (
    <div className="wrap" style={{ paddingTop: 30 }}>
      {/* HERO */}
      <div className="shop-hero" style={{ marginTop: 24 }}>
        <div>
          <h2>{t.heroTitle}</h2>
          <div className="sh-dots">
            <span className="sh-dot" style={{ background: "#2f9bb0" }}></span>
            <span className="sh-dot" style={{ background: "#4b5560" }}></span>
            <span className="sh-dot" style={{ background: "#e8513a" }}></span>
            <span className="sh-dot" style={{ background: "#ffffff" }}></span>
            <span className="sh-dot" style={{ background: "#cfd4d6" }}></span>
          </div>
        </div>
        <div className="sh-art">
          <svg viewBox="0 0 200 200" fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round">
            <rect x="40" y="86" width="120" height="84" />
            <rect x="34" y="62" width="132" height="26" />
            <path d="M100 62v108" />
            <path d="M100 62c-26-2-40-30-20-38 16-6 22 24 20 38zM100 62c26-2 40-30 20-38-16-6-22 24-20 38z" />
          </svg>
        </div>
      </div>

      <div className="crumb-bar">
        <div className="breadcrumb">
          {nav.home} <span>/</span> {nav.werbemittel} <span>/</span> {catLabel}
        </div>
      </div>

      {/* CATALOG */}
      <div className="catalog">
        {/* SIDEBAR */}
        <aside className="fil-side">
          <div className="fil-group">
            <div className="fil-head">
              {t.filterHead}
              {activeFilters > 0 && (
                <button type="button" className="fil-reset" onClick={resetFilters}>
                  {t.reset} ({activeFilters})
                </button>
              )}
            </div>
          </div>

          <div className="fil-group">
            <div className="fil-head">{t.catHead}</div>
            <div className="fil-total">
              {catLabel} ({catCount})
            </div>
            <div className="fil-list">
              <button
                className={cat === "all" ? "active" : ""}
                onClick={() => setCat("all")}
              >
                {t.allItems} <span className="cnt">{total}</span>
              </button>
              {categories.map((x) => (
                <button
                  key={x.slug}
                  className={cat === x.slug ? "active" : ""}
                  onClick={() => setCat(x.slug)}
                >
                  {x.name} <span className="cnt">{x.count}</span>
                </button>
              ))}
            </div>
          </div>

          {allColors.length > 0 && (
            <div className="fil-group">
              <div className="fil-head">{t.colorHead}</div>
              <div className="swatches">
                {allColors.map((x) => (
                  <span
                    key={x}
                    className={`sw${color === x ? " active" : ""}`}
                    style={{ background: colorHex(x) }}
                    title={colorLabel(x)}
                    onClick={() => setColor(color === x ? null : x)}
                  ></span>
                ))}
              </div>
            </div>
          )}

          {allMaterials.length > 0 && (
            <div className="fil-group">
              <div className="fil-head">{t.materialHead}</div>
              {allMaterials.map((m) => (
                <label key={m} className="fil-check">
                  <input
                    type="checkbox"
                    checked={selMaterials.includes(m)}
                    onChange={() => toggleMaterial(m)}
                  />{" "}
                  {materialLabel(m)}
                </label>
              ))}
            </div>
          )}

          <div className="fil-group">
            <div className="fil-head">{t.stockHead}</div>
            <input
              className="fil-input"
              type="number"
              min={0}
              placeholder={t.stockPlaceholder}
              value={minStock || ""}
              onChange={(e) => setMinStock(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </aside>

        {/* MAIN */}
        <div>
          <div className="sort-bar">
            <div className="sort-left">
              {t.sortLabel}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="standard">{t.sortStandard}</option>
                <option value="preis-auf">{t.sortPriceAsc}</option>
                <option value="preis-ab">{t.sortPriceDesc}</option>
                <option value="neu">{t.sortNew}</option>
              </select>
            </div>
            <div className="sort-right">
              {list.length} {t.itemsWord}
            </div>
          </div>

          <div className="cat-prod-grid">
            {list.length === 0 && (
              <div className="cat-empty">{t.empty}</div>
            )}
            {list.map((p) => {
              const merkt = has(p.id);
              return (
                <article key={p.id} className="pcard">
                  <Link href={`/werbemittel/${p.id}`} className="pcard-link">
                    <div className="pcard-img">
                      {p.isNew && <span className="pc-badge new">{c.badgeNew}</span>}
                      {p.isEco && <span className="pc-badge eco">{c.badgeEco}</span>}
                      {p.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="pcard-photo" src={p.images[0]} alt={p.name} />
                      ) : (
                        <ProductIcon name={p.icon} />
                      )}
                      {p.images.length > 1 && (
                        <span className="pc-imgcount">+{p.images.length - 1}</span>
                      )}
                    </div>
                    <div className="pcard-body">
                      <div className="pc-code">{p.code}</div>
                      <div className="pc-name">{p.name}</div>
                      <div className="pc-price">{formatPrice(p.priceCents)}</div>
                      <div className="pc-stock">
                        {t.cardStock} {formatNumber(p.stock)} {t.stockUnit}
                      </div>
                      <div className="pc-colors">
                        {p.colors.map((x) => (
                          <span
                            key={x}
                            className="pc-color"
                            style={{ background: colorHex(x) }}
                            title={colorLabel(x)}
                          ></span>
                        ))}
                      </div>
                    </div>
                  </Link>
                  <div className="pc-foot">
                    <button
                      type="button"
                      className={`pc-merk${merkt ? " is-merkt" : ""}`}
                      onClick={() =>
                        toggle({
                          id: p.id,
                          code: p.code,
                          name: p.name,
                          image: p.images[0] ?? null,
                        })
                      }
                    >
                      {merkt ? c.gemerkt : c.merken}
                    </button>
                    <Link href={`/werbemittel/${p.id}`} className="pc-cta">
                      {t.details}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
