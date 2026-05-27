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
  if (!product) return { title: "Artikel | INKII" };
  return {
    title: `${product.name} | INKII Werbemittel`,
    description: (product.subtitle || product.description || product.name).slice(0, 160),
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

  const categoryName = product.category?.name ?? "Werbemittel";
  const images = split(product.images);
  const colors = split(product.colors);
  const materials = split(product.material);
  const hasPrice = product.priceCents != null;
  const tiers = parsePriceTiers(product.priceTiers);
  const sizesList = parseSizes(product.sizes);

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
              <ProductGallery images={images} name={product.name} iconName={product.icon} />
            </div>

            {/* Info */}
            <div className="mm-detail-info">
              <h1 className="mm-detail-h1">{product.name}</h1>
              {product.subtitle && <p className="mm-detail-sub">{product.subtitle}</p>}
              <p className="mm-detail-meta">
                Produktionszeit: <strong>Auf Anfrage</strong> · exkl. Versand
              </p>

              {/* Beschreibung (als reiner Text, ohne HTML/DOMPurify) */}
              {product.description && (
                <div className="mm-detail-section">
                  <h2 className="mm-detail-h2">ÜBERSICHT</h2>
                  <div style={{ lineHeight: 1.65, color: "#3b4540", whiteSpace: "pre-wrap" }}>
                    {product.description}
                  </div>
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

              {/* Mengenstaffel */}
              {SHOW_TIERS && tiers.length > 0 && (
                <div className="mm-tiers">
                  <div className="mm-tiers-head">
                    <span className="mm-detail-cbnum">{colors.length > 0 ? "2." : "1."}</span>{" "}
                    <span>Menge auswählen</span>
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

              {/* Größen-Auswahl + Mengen + Anfrage-Formular */}
              <DetailOrderForm
                productId={product.id}
                productCode={product.code}
                productName={product.name}
                sizes={sizesList}
                tiers={tiers}
                basePriceCents={product.priceCents}
              />

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
                <div><strong>✓</strong> Angebot in 24 Stunden</div>
                <div><strong>✓</strong> Persönliche Beratung</div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </SiteShell>
  );
}
