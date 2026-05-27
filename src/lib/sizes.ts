/** Größen mit optionalem individuellem Stückpreis. Persistiert als JSON im Product.sizes-Feld.
 *  WICHTIG: `extraCents` ist hier der ABSOLUTE Stückpreis dieser Größe in Cent.
 *  0 oder leer = "wie Basispreis" (kein Unterschied).
 *  Beispiel mit Basispreis €1,00:
 *    [{name:"S",extraCents:0},          → S kostet €1,00 (wie Basis)
 *     {name:"M",extraCents:0},          → M kostet €1,00 (wie Basis)
 *     {name:"L",extraCents:80},         → L kostet €0,80 (Rabatt)
 *     {name:"XL",extraCents:150}]       → XL kostet €1,50 (Aufpreis)
 *  Mengenrabatt aus PriceTiers wird auf den jeweiligen Stückpreis anteilig
 *  übertragen (Verhältnis = aktiver Staffel-Preis / Basispreis). */

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
