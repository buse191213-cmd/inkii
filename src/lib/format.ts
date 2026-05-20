/** Wandelt Cent-Beträge in deutsche Preisdarstellung um. */
export function formatPrice(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "Preis auf Anfrage";
  return (
    "ab " +
    (cents / 100).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    " €"
  );
}

/** Wandelt einen Preis-String (z. B. "6,90") in Cent um, oder null. */
export function parsePriceToCents(value: string): number | null {
  const v = value.trim().replace(/\./g, "").replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

/** Cent zurück in einen editierbaren String "6,90". */
export function centsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Tausenderpunkte für Zahlen. */
export function formatNumber(n: number): string {
  return n.toLocaleString("de-DE");
}

/** Datum kurz, deutsch. */
export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Slug aus einem Namen erzeugen. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
