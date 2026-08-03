/**
 * Bildoptimierung vorübergehend deaktiviert: liefert die Original-URL zurück.
 * (Die Vercel-Optimierung /_next/image verursachte, dass Bilder gar nicht mehr
 * geladen wurden. Bis das geklärt ist, geben wir das Rohbild unverändert aus.)
 */
export function optimizedImage(src: string, _width = 640, _quality = 75): string {
  return src;
}
