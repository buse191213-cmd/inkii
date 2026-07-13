import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import ProductGallery from "@/components/ProductGallery";
import { guessPrintAreaType } from "@/lib/print-areas";
import DesignUploadTabs from "@/components/DesignUploadTabs";
import MerkenButton from "@/components/MerkenButton";
import { db } from "@/lib/db";
import { formatPrice, formatNumber } from "@/lib/format";
import { colorHex, colorLabel, materialLabel } from "@/lib/catalog-options";
import { parsePriceTiers } from "@/lib/price-tiers";
import { parseSizes } from "@/lib/sizes";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import DetailOrderForm from "@/components/DetailOrderForm";
import ProductDetailTabs, { type DetailTab } from "@/components/ProductDetailTabs";
import { CARE_SYMBOLS } from "@/lib/care-symbols";
import { getShopConfig } from "@/app/admin/(panel)/settings/shop-config-actions";

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

  // Cross-sell: önce ADMIN'in manuel seçtiği öneriler, yoksa aynı kategori
  const recommendedIds = ((product as { recommendedIds?: string }).recommendedIds || "")
    .split(",").map((s) => s.trim()).filter(Boolean);

  let related: Awaited<ReturnType<typeof db.product.findMany>> = [];

  if (recommendedIds.length > 0) {
    // Manuel önerilen ürünleri getir (admin seçti)
    const manual = await db.product.findMany({
      where: { id: { in: recommendedIds } },
    });
    // Admin'in sıralamasını koru
    related = recommendedIds
      .map((id) => manual.find((m) => m.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }

  // Manuel öneri yoksa veya 4'ten az ise: aynı kategoriden doldur
  if (related.length < 4) {
    const existing = [product.id, ...related.map((r) => r.id)];
    const catProducts = await db.product.findMany({
      where: {
        id: { notIn: existing },
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
      },
      take: 4 - related.length,
      orderBy: { createdAt: "desc" },
    });
    related = [...related, ...catProducts];
  }
  // Hâlâ azsa: diğer ürünlerle doldur
  if (related.length < 4) {
    const fillers = await db.product.findMany({
      where: { id: { notIn: [product.id, ...related.map((r) => r.id)] } },
      take: 4 - related.length,
      orderBy: { createdAt: "desc" },
    });
    related = [...related, ...fillers];
  }

  const categoryName = product.category?.name ?? "Werbemittel";

  // Baskı alanı tipi: admin manuel seçtiyse onu kullan, yoksa kategoriden otomatik tahmin et
  const adminPrintType = (product as { printAreaType?: string }).printAreaType;
  const effectivePrintAreaType =
    adminPrintType && adminPrintType !== "tshirt"
      ? adminPrintType
      : guessPrintAreaType(product.category?.name, product.category?.slug);

  const images = split(product.images);
  const colors = split(product.colors);
  const materials = split(product.material);
  const tiers = parsePriceTiers(product.priceTiers);
  const sizesList = parseSizes(product.sizes);
  const shopConfig = await getShopConfig();
  const transferPriceCents = shopConfig.shipping.transferPriceCents ?? 900;

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
        <div className="wrap-wide">

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
                {(product as { isBestseller?: boolean }).isBestseller && (
                  <span className="mm-tag tag-best">★ MEISTVERKAUFT</span>
                )}
                {((product as { deliveryDays?: number }).deliveryDays ?? 0) > 0 && (
                  <span className="mm-tag tag-days">
                    {(product as { deliveryDays?: number }).deliveryDays} TAGE
                  </span>
                )}
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
                printAreaType={effectivePrintAreaType}
                customPrintArea={(product as { customPrintArea?: string }).customPrintArea || ""}
              />
            </div>

            {/* Info */}
            <div className="mm-detail-info">
              <h1 className="mm-detail-h1">{product.name}</h1>
              {product.subtitle && <p className="mm-detail-sub">{product.subtitle}</p>}

              {/* FIYAT — ürün başlığı altında her zaman görünür */}
              {(() => {
                // "ab" fiyatı = Staffeldeki EN DÜŞÜK stück fiyatı
                const lowestTierCents = tiers.length > 0
                  ? Math.min(...tiers.map((t) => t.cents))
                  : null;
                // Tier varsa en düşük tier, yoksa priceCents
                const displayCents = lowestTierCents ?? product.priceCents;
                // "ab" prefix — Mengenstaffel varsa göster
                const showFromPrefix = tiers.length > 0;

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
                        color: "#94a3b8",
                        fontWeight: 400,
                      }}>
                        ab
                      </span>
                    )}
                    <span style={{
                      fontSize: "1.75rem",
                      fontWeight: 500,
                      color: "#0f1a16",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}>
                      €{euroVal}
                    </span>
                    <span style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      fontWeight: 400,
                    }}>
                      / Stück
                    </span>
                  </div>
                );
              })()}
              {/* Ein Hinweis reicht — vorher stand „zzgl. Versand" doppelt */}
              <p style={{ fontSize: 12, color: "#a8b0aa", marginTop: 6, marginBottom: 20 }}>
                inkl. MwSt., zzgl. Versand
              </p>

              {/* ÜBERSICHT + DETAILS tabs yan yana — fiyatın hemen altında */}
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

              {/* Ihr Design hochladen — Details'ten sonra, sipariş formundan önce */}
              <DesignUploadTabs />

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
                transferPriceCents={transferPriceCents}
                minOrderQty={(product as { minOrderQty?: number }).minOrderQty ?? 1}
                colorImages={colorImages}
                t={d.detailForm}
              />

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

      {/* Vertrauens-Leiste — Social Proof vor den Empfehlungen */}
      <section className="mm-trust">
        <div className="wrap-wide">
          <div className="mm-trust-grid">
            <a
              href="https://de.trustpilot.com/review/inkiiworks.de"
              target="_blank"
              rel="noopener noreferrer"
              className="mm-trust-item mm-trust-link"
            >
              {/* Offizielles Trustpilot-Logo: grüner Stern + Wortmarke */}
              <div className="mm-trust-tp-logo" aria-label="Trustpilot">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#00b67a" aria-hidden>
                  <path d="M12 1.5l2.95 6.4 7.05.82-5.2 4.78 1.42 6.9L12 16.98l-6.22 3.42 1.42-6.9L2 8.72l7.05-.82z" />
                </svg>
                <span className="mm-trust-tp-word">Trustpilot</span>
              </div>
              <div className="mm-trust-stars" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
                  </svg>
                ))}
              </div>
              <div className="mm-trust-text">Bewerten Sie uns auf Trustpilot</div>
            </a>

            <div className="mm-trust-item">
              <svg className="mm-trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="6" width="14" height="11" rx="1.5" />
                <path d="M15 9h3.5L22 12.5V17h-7z" />
                <circle cx="6" cy="18.5" r="1.8" />
                <circle cx="18" cy="18.5" r="1.8" />
              </svg>
              <div className="mm-trust-title">Versand in ganz Deutschland</div>
              <div className="mm-trust-text">Zuverlässige Lieferung per DHL</div>
            </div>

            <div className="mm-trust-item">
              <svg className="mm-trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <div className="mm-trust-title">Qualitätskontrolle</div>
              <div className="mm-trust-text">Jede Bestellung wird vor der Produktion doppelt geprüft</div>
            </div>

            <div className="mm-trust-item">
              <svg className="mm-trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <div className="mm-trust-title">Sie vertrauen uns</div>
              <div className="mm-trust-text">Firmen, Vereine und Agenturen aus ganz Deutschland</div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mm-related">
          <div className="wrap-wide">
            <div className="mm-related-head">
              {dt.relatedKicker && <p className="kicker">{dt.relatedKicker}</p>}
              <h3>{dt.relatedTitle}</h3>
            </div>
            {/* Katalogdaki kartlarla BİREBİR aynı yapı (mm-card / mm-grid) */}
            <div className="mm-grid">
              {related.map((r) => {
                const rImages = split(r.images);
                const rImg = rImages[0] || null;
                const rColors = split(r.colors);
                // Kademeli fiyatlardaki en düşük fiyat (listedeki "ab" mantığı)
                const rLowest = (() => {
                  try {
                    const tiers = JSON.parse((r as { priceTiers?: string }).priceTiers ?? "[]");
                    const tierCents = Array.isArray(tiers)
                      ? tiers.map((x: { cents?: number }) => x?.cents)
                          .filter((c: unknown): c is number => typeof c === "number" && c > 0)
                      : [];
                    const base = typeof r.priceCents === "number" && r.priceCents > 0 ? [r.priceCents] : [];
                    const all = [...base, ...tierCents];
                    return all.length > 0 ? Math.min(...all) : null;
                  } catch {
                    return r.priceCents;
                  }
                })();
                // cardCrop (zoom/pan) — katalogla aynı
                let zoom = 1, tx = 0, ty = 0;
                try {
                  const cc = (r as { cardCrop?: string }).cardCrop;
                  if (cc) {
                    const c = JSON.parse(cc);
                    zoom = Number(c.zoom) || 1;
                    tx = Number(c.x) || 0;
                    ty = Number(c.y) || 0;
                  }
                } catch {}

                return (
                  <article key={r.id} className="mm-card">
                    <Link href={`/werbemittel/${r.id}`} className="mm-card-link">
                      <div className="mm-card-img">
                        {rImg ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={rImg}
                            alt={r.name}
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
                        ) : (
                          <span className="mm-related-img-fallback">INKII</span>
                        )}
                        <div className="mm-card-tags mm-card-tags-overlay">
                          {r.isNew && <span className="mm-tag tag-new">NEU</span>}
                          {(r as { isBestseller?: boolean }).isBestseller && (
                            <span className="mm-tag tag-best">★ MEISTVERKAUFT</span>
                          )}
                          {((r as { deliveryDays?: number }).deliveryDays ?? 0) > 0 && (
                            <span className="mm-tag tag-days">
                              {(r as { deliveryDays?: number }).deliveryDays} TAGE
                            </span>
                          )}
                          {r.stock > 0 && <span className="mm-tag tag-stock">AB LAGER</span>}
                          {r.isEco && <span className="mm-tag tag-eco">✦ NACHHALTIG</span>}
                        </div>
                        <span className="mm-quick">{dt.relatedCta ?? "Details"}</span>
                      </div>

                      {rColors.length > 0 && (
                        <div className="mm-card-colors">
                          {rColors.slice(0, 12).map((x) => (
                            <span
                              key={x}
                              className="mm-card-color"
                              style={{ background: colorHex(x) }}
                              title={colorLabel(x)}
                            />
                          ))}
                        </div>
                      )}

                      <div className="mm-card-name">{r.name}</div>
                      <div className="mm-card-price">
                        {rLowest != null ? (
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f1a16" }}>
                            <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 3, fontWeight: 500 }}>ab</span>
                            {(rLowest / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                            <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 3 }}>/ Stk</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                            Preis auf Anfrage
                          </span>
                        )}
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
