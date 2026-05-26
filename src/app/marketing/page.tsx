import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketing | INKII Digital Studio",
  description:
    "Datengetriebenes Wachstum, Performance & Markenautorität — strategische End-to-End-Lösungen.",
};

export default async function MarketingPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  const services = [
    {
      kicker: "Performance-Werbung",
      title: "Meta Ads Verwaltung",
      desc: "Skalierbare Kampagnen auf Facebook und Instagram. Datengetriebene Ausrichtung und kontinuierliche Optimierung.",
      icon: "✦",
      hue: "mk-hue-1",
    },
    {
      kicker: "Suchmaschinen-Marketing",
      title: "Google Ads Strategie",
      desc: "Search-, Display- und Shopping-Kampagnen mit klarem ROAS-Fokus. Keyword-Strategie und Conversion-Tracking inklusive.",
      icon: "◬",
      hue: "mk-hue-2",
    },
    {
      kicker: "Conversion-Optimierung",
      title: "CRO & Landingpage-Design",
      desc: "Strategische Performance-Verbesserung. A/B-Tests, UX-Audits und Conversion-Pfade für jeden Funnel-Schritt.",
      icon: "◉",
      hue: "mk-hue-3",
    },
  ];

  const process = [
    { n: "01", t: "Analyse", d: "Markt, Marke, Zielgruppe verstehen" },
    { n: "02", t: "Strategie", d: "Maßgeschneiderte Roadmap entwickeln" },
    { n: "03", t: "Kreation", d: "Texte, Designs, Werbemittel produzieren" },
    { n: "04", t: "Launch", d: "Kampagne aktivieren — Multi-Channel" },
    { n: "05", t: "Optimierung", d: "Skalieren basierend auf realen Daten" },
  ];

  const offerings = [
    "Branding & Corporate Design",
    "Social Media Management",
    "Newsletter & E-Mail-Marketing",
    "SEO & Content-Strategie",
    "Influencer-Kooperationen",
    "Print &amp; Out-of-Home",
  ];

  return (
    <SiteShell>
      {/* HERO — Light Premium */}
      <section className="mk-hero">
        <div className="mk-hero-bg" />
        <div className="mk-hero-inner">
          <h1 className="mk-hero-title">
            Datengetriebenes Wachstum, <br />
            <span className="mk-gradient-text">Performance &amp; Markenautorität.</span>
          </h1>
          <p className="mk-hero-sub">
            Strategische End-to-End-Lösungen für nachhaltige Markenerfolge und
            messbare E-Commerce-Ergebnisse.
          </p>
          <Link href="/kontakt" className="mk-hero-btn">
            Kostenloses Strategie-Gespräch
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* 3 SERVICE-KARTEN MIT GRADIENT */}
      <section className="mk-section">
        <div className="wrap">
          <div className="mk-cards">
            {services.map((s) => (
              <div key={s.title} className={`mk-card ${s.hue}`}>
                <div className="mk-card-icon">{s.icon}</div>
                <div className="mk-card-body">
                  <span className="mk-card-kicker">{s.kicker}</span>
                  <h3 className="mk-card-title">{s.title}</h3>
                  <p className="mk-card-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SÜRECİMİZ — Timeline */}
      <section className="mk-section mk-section-alt">
        <div className="wrap">
          <div className="mk-section-head">
            <span className="mk-kicker">Unser Prozess</span>
            <h2 className="mk-section-h">Fünf Schritte zum messbaren Erfolg.</h2>
          </div>
          <div className="mk-timeline">
            {process.map((p, i) => (
              <div key={p.n} className="mk-step">
                <div className="mk-step-num">{p.n}</div>
                <h4 className="mk-step-t">{p.t}</h4>
                <p className="mk-step-d">{p.d}</p>
                {i < process.length - 1 && <div className="mk-step-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIZMETLERIMIZ — Liste */}
      <section className="mk-section mk-section-alt">
        <div className="wrap">
          <div className="mk-section-head">
            <span className="mk-kicker">Weitere Leistungen</span>
            <h2 className="mk-section-h">Alles, was Ihre Marke wachsen lässt.</h2>
          </div>
          <ul className="mk-offerings">
            {offerings.map((o) => (
              <li key={o}>
                <span className="mk-check">✓</span>
                {o}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Lassen Sie Ihre Marke wachsen.</h2>
        <p className="mm-page-cta-p">Kostenlose Strategie-Beratung in 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
