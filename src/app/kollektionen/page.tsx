import SiteShell from "@/components/SiteShell";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import KollektionenClient, { type KollektionProduct } from "./KollektionenClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kollektionen",
  description:
    "Entdecken Sie unsere eigenen Designs – fertige Kollektionen zum Direktkauf. Sommer, Winter, Bestseller und mehr, in allen Größen erhältlich.",
  alternates: { canonical: "/kollektionen" },
};

// Feste Kategorien-Reihenfolge & Labels
const COLLECTION_CATEGORIES: { key: string; label: string }[] = [
  { key: "bestseller", label: "Bestseller" },
  { key: "neu", label: "Neuheiten" },
  { key: "sommer", label: "Sommer" },
  { key: "winter", label: "Winter" },
  { key: "weihnachten", label: "Weihnachten" },
  { key: "basics", label: "Basics" },
];

export default async function KollektionenPage() {
  let dbProducts: Awaited<ReturnType<typeof db.product.findMany>> = [];
  try {
    dbProducts = await db.product.findMany({
      where: { status: "active", isCollection: true },
      orderBy: [{ displayOrder: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    dbProducts = [];
  }

  const products: KollektionProduct[] = dbProducts.map((p) => {
    let images: string[] = [];
    if (p.images) images = p.images.split(",").map((s) => s.trim()).filter(Boolean);
    let sizes: { name: string; extraCents: number }[] = [];
    try {
      const parsed = JSON.parse(p.sizes || "[]");
      if (Array.isArray(parsed)) sizes = parsed;
    } catch { /* leer */ }
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      subtitle: p.subtitle ?? "",
      priceCents: p.priceCents ?? 0,
      image: images[0] ?? "",
      sizes: sizes.map((s) => s.name),
      stock: p.stock ?? 0,
      category: (p as { collectionCategory?: string }).collectionCategory ?? "",
      isNew: p.isNew ?? false,
      isBestseller: p.isBestseller ?? false,
    };
  });

  // Nur Kategorien anzeigen, die auch Produkte haben
  const usedCats = COLLECTION_CATEGORIES.filter((c) =>
    products.some((p) => p.category === c.key)
  );

  return (
    <SiteShell>
      <section className="koll-hero">
        <div className="koll-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">Home</Link>
            <span className="mm-dot">•</span>
            <span className="active">Kollektionen</span>
          </div>
          <h1 className="koll-hero-h1">Unsere Kollektionen</h1>
          <p className="koll-hero-lead">
            Eigene Designs, fertig für Sie – direkt bestellbar in Ihrer Größe.
          </p>
        </div>
      </section>

      <KollektionenClient products={products} categories={usedCats} />
    </SiteShell>
  );
}
