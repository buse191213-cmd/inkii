import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import ProductGallery from "@/components/ProductGallery";
import MerkenButton from "@/components/MerkenButton";
import { db } from "@/lib/db";
import { formatPrice, formatNumber } from "@/lib/format";
import { colorHex, colorLabel, materialLabel } from "@/lib/catalog-options";
import { parsePriceTiers, tierDiscountPercent } from "@/lib/price-tiers";
import { parseSizes } from "@/lib/sizes";
import { SHOW_TIERS } from "@/lib/feature-flags";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import DetailOrderForm from "@/components/DetailOrderForm";
import DesignerLauncher from "@/components/DesignerLauncher";

export const dynamic = "force-dynamic";

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
  if (!product) return { title: "Artikel" };
  const title = product.name;
  const description = (product.subtitle || product.description || product.name).slice(0, 160);
  const url = `/werbemittel/${id}`;
  const firstImage = product.images ? product.images.split(",")[0].trim() : "";
  const ogImage = firstImage || "/og-default.png";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | INKII Works`,
      description,
      url,
      type: "website",
      images: [{ url: ogImage, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | INKII Works`,
      description,
      images: [ogImage],
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

  // Cross-sell: 4 weitere Produkte aus derselben Kategorie (oder zufällige Fallbacks)
  let related = await db.product.findMany({
    where: {
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  // Falls in dieser Kategorie zu wenige sind, mit anderen Produkten auffüllen
  if (related.length < 4) {
    const fillers = await db.product.findMany({
      where: { id: { notIn: [product.id, ...related.map((r) => r.id)] } },
      take: 4 - related.length,
      orderBy: { createdAt: "desc" },
    });
    related = [...related, ...fillers];
  }

  const categoryName = product.category?.name ?? "Werbemittel";
  const images = split(product.images);
  const colors = split(product.colors);
  const materials = split(product.material);
  const hasPrice = product.priceCents != null;
  const tiers = parsePriceTiers(product.priceTiers);
  const sizesList = parseSizes(product.sizes);

  // Renk başına görseller (JSON: { "weiß": ["url1","url2"], "schwarz": ["url3"] })
  let colorImages: Record<string, string[]> = {};
  try {
    const raw = (product as { colorImages?: string }).colorImages;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") colorImages = parsed;
    }
  } catch { /* görmezden gel */ }

  return (
    <SiteShell>
      <section className="mm-detail">
        <div className="wrap">

          {/* Breadcrumb */}
          <div className="mm-crumb mm-detail-crumb">
            <Link href="/werbemittel">ALLE PRODUKTE</Link>
            <span className="mm-dot">•</span>
            <Link href="/werbemittel">{categoryName.toUpperCase()}</Link>
            <span className="mm-dot">•</span>
            <span className="active">{product.name.toUpperCase()}</span>
          </div>

          <div className="mm-detail-grid">

            {/* Galerie */}
            <div className="mm-detail-gallery">
              <div className="mm-detail-tags">
                {product.isNew && <span className="mm-tag tag-new">NEU</span>}
                {product.stock > 0 && <span className="mm-tag tag-stock">AB LAGER</span>}
                {product.isEco && <span className="mm-tag tag-eco">✦ NACHHALTIG</span>}
              </div>
              <ProductGallery images={images} colorImages={colorImages} colors={colors} name={product.name} iconName={product.icon} />
            </div>

            {/* Info */}
            <div className="mm-detail-info">
              <h1 className="mm-detail-h1">{product.name}</h1>
              {product.subtitle && <p className="mm-detail-sub">{product.subtitle}</p>}
              <p className="mm-detail-meta">
                Produktionszeit: <strong>Auf Anfrage</strong> · exkl. Versand
              </p>

              {/* Sipariş formu — Galery'e yakın olsun diye en üste alındı */}
              <DetailOrderForm
                productId={product.id}
                productCode={product.code}
                productName={product.name}
                productImage={images[0] ?? null}
                colors={colors}
                sizes={sizesList}
                tiers={tiers}
                basePriceCents={product.priceCents}
              />

              {/* Eigenes Design hochladen — Tasarımcı modali açar */}
              <DesignerLauncher productName={product.name} productCode={product.code} />

              {/* Beschreibung — HTML render (Admin RichEditor'dan kayıtlı) */}
              {product.description && (
                <div className="mm-detail-section">
                  <h2 className="mm-detail-h2">ÜBERSICHT</h2>
                  <div
                    className="product-description-html"
                    style={{ lineHeight: 1.65, color: "#3b4540" }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
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
                    <strong>{categoryName}</strong>
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
                </div>
              </div>

              {/* Mengenstaffel-Tabelle (eski yeri: Material altında) */}
              {SHOW_TIERS && tiers.length > 0 && (
                <div className="mm-tiers">
                  <div className="mm-tiers-head">
                    <span>Staffelpreise</span>
                  </div>
                  <div className="mm-tiers-list">
                    {tiers.map((t, i) => {
                      const total = t.qty * t.cents;
                      const discount = tierDiscountPercent(tiers, t);
                      const totalEuro = (total / 100).toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                      const unitEuro = (t.cents / 100).toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                      return (
                        <div key={i} className="mm-tier-row">
                          <div className="mm-tier-qty">{t.qty} Stück</div>
                          <div className="mm-tier-unit">€{unitEuro} / Stück</div>
                          <div className="mm-tier-spart">
                            <span className={`mm-tier-badge${discount > 0 ? " active" : ""}`}>
                              Spart {discount}%
                            </span>
                          </div>
                          <div className="mm-tier-total">€{totalEuro}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Eigenes Design hochladen — Tasarımcı modali açar */}

              <div className="mm-detail-cta-secondary">
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

              <div className="mm-detail-trust">
                <div><strong>✓</strong> Kostenlose Designvorschläge</div>
                <div><strong>✓</strong> Angebot innerhalb 24 Stunden</div>
                <div><strong>✓</strong> Persönliche Beratung</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mm-related">
          <div className="wrap">
            <div className="mm-related-head">
              <p className="kicker">{dt.relatedKicker}</p>
              <h3>{dt.relatedTitle}</h3>
            </div>
            <div className="mm-related-grid">
              {related.map((r) => {
                const rImages = split(r.images);
                const rImg = rImages[0] || null;
                return (
                  <Link key={r.id} href={`/werbemittel/${r.id}`} className="mm-related-card">
                    <div
                      className="mm-related-img"
                      style={rImg ? { backgroundImage: `url(${rImg})` } : undefined}
                    >
                      {!rImg && <span className="mm-related-img-fallback">INKII</span>}
                    </div>
                    <div className="mm-related-body">
                      {r.code && <div className="mm-related-code">{r.code}</div>}
                      <div className="mm-related-name">{r.name}</div>
                      {r.subtitle && <div className="mm-related-sub">{r.subtitle}</div>}
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
