/**
 * Wandelt eine (Blob-)Bild-URL in eine über Vercels Bildoptimierung
 * ausgelieferte URL um (`/_next/image`). Ergebnis: WebP statt Original,
 * passende Breite statt Vollformat → deutlich kleinere Dateien und schnellere
 * Ladezeiten, ohne dass wir `next/image` (mit Layout-Zwang) verwenden müssen.
 *
 * Für <img>-Tags in Katalog-/Related-Karten gedacht, NICHT für den
 * Customizer (dort hängen Koordinaten am Rohbild).
 *
 * @param src  Original-Bild-URL (Vercel Blob o. Ä.)
 * @param width  gewünschte Anzeigebreite in px (Vercel liefert die nächste passende Größe)
 * @param quality  1–100 (Standard 75)
 */
export function optimizedImage(src: string, width = 640, quality = 75): string {
  if (!src) return src;
  // Nur externe/absolute Bilder optimieren; data:-URIs & SVGs unverändert lassen.
  if (src.startsWith("data:") || src.endsWith(".svg")) return src;
  try {
    const encoded = encodeURIComponent(src);
    return `/_next/image?url=${encoded}&w=${width}&q=${quality}`;
  } catch {
    return src;
  }
}
