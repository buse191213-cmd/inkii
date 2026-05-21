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
import { colorHex, colorLabel, materialLabel } from "@/lib/catalog-options";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import DOMPurify from "isomorphic-dompurify";

function renderDescription(raw: string | null | undefined): string {
  if (!raw) return "";
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  const html = hasHtml
    ? raw
    : "<p>" + raw.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>") + "</p>";
  return DOMPurify.sanitize(html);
}

export const dynamic = "force-dynamic";

function split(s: string | null | undefined): string[] {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return { title: "Artikel nicht gefunden | INKII" };
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
  const hasPrice = product.priceCents != null;

  // === Cross-Sell ===
  const sameCategory = await db.product.findMany({
    where: { categoryId: product.categoryId, status: "active", id: { not: product.id } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  let related = sameCategory;
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
      if (product.isEco && c.isEco) score += 4;
      if (c.isNew) score += 1;
      split(c.colors).forEach((x) => { if (ownColors.has(x)) score += 3; });
      split(c.material).forEach((x) => { if (ownMaterials.has(x)) score += 2; });
      return { p: c, score };
    });
    scored.sort((a, b) => b.score - a.score);
    related = [...related, ...scored.slice(0, 4 - related.length).map((s) => s.p)];
  }
  related = related.slice(0, 4);

  const descHtml = renderDescription(product.description);

  return (
    <SiteShell>
      <JsonLd
        data={productSchema({
          id: product.id,
          name: product.name,
          code: product.code,
          description: product.description ?? "",
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

      <section className="mm-detail">
        <div className="wrap">

          {/* Breadcrumb */}
          <div className="mm-crumb mm-detail-crumb">
            <Link href="/werbemittel">ALLE PRODUKTE</Link>
            <span className="mm-dot">•</span>
            <Link href="/werbemittel">{product.category.name.toUpperCase()}</Link>
            <span className="mm-dot">•</span>
            <span className="active">{product.name.toUpperCase()}</span>
          </div>

          <div className="mm-detail-grid">

            {/* === Galerie === */}
            <div className="mm-detail-gallery">
              <div className="mm-detail-tags">
                {product.isNew && <span className="mm-tag tag-new">NEU</span>}
                {product.stock > 0 && <span className="mm-tag tag-stock">AB LAGER</span>}
                {product.isEco && <span className="mm-tag tag-eco">✦ NACHHALTIG</span>}
              </div>
              <ProductGallery images={images} name={product.name} iconName={product.icon} />
            </div>

            {/* === Info === */}
            <div className="mm-detail-info">
              <h1 className="mm-detail-h1">{product.name}</h1>
              {product.subtitle && <p className="mm-detail-sub">{product.subtitle}</p>}
              <p className="mm-detail-meta">
                Produktionszeit: <strong>Auf Anfrage</strong> · exkl. Versand
              </p>

              {/* Beschreibung */}
              {descHtml && (
                <div className="mm-detail-section">
                  <h2 className="mm-detail-h2">ÜBERSICHT</h2>
                  <div
                    className="mm-tab-prose"
                    dangerouslySetInnerHTML={{ __html: descHtml }}
                  />
                </div>
              )}

              {/* Details */}
              <div className="mm-detail-section">
                <h2 className="mm-detail-h2">DETAILS</h2>
                <div className="mm-detail-specs">
                  <div className="mm-spec-row">
                    <span>{dt.specArtNr}</span>
                    <strong>{product.code}</strong>
                  </div>
                  <div className="mm-spec-row">
                    <span>{dt.specCategory}</span>
                    <strong>{product.category.name}</strong>
                  </div>
                  <div className="mm-spec-row">
                    <span>{dt.specStock}</span>
                    <strong>{formatNumber(product.stock)} {dt.stockUnit}</strong>
                  </div>
                  {materials.length > 0 && (
                    <div className="mm-spec-row">
                      <span>{dt.specMaterial}</span>
                      <strong>{materials.map((m) => materialLabel(m)).join(", ")}</strong>
                    </div>
                  )}
                  {colors.length > 0 && (
                    <div className="mm-spec-row">
                      <span>{dt.colorsLabel}</span>
                      <strong>{colors.map((c) => colorLabel(c)).join(", ")}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Farbauswahl-Box */}
              {colors.length > 0 && (
                <div className="mm-detail-colorbox">
                  <div className="mm-detail-cbhead">
                    <span className="mm-detail-cbnum">1.</span>{" "}
                    <span>Farben:</span>{" "}
                    <strong>{colorLabel(colors[0])}</strong>
                  </div>
                  <div className="mm-detail-colorgrid">
                    {colors.map((c) => (
                      <span
                        key={c}
                        className="mm-detail-colortile"
                        style={{ background: colorHex(c) }}
                        title={colorLabel(c)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mm-detail-cta">
                <Link href="/kontakt" className="mm-detail-cta-btn">
                  <span>Anfrage senden</span>
                  <span className="mm-detail-cta-price">
                    {hasPrice ? <>ab {formatPrice(product.priceCents)}</> : "Preis auf Anfrage"}
                  </span>
                </Link>
                <div className="mm-detail-cta-row">
                  <MerkenButton
                    id={product.id}
                    code={product.code}
                    name={product.name}
                    image={images[0] ?? null}
                    labelOn={d.common.gemerktLong}
                    labelOff={d.common.merkenLong}
                  />
                  <Link className="mm-detail-cta-back" href="/werbemittel">
                    ← {dt.backToCatalog}
                  </Link>
                </div>
              </div>

              <div className="mm-detail-trust">
                <div><strong>✓</strong> Kostenlose Designvorschläge</div>
                <div><strong>✓</strong> Angebot in 24 Stunden</div>
                <div><strong>✓</strong> Persönliche Beratung</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ÄHNLICHE ARTIKEL */}
      {related.length > 0 && (
        <section className="mm-detail-related">
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">{dt.relatedKicker}</span>
              <h2 className="big">{dt.relatedTitle}</h2>
            </div>
            <div className="mm-grid">
              {related.map((r) => {
                const rImgs = split(r.images);
                return (
                  <Link key={r.id} href={`/werbemittel/${r.id}`} className="mm-card mm-card-related">
                    <div className="mm-card-tags">
                      {r.isNew && <span className="mm-tag tag-new">NEU</span>}
                      {r.isEco && <span className="mm-tag tag-eco">✦ NACHHALTIG</span>}
                    </div>
                    <div className="mm-card-img">
                      {rImgs.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rImgs[0]} alt={r.name} />
                      ) : (
                        <ProductIcon name={r.icon} />
                      )}
                    </div>
                    <div className="mm-card-name">{r.name}</div>
                    <div className="mm-card-price">
                      {r.priceCents != null ? <>Ab {formatPrice(r.priceCents)}</> : "Preis auf Anfrage"}
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
