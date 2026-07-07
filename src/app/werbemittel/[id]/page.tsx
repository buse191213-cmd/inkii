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
import ProductDetailTabs, { type DetailTab } from "@/components/ProductDetailTabs";
import { CARE_SYMBOLS } from "@/lib/care-symbols";

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
  const locale = await getLocale();
  const d = getDictionary(locale);
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
            <Link href={product.category?.slug ? `/werbemittel?cat=${product.category.slug}` : "/werbemittel"}>
              {categoryName.toUpperCase()}
            </Link>
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
              <ProductGallery
                images={images}
                colorImages={colorImages}
                colors={colors}
                name={product.name}
                iconName={product.icon}
                cardCrop={(product as { cardCrop?: string }).cardCrop || ""}
              />
            </div>

            {/* Info */}
            <div className="mm-detail-info">
              <h1 className="mm-detail-h1">{product.name}</h1>
              {product.subtitle && <p className="mm-detail-sub">{product.subtitle}</p>}

              {/* FIYAT — ürün başlığı altında her zaman görünür */}
              {(() => {
                // priceCents varsa onu kullan (kullanıcının admin'de girdiği ana fiyat)
                // yoksa tier'ların minimumunu göster
                const lowestTierCents = tiers.length > 0
                  ? Math.min(...tiers.map((t) => t.cents))
                  : null;
                const displayCents = product.priceCents ?? lowestTierCents;
                // "ab" prefix SADECE priceCents yoksa ve tier'lar varsa göster
                const showFromPrefix = product.priceCents == null && tiers.length > 0;

                if (displayCents == null || displayCents === 0) {
                  return (
                    <div style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      marginTop: 14,
                      marginBottom: 4,
                    }}>
                      <span style={{
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "#0f1a16",
                        letterSpacing: "-0.01em",
                      }}>
                        Preis auf Anfrage
                      </span>
                    </div>
                  );
                }

                const euroVal = (displayCents / 100).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });

                return (
                  <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    marginTop: 14,
                    marginBottom: 4,
                    flexWrap: "wrap",
                  }}>
                    {showFromPrefix && (
                      <span style={{
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}>
                        ab
                      </span>
                    )}
                    <span style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: "#0f1a16",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}>
                      €{euroVal}
                    </span>
                    <span style={{
                      fontSize: 13,
                      color: "#64748b",
                      fontWeight: 500,
                    }}>
                      / Stück
                    </span>
                  </div>
                );
              })()}
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, marginBottom: 16 }}>
                Alle Preise zzgl. MwSt. und Versand
              </p>

              <p className="mm-detail-meta">
                Produktionszeit: <strong>Auf Anfrage</strong> · exkl. Versand
              </p>

              {/* ÜBERSICHT + DETAILS tabs yan yana */}
              {(() => {
                const tabs: DetailTab[] = [];
                if (product.description) {
                  tabs.push({ key: "ubersicht", label: "ÜBERSICHT", html: product.description });
                }
                const rows: Array<{ k: string; v: string }> = [
                  { k: dt.specArtNr, v: product.code },
                  { k: dt.specCategory, v: categoryName },
                  { k: dt.specStock, v: `${formatNumber(product.stock)} ${dt.stockUnit}` },
                ];
                if (materials.length > 0) {
                  rows.push({ k: dt.specMaterial, v: materials.map((m) => materialLabel(m)).join(", ") });
                }
                tabs.push({ key: "details", label: "DETAILS", rows });

                // 3. tab: Waschanleitung (sadece care symbols seçilmişse)
                const careRaw = (product as { careSymbols?: string }).careSymbols || "";
                if (careRaw.trim()) {
                  const keys = careRaw.split(",").map((s) => s.trim()).filter(Boolean);
                  const loc: "de" | "en" | "tr" = locale === "tr" ? "tr" : locale === "en" ? "en" : "de";
                  const icons = keys.map((key) => {
                    const sym = CARE_SYMBOLS.find((s) => s.key === key);
                    return {
                      key,
                      label: sym?.label[loc] ?? key,
                      svg: sym?.svg ?? null,
                      imgUrl: sym?.imgUrl,
                    };
                  });
                  const careLabel = loc === "tr" ? "YIKAMA TALİMATI" : loc === "en" ? "CARE INSTRUCTIONS" : "WASCHANLEITUNG";
                  tabs.push({ key: "care", label: careLabel, careIcons: icons });
                }

                return <ProductDetailTabs tabs={tabs} />;
              })()}

              {/* Eigenes Design hochladen — DETAILS altında */}
              <DesignerLauncher productName={product.name} productCode={product.code} />

              {/* Sipariş formu */}
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
