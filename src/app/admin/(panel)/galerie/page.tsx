import { db } from "@/lib/db";
import GalleryManager, { type AdminGalleryItem } from "./GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGaleriePage() {
  let rows: AdminGalleryItem[] = [];
  try {
    const data = await db.galleryItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    rows = data.map((r) => ({
      id: r.id,
      imageUrl: r.imageUrl,
      title: r.title ?? "",
      sortOrder: r.sortOrder ?? 0,
    }));
  } catch {
    rows = [];
  }
  return <GalleryManager items={rows} />;
}
