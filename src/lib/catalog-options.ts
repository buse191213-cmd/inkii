// Einzige Quelle für Farben & Materialien – genutzt vom Admin-Formular,
// vom Katalog-Filter und von der Produktseite. Keine Node-Abhängigkeiten.

export type ColorOption = { key: string; label: string; hex: string };

export const PRODUCT_COLORS: ColorOption[] = [
  { key: "weiss", label: "Weiß", hex: "#ffffff" },
  { key: "schwarz", label: "Schwarz", hex: "#1c2722" },
  { key: "grau", label: "Grau", hex: "#8b948d" },
  { key: "silber", label: "Silber", hex: "#c9cdc9" },
  { key: "blau", label: "Blau", hex: "#2f5fd0" },
  { key: "navy", label: "Navy", hex: "#16306b" },
  { key: "gruen", label: "Grün", hex: "#3f9c5c" },
  { key: "rot", label: "Rot", hex: "#d8442f" },
  { key: "gelb", label: "Gelb", hex: "#f2c200" },
  { key: "orange", label: "Orange", hex: "#e8732f" },
  { key: "natur", label: "Natur", hex: "#d6c39a" },
  { key: "pink", label: "Pink", hex: "#d8569a" },
];

export type MaterialOption = { key: string; label: string };

export const PRODUCT_MATERIALS: MaterialOption[] = [
  { key: "baumwolle", label: "Baumwolle" },
  { key: "polyester", label: "Polyester" },
  { key: "kunststoff", label: "Kunststoff" },
  { key: "metall", label: "Metall" },
  { key: "edelstahl", label: "Edelstahl" },
  { key: "aluminium", label: "Aluminium" },
  { key: "bambus", label: "Bambus" },
  { key: "holz", label: "Holz" },
  { key: "glas", label: "Glas" },
  { key: "keramik", label: "Keramik" },
  { key: "leder", label: "Leder" },
  { key: "papier", label: "Papier" },
];

const colorMap = new Map(PRODUCT_COLORS.map((c) => [c.key, c]));
const materialMap = new Map(PRODUCT_MATERIALS.map((m) => [m.key, m]));

/** True wenn der Wert ein direkter Hex-Farbcode ist (z. B. "#ff5733"). */
function isHex(key: string): boolean {
  return typeof key === "string" && /^#[0-9a-fA-F]{3,8}$/.test(key);
}

/** Hex-Wert zu einem Farbschlüssel (Fallback: neutrales Grau).
 *  Wenn der Schlüssel selbst schon ein Hex-Code ist (Custom-Farbe),
 *  wird er direkt zurückgegeben. */
export function colorHex(key: string): string {
  // "hex:name" formatı: hex'i al
  if (key.includes(":") && key.startsWith("#")) {
    const hex = key.split(":")[0];
    if (isHex(hex)) return hex;
  }
  if (isHex(key)) return key;
  return colorMap.get(key)?.hex ?? "#cccccc";
}

/** Anzeigename zu einem Farbschlüssel.
 *  Bei Custom-Farben (Hex) wird der Code in Großbuchstaben angezeigt.
 *  Bei "hex:name" Format wird der Name angezeigt. */
export function colorLabel(key: string): string {
  // "hex:name" formatı: name'i al
  if (key.includes(":") && key.startsWith("#")) {
    const parts = key.split(":");
    if (parts[1] && parts[1].trim()) return parts[1].trim();
    return parts[0].toUpperCase();
  }
  if (isHex(key)) return key.toUpperCase();
  return colorMap.get(key)?.label ?? key;
}

/** Anzeigename zu einem Materialschlüssel. */
export function materialLabel(key: string): string {
  return materialMap.get(key)?.label ?? key.charAt(0).toUpperCase() + key.slice(1);
}
