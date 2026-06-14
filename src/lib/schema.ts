import { COMPANY } from "./company";
import { SITE_URL } from "./site";

type Json = Record<string, unknown>;

const abs = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

/**
 * Organization-Schema – beschreibt das Unternehmen.
 * Wird auf allen Seiten ausgegeben. Nur ausgefüllte Felder werden aufgenommen.
 */
export function organizationSchema(): Json {
  const org: Json = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.name,
    url: COMPANY.url,
    description: COMPANY.description,
  };

  if (COMPANY.legalName) org.legalName = COMPANY.legalName;
  if (COMPANY.logo) org.logo = abs(COMPANY.logo);

  if (COMPANY.email || COMPANY.phone) {
    const contact: Json = {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "DE",
      availableLanguage: ["de"],
    };
    if (COMPANY.email) contact.email = COMPANY.email;
    if (COMPANY.phone) contact.telephone = COMPANY.phone;
    org.contactPoint = contact;
  }

  const a = COMPANY.address;
  if (a.street && a.city && a.postalCode) {
    const addr: Json = {
      "@type": "PostalAddress",
      streetAddress: a.street,
      postalCode: a.postalCode,
      addressLocality: a.city,
      addressCountry: a.country,
    };
    if (a.region) addr.addressRegion = a.region;
    org.address = addr;
  }

  const sameAs = Object.values(COMPANY.social).filter(Boolean);
  if (sameAs.length > 0) org.sameAs = sameAs;

  return org;
}

/** Product-Schema für eine einzelne Artikel-Detailseite. */
export function productSchema(p: {
  id: string;
  name: string;
  code: string;
  description: string;
  images: string[];
  priceCents: number | null;
  stock: number;
}): Json {
  const url = `${SITE_URL}/werbemittel/${p.id}`;
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.code,
    url,
    brand: { "@type": "Brand", name: COMPANY.name },
  };

  if (p.description) schema.description = p.description;
  if (p.images.length > 0) schema.image = p.images.map(abs);

  if (p.priceCents != null) {
    schema.offers = {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (p.priceCents / 100).toFixed(2),
      availability:
        p.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url,
    };
  }

  return schema;
}

/** FAQPage-Schema aus einer Frage/Antwort-Liste. */
export function faqSchema(faqs: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** BreadcrumbList-Schema für die Navigationspfad-Anzeige in Suchergebnissen. */
export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/**
 * LocalBusiness-Schema (PrintShop) — für Google Maps, Local SEO und
 * "Knowledge Panel". Wichtig für lokale Suchanfragen in Essen/Umgebung.
 */
export function localBusinessSchema(): Json {
  const a = COMPANY.address;
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "PrintShop"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: COMPANY.name,
    url: COMPANY.url,
    description: COMPANY.description,
    image: COMPANY.logo ? abs(COMPANY.logo) : undefined,
    logo: COMPANY.logo ? abs(COMPANY.logo) : undefined,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      postalCode: a.postalCode,
      addressLocality: a.city,
      addressRegion: a.region || "NRW",
      addressCountry: a.country,
    },
    // Ungefähre Koordinaten Essen-Borbeck (Westuferstr.)
    geo: {
      "@type": "GeoCoordinates",
      latitude: 51.4823,
      longitude: 6.9408,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Essen" },
      { "@type": "City", name: "Bottrop" },
      { "@type": "City", name: "Gelsenkirchen" },
      { "@type": "City", name: "Mülheim an der Ruhr" },
      { "@type": "City", name: "Oberhausen" },
      { "@type": "City", name: "Duisburg" },
      { "@type": "AdministrativeArea", name: "Nordrhein-Westfalen" },
      { "@type": "Country", name: "Deutschland" },
    ],
    knowsAbout: [
      "Textilveredelung",
      "DTF-Druck",
      "Stickerei",
      "Siebdruck",
      "Werbeartikel",
      "Werbemittel",
      "Firmenkleidung",
      "Berufsbekleidung",
      "Fahrzeugbeschriftung",
      "Folienbeschriftung",
      "Onlineshop-Entwicklung",
    ],
    paymentAccepted: "Cash, Invoice, Bank Transfer",
  };

  const sameAs = Object.values(COMPANY.social).filter(Boolean);
  if (sameAs.length > 0) schema.sameAs = sameAs;

  // undefined Werte entfernen
  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);
  return schema;
}

/**
 * FAQPage Schema — Yapay zeka (Google AI, Perplexity, ChatGPT)
 * doğrudan soru-cevap çekmesi için.
 */
export function faqSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Was macht INKII WORKS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "INKII WORKS veredelt Textilien (T-Shirts, Hoodies, Workwear) mit Druck und Stickerei und liefert Werbeartikel mit individuellem Branding. Außerdem Fahrzeugbeschriftung und B2B-Onlineshops, alles aus einer Hand in Essen.",
        },
      },
      {
        "@type": "Question",
        name: "Was ist der Unterschied zwischen INKII WORKS und INKII MARKETING?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "INKII WORKS ist die physische Marke: Textilveredelung, Werbeartikel, Fahrzeugbeschriftung. INKII MARKETING ist die digitale Marke: Webdesign, SEO, Social Media. Beide Marken gehören zum selben Unternehmen — Inhaber Sener Kirli — und liefern komplette Markenauftritte aus einer Hand.",
        },
      },
      {
        "@type": "Question",
        name: "Wo ist INKII ansässig?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "INKII WORKS sitzt in der Westuferstr. 25, 45356 Essen, Nordrhein-Westfalen. Wir bedienen das gesamte Ruhrgebiet — Essen, Bottrop, Gelsenkirchen, Mülheim an der Ruhr, Oberhausen, Duisburg — sowie ganz NRW und auf Anfrage deutschlandweit.",
        },
      },
      {
        "@type": "Question",
        name: "Ab welcher Menge kann ich bestellen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Textilveredelung schon ab 1 Stück möglich. Werbeartikel haben je nach Produkt eine Mindestmenge. Bei Großaufträgen gibt es gestaffelte Mengenpreise.",
        },
      },
      {
        "@type": "Question",
        name: "Welche Sprachen werden gesprochen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "INKII bietet persönliche Beratung in Deutsch, Englisch und Türkisch — die Website ist in allen drei Sprachen verfügbar.",
        },
      },
      {
        "@type": "Question",
        name: "Wie lange dauert ein typischer Auftrag?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Standard-Textilveredelung ca. 5 bis 10 Werktage nach Designfreigabe. Fahrzeugbeschriftung 1 bis 2 Tage Montage. Webdesign-Projekte typischerweise 2 bis 6 Wochen je nach Umfang.",
        },
      },
      {
        "@type": "Question",
        name: "Welche Druckverfahren bietet INKII WORKS an?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DTF-Druck (Direct-to-Film), Siebdruck, Transferdruck und maschinelle Stickerei. Auswahl je nach Auflage, Motiv-Komplexität und Textilqualität.",
        },
      },
      {
        "@type": "Question",
        name: "Wie kann ich Kontakt aufnehmen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Telefon und WhatsApp: +49 160 6767001. E-Mail: info@inkiiworks.de. Kontaktformular: https://www.inkiiworks.de/kontakt",
        },
      },
    ],
  };
}

/**
 * Service-Schema — beschreibt eine konkrete Dienstleistung.
 * Verwendung auf Bereich-Detailseiten.
 */
export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  category?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    provider: {
      "@type": "LocalBusiness",
      name: COMPANY.name,
      url: COMPANY.url,
    },
    areaServed: [
      { "@type": "City", name: "Essen" },
      { "@type": "City", name: "Bottrop" },
      { "@type": "City", name: "Gelsenkirchen" },
      { "@type": "City", name: "Mülheim an der Ruhr" },
      { "@type": "City", name: "Oberhausen" },
      { "@type": "City", name: "Duisburg" },
      { "@type": "State", name: "Nordrhein-Westfalen" },
    ],
    url: abs(opts.url),
    ...(opts.category ? { category: opts.category } : {}),
  };
}
