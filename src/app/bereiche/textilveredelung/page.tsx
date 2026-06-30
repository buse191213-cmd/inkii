import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { serviceSchema } from "@/lib/schema";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Textildruck & Bestickung Essen — DTF, Siebdruck, Stickerei | INKII Works",
  description: "Professioneller Textildruck und Bestickung in Essen ✓ DTF-Druck ab 1 Stück ✓ Siebdruck ✓ Maschinenstickerei ✓ Flock & Flex ✓ Lieferung in 5-10 Tagen | INKII Works Ruhrgebiet",
  keywords: [
    "Textildruck Essen",
    "Bestickung Essen",
    "Textilveredelung Essen",
    "DTF-Druck Essen",
    "Siebdruck Essen",
    "Stickerei Essen",
    "T-Shirt bedrucken Essen",
    "Workwear Bestickung",
    "Textildruck Ruhrgebiet",
    "Bestickung NRW",
    "Firmenkleidung bedrucken",
    "Arbeitskleidung Stickerei",
    "Textildruck Bottrop",
    "Textildruck Mülheim",
    "Textildruck Gelsenkirchen",
  ],
  alternates: { canonical: "/bereiche/textilveredelung" },
  openGraph: {
    title: "Textildruck & Bestickung in Essen | INKII Works",
    description: "Premium Textilveredelung im Ruhrgebiet — DTF-Druck, Siebdruck, Maschinenstickerei ab 1 Stück. Beratung & Mustererstellung kostenlos.",
    type: "website",
    locale: "de_DE",
    images: ["/og-default.png"],
  },
};

export default async function TextilveredelungDetailPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.textilSub;
  const heroImg = await getHomeImage("tv-hero");
  const imgs = [
    await getHomeImage("tv-method-1"),
    await getHomeImage("tv-method-2"),
    await getHomeImage("tv-method-3"),
    await getHomeImage("tv-method-4"),
    await getHomeImage("tv-method-5"),
  ];

  return (
    <SiteShell>
      <JsonLd data={serviceSchema({
        name: "Textildruck & Bestickung Essen",
        description: "Professionelle Textilveredelung mit DTF-Druck, Siebdruck, Maschinenstickerei, Flock und Flex in Essen und im gesamten Ruhrgebiet. Schon ab 1 Stück.",
        url: "/bereiche/textilveredelung",
        category: "Textilveredelung",
      })} />
      <section
        className="mm-page-hero"
        style={heroImg ? { backgroundImage: `url(${heroImg})` } : undefined}
      >
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">{d.nav.home}</Link>
            <span className="mm-dot">•</span>
            <Link href="/bereiche">{d.nav.bereiche}</Link>
            <span className="mm-dot">•</span>
            <span className="active">{t.kicker}</span>
          </div>
          <h1 className="mm-page-h1">{t.h1}</h1>
          <p className="mm-page-lead">{t.intro}</p>
        </div>
      </section>

      <section className="mm-page-section bereich-grid">
        <div className="wrap">
          <div className="mm-page-tiles cols-2" style={{ marginBottom: 14 }}>
            {t.details.slice(0, 2).map((m, i) => (
              <div
                key={m.title}
                className="mm-page-tile"
                style={imgs[i] ? { backgroundImage: `url(${imgs[i]})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{m.title}</h3>
                <p className="mm-page-tile-desc">{m.text}</p>
              </div>
            ))}
          </div>
          <div className="mm-page-tiles cols-3">
            {t.details.slice(2, 5).map((m, i) => (
              <div
                key={m.title}
                className="mm-page-tile"
                style={imgs[i + 2] ? { backgroundImage: `url(${imgs[i + 2]})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 3}</div>
                <h3 className="mm-page-tile-title">{m.title}</h3>
                <p className="mm-page-tile-desc">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">{t.ctaTitle}</h2>
        <p className="mm-page-cta-p">{t.ctaText}</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{t.ctaBtn}</Link>
      </section>
    </SiteShell>
  );
}
