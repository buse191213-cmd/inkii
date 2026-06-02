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
