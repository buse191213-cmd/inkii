import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nachhaltigkeit | INKII",
  description: "Faire Textilien, langlebige Qualität und bewusste Produktion bei INKII WORKS.",
};

export default async function NachhaltigkeitPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const heroImg = await getHomeImage("nh-hero");
  const nh1 = await getHomeImage("nh-1");
  const nh2 = await getHomeImage("nh-2");
  const nh3 = await getHomeImage("nh-3");
  const nh4 = await getHomeImage("nh-4");
  const nh5 = await getHomeImage("nh-5");
  const nh6 = await getHomeImage("nh-6");

  const cards = [
    { label: "Faire Textilien", desc: "GOTS- und Fair-Wear-zertifizierte Materialien.", img: nh1 },
    { label: "Wassersparend", desc: "Moderne Druckverfahren mit minimalem Wasserverbrauch.", img: nh2 },
    { label: "Langlebig", desc: "Hochwertige Veredelung, die Jahre hält.", img: nh3 },
    { label: "Plastikfrei", desc: "Recycelbare Verpackung statt Folie.", img: nh4 },
    { label: "Grüne Energie", desc: "Unsere Produktion läuft mit Ökostrom.", img: nh5 },
    { label: "Regional", desc: "Kurze Wege, faire Partner aus Deutschland und Europa.", img: nh6 },
  ];

  // Bei jedem Seitenaufruf zufällige Reihenfolge (Fisher–Yates Shuffle)
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return (
    <SiteShell>
      <section
        className="mm-page-hero"
        style={heroImg ? { backgroundImage: `url(${heroImg})` } : undefined}
      >
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">Home</Link>
            <span className="mm-dot">•</span>
            <span className="active">Nachhaltigkeit</span>
          </div>
          <h1 className="mm-page-h1">Sorgfältig produziert.</h1>
          <p className="mm-page-lead">
            Von den Materialien bis zur Verarbeitung achten wir auf Qualität in jedem Detail.
          </p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-3">
            {shuffled.map((c) => (
              <div
                key={c.label}
                className="mm-page-tile"
                style={c.img ? { backgroundImage: `url(${c.img})` } : undefined}
              >
                <h3 className="mm-page-tile-title">{c.label}</h3>
                <p className="mm-page-tile-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Nachhaltige Werbeartikel-Lösungen, persönlich beraten.</h2>
        <p className="mm-page-cta-p">Fragen Sie nach unseren Eco-Linien — wir helfen gerne bei der Auswahl.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
