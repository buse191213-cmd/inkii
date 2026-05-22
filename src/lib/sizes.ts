/** Größen mit optionalem Aufpreis. Persistiert als JSON im Product.sizes-Feld.
 *  Beispiel: [{name:"S",extraCents:0},{name:"XXL",extraCents:90},{name:"3XL",extraCents:120}] */

export type ProductSize = { name: string; extraCents: number };

export function parseSizesField(raw: string | null | undefined): Array<{
  nameText: string;
  extraText: string;
}> {
  return parseSizes(raw).map((s) => ({
    nameText: s.name,
    extraText: s.extraCents > 0 ? (s.extraCents / 100).toFixed(2).replace(".", ",") : "",
  }));
}

export function parseSizes(raw: string | null | undefined): ProductSize[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const out: ProductSize[] = [];
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const name = String((item as Record<string, unknown>).name ?? "").trim();
      const extraCents = Number((item as Record<string, unknown>).extraCents);
      if (name) {
        out.push({
          name,
          extraCents: Number.isFinite(extraCents) && extraCents >= 0
            ? Math.round(extraCents)
            : 0,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export function stringifySizesFromDrafts(
  drafts: Array<{ nameText: string; extraText: string }>
): string {
  const out: ProductSize[] = [];
  for (const d of drafts) {
    const name = d.nameText.trim();
    if (!name) continue;
    const raw = (d.extraText || "0").replace(",", ".");
    const euro = parseFloat(raw) || 0;
    out.push({ name, extraCents: Math.round(euro * 100) });
  }
  return JSON.stringify(out);
}
