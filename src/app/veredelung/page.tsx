import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Textilveredelung | INKII",
  description: "Siebdruck, Stickerei, Transferdruck & Sublimation — alle Veredelungsarten bei INKII WORKS.",
};

export default async function VeredelungPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const heroImg = await getHomeImage("vd-hero");
  const f1 = await getHomeImage("feat-1");
  const f2 = await getHomeImage("feat-2");
  const f3 = await getHomeImage("feat-3");
  const f4 = await getHomeImage("feat-4");

  const methods = [
    { label: "Siebdruck", desc: "Brillante Farben, ideal für hohe Stückzahlen.", img: f1 },
    { label: "Stickerei", desc: "Edel, langlebig, perfekt für Logos und Branding.", img: f2 },
    { label: "Transferdruck", desc: "Detailreich, ideal für Fotomotive und kleine Auflagen.", img: f3 },
    { label: "Sublimation", desc: "Vollflächiger Druck mit lebendigen Farben.", img: f4 },
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
            <span className="active">Textilveredelung</span>
          </div>
          <h1 className="mm-page-h1">Jedes Verfahren. Eine Quelle.</h1>
          <p className="mm-page-lead">
            Vom Siebdruck bis zur Stickerei — wir veredeln Ihre Textilien mit der richtigen Methode.
          </p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-4">
            {methods.map((m, i) => (
              <div
                key={m.label}
                className="mm-page-tile"
                style={m.img ? { backgroundImage: `url(${m.img})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{m.label}</h3>
                <p className="mm-page-tile-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Welche Methode passt zu Ihrem Projekt?</h2>
        <p className="mm-page-cta-p">Wir beraten Sie kostenlos und liefern Designvorschläge in 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
