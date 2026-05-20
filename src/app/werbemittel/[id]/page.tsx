import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import ProductGallery from "@/components/ProductGallery";
import MerkenButton from "@/components/MerkenButton";
import JsonLd from "@/components/JsonLd";
import { db } from "@/lib/db";
import { formatPrice, formatNumber } from "@/lib/format";
import { ProductIcon } from "@/lib/icons";
import { SITE_URL } from "@/lib/site";
import { productSchema, breadcrumbSchema } from "@/lib/schema";
import { materialLabel } from "@/lib/catalog-options";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import DOMPurify from "isomorphic-dompurify";

/** Beschreibung als sicheres HTML rendern. Alter reiner Text → Absatz mit Zeilenumbrüchen. */
function renderDescription(raw: string): string {
  if (!raw) return "";
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  const html = hasHtml
    ? raw
    : "<p>" + raw.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>") + "</p>";
  return DOMPurify.sanitize(html);
}

export const dynamic = "force-dynamic";

const COLORS: Record<string, { hex: string; label: string }> = {
  weiss: { hex: "#ffffff", label: "Weiß" },
  schwarz: { hex: "#1c2722", label: "Schwarz" },
  blau: { hex: "#2f5fd0", label: "Blau" },
  navy: { hex: "#16306b", label: "Navy" },
  rot: { hex: "#d8442f", label: "Rot" },
  gruen: { hex: "#3f9c5c", label: "Grün" },
  grau: { hex: "#8b948d", label: "Grau" },
  silber: { hex: "#c9cdc9", label: "Silber" },
  natur: { hex: "#d6c39a", label: "Natur" },
  gelb: { hex: "#f2c200", label: "Gelb" },
};

function split(s: string): string[] {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    return { title: "Artikel nicht gefunden | INKII" };
  }
  const desc = (
    product.subtitle ||
    product.description ||
    `${product.name} – als Werbemittel individuell veredelbar bei INKII.`
  ).slice(0, 160);
  const firstImage = split(product.images)[0];
  return {
    title: `${product.name} | INKII Werbemittel`,
    description: desc,
    openGraph: {
      title: `${product.name} | INKII`,
      description: desc,
      type: "website",
      images: firstImage ? [{ url: firstImage }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const d = getDictionary(await getLocale());
  const dt = d.detail;

  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  const images = split(product.images);
  const colors = split(product.colors);
  const materials = split(product.material);

  // === Empfehlungen ("Weitere Artikel") ===
  // 1. Stufe: gleiche Kategorie (höchste Relevanz)
  const sameCategory = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: "active",
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  let related = sameCategory;

  // 2. Stufe: wenn weniger als 4, füllen wir mit Produkten aus anderen
  // Kategorien, die thematisch passen: gleiche Farbe / Material / Öko-Flag
  // bekommen Punkte. Klassisches Cross-Selling für Werbemittel-Sets
  // (z. B. T-Shirt + passende Mütze / Tasche in derselben Farbwelt).
  if (related.length < 4) {
    const excludeIds = [product.id, ...related.map((p) => p.id)];
    const pool = await db.product.findMany({
      where: { status: "active", id: { notIn: excludeIds } },
      take: 24,
      orderBy: { createdAt: "desc" },
    });

    const ownColors = new Set(colors);
    const ownMaterials = new Set(materials);

    const scored = pool.map((c) => {
      let score = 0;
      // Öko-Profil passt zusammen (umweltbewusste Käufer mögen Öko-Sets)
      if (product.isEco && c.isEco) score += 4;
      // Neuheiten als Aufmerksamkeitsbringer
      if (c.isNew) score += 1;
      // Farbüberlappung – wichtig für stimmige Marken-Sets
      split(c.colors).forEach((x) => {
        if (ownColors.has(x)) score += 3;
      });
      // Materialüberlappung – z. B. Baumwolle bei mehreren Textilien
      split(c.material).forEach((x) => {
        if (ownMaterials.has(x)) score += 2;
      });
      return { p: c, score };
    });

    // Höchste Punktzahl zuerst; bei Gleichstand bleibt die Reihenfolge
    // (also: neueste zuerst – aus orderBy oben)
    scored.sort((a, b) => b.score - a.score);

    related = [
      ...related,
      ...scored.slice(0, 4 - related.length).map((s) => s.p),
    ];
  }

  related = related.slice(0, 4);

  return (
    <SiteShell>
      <JsonLd
        data={productSchema({
          id: product.id,
          name: product.name,
          code: product.code,
          description: product.description,
          images,
          priceCents: product.priceCents,
          stock: product.stock,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Werbemittel", url: `${SITE_URL}/werbemittel` },
          { name: product.category.name, url: `${SITE_URL}/werbemittel` },
          { name: product.name, url: `${SITE_URL}/werbemittel/${product.id}` },
        ])}
      />
      <div className="wrap" style={{ paddingTop: 28 }}>
        <div className="breadcrumb" style={{ marginBottom: 24 }}>
          <Link href="/">{d.nav.home}</Link> <span>/</span>
          <Link href="/werbemittel"> {d.nav.werbemittel}</Link> <span>/</span>
          <span> {product.category.name}</span>
        </div>

        <div className="detail-grid">
          {/* GALERIE */}
          <ProductGallery images={images} name={product.name} iconName={product.icon} />

          {/* INFO */}
          <div className="detail-info">
            <div className="detail-badges">
              {product.isNew && <span className="d-badge new">{d.common.badgeNew}</span>}
              {product.isEco && <span className="d-badge eco">{d.common.badgeEco}</span>}
              {product.status === "draft" && (
                <span className="d-badge draft">{dt.badgeDraft}</span>
              )}
            </div>
            <div className="detail-code">{dt.artNr} {product.code}</div>
            <h1 className="detail-name">{product.name}</h1>
            {product.subtitle && <p className="detail-sub">{product.subtitle}</p>}

            <div className="detail-price">{formatPrice(product.priceCents)}</div>
            <div className="detail-stock">
              <span className="dot-stock" /> {dt.stockLabel}{" "}
              <b>{formatNumber(product.stock)} {dt.stockUnit}</b>
            </div>

            {colors.length > 0 && (
              <div className="detail-block">
                <span className="detail-label">{dt.colorsLabel}</span>
                <div className="detail-colors">
                  {colors.map((c) => (
                    <span key={c} className="detail-color">
                      <span
                        className="dot-color"
                        style={{ background: COLORS[c]?.hex ?? "#ccc" }}
                      />
                      {COLORS[c]?.label ?? c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.description && (
              <div className="detail-block">
                <span className="detail-label">{dt.descLabel}</span>
                <div
                  className="detail-desc-html"
                  dangerouslySetInnerHTML={{ __html: renderDescription(product.description) }}
                />
              </div>
            )}

            <div className="detail-actions">
              <MerkenButton
                id={product.id}
                code={product.code}
                name={product.name}
                image={images[0] ?? null}
                labelOn={d.common.gemerktLong}
                labelOff={d.common.merkenLong}
              />
              <Link className="btn btn-primary" href="/merkzettel">
                {dt.merkzettelCta}
              </Link>
              <Link className="btn btn-ghost" href="/werbemittel">
                {dt.backToCatalog}
              </Link>
            </div>

            <div className="detail-specs">
              <div className="spec-row">
                <span>{dt.specArtNr}</span>
                <b>{product.code}</b>
              </div>
              <div className="spec-row">
                <span>{dt.specCategory}</span>
                <b>{product.category.name}</b>
              </div>
              <div className="spec-row">
                <span>{dt.specStock}</span>
                <b>{formatNumber(product.stock)} {dt.stockUnit}</b>
              </div>
              {materials.length > 0 && (
                <div className="spec-row">
                  <span>{dt.specMaterial}</span>
                  <b>{materials.map((m) => materialLabel(m)).join(", ")}</b>
                </div>
              )}
              <div className="spec-row">
                <span>{dt.specVeredelung}</span>
                <b>{dt.specVeredelungValue}</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ÄHNLICHE ARTIKEL */}
      {related.length > 0 && (
        <section style={{ paddingTop: 80 }}>
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">{dt.relatedKicker}</span>
              <h2 className="big">{dt.relatedTitle}</h2>
            </div>
            <div className="related-grid">
              {related.map((r) => {
                const rImgs = split(r.images);
                return (
                  <Link key={r.id} href={`/werbemittel/${r.id}`} className="related-card">
                    <div className="related-img">
                      {rImgs.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rImgs[0]} alt={r.name} />
                      ) : (
                        <ProductIcon name={r.icon} />
                      )}
                    </div>
                    <div className="related-body">
                      <div className="pc-code">{r.code}</div>
                      <div className="pc-name">{r.name}</div>
                      <div className="pc-price">{formatPrice(r.priceCents)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
