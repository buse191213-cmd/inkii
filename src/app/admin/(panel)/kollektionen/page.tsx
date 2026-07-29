import { db } from "@/lib/db";
import KollektionKategorieManager, { type AdminKollektionKategorie } from "./KollektionKategorieManager";

export const dynamic = "force-dynamic";

export default async function AdminKollektionenPage() {
  let cats: AdminKollektionKategorie[] = [];
  try {
    const rows = await db.kollektionKategorie.findMany({
      orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
    });
    cats = rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      imageUrl: c.imageUrl ?? "",
      sortOrder: c.sortOrder ?? 0,
    }));
  } catch {
    cats = [];
  }
  return <KollektionKategorieManager categories={cats} />;
}
