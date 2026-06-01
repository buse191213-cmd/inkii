import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Erstellt einheitliche, suchmaschinenfreundliche Metadaten für eine Unterseite.
 * Verwendet das Layout-Default für Open-Graph-Bild + Site-Name,
 * ergänzt nur Title/Description/Canonical/Path-spezifische Felder.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  /** z. B. "/bereiche/textilveredelung" — wird zum kanonischen Pfad. */
  path: string;
  /** Optional: eigenes OG-Bild für diese Seite (sonst Layout-Default). */
  image?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const og = image
    ? [{ url: image, width: 1200, height: 630, alt: title }]
    : undefined; // Layout-Default greift
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | INKII Works`,
      description,
      url,
      ...(og ? { images: og } : {}),
    },
    twitter: {
      title: `${title} | INKII Works`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
