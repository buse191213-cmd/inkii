// Bild-Bereiche der Startseite, Nachhaltigkeits-, Leistungs- & Bereiche-Seite.
// Keine Node-Abhängigkeiten – auch im Client nutzbar.

export type HomeSlot = {
  slot: string;
  label: string;
  group: "home-tiles" | "category" | "feature" | "nachhaltigkeit" | "leistungen" | "bereiche" | "page" | "designer";
  /** Empfohlene Mindestgröße (px) für das Bild, z. B. "1600×900". */
  size?: string;
  /** Seitenverhältnis als CSS aspect-ratio, z. B. "16/9", "4/3", "1/1". */
  ratio?: string;
};

export const HOME_SLOTS: HomeSlot[] = [
  { slot: "home-tile-1", label: "Startseite — Großes Bild links (z. B. Bekleidung)", group: "home-tiles", size: "1200×900", ratio: "4/3" },
  { slot: "home-tile-2", label: "Startseite — Großes Bild rechts (z. B. Taschen)", group: "home-tiles", size: "1200×900", ratio: "4/3" },
  { slot: "cat-1", label: "Kategorie 1 — Firmen- & Arbeitskleidung", group: "category", size: "900×900", ratio: "1/1" },
  { slot: "cat-2", label: "Kategorie 2 — Werbeartikel & Merchandise", group: "category", size: "900×900", ratio: "1/1" },
  { slot: "cat-3", label: "Kategorie 3 — Team- & Sportbekleidung", group: "category", size: "900×900", ratio: "1/1" },
  { slot: "cat-4", label: "Kategorie 4 — Konzepte & Lösungen", group: "category", size: "900×900", ratio: "1/1" },
  { slot: "feat-1", label: "Leistung 1 — Professionelle Textilveredelung", group: "feature", size: "800×1000", ratio: "4/5" },
  { slot: "feat-2", label: "Leistung 2 — Firmen- und Berufsbekleidung", group: "feature", size: "800×1000", ratio: "4/5" },
  { slot: "feat-3", label: "Leistung 3 — Team- & Sportbekleidung", group: "feature", size: "800×1000", ratio: "4/5" },
  { slot: "feat-4", label: "Leistung 4 — Hochwertige Werbemittel", group: "feature", size: "800×1000", ratio: "4/5" },
  { slot: "feat-5", label: "Leistung 5 — INKII Works Shop", group: "feature", size: "800×1000", ratio: "4/5" },
  { slot: "feat-6", label: "Leistung 6 — Webdesign & digitale Lösungen", group: "feature", size: "800×1000", ratio: "4/5" },
  { slot: "feat-7", label: "Leistung 7 — Onlineshops für Unternehmen", group: "feature", size: "800×1000", ratio: "4/5" },
  { slot: "feat-8", label: "Leistung 8 — Ganzheitliche Marketinglösungen", group: "feature", size: "800×1000", ratio: "4/5" },
  { slot: "tv-method-1", label: "Textilveredelung — Siebdruck (Foto)", group: "feature", size: "800×800", ratio: "1/1" },
  { slot: "tv-method-2", label: "Textilveredelung — Stickerei (Foto)", group: "feature", size: "800×800", ratio: "1/1" },
  { slot: "tv-method-3", label: "Textilveredelung — DTF-Druck (Foto)", group: "feature", size: "800×800", ratio: "1/1" },
  { slot: "tv-method-4", label: "Textilveredelung — Flockdruck (Foto)", group: "feature", size: "800×800", ratio: "1/1" },
  { slot: "tv-method-5", label: "Textilveredelung — Patches (Foto)", group: "feature", size: "800×800", ratio: "1/1" },
  { slot: "nh-hero", label: "Nachhaltigkeit — Titelbild (großer Hero-Bereich)", group: "nachhaltigkeit", size: "1920×900", ratio: "21/9" },
  { slot: "nh-1", label: "Nachhaltigkeit — Karte 1: Faire Textilien", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-2", label: "Nachhaltigkeit — Karte 2: Wassersparende Verfahren", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-3", label: "Nachhaltigkeit — Karte 3: Langlebigkeit", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-4", label: "Nachhaltigkeit — Karte 4: Verpackung", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-5", label: "Nachhaltigkeit — Karte 5: Grüne Energie", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-6", label: "Nachhaltigkeit — Karte 6: Regionale Partner", group: "nachhaltigkeit", size: "800×1000", ratio: "4/5" },
  { slot: "nh-band", label: "Nachhaltigkeit — Naturbild (breites Banner)", group: "nachhaltigkeit", size: "2400×800", ratio: "3/1" },
  { slot: "ls-hero", label: "Leistungen-Seite — Titelbild (Hero)", group: "leistungen", size: "1920×900", ratio: "21/9" },
  { slot: "bereiche-hero", label: "Bereiche-Seite — Titelbild (Hero)", group: "bereiche", size: "1920×900", ratio: "21/9" },
  { slot: "area-1", label: "Bereich 1 — Textilveredelung", group: "bereiche", size: "1200×900", ratio: "4/3" },
  { slot: "area-2", label: "Bereich 2 — Werbeartikel", group: "bereiche", size: "1200×900", ratio: "4/3" },
  { slot: "area-3", label: "Bereich 3 — Webdesign", group: "bereiche", size: "1200×900", ratio: "4/3" },
  { slot: "area-4", label: "Bereich 4 — Marketing", group: "bereiche", size: "1200×900", ratio: "4/3" },
  { slot: "vd-hero", label: "Textilveredelung — Titelbild (Hero)", group: "page", size: "1920×900", ratio: "21/9" },
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
  { slot: "designer-tshirt", label: "Designer — T-Shirt Foto (vorne, ohne Logo)", group: "designer", size: "1000×1200", ratio: "5/6" },
  { slot: "designer-hoodie", label: "Designer — Hoodie Foto (vorne, ohne Logo)", group: "designer", size: "1000×1200", ratio: "5/6" },
  { slot: "designer-cap", label: "Designer — Cap Foto (vorne, ohne Logo)", group: "designer", size: "1000×1200", ratio: "5/6" },
  { slot: "designer-tote", label: "Designer — Tasche Foto (vorne, ohne Logo)", group: "designer", size: "1000×1200", ratio: "5/6" },
];

export const HOME_SLOT_IDS: string[] = HOME_SLOTS.map((s) => s.slot);
