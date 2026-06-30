"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductIcon } from "@/lib/icons";
import { formatPrice } from "@/lib/format";
import { colorHex, colorLabel, materialLabel } from "@/lib/catalog-options";
import { useMerkliste } from "./MerklisteProvider";
import { SHOW_PRICES } from "@/lib/feature-flags";
import type { Dictionary } from "@/dictionaries/types";

export type CatalogProduct = {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  icon: string;
  images: string[];
  priceCents: number | null;
  hasTiers?: boolean; // Staffelpreise var mı (true ise "ab" prefix göster)
  stock: number;
  isNew: boolean;
  isEco: boolean;
  colors: string[];
  material: string[];
  categorySlug: string;
  visiblePages: string[];
  cardFit?: string;
  cardCrop?: string;
};

export type CatalogCategory = { slug: string; name: string; count: number };

type SortKey = "standard" | "preis-auf" | "preis-ab" | "neu";

/** Preisvergleich – Artikel ohne Preis ans Ende. */
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
  c,
}: {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  t: Dictionary["catalog"];
  nav: Dictionary["nav"];
  c: Dictionary["common"];
}) {
  const searchParams = useSearchParams();
  const [cat, setCat] = useState("all");

  // URL-Parameter ?cat=… beim Mount und bei jeder Änderung übernehmen.
  // Feste Navi-Kategorien (kleidung/taschen/werbeartikel) immer akzeptieren,
  // auch wenn (noch) keine Produkte zugeordnet sind — sonst bleibt die alte
  // Auswahl hängen und es werden falsche Produkte gezeigt.
  useEffect(() => {
    const urlCat = searchParams.get("cat");
    const FIXED = ["kleidung", "taschen", "werbeartikel"];
    if (urlCat && (FIXED.includes(urlCat) || categories.some((x) => x.slug === urlCat))) {
      setCat(urlCat);
    } else if (urlCat === null) {
      setCat("all");
    } else {
      // unbekannte Kategorie → nichts erzwingen, aber sicher auf 'all'
      setCat("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [color, setColor] = useState<string | null>(null);
  const [selMaterials, setSelMaterials] = useState<string[]>([]);
  const [minStock, setMinStock] = useState(0);
  const [sort, setSort] = useState<SortKey>("standard");
  const [open, setOpen] = useState(false);
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
    // Fixe Seiten (Navi: Kleidung/Taschen/Werbeartikel) → über visiblePages filtern.
    // Sonst → über categorySlug (admin-definiert).
    const FIXED = ["kleidung", "taschen", "werbeartikel"];
    let arr = products.filter((p) => {
      const catMatch =
        cat === "all" ||
        (FIXED.includes(cat)
          ? p.visiblePages.includes(cat) || p.categorySlug === cat
          : p.categorySlug === cat);
      return (
        catMatch &&
        (!color || p.colors.includes(color)) &&
        (selMaterials.length === 0 || selMaterials.some((m) => p.material.includes(m))) &&
        (minStock <= 0 || p.stock >= minStock)
      );
    });
    if (sort === "preis-auf") arr = [...arr].sort((a, b) => cmpPrice(a, b, 1));
    else if (sort === "preis-ab") arr = [...arr].sort((a, b) => cmpPrice(a, b, -1));
    else if (sort === "neu") arr = [...arr].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return arr;
  }, [products, cat, color, selMaterials, minStock, sort]);

  function toggleMaterial(m: string) {
    setSelMaterials((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));
  }

  const activeFilters = (color ? 1 : 0) + selMaterials.length + (minStock > 0 ? 1 : 0);

  function resetFilters() {
    setColor(null);
    setSelMaterials([]);
    setMinStock(0);
  }

  // Slug → Anzeigename mit Erstbuchstabe-Großschreibung (falls Admin "kleidung" eingegeben hat)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const SLUG_LABEL: Record<string, string> = {
    kleidung: "Textilveredelung",
    taschen: "Taschen",
    werbeartikel: "Werbeartikel",
  };
  const rawName = cat === "all" ? "Alle Produkte" : (categories.find((x) => x.slug === cat)?.name ?? cat);
  const catName = cat === "all"
    ? "Alle Produkte"
    : (SLUG_LABEL[cat] ?? cap(rawName));

  return (
    <section className="mm-cat">
      <div className="wrap">

        {/* === Breadcrumb === */}
        <div className="mm-crumb">
          <button className={cat === "all" ? "active" : ""} onClick={() => setCat("all")}>
            ALLE PRODUKTE
          </button>
          {cat !== "all" && (
            <>
              <span className="mm-dot">•</span>
              <span className="active">{catName.toUpperCase()}</span>
            </>
          )}
        </div>

        {/* === Title row === */}
        <div className="mm-title-row">
          <h1 className="mm-title">{catName}</h1>
          <button
            type="button"
            className={`mm-filter-btn${open ? " open" : ""}${activeFilters > 0 ? " has-active" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
            </svg>
            Filter &amp; Sortieren
            {activeFilters > 0 && <span className="mm-fbtn-badge">{activeFilters}</span>}
          </button>
        </div>

        {/* === Filter-Drawer (toggle) === */}
        {open && (
          <div className="mm-filter-panel">
            <div className="mm-fp-grid">
              <div className="mm-fp-col">
                <div className="mm-fp-head">Kategorie</div>
                <div className="mm-fp-list">
                  <button className={cat === "all" ? "active" : ""} onClick={() => setCat("all")}>
                    {t.allItems} <span className="cnt">{total}</span>
                  </button>
                  {categories.map((x) => (
                    <button key={x.slug} className={cat === x.slug ? "active" : ""} onClick={() => setCat(x.slug)}>
                      {SLUG_LABEL[x.slug] ?? cap(x.name)} <span className="cnt">{x.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {allColors.length > 0 && (
                <div className="mm-fp-col">
                  <div className="mm-fp-head">{t.colorHead}</div>
                  <div className="mm-fp-swatches">
                    {allColors.map((x) => (
                      <span
                        key={x}
                        className={`mm-fp-sw${color === x ? " active" : ""}`}
                        style={{ background: colorHex(x) }}
                        title={colorLabel(x)}
                        onClick={() => setColor(color === x ? null : x)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {allMaterials.length > 0 && (
                <div className="mm-fp-col">
                  <div className="mm-fp-head">{t.materialHead}</div>
                  <div className="mm-fp-mat">
                    {allMaterials.map((m) => (
                      <label key={m} className="mm-fp-check">
                        <input type="checkbox" checked={selMaterials.includes(m)} onChange={() => toggleMaterial(m)} />
                        <span>{materialLabel(m)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mm-fp-col">
                <div className="mm-fp-head">{t.sortLabel}</div>
                <select className="mm-fp-sel" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="standard">{t.sortStandard}</option>
                  <option value="preis-auf">{t.sortPriceAsc}</option>
                  <option value="preis-ab">{t.sortPriceDesc}</option>
                  <option value="neu">{t.sortNew}</option>
                </select>
                {activeFilters > 0 && (
                  <button type="button" className="mm-fp-reset" onClick={resetFilters}>
                    {t.reset} ({activeFilters})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === Result count === */}
        <div className="mm-result">
          {list.length} {t.itemsWord}
        </div>

        {/* === Grid === */}
        <div className="mm-grid">
          {list.length === 0 && <div className="mm-empty">{t.empty}</div>}
          {list.map((p) => {
            const merkt = has(p.id);
            const hasPrice = p.priceCents != null;
            return (
              <article key={p.id} className="mm-card">
                {/* Etiketten oben im weißen Bereich */}
                <div className="mm-card-tags">
                  {p.isNew && <span className="mm-tag tag-new">NEU</span>}
                  {p.stock > 0 && <span className="mm-tag tag-stock">AB LAGER</span>}
                  {p.isEco && <span className="mm-tag tag-eco">✦ NACHHALTIG</span>}
                </div>

                <Link href={`/werbemittel/${p.id}`} className="mm-card-link">
                  <div className="mm-card-img">
                    {p.images.length > 0 ? (() => {
                      let zoom = 1, tx = 0, ty = 0;
                      try {
                        if (p.cardCrop) {
                          const c = JSON.parse(p.cardCrop);
                          zoom = Number(c.zoom) || 1;
                          tx = Number(c.x) || 0;
                          ty = Number(c.y) || 0;
                        }
                      } catch {}
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            objectPosition: "center",
                            transform: (zoom !== 1 || tx !== 0 || ty !== 0)
                              ? `scale(${zoom}) translate(${-tx}%, ${ty}%)`
                              : undefined,
                            transformOrigin: "center",
                            padding: 4,
                          }}
                        />
                      );
                    })() : (
                      <ProductIcon name={p.icon} />
                    )}
                    <span className="mm-quick">{t.details}</span>
                  </div>

                  {p.colors.length > 0 && (
                    <div className="mm-card-colors">
                      {p.colors.slice(0, 12).map((x) => (
                        <span
                          key={x}
                          className="mm-card-color"
                          style={{ background: colorHex(x) }}
                          title={colorLabel(x)}
                        />
                      ))}
                    </div>
                  )}

                  <div className="mm-card-name">{p.name}</div>
                  <div className="mm-card-price">
                    {SHOW_PRICES && hasPrice ? (
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f1a16" }}>
                        {p.hasTiers && <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, marginRight: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>ab</span>}
                        {formatPrice(p.priceCents)}
                        <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 3 }}>/ Stk</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                        Preis auf Anfrage
                      </span>
                    )}
                  </div>
                </Link>

                <button
                  type="button"
                  className={`mm-card-merk${merkt ? " is-merkt" : ""}`}
                  onClick={() =>
                    toggle({ id: p.id, code: p.code, name: p.name, image: p.images[0] ?? null })
                  }
                  aria-label={merkt ? c.gemerkt : c.merken}
                >
                  {merkt ? "♥" : "♡"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
