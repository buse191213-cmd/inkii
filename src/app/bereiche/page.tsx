import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bereiche | INKII",
  description: "Druck, Werbetechnik, Webdesign und Marketing – die vier Bereiche von INKII WORKS.",
};

export default async function BereichePage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const heroImg = await getHomeImage("bereiche-hero");
  const a1 = await getHomeImage("area-1");
  const a2 = await getHomeImage("area-2");
  const a3 = await getHomeImage("area-3");
  const a4 = await getHomeImage("area-4");

  const areas = [
    { label: "01", title: "Druck", desc: "Flyer, Plakate, Visitenkarten und Großformat.", img: a1 },
    { label: "02", title: "Werbetechnik", desc: "Schilder, Fahrzeugbeschriftung, Schaufenster.", img: a2 },
    { label: "03", title: "Webdesign", desc: "Moderne Websites und Online-Shops aus einer Hand.", img: a3 },
    { label: "04", title: "Marketing", desc: "Branding, Social Media, Kampagnen.", img: a4 },
  ];

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
            <span className="active">Bereiche</span>
          </div>
          <h1 className="mm-page-h1">Vier Bereiche, ein Team.</h1>
          <p className="mm-page-lead">
            Druck, Werbetechnik, Webdesign und Marketing — alles bei INKII WORKS.
          </p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-4">
            {areas.map((a) => (
              <div
                key={a.title}
                className="mm-page-tile"
                style={a.img ? { backgroundImage: `url(${a.img})` } : undefined}
              >
                <div className="mm-page-tile-label">{a.label}</div>
                <h3 className="mm-page-tile-title">{a.title}</h3>
                <p className="mm-page-tile-desc">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Lassen Sie uns Ihr Projekt umsetzen.</h2>
        <p className="mm-page-cta-p">Egal welcher Bereich – wir liefern Ihnen ein Angebot in 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
