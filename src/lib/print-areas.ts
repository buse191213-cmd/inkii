// Baskı alanı ön tanımları — ürün tipine göre.
// left/top/right/bottom: görselin % koordinatları (0-100).
// widthCm/heightCm: baskı alanının gerçek dünya boyutu.

export type PrintAreaType = "tshirt" | "bag" | "cap" | "mug" | "notebook" | "hoodie";

export type PrintAreaConfig = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  widthCm: number;
  heightCm: number;
  label: string; // admin için okunabilir ad
};

export const PRINT_AREAS: Record<PrintAreaType, PrintAreaConfig> = {
  // T-Shirt: göğüs bölgesi, DIN A3+ (34×42 cm)
  tshirt: {
    left: 29, top: 20, right: 71, bottom: 71,
    widthCm: 34, heightCm: 42,
    label: "T-Shirt / Textil (Brust)",
  },
  // Hoodie: kapüşon nedeniyle biraz daha aşağıda
  hoodie: {
    left: 30, top: 28, right: 70, bottom: 68,
    widthCm: 30, heightCm: 36,
    label: "Hoodie / Sweatshirt",
  },
  // Tasche/Beutel: orta-alt bölge, daha küçük alan
  bag: {
    left: 30, top: 58, right: 70, bottom: 92,
    widthCm: 25, heightCm: 30,
    label: "Tasche / Beutel",
  },
  // Cap/Mütze: ön panel, üstte ve klein
  cap: {
    left: 40, top: 32, right: 60, bottom: 46,
    widthCm: 9, heightCm: 5,
    label: "Cap / Mütze (Front)",
  },
  // Tasse: yan yüzey, orta bölge
  mug: {
    left: 32, top: 34, right: 68, bottom: 66,
    widthCm: 20, heightCm: 8,
    label: "Tasse",
  },
  // Notizbuch: kapak ortası
  notebook: {
    left: 30, top: 28, right: 70, bottom: 72,
    widthCm: 14, heightCm: 20,
    label: "Notizbuch / Block",
  },
};

export const DEFAULT_PRINT_AREA_TYPE: PrintAreaType = "tshirt";

export function getPrintArea(type?: string | null): PrintAreaConfig {
  if (type && type in PRINT_AREAS) {
    return PRINT_AREAS[type as PrintAreaType];
  }
  return PRINT_AREAS[DEFAULT_PRINT_AREA_TYPE];
}

/**
 * Kategori adından/slug'ından otomatik print area tipi tahmin eder.
 * Admin manuel seçmezse başlangıç değeri olarak kullanılır.
 */
export function guessPrintAreaType(categoryName?: string | null, categorySlug?: string | null): PrintAreaType {
  const s = `${categoryName || ""} ${categorySlug || ""}`.toLowerCase();
  if (/tasche|beutel|bag|rucksack|shopper/.test(s)) return "bag";
  if (/cap|mütze|mutze|kappe|hut|beanie/.test(s)) return "cap";
  if (/tasse|becher|mug|glas/.test(s)) return "mug";
  if (/notiz|block|buch|notebook|heft/.test(s)) return "notebook";
  if (/hoodie|sweat|pullover|kapuzen/.test(s)) return "hoodie";
  return "tshirt";
}
