import SiteShell from "@/components/SiteShell";
import CatalogClient, { CatalogProduct, CatalogCategory } from "@/components/CatalogClient";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Werbemittel & Werbeartikel | INKII",
  description:
    "Werbeartikel mit Wirkung – vom Kugelschreiber bis zur Powerbank, individuell veredelt mit Ihrem Logo. Jetzt im Katalog stöbern.",
  alternates: { canonical: "/werbemittel" },
};

export default async function WerbemittelPage() {
  const d = getDictionary(await getLocale());

  const [dbProducts, dbCategories] = await Promise.all([
    db.product.findMany({
      where: { status: "active" },
      include: { category: true },
      orderBy: [
        { displayOrder: "desc" },
        { createdAt: "desc" },
      ],
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { status: "active" } } } } },
    }),
  ]);

  const products: CatalogProduct[] = dbProducts.map((p) => {
    return {
    id: p.id,
    code: p.code,
    name: p.name,
    subtitle: p.subtitle,
    icon: p.icon,
    images: p.images
      ? String(p.images).split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    priceCents: p.priceCents,
    // Kademeli fiyatlardaki EN DÜŞÜK fiyat (çok alınca ucuzlar) — listede "ab X €" için
    lowestPriceCents: (() => {
      try {
        const tiers = JSON.parse((p as { priceTiers?: string }).priceTiers ?? "[]");
        const tierCents = Array.isArray(tiers)
          ? tiers
              .map((t: { cents?: number }) => t?.cents)
              .filter((c: unknown): c is number => typeof c === "number" && c > 0)
          : [];
        const base = typeof p.priceCents === "number" && p.priceCents > 0 ? [p.priceCents] : [];
        const all = [...base, ...tierCents];
        return all.length > 0 ? Math.min(...all) : null;
      } catch {
        return p.priceCents;
      }
    })(),
    stock: p.stock,
    isNew: p.isNew,
    isEco: p.isEco,
    isBestseller: (p as { isBestseller?: boolean }).isBestseller ?? false,
    deliveryDays: (p as { deliveryDays?: number }).deliveryDays ?? 0,
    colors: p.colors ? String(p.colors).split(",").map((c: string) => c.trim()).filter(Boolean) : [],
    material: p.material ? String(p.material).split(",").map((m: string) => m.trim()).filter(Boolean) : [],
    categorySlug: p.category.slug,
    cardFit: (p as { cardFit?: string }).cardFit || "cover",
    cardCrop: (p as { cardCrop?: string }).cardCrop || "",
    visiblePages: (() => {
      try {
        const arr = JSON.parse(p.visiblePages ?? "[]");
        return Array.isArray(arr) ? arr.filter((x: unknown) => typeof x === "string") : [];
      } catch {
        return [];
      }
    })(),
    };
  });

  const categories: CatalogCategory[] = dbCategories
    .map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }))
    .filter((c) => c.count > 0);

  return (
    <SiteShell>
      <Suspense fallback={<div style={{ minHeight: 400 }} />}>
        <CatalogClient
          products={products}
          categories={categories}
          t={d.catalog}
          nav={d.nav}
          c={d.common}
        />
      </Suspense>
      <div className="cta-strip" style={{ margin: "60px 28px 0" }}>
        <h2>{d.catalog.ctaTitle}</h2>
        <p>{d.catalog.ctaText}</p>
        <Link className="btn btn-primary" href="/kontakt">
          {d.catalog.ctaBtn}
        </Link>
      </div>
    </SiteShell>
  );
}
