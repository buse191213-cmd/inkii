import { db } from "@/lib/db";
import { HOME_SLOT_IDS } from "./home-slots";

/** URL des Bildes für einen Bereich oder null. Nur serverseitig. */
export async function getHomeImage(slot: string): Promise<string | null> {
  try {
    const row = await db.siteImage.findUnique({ where: { key: slot } });
    return row?.url ?? null;
  } catch {
    return null;
  }
}

/** Alle Startseiten-Bilder als { slot: url|null }. */
export async function getHomeImages(): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  for (const id of HOME_SLOT_IDS) out[id] = null;
  try {
    const rows = await db.siteImage.findMany({
      where: { key: { in: HOME_SLOT_IDS } },
    });
    for (const r of rows as { key: string; url: string }[]) out[r.key] = r.url;
  } catch {
    /* Datenbank nicht erreichbar – nur Platzhalter ausliefern */
  }
  return out;
}
