import { SITE_URL } from "./site";

/**
 * Zentrale Firmendaten fuer SEO und strukturierte Daten (Schema.org).
 * Leere Werte werden NICHT an Google gesendet.
 */
export const COMPANY = {
  // Anzeigename der Marke
  name: "INKII Works",

  // Alternative Namen für SEO
  alternateName: ["INKII", "Inkii Works", "INKIIWORKS"],

  // Vollstaendiger rechtlicher Name
  legalName: "INKII Works - Inh. Sener Kirli",

  // Kurzbeschreibung
  description:
    "INKII Works aus Essen: Textilveredelung, Werbeartikel, Fahrzeugbeschriftung, Webdesign und Marketing aus einer Hand. DTF-Druck, Stickerei und individuelle Werbemittel für Unternehmen in NRW.",

  url: SITE_URL,

  // Pfad zum Logo in /public
  logo: "/inkii-logo.png",

  // Foto vom Geschaeft (optional)
  image: "/inkii-logo.png",

  // Preisrahmen (Google nutzt das fuer Local Listings)
  priceRange: "EUR EUR",

  // --- Kontakt ---
  email: "info@inkiiworks.de",
  phone: "+49 160 6767001",

  // --- Adresse ---
  address: {
    street: "Westuferstr. 25",
    postalCode: "45356",
    city: "Essen",
    region: "Nordrhein-Westfalen",
    country: "DE",
  } as {
    street: string;
    postalCode: string;
    city: string;
    region: string;
    country: string;
  },

  // --- Geokoordinaten (Essen) ---
  geo: {
    latitude: 51.4823,
    longitude: 6.9408,
  } as { latitude: number; longitude: number },

  // --- Oeffnungszeiten ---
  openingHours: [
    { days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "09:00", closes: "18:00" },
  ] as { days: string[]; opens: string; closes: string }[],

  // --- Bedientes Gebiet ---
  areaServed: [
    "Essen",
    "Bottrop",
    "Gelsenkirchen",
    "Muelheim an der Ruhr",
    "Oberhausen",
    "Duisburg",
    "Nordrhein-Westfalen",
    "Deutschland",
  ] as string[],

  // --- Themen, mit denen wir uns auskennen ---
  knowsAbout: [
    "Textilveredelung",
    "DTF-Druck",
    "Siebdruck",
    "Stickerei",
    "Werbemittel",
    "Werbeartikel",
    "Fahrzeugbeschriftung",
    "Folienbeschriftung",
    "Berufsbekleidung",
    "Workwear",
    "Webdesign",
    "Online-Marketing",
    "SEO",
    "Social Media Marketing",
  ] as string[],

  // --- Social Media / sameAs (vollstaendige URLs) ---
  sameAs: [] as string[],

  // --- Social Media (einzeln) ---
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
  },
};
