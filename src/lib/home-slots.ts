// Bild-Bereiche der Startseite, Nachhaltigkeits-, Leistungs- & Bereiche-Seite.
// Keine Node-Abhängigkeiten – auch im Client nutzbar.

export type HomeSlot = {
  slot: string;
  label: string;
  group: "home-tiles" | "category" | "feature" | "nachhaltigkeit" | "leistungen" | "bereiche" | "page";
};

export const HOME_SLOTS: HomeSlot[] = [
  { slot: "home-tile-1", label: "Startseite — Großes Bild links (z. B. Bekleidung)", group: "home-tiles" },
  { slot: "home-tile-2", label: "Startseite — Großes Bild rechts (z. B. Taschen)", group: "home-tiles" },
  { slot: "cat-1", label: "Kategorie 1 — Firmen- & Arbeitskleidung", group: "category" },
  { slot: "cat-2", label: "Kategorie 2 — Werbeartikel & Merchandise", group: "category" },
  { slot: "cat-3", label: "Kategorie 3 — Team- & Sportbekleidung", group: "category" },
  { slot: "cat-4", label: "Kategorie 4 — Konzepte & Lösungen", group: "category" },
  { slot: "feat-1", label: "Leistung 1 — Textildruck & Veredelung", group: "feature" },
  { slot: "feat-2", label: "Leistung 2 — Team- & Sportswear", group: "feature" },
  { slot: "feat-3", label: "Leistung 3 — Werbemittel & Merch", group: "feature" },
  { slot: "feat-4", label: "Leistung 4 — Arbeits- & Berufskleidung", group: "feature" },
  { slot: "feat-5", label: "Leistung 5 — Eigene Onlineshops", group: "feature" },
  { slot: "feat-6", label: "Leistung 6 — Nachhaltige Produktion", group: "feature" },
  { slot: "nh-hero", label: "Nachhaltigkeit — Titelbild (großer Hero-Bereich)", group: "nachhaltigkeit" },
  { slot: "nh-1", label: "Nachhaltigkeit — Karte 1: Faire Textilien", group: "nachhaltigkeit" },
  { slot: "nh-2", label: "Nachhaltigkeit — Karte 2: Wassersparende Verfahren", group: "nachhaltigkeit" },
  { slot: "nh-3", label: "Nachhaltigkeit — Karte 3: Langlebigkeit", group: "nachhaltigkeit" },
  { slot: "nh-4", label: "Nachhaltigkeit — Karte 4: Verpackung", group: "nachhaltigkeit" },
  { slot: "nh-5", label: "Nachhaltigkeit — Karte 5: Grüne Energie", group: "nachhaltigkeit" },
  { slot: "nh-6", label: "Nachhaltigkeit — Karte 6: Regionale Partner", group: "nachhaltigkeit" },
  { slot: "nh-band", label: "Nachhaltigkeit — Naturbild (breites Banner)", group: "nachhaltigkeit" },
  { slot: "ls-hero", label: "Leistungen-Seite — Titelbild (großer Hero-Bereich)", group: "leistungen" },
  { slot: "bereiche-hero", label: "Bereiche-Seite — Titelbild (großer Hero-Bereich)", group: "bereiche" },
  { slot: "area-1", label: "Bereich 1 — Druck", group: "bereiche" },
  { slot: "area-2", label: "Bereich 2 — Werbetechnik", group: "bereiche" },
  { slot: "area-3", label: "Bereich 3 — Webdesign", group: "bereiche" },
  { slot: "area-4", label: "Bereich 4 — Marketing", group: "bereiche" },
  { slot: "vd-hero", label: "Textilveredelung — Titelbild (großer Hero-Bereich)", group: "page" },
  { slot: "uu-hero", label: "Über Uns — Titelbild (großer Hero-Bereich)", group: "page" },
];

export const HOME_SLOT_IDS: string[] = HOME_SLOTS.map((s) => s.slot);
