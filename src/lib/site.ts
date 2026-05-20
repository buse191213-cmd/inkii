// Basis-URL der Website. Beim Veröffentlichen in der .env als
// NEXT_PUBLIC_SITE_URL die echte Domain eintragen (z. B. https://www.inkii.de).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.inkii.de"
).replace(/\/+$/, "");
