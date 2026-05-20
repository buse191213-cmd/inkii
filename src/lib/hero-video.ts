import { db } from "@/lib/db";

/**
 * Liefert die URL des hinterlegten Hero-Videos oder null.
 * Das Video wird in Vercel Blob gespeichert; die URL steht in der Datenbank.
 * Nur serverseitig verwendbar.
 */
export async function getHeroVideoSrc(): Promise<string | null> {
  try {
    const row = await db.siteImage.findUnique({ where: { key: "hero-video" } });
    return row?.url ?? null;
  } catch {
    return null;
  }
}
