import { COMPANY } from "./company";
import { SITE_URL } from "./site";

type Json = Record<string, unknown>;

const abs = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

/**
 * Organization-Schema - beschreibt das Unternehmen.
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

  if (COMPANY.address) {
    org.address = {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    };
  }

  if (COMPANY.sameAs && COMPANY.sameAs.length > 0) {
    org.sameAs = COMPANY.sameAs;
  }

  return org;
}

/**
 * WebSite-Schema - macht die Site-Suche fuer Suchmaschinen bekannt.
 */
export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY.name,
    url: COMPANY.url,
    inLanguage: ["de", "en", "tr"],
  };
}

/**
 * Breadcrumb-Schema fuer Navigationspfade.
 */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

/**
 * Product-Schema fuer Produktdetailseiten.
 */
export function productSchema(opts: {
  name: string;
  description: string;
  image?: string | null;
  url: string;
  brand?: string;
  category?: string;
  sku?: string | null;
  material?: string | null;
}): Json {
  const p: Json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    url: abs(opts.url),
  };
  if (opts.image) p.image = abs(opts.image);
  if (opts.brand) p.brand = { "@type": "Brand", name: opts.brand };
  if (opts.category) p.category = opts.category;
  if (opts.sku) p.sku = opts.sku;
  if (opts.material) p.material = opts.material;
  p.offers = {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    priceCurrency: "EUR",
    url: abs(opts.url),
  };
  return p;
}

/**
 * LocalBusiness / PrintShop - Local SEO icin.
 */
export function localBusinessSchema(): Json {
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "PrintShop"],
    "@id": `${COMPANY.url}#localbusiness`,
    name: COMPANY.name,
    url: COMPANY.url,
    description: COMPANY.description,
  };

  if (COMPANY.legalName) schema.legalName = COMPANY.legalName;
  if (COMPANY.logo) schema.logo = abs(COMPANY.logo);
  if (COMPANY.image) schema.image = abs(COMPANY.image);
  if (COMPANY.email) schema.email = COMPANY.email;
  if (COMPANY.phone) schema.telephone = COMPANY.phone;
  if (COMPANY.priceRange) schema.priceRange = COMPANY.priceRange;

  if (COMPANY.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    };
  }

  if (COMPANY.geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: COMPANY.geo.latitude,
      longitude: COMPANY.geo.longitude,
    };
  }

  if (COMPANY.openingHours && COMPANY.openingHours.length > 0) {
    schema.openingHoursSpecification = COMPANY.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    }));
  }

  if (COMPANY.areaServed && COMPANY.areaServed.length > 0) {
    schema.areaServed = COMPANY.areaServed.map((area) => ({
      "@type": "City",
      name: area,
    }));
  }

  if (COMPANY.knowsAbout && COMPANY.knowsAbout.length > 0) {
    schema.knowsAbout = COMPANY.knowsAbout;
  }

  if (COMPANY.sameAs && COMPANY.sameAs.length > 0) {
    schema.sameAs = COMPANY.sameAs;
  }

  return schema;
}

/**
 * FAQPage Schema - fuer KI-Assistenten und Google rich snippets.
 * Akzeptiert optional ein eigenes FAQs-Array (z. B. aus dem dictionary).
 */
export function faqSchema(items?: Array<{ q: string; a: string }>): Json {
  const defaults: Array<[string, string]> = [
    [
      "Was macht INKII WORKS?",
      "INKII WORKS veredelt Textilien wie T-Shirts, Hoodies und Workwear mit Druck und Stickerei und liefert Werbeartikel mit individuellem Branding. Ausserdem Fahrzeugbeschriftung und B2B-Onlineshops in Essen.",
    ],
    [
      "Was ist der Unterschied zwischen INKII WORKS und INKII MARKETING?",
      "INKII WORKS ist die physische Marke: Textilveredelung, Werbeartikel, Fahrzeugbeschriftung. INKII MARKETING ist die digitale Marke: Webdesign, SEO, Social Media. Beide gehoeren zum selben Unternehmen, Inhaber Sener Kirli.",
    ],
    [
      "Wo ist INKII ansaessig?",
      "INKII WORKS sitzt in der Westuferstrasse 25, 45356 Essen, Nordrhein-Westfalen. Wir bedienen das gesamte Ruhrgebiet sowie ganz NRW.",
    ],
    [
      "Ab welcher Menge kann ich bestellen?",
      "Textilveredelung schon ab 1 Stueck moeglich. Werbeartikel haben je nach Produkt eine Mindestmenge. Bei Grossauftraegen gibt es gestaffelte Mengenpreise.",
    ],
    [
      "Welche Sprachen werden gesprochen?",
      "INKII bietet Beratung in Deutsch, Englisch und Tuerkisch. Die Website ist in allen drei Sprachen verfuegbar.",
    ],
    [
      "Wie lange dauert ein typischer Auftrag?",
      "Standard-Textilveredelung ca. 5 bis 10 Werktage. Fahrzeugbeschriftung 1 bis 2 Tage Montage. Webdesign-Projekte 2 bis 6 Wochen je nach Umfang.",
    ],
    [
      "Welche Druckverfahren bietet INKII WORKS an?",
      "DTF-Druck, Siebdruck, Transferdruck und maschinelle Stickerei.",
    ],
    [
      "Wie kann ich Kontakt aufnehmen?",
      "Telefon und WhatsApp: +49 160 6767001. E-Mail: info@inkiiworks.de.",
    ],
  ];

  const pairs: Array<[string, string]> =
    items && items.length > 0
      ? items.map((it) => [it.q, it.a] as [string, string])
      : defaults;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((pair) => ({
      "@type": "Question",
      name: pair[0],
      acceptedAnswer: {
        "@type": "Answer",
        text: pair[1],
      },
    })),
  };
}

/**
 * Service-Schema fuer einzelne Leistungen.
 */
export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  category?: string;
}): Json {
  const s: Json = {
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
      { "@type": "City", name: "Muelheim an der Ruhr" },
      { "@type": "City", name: "Oberhausen" },
      { "@type": "City", name: "Duisburg" },
      { "@type": "State", name: "Nordrhein-Westfalen" },
    ],
    url: abs(opts.url),
  };
  if (opts.category) s.category = opts.category;
  return s;
}
