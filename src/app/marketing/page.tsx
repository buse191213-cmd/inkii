import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketing | INKII Digital Studio",
  description: "Datenbasierte Wachstumsstrategien für maximale Conversion und nachhaltiges Wachstum.",
};

/* === HTML/CSS Mockups für die Marketing-Karten === */

function GrowthChartMockup() {
  return (
    <div className="mkt-mock mkt-mock-chart">
      <div className="mkt-chart-card">
        <div className="mkt-chart-head">
          <span className="mkt-chart-dot mkt-chart-dot-1" />
          <span className="mkt-chart-dot mkt-chart-dot-2" />
          <span className="mkt-chart-dot mkt-chart-dot-3" />
          <span className="mkt-chart-label">Performance</span>
        </div>
        <svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg"
          className="mkt-chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7fa389" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7fa389" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="0" y1="32" x2="280" y2="32" stroke="#ececea" strokeWidth="0.5" strokeDasharray="2 3" />
          <line x1="0" y1="70" x2="280" y2="70" stroke="#ececea" strokeWidth="0.5" strokeDasharray="2 3" />
          <line x1="0" y1="108" x2="280" y2="108" stroke="#ececea" strokeWidth="0.5" strokeDasharray="2 3" />
          {/* Area fill */}
          <path d="M0,120 L40,108 L80,92 L120,72 L160,60 L200,42 L240,28 L280,14 L280,130 L0,130 Z"
            fill="url(#gFill)" />
          {/* Trend line */}
          <path d="M0,120 L40,108 L80,92 L120,72 L160,60 L200,42 L240,28 L280,14"
            fill="none" stroke="#5e8470" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots */}
          <circle cx="40" cy="108" r="2.4" fill="#5e8470" />
          <circle cx="120" cy="72" r="2.4" fill="#5e8470" />
          <circle cx="200" cy="42" r="2.4" fill="#5e8470" />
          <circle cx="280" cy="14" r="3" fill="#5e8470" stroke="#fff" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="mkt-badge">
        <span className="mkt-badge-arrow">↑</span>
        <span className="mkt-badge-val">+340%</span>
        <span className="mkt-badge-lbl">ROAS</span>
      </div>
    </div>
  );
}

function SeoMockup() {
  return (
    <div className="mkt-mock mkt-mock-seo">
      <div className="mkt-search-bar">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#9ea7a2" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3 3" strokeLinecap="round" />
        </svg>
        <span className="mkt-search-text">inkii works merch</span>
        <span className="mkt-search-google">Google</span>
      </div>
      <div className="mkt-results">
        <div className="mkt-result mkt-result-top">
          <span className="mkt-rank">#1</span>
          <div className="mkt-result-lines">
            <span className="mkt-result-title" />
            <span className="mkt-result-url" />
            <span className="mkt-result-desc" />
          </div>
        </div>
        <div className="mkt-result">
          <span className="mkt-rank-mini">2</span>
          <div className="mkt-result-lines"><span /><span /></div>
        </div>
        <div className="mkt-result">
          <span className="mkt-rank-mini">3</span>
          <div className="mkt-result-lines"><span /><span /></div>
        </div>
      </div>
      <div className="mkt-rank-trend">
        <span className="mkt-trend-lbl">Ranking</span>
        <svg viewBox="0 0 120 32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,28 L20,24 L40,18 L60,12 L80,8 L100,4 L120,2"
            stroke="#5e8470" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <circle cx="120" cy="2" r="2.5" fill="#5e8470" stroke="#fff" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}

function FunnelMockup() {
  return (
    <div className="mkt-mock mkt-mock-funnel">
      <svg viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg" className="mkt-funnel-svg">
        {/* Funnel layers */}
        <polygon points="20,16 240,16 210,52 50,52" fill="#cfd9a8" />
        <polygon points="52,60 208,60 178,96 82,96" fill="#7fa389" />
        <polygon points="84,104 176,104 150,140 110,140" fill="#5e8470" />
        <polygon points="112,148 148,148 138,172 122,172" fill="#1c2722" />
        {/* Side labels right */}
        <text x="248" y="38" fontFamily="ui-monospace,monospace" fontSize="9" fill="#1c2722" textAnchor="end">100%</text>
        <text x="248" y="82" fontFamily="ui-monospace,monospace" fontSize="9" fill="#1c2722" textAnchor="end">62%</text>
        <text x="248" y="126" fontFamily="ui-monospace,monospace" fontSize="9" fill="#1c2722" textAnchor="end">28%</text>
        <text x="248" y="166" fontFamily="ui-monospace,monospace" fontSize="9" fill="#1c2722" textAnchor="end">9%</text>
        {/* Labels left */}
        <text x="12" y="38" fontFamily="ui-sans-serif,system-ui" fontSize="8" fill="#7a857f" textAnchor="end">Besucher</text>
        <text x="44" y="82" fontFamily="ui-sans-serif,system-ui" fontSize="8" fill="#7a857f" textAnchor="end">Interaktion</text>
        <text x="76" y="126" fontFamily="ui-sans-serif,system-ui" fontSize="8" fill="#7a857f" textAnchor="end">Warenkorb</text>
        <text x="104" y="166" fontFamily="ui-sans-serif,system-ui" fontSize="8" fill="#7a857f" textAnchor="end">Kauf</text>
      </svg>
    </div>
  );
}

export default async function MarketingPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  const cards = [
    {
      kicker: "Performance",
      title: "Meta & Google Ads",
      desc: "Budgetoptimierung und kreative Kampagnen für maximalen Umsatz.",
      mockup: <GrowthChartMockup />,
    },
    {
      kicker: "SEO",
      title: "Organisches Wachstum",
      desc: "Dauerhafte Sichtbarkeit bei Google ohne laufende Klickkosten.",
      mockup: <SeoMockup />,
    },
    {
      kicker: "Analytics",
      title: "Transparentes Reporting",
      desc: "Detaillierte Analyse des Nutzerverhaltens zur Maximierung Ihrer Conversion-Rate.",
      mockup: <FunnelMockup />,
    },
  ];

  return (
    <SiteShell>
      {/* HERO: links ausgerichtet */}
      <section className="mkt-hero">
        <div className="wrap">
          <div className="mkt-hero-grid">
            <div className="mkt-hero-text">
              <h1 className="mkt-hero-title">
                Datenbasierte <br />Wachstumsstrategien
              </h1>
              <p className="mkt-hero-sub">
                Maximale Conversion und nachhaltiges Wachstum durch
                datenbasierte digitale Marketinglösungen.
              </p>
              <Link href="/kontakt" className="mkt-hero-btn">
                Kostenlose Analyse
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="mkt-hero-deco">
              <div className="mkt-deco-ring" />
              <div className="mkt-deco-line mkt-deco-line-1" />
              <div className="mkt-deco-line mkt-deco-line-2" />
              <div className="mkt-deco-dot mkt-deco-dot-1" />
              <div className="mkt-deco-dot mkt-deco-dot-2" />
            </div>
          </div>
        </div>
      </section>

      {/* 3 KARTEN */}
      <section className="wd-section">
        <div className="wrap">
          <div className="wd-cards">
            {cards.map((c) => (
              <div key={c.kicker} className="wd-card">
                <div className="wd-card-img">
                  <div className="wd-mockup-wrap">{c.mockup}</div>
                </div>
                <div className="wd-card-body">
                  <span className="wd-card-kicker">{c.kicker}</span>
                  <h3 className="wd-card-title">{c.title}</h3>
                  <p className="wd-card-desc">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
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
