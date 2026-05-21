import { db } from "./db";
import type { Dictionary } from "@/dictionaries/types";

/** Alle bekannten Navbar-Einträge in Standard-Reihenfolge. */
export const NAV_KEYS = [
  "home",
  "veredelung",
  "werbemittel",
  "leistungen",
  "bereiche",
  "nachhaltigkeit",
  "ueberUns",
  "kontakt",
] as const;

export type NavKey = (typeof NAV_KEYS)[number];

/** Pfad zu jedem Schlüssel. */
export const NAV_HREF: Record<NavKey, string> = {
  home: "/",
  veredelung: "/veredelung",
  werbemittel: "/werbemittel",
  leistungen: "/leistungen",
  bereiche: "/bereiche",
  nachhaltigkeit: "/nachhaltigkeit",
  ueberUns: "/ueber-uns",
  kontakt: "/kontakt",
};

/** Beschriftung aus dem Wörterbuch (Sprache wird über `nav` übergeben). */
export function navLabel(key: NavKey, nav: Dictionary["nav"]): string {
  return nav[key];
}

export type NavItemResolved = {
  key: NavKey;
  href: string;
  active: boolean;
  sortOrder: number;
};

/**
 * Lädt alle Einstellungen aus der DB und ergänzt fehlende Schlüssel mit
 * `active = true`. So bleibt die Navbar bei einer frischen Installation
 * vollständig sichtbar und der Admin kann nach und nach Seiten deaktivieren.
 */
export async function getAllNavItems(): Promise<NavItemResolved[]> {
  type Row = { key: string; active: boolean; sortOrder: number };
  let rows: Row[] = [];
  try {
    rows = (await db.navSetting.findMany()) as Row[];
  } catch {
    rows = [];
  }
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return NAV_KEYS.map((k, i) => {
    const r = byKey.get(k);
    return {
      key: k,
      href: NAV_HREF[k],
      active: r ? r.active : true,
      sortOrder: r ? r.sortOrder : (i + 1) * 10,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Nur aktive Einträge in Reihenfolge — für den Header. */
export async function getActiveNavItems() {
  const all = await getAllNavItems();
  return all.filter((n) => n.active);
}
