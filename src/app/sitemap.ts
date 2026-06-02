import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/bereiche/textilveredelung",
    "/bereiche/firmenkleidung",
    "/bereiche/premium-werbemittel",
    "/bereiche/onlineshops",
    "/fahrzeugbeschriftung",
    "/werbemittel",
    "/leistungen",
    "/bereiche",
    "/nachhaltigkeit",
    "/ueber-uns",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/widerrufsbelehrung",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      where: { status: "active" },
      select: { id: true, updatedAt: true },
    });
    productRoutes = products.map((p: { id: string; updatedAt: Date }) => ({
      url: `${SITE_URL}/werbemittel/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    /* Datenbank nicht erreichbar – nur statische Routen ausliefern */
  }

  return [...staticRoutes, ...productRoutes];
}
