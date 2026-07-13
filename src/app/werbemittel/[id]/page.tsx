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
                inkl. MwSt., zzgl. Versand
              </p>

              <p className="mm-detail-meta">
                Produktionszeit: <strong>Auf Anfrage</strong> · exkl. Versand
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
                    <div className="mm-card-tags">
                      {r.isNew && <span className="mm-tag tag-new">NEU</span>}
                      {r.stock > 0 && <span className="mm-tag tag-stock">AB LAGER</span>}
                      {r.isEco && <span className="mm-tag tag-eco">✦ NACHHALTIG</span>}
                    </div>

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
