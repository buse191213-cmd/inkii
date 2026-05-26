import { db } from "./db";
import type { Dictionary } from "@/dictionaries/types";

/** Alle bekannten Navbar-Einträge in Standard-Reihenfolge. */
export const NAV_KEYS = [
  "home",
  "kleidung",
  "taschen",
  "werbeartikel",
  "werbemittel",
  "webdesign",
  "marketing",
  // Sekundär (per Admin abschaltbar):
  "veredelung",
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
  kleidung: "/werbemittel?cat=kleidung",
  taschen: "/werbemittel?cat=taschen",
  werbeartikel: "/werbemittel?cat=werbeartikel",
  werbemittel: "/werbemittel",
  webdesign: "/leistungen",
  marketing: "/leistungen",
  veredelung: "/veredelung",
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

/** Standard-aktive Einträge (die übrigen sind zwar verfügbar, aber per Default nicht in der Hauptnavbar sichtbar). */
const DEFAULT_ACTIVE: ReadonlySet<NavKey> = new Set([
  "home",
  "kleidung",
  "taschen",
  "werbeartikel",
  "werbemittel",
  "webdesign",
  "marketing",
]);

/**
 * Lädt alle Einstellungen aus der DB und ergänzt fehlende Schlüssel mit
 * `active = true`. So bleibt die Navbar bei einer frischen Installation
 * vollständig sichtbar und der Admin kann nach und nach Seiten deaktivieren.
 */
export async function getAllNavItems(): Promise<NavItemResolved[]> {
  type Row = { key: string; active: boolean; sortOrder: number };
  let rows: Row[] = [];
  try {
    // Vorsichtig: das Modell wird ggf. noch nicht in der DB existieren
    // (z. B. wenn `prisma db push` noch nicht gelaufen ist). In dem Fall
    // schweigend mit Defaults weitermachen, statt das ganze Layout zu killen.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ns = (db as any).navSetting;
    if (ns && typeof ns.findMany === "function") {
      rows = (await ns.findMany()) as Row[];
    }
  } catch {
    rows = [];
  }
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return NAV_KEYS.map((k, i) => {
    const r = byKey.get(k);
    return {
      key: k,
      href: NAV_HREF[k],
      active: r ? r.active : DEFAULT_ACTIVE.has(k),
      sortOrder: r ? r.sortOrder : (i + 1) * 10,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Nur aktive Einträge in Reihenfolge — für den Header. */
export async function getActiveNavItems() {
  const all = await getAllNavItems();
  return all.filter((n) => n.active);
}
