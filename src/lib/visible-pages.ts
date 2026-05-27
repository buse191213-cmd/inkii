// Hilfsmodul: parst / serialisiert die "visiblePages"-Liste eines Produkts.
// Beispiel: ["kleidung","werbeartikel"] → das Produkt erscheint auf den Seiten
// /werbemittel?cat=kleidung und /werbemittel?cat=werbeartikel.

export const ALL_PAGES = ["kleidung", "taschen", "werbeartikel"] as const;
export type PageSlug = (typeof ALL_PAGES)[number];

export const PAGE_LABELS: Record<PageSlug, string> = {
  kleidung: "Kleidung",
  taschen: "Taschen",
  werbeartikel: "Werbeartikel",
};

export function parsePages(raw: string | null | undefined): PageSlug[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is PageSlug =>
      typeof x === "string" && (ALL_PAGES as readonly string[]).includes(x)
    );
  } catch {
    return [];
  }
}

export function serializePages(list: string[]): string {
  const valid = list.filter((x): x is PageSlug =>
    (ALL_PAGES as readonly string[]).includes(x)
  );
  // Doppelte entfernen + Reihenfolge stabil halten
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of valid) {
    if (!seen.has(slug)) {
      seen.add(slug);
      out.push(slug);
    }
  }
  return JSON.stringify(out);
}
