import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Textilveredelung | INKII",
  description: "Siebdruck, Stickerei, DTF, Flockdruck und Patches — alle Veredelungsmethoden bei INKII WORKS.",
};

export default async function VeredelungPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const heroImg = await getHomeImage("vd-hero");
  const f1 = await getHomeImage("feat-1");
  const f2 = await getHomeImage("feat-2");
  const f3 = await getHomeImage("feat-3");
  const f4 = await getHomeImage("feat-4");
  const f5 = await getHomeImage("feat-5");

  const methods = [
    {
      title: "Siebdruck",
      desc: "Brillante Farben und hohe Deckkraft, ideal für große Stückzahlen und langlebige Ergebnisse.",
      img: f1,
    },
    {
      title: "Stickerei",
      desc: "Hochwertig, edel und extrem strapazierfähig, perfekt für Logos und Corporate Branding.",
      img: f2,
    },
    {
      title: "DTF-Druck",
      desc: "Detailreiche Motive in Fotodruckqualität, geeignet für alle Stofffarben und waschbeständig.",
      img: f3,
    },
    {
      title: "Flockdruck",
      desc: "Haptische Veredelung mit klaren Konturen, robust, farbstark und vielseitig einsetzbar.",
      img: f4,
    },
    {
      title: "Patches",
      desc: "Austauschbare Lösung für flexible Nutzung, langlebig im Alltag und ideal für ein einheitliches Erscheinungsbild.",
      img: f5,
    },
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
            Vom Siebdruck bis zum Patch — wir veredeln Ihre Textilien mit der richtigen Methode.
          </p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-5">
            {methods.map((m, i) => (
              <div
                key={m.title}
                className="mm-page-tile"
                style={m.img ? { backgroundImage: `url(${m.img})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{m.title}</h3>
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
