// Bild-Bereiche der Startseite, Nachhaltigkeits-, Leistungs- & Bereiche-Seite.
// Keine Node-Abhängigkeiten – auch im Client nutzbar.

export type HomeSlot = {
  slot: string;
  label: string;
  group: "home-tiles" | "category" | "nachhaltigkeit" | "bereiche" | "page" | "textil-method" | "firmen-method" | "premium-method" | "onlineshops-method" | "im" | "fahrzeug-method" | "werbeartikel-img";
  /** Empfohlene Mindestgröße (px) für das Bild, z. B. "1600×900". */
  size?: string;
  /** Seitenverhältnis als CSS aspect-ratio, z. B. "16/9", "4/3", "1/1". */
  ratio?: string;
};

export const HOME_SLOTS: HomeSlot[] = [
  { slot: "home-tile-1", label: "Startseite — Großes Bild links (z. B. Bekleidung)", group: "home-tiles", size: "1200×900", ratio: "4/3" },
  { slot: "home-tile-2", label: "Startseite — Großes Bild rechts (z. B. Taschen)", group: "home-tiles", size: "1200×900", ratio: "4/3" },
  { slot: "tv-hero", label: "Textilveredelung — Hero Foto", group: "textil-method", size: "1600×800", ratio: "2/1" },
  { slot: "fk-hero", label: "Firmenkleidung — Hero Foto", group: "firmen-method", size: "1600×800", ratio: "2/1" },
  { slot: "pw-hero", label: "Premium Werbemittel — Hero Foto", group: "premium-method", size: "1600×800", ratio: "2/1" },
  { slot: "os-hero", label: "Onlineshops — Hero Foto", group: "onlineshops-method", size: "1600×800", ratio: "2/1" },
  { slot: "tv-method-1", label: "Textilveredelung — Siebdruck (Foto)", group: "textil-method", size: "800×800", ratio: "1/1" },
  { slot: "tv-method-2", label: "Textilveredelung — Stickerei (Foto)", group: "textil-method", size: "800×800", ratio: "1/1" },
  { slot: "tv-method-3", label: "Textilveredelung — DTF-Druck (Foto)", group: "textil-method", size: "800×800", ratio: "1/1" },
  { slot: "tv-method-4", label: "Textilveredelung — Flockdruck (Foto)", group: "textil-method", size: "800×800", ratio: "1/1" },
  { slot: "tv-method-5", label: "Textilveredelung — Patches (Foto)", group: "textil-method", size: "800×800", ratio: "1/1" },
  // Firmen- & Berufsbekleidung
  { slot: "fk-1", label: "Firmenkleidung — Polo & T-Shirts (Foto)", group: "firmen-method", size: "800×800", ratio: "1/1" },
  { slot: "fk-2", label: "Firmenkleidung — Hemden & Blusen (Foto)", group: "firmen-method", size: "800×800", ratio: "1/1" },
  { slot: "fk-3", label: "Firmenkleidung — Hoodies & Sweater (Foto)", group: "firmen-method", size: "800×800", ratio: "1/1" },
  { slot: "fk-4", label: "Firmenkleidung — Jacken & Westen (Foto)", group: "firmen-method", size: "800×800", ratio: "1/1" },
  { slot: "fk-5", label: "Firmenkleidung — Workwear (Foto)", group: "firmen-method", size: "800×800", ratio: "1/1" },
  // Premium Werbemittel
  { slot: "pw-1", label: "Premium Werbemittel — Trinkflaschen (Foto)", group: "premium-method", size: "800×800", ratio: "1/1" },
  { slot: "pw-2", label: "Premium Werbemittel — Caps (Foto)", group: "premium-method", size: "800×800", ratio: "1/1" },
  { slot: "pw-4", label: "Premium Werbemittel — Stoff & Leder (Foto)", group: "premium-method", size: "800×800", ratio: "1/1" },
  { slot: "pw-5", label: "Premium Werbemittel — Premium-Stifte (Foto)", group: "premium-method", size: "800×800", ratio: "1/1" },
  // Onlineshops
  { slot: "os-1", label: "Onlineshops — B2B-Shops (Foto)", group: "onlineshops-method", size: "800×800", ratio: "1/1" },
  { slot: "os-2", label: "Onlineshops — Konfiguratoren (Foto)", group: "onlineshops-method", size: "800×800", ratio: "1/1" },
  { slot: "os-3", label: "Onlineshops — ERP/PIM (Foto)", group: "onlineshops-method", size: "800×800", ratio: "1/1" },
  { slot: "os-4", label: "Onlineshops — Design & UX (Foto)", group: "onlineshops-method", size: "800×800", ratio: "1/1" },
  { slot: "os-5", label: "Onlineshops — Hosting & Support (Foto)", group: "onlineshops-method", size: "800×800", ratio: "1/1" },
  { slot: "fb-banner", label: "Fahrzeug — Startseite Banner (uzun)", group: "fahrzeug-method", size: "1800×600", ratio: "3/1" },
  { slot: "fb-hero", label: "Fahrzeug — Hero Foto", group: "fahrzeug-method", size: "1600×800", ratio: "2/1" },
  { slot: "fb-1", label: "Fahrzeug — Folienbeschriftung (Foto)", group: "fahrzeug-method", size: "800×800", ratio: "1/1" },
  { slot: "fb-2", label: "Fahrzeug — Vollverklebung (Foto)", group: "fahrzeug-method", size: "800×800", ratio: "1/1" },
  { slot: "fb-3", label: "Fahrzeug — Magnetschilder (Foto)", group: "fahrzeug-method", size: "800×800", ratio: "1/1" },
  { slot: "fb-4", label: "Fahrzeug — Schaufenster (Foto)", group: "fahrzeug-method", size: "800×800", ratio: "1/1" },
  { slot: "fb-5", label: "Fahrzeug — Design & Montage (Foto)", group: "fahrzeug-method", size: "800×800", ratio: "1/1" },
  { slot: "wa-1", label: "Werbeartikel — 01 Taschen", group: "werbeartikel-img", size: "800×1000", ratio: "4/5" },
  { slot: "wa-2", label: "Werbeartikel — 02 Büromaterial", group: "werbeartikel-img", size: "800×1000", ratio: "4/5" },
  { slot: "wa-3", label: "Werbeartikel — 03 Trinkflaschen & Becher", group: "werbeartikel-img", size: "800×1000", ratio: "4/5" },
  { slot: "wa-4", label: "Werbeartikel — 04 Werbegeschenke", group: "werbeartikel-img", size: "800×1000", ratio: "4/5" },

  { slot: "nh-hero", label: "Nachhaltigkeit — Titelbild (großer Hero-Bereich)", group: "nachhaltigkeit", size: "1920×900", ratio: "21/9" },
  { slot: "galerie-hero", label: "Galerie — Titelbild (Hero-Bereich)", group: "page", size: "1920×900", ratio: "21/9" },
  { slot: "nh-1", label: "Nachhaltigkeit — Karte 1: Faire Textilien", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-2", label: "Nachhaltigkeit — Karte 2: Wassersparende Verfahren", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-3", label: "Nachhaltigkeit — Karte 3: Langlebigkeit", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-4", label: "Nachhaltigkeit — Karte 4: Verpackung", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-5", label: "Nachhaltigkeit — Karte 5: Grüne Energie", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-6", label: "Nachhaltigkeit — Karte 6: Regionale Partner", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "bereiche-hero", label: "Bereiche-Seite — Titelbild (Hero)", group: "bereiche", size: "1920×900", ratio: "21/9" },
  { slot: "area-1", label: "Bereich 1 — Textilveredelung", group: "bereiche", size: "1200×900", ratio: "4/3" },
  { slot: "area-2", label: "Bereich 2 — Werbeartikel", group: "bereiche", size: "1200×900", ratio: "4/3" },
  { slot: "area-3", label: "Bereich 3 — Webdesign", group: "bereiche", size: "1200×900", ratio: "4/3" },
  { slot: "area-4", label: "Bereich 4 — Marketing", group: "bereiche", size: "1200×900", ratio: "4/3" },
  { slot: "uu-hero", label: "Über Uns — Titelbild (Hero)", group: "page", size: "1920×900", ratio: "21/9" },
  { slot: "uu-value-1", label: "Über Uns — Wert 1: Verlässlichkeit", group: "page", size: "800×1000", ratio: "4/5" },
  { slot: "uu-value-2", label: "Über Uns — Wert 2: Qualität", group: "page", size: "800×1000", ratio: "4/5" },
  { slot: "uu-value-3", label: "Über Uns — Wert 3: Persönlich", group: "page", size: "800×1000", ratio: "4/5" },
  { slot: "sport-hero", label: "Sportartikel — Titelbild (Hero)", group: "page", size: "1920×900", ratio: "21/9" },
  { slot: "sport-1", label: "Sportartikel — Bild 1 (Mood-Bild)", group: "page", size: "900×1200", ratio: "3/4" },
  { slot: "sport-2", label: "Sportartikel — Bild 2 (Mood-Bild)", group: "page", size: "900×1200", ratio: "3/4" },
  { slot: "sport-3", label: "Sportartikel — Bild 3 (Mood-Bild)", group: "page", size: "900×1200", ratio: "3/4" },
  { slot: "sport-4", label: "Sportartikel — Bild 4 (Mood-Bild)", group: "page", size: "900×1200", ratio: "3/4" },
  { slot: "sport-5", label: "Sportartikel — Bild 5 (Mood-Bild)", group: "page", size: "900×1200", ratio: "3/4" },
  { slot: "sport-6", label: "Sportartikel — Bild 6 (Mood-Bild)", group: "page", size: "900×1200", ratio: "3/4" },
  { slot: "sport-7", label: "Sportartikel — Bild 7 (Mood-Bild)", group: "page", size: "900×1200", ratio: "3/4" },
  { slot: "sport-8", label: "Sportartikel — Bild 8 (Mood-Bild)", group: "page", size: "900×1200", ratio: "3/4" },
  { slot: "marketing-logo", label: "INKII MARKETING — Logo (Header)", group: "im", size: "200×60", ratio: "auto" },
  { slot: "im-hero", label: "INKII MARKETING — Hero (Titelbild)", group: "im", size: "1920×900", ratio: "21/9" },
  { slot: "im-s1", label: "INKII MARKETING — 01 Webdesign", group: "im", size: "800×640", ratio: "5/4" },
  { slot: "im-s2", label: "INKII MARKETING — 02 Social Media", group: "im", size: "800×640", ratio: "5/4" },
  { slot: "im-s3", label: "INKII MARKETING — 03 SEO & Ads", group: "im", size: "800×640", ratio: "5/4" },
  { slot: "im-s4", label: "INKII MARKETING — 04 Branding", group: "im", size: "800×640", ratio: "5/4" },
];

export const HOME_SLOT_IDS: string[] = HOME_SLOTS.map((s) => s.slot);
