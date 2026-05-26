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
          <line x1="0" y1="32" x2="280" y2="32" stroke="#ececea" strokeWidth="0.5" strokeDasharray="2 3" />
          <line x1="0" y1="70" x2="280" y2="70" stroke="#ececea" strokeWidth="0.5" strokeDasharray="2 3" />
          <line x1="0" y1="108" x2="280" y2="108" stroke="#ececea" strokeWidth="0.5" strokeDasharray="2 3" />
          <path d="M0,120 L40,108 L80,92 L120,72 L160,60 L200,42 L240,28 L280,14 L280,130 L0,130 Z"
            fill="url(#gFill)" />
          <path d="M0,120 L40,108 L80,92 L120,72 L160,60 L200,42 L240,28 L280,14"
            fill="none" stroke="#5e8470" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

function SocialMediaMockup() {
  return (
    <div className="mkt-mock mkt-mock-social">
      {/* Telefon 1: Feed (Instagram-Stil) */}
      <div className="mkt-social-phone">
        <div className="mkt-social-stories">
          <span className="mkt-story mkt-story-active" />
          <span className="mkt-story mkt-story-active" />
          <span className="mkt-story" />
          <span className="mkt-story" />
        </div>
        <div className="mkt-social-post">
          <div className="mkt-social-post-img" />
          <div className="mkt-social-actions">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#5e8470" strokeWidth="1.4">
              <path d="M8 14s-5-3.5-5-7a3 3 0 015-2.2A3 3 0 0113 7c0 3.5-5 7-5 7z" fill="#5e8470" />
            </svg>
            <span className="mkt-social-likes" />
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#7a857f" strokeWidth="1.4" style={{ marginLeft: 4 }}>
              <path d="M3 6c0-1.5 1-3 3-3h4c2 0 3 1.5 3 3v3c0 1.5-1 3-3 3H8l-3 2v-2H6c-2 0-3-1.5-3-3V6z" />
            </svg>
          </div>
        </div>
      </div>
      {/* Telefon 2: Reel (TikTok-Stil) */}
      <div className="mkt-social-phone mkt-social-phone-2">
        <div className="mkt-social-reel">
          <div className="mkt-reel-side">
            <div className="mkt-reel-icon">
              <svg viewBox="0 0 16 16" width="12" height="12" fill="#fff" stroke="#fff" strokeWidth="0.6">
                <path d="M8 14s-5-3.5-5-7a3 3 0 015-2.2A3 3 0 0113 7c0 3.5-5 7-5 7z" />
              </svg>
              <span>12K</span>
            </div>
            <div className="mkt-reel-icon">
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#fff" strokeWidth="1.4">
                <path d="M3 6c0-1.5 1-3 3-3h4c2 0 3 1.5 3 3v3c0 1.5-1 3-3 3H8l-3 2v-2H6c-2 0-3-1.5-3-3V6z" />
              </svg>
              <span>284</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailAutomationMockup() {
  return (
    <div className="mkt-mock mkt-mock-email">
      {/* Briefumschlag oben */}
      <div className="mkt-envelope">
        <svg viewBox="0 0 80 56" xmlns="http://www.w3.org/2000/svg" width="80" height="56">
          <rect x="2" y="14" width="76" height="40" rx="3" fill="#fff" stroke="#5e8470" strokeWidth="1.4" />
          <path d="M2,18 L40,38 L78,18" fill="none" stroke="#5e8470" strokeWidth="1.4" />
          <path d="M2,54 L30,32 M78,54 L50,32" fill="none" stroke="#ececea" strokeWidth="1" />
          <circle cx="68" cy="10" r="6" fill="#7fa389" />
          <text x="68" y="13" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" fontFamily="ui-sans-serif,system-ui">3</text>
        </svg>
      </div>
      {/* Flow nodes */}
      <div className="mkt-flow">
        <div className="mkt-flow-step mkt-flow-step-1">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#fff" strokeWidth="1.6">
            <circle cx="8" cy="6" r="2.5" />
            <path d="M3 14c0-3 2.5-5 5-5s5 2 5 5" />
          </svg>
        </div>
        <div className="mkt-flow-line" />
        <div className="mkt-flow-step mkt-flow-step-2">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#fff" strokeWidth="1.6">
            <rect x="2" y="4" width="12" height="8" rx="1" />
            <path d="M2 5l6 4 6-4" />
          </svg>
        </div>
        <div className="mkt-flow-line" />
        <div className="mkt-flow-step mkt-flow-step-3">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#5e8470" strokeWidth="1.6">
            <path d="M2 8l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {/* Open Rate ring */}
      <div className="mkt-rate-ring">
        <svg viewBox="0 0 60 60" width="60" height="60">
          <circle cx="30" cy="30" r="24" fill="none" stroke="#ececea" strokeWidth="4" />
          <circle cx="30" cy="30" r="24" fill="none" stroke="#5e8470" strokeWidth="4"
            strokeDasharray="63.3 150.8" strokeLinecap="round"
            transform="rotate(-90 30 30)" />
        </svg>
        <div className="mkt-rate-text">
          <span className="mkt-rate-val">42%</span>
          <span className="mkt-rate-lbl">Open Rate</span>
        </div>
      </div>
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
      kicker: "Social Media",
      title: "Kreative Markenpräsenz",
      desc: "Zielgerichtete Content-Strategien für Instagram, TikTok und LinkedIn zur Steigerung der Markenbindung.",
      mockup: <SocialMediaMockup />,
    },
    {
      kicker: "Automation",
      title: "Smart E-Mail-Marketing",
      desc: "Automatisierte Flows (Klaviyo) zur Kundenrückgewinnung und Umsatzsteigerung durch personalisierte Newsletter.",
      mockup: <EmailAutomationMockup />,
    },
  ];

  return (
    <SiteShell>
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

      <section className="wd-section">
        <div className="wrap">
          <div className="wd-cards wd-cards-4">
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
