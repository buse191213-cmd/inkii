import { SITE_URL } from "./site";

/**
 * Zentrale Firmendaten für SEO und strukturierte Daten (Schema.org).
 *
 * WICHTIG: Felder mit leerem Wert ("") werden NICHT an Google gesendet –
 * so werden keine falschen Angaben veröffentlicht. Sobald echte Daten
 * vorliegen, hier eintragen; die strukturierten Daten aktualisieren sich
 * dann automatisch. Alle mit "TODO" markierten Felder bitte ersetzen.
 */
export const COMPANY = {
  // Anzeigename der Marke
  name: "INKII",

  // Vollständiger rechtlicher Name inkl. Rechtsform.
  // TODO: z. B. "INKII Textilveredelung GmbH" oder "Max Mustermann e. K."
  legalName: "",

  // Kurzbeschreibung des Unternehmens
  description:
    "Textilveredelung, Teamwear und Werbemittel aus einer Hand – von der Gestaltung bis zur Lieferung.",

  url: SITE_URL,

  // Pfad zum Logo in /public, z. B. "/logo.png". Leer = wird ausgelassen.
  // TODO: Logo-Datei in den Ordner /public legen und Pfad hier eintragen.
  logo: "",

  // --- Kontakt ---
  email: "", // TODO: z. B. "info@inkii.de"
  phone: "", // TODO: international, z. B. "+49 221 1234567"

  // --- Adresse (nur bei festem Standort ausfüllen) ---
  address: {
    street: "", // TODO: Straße + Hausnummer
    postalCode: "", // TODO: PLZ
    city: "", // TODO: Ort
    region: "", // optional: Bundesland
    country: "DE",
  },

  // --- Öffnungszeiten ---
  // Beispiel: [{ days: ["Mo","Tu","We","Th","Fr"], opens: "08:30", closes: "17:00" }]
  // Tageskürzel: Mo, Tu, We, Th, Fr, Sa, Su
  openingHours: [] as { days: string[]; opens: string; closes: string }[],

  // --- Social-Media-Profile (vollständige URLs) ---
  // Leere Einträge werden ignoriert.
  social: {
    instagram: "", // TODO: z. B. "https://www.instagram.com/..."
    facebook: "",
    linkedin: "",
  },
};
