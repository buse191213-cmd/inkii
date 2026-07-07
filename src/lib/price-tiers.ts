/** Mengenstaffel-Preise. Persistiert als JSON-Array im Product.priceTiers-Feld.
 *  Beispiel: [{qty:15,cents:1491}, {qty:50,cents:1349}, {qty:100,cents:1315}] */

export type PriceTier = { qty: number; cents: number };

/** Parst das JSON robust — leere oder ungültige Werte ergeben [].
 *  Tiers werden nach Stückzahl aufsteigend sortiert. */
export function parsePriceTiers(raw: string | null | undefined): PriceTier[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const tiers: PriceTier[] = [];
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const qty = Number((item as Record<string, unknown>).qty);
      const cents = Number((item as Record<string, unknown>).cents);
      if (Number.isFinite(qty) && qty > 0 && Number.isFinite(cents) && cents >= 0) {
        tiers.push({ qty: Math.round(qty), cents: Math.round(cents) });
      }
    }
    tiers.sort((a, b) => a.qty - b.qty);
    return tiers;
  } catch {
    return [];
  }
}

/** Validierung & Serialisierung für die DB. */
export function stringifyPriceTiers(tiers: PriceTier[]): string {
  const cleaned = tiers
    .filter((t) => Number.isFinite(t.qty) && t.qty > 0 && Number.isFinite(t.cents) && t.cents >= 0)
    .map((t) => ({ qty: Math.round(t.qty), cents: Math.round(t.cents) }))
    .sort((a, b) => a.qty - b.qty);
  return JSON.stringify(cleaned);
}

/** Ersparnis in % gegenüber dem Basispreis (priceCents) oder dem ersten Tier.
 *  Rückgabe als ganze Zahl, z. B. 12 für "Spart 12%".
 *  @param basePriceCents Optional: Wenn gesetzt, wird das als Basis genommen
 *                        (Admin's "Preis (€)"). Sonst wird der erste Tier verwendet. */
export function tierDiscountPercent(
  tiers: PriceTier[],
  tier: PriceTier,
  basePriceCents?: number | null
): number {
  // Öncelik: basePriceCents (Preis € Feld) > ilk tier
  const basePrice = (basePriceCents && basePriceCents > 0)
    ? basePriceCents
    : (tiers.length > 0 ? tiers[0].cents : 0);
  if (basePrice <= 0) return 0;
  const diff = basePrice - tier.cents;
  if (diff <= 0) return 0;
  return Math.round((diff / basePrice) * 100);
}
