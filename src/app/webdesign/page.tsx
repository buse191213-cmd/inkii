import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Webdesign | INKII Digital Studio",
  description: "Gestalten Sie Ihre digitale Präsenz — moderne, schnelle und SEO-optimierte Websites.",
};

/* === Mockup-Komponenten — saubere SVG-Grafiken === */

function BrowserMockup() {
  return (
    <svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" className="wd-mockup-svg">
      {/* Browser Chrome */}
      <rect x="0" y="0" width="420" height="34" fill="#e8e8e6" />
      <circle cx="14" cy="17" r="4.5" fill="#ed6a5e" />
      <circle cx="28" cy="17" r="4.5" fill="#f4bf4f" />
      <circle cx="42" cy="17" r="4.5" fill="#62c554" />
      <rect x="70" y="9" width="280" height="17" rx="3" fill="#fff" />
      <text x="84" y="20" fontFamily="system-ui,sans-serif" fontSize="9" fill="#7a857f">inkiiworks.de</text>
      {/* Screen Content */}
      <rect x="0" y="34" width="420" height="266" fill="#fdfcf8" />
      {/* Site nav */}
      <rect x="0" y="34" width="420" height="22" fill="#fff" />
      <rect x="16" y="42" width="36" height="6" rx="1" fill="#1c2722" />
      <rect x="260" y="44" width="22" height="3" rx="1" fill="#7fa389" />
      <rect x="290" y="44" width="22" height="3" rx="1" fill="#a8b0a8" />
      <rect x="320" y="44" width="22" height="3" rx="1" fill="#a8b0a8" />
      <rect x="350" y="44" width="22" height="3" rx="1" fill="#a8b0a8" />
      {/* Hero */}
      <rect x="0" y="56" width="420" height="118" fill="#eef0e8" />
      <rect x="32" y="86" width="200" height="9" rx="2" fill="#1c2722" />
      <rect x="32" y="100" width="170" height="9" rx="2" fill="#1c2722" />
      <rect x="32" y="120" width="130" height="5" rx="1" fill="#7a857f" />
      <rect x="32" y="130" width="100" height="5" rx="1" fill="#7a857f" />
      <rect x="32" y="146" width="60" height="14" rx="3" fill="#5e8470" />
      <circle cx="335" cy="115" r="36" fill="#7fa389" opacity="0.85" />
      {/* Cards row */}
      <rect x="16" y="190" width="120" height="80" rx="6" fill="#f3f1eb" />
      <rect x="148" y="190" width="120" height="80" rx="6" fill="#f3f1eb" />
      <rect x="280" y="190" width="120" height="80" rx="6" fill="#f3f1eb" />
      <rect x="28" y="252" width="60" height="4" rx="1" fill="#5a6660" />
      <rect x="160" y="252" width="60" height="4" rx="1" fill="#5a6660" />
      <rect x="292" y="252" width="60" height="4" rx="1" fill="#5a6660" />
    </svg>
  );
}

function PhoneMockup() {
  return (
    <svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" className="wd-mockup-svg">
      <rect x="0" y="0" width="420" height="300" fill="#f3f1eb" />
      {/* Phone frame centered */}
      <g transform="translate(146,16)">
        <rect x="0" y="0" width="128" height="268" rx="20" fill="#1c2722" />
        <rect x="4" y="4" width="120" height="260" rx="16" fill="#fdfcf8" />
        {/* Notch */}
        <rect x="48" y="6" width="32" height="6" rx="3" fill="#1c2722" />
        {/* Screen content */}
        <rect x="10" y="22" width="108" height="18" rx="2" fill="#eef0e8" />
        <rect x="16" y="28" width="38" height="3" rx="1" fill="#1c2722" />
        <rect x="100" y="28" width="12" height="3" rx="1" fill="#5e8470" />
        {/* Hero image */}
        <rect x="10" y="46" width="108" height="80" rx="4" fill="#7fa389" />
        <rect x="16" y="108" width="50" height="5" rx="1" fill="#fff" />
        <rect x="16" y="116" width="32" height="3" rx="1" fill="#fff" opacity="0.85" />
        {/* Product cards */}
        <rect x="10" y="134" width="50" height="60" rx="3" fill="#eef0e8" />
        <rect x="68" y="134" width="50" height="60" rx="3" fill="#eef0e8" />
        <rect x="14" y="178" width="30" height="3" rx="1" fill="#1c2722" />
        <rect x="14" y="184" width="20" height="2" rx="1" fill="#7a857f" />
        <rect x="72" y="178" width="30" height="3" rx="1" fill="#1c2722" />
        <rect x="72" y="184" width="20" height="2" rx="1" fill="#7a857f" />
        {/* Second row */}
        <rect x="10" y="200" width="50" height="40" rx="3" fill="#eef0e8" />
        <rect x="68" y="200" width="50" height="40" rx="3" fill="#eef0e8" />
        {/* Bottom nav */}
        <rect x="10" y="246" width="108" height="14" rx="3" fill="#1c2722" />
        <circle cx="24" cy="253" r="2" fill="#fff" />
        <circle cx="44" cy="253" r="2" fill="#fff" opacity="0.55" />
        <circle cx="64" cy="253" r="2" fill="#fff" opacity="0.55" />
        <circle cx="84" cy="253" r="2" fill="#fff" opacity="0.55" />
        <circle cx="104" cy="253" r="2" fill="#fff" opacity="0.55" />
      </g>
    </svg>
  );
}

function UIKitMockup() {
  return (
    <svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" className="wd-mockup-svg">
      <rect x="0" y="0" width="420" height="300" fill="#fdfcf8" />
      {/* Color palette */}
      <text x="32" y="42" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="600" fill="#7a857f" letterSpacing="1.4">FARBEN</text>
      <circle cx="40" cy="68" r="16" fill="#1c2722" />
      <circle cx="78" cy="68" r="16" fill="#5e8470" />
      <circle cx="116" cy="68" r="16" fill="#7fa389" />
      <circle cx="154" cy="68" r="16" fill="#cfd9a8" />
      <circle cx="192" cy="68" r="16" fill="#fdfcf8" stroke="#e8e4d8" strokeWidth="1" />
      <text x="40" y="98" textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="6" fill="#7a857f">#1C2722</text>
      <text x="78" y="98" textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="6" fill="#7a857f">#5E8470</text>
      <text x="116" y="98" textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="6" fill="#7a857f">#7FA389</text>
      {/* Typography */}
      <text x="240" y="42" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="600" fill="#7a857f" letterSpacing="1.4">TYPOGRAFIE</text>
      <text x="240" y="68" fontFamily="system-ui,sans-serif" fontSize="22" fontWeight="800" fill="#1c2722" letterSpacing="-0.5">Aa</text>
      <text x="278" y="68" fontFamily="system-ui,sans-serif" fontSize="14" fontWeight="600" fill="#1c2722">Heading</text>
      <text x="240" y="86" fontFamily="system-ui,sans-serif" fontSize="8" fill="#5a6660">The quick brown fox jumps</text>
      <text x="240" y="98" fontFamily="system-ui,sans-serif" fontSize="6" fill="#7a857f">over the lazy dog 0123456789</text>
      {/* Buttons */}
      <text x="32" y="138" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="600" fill="#7a857f" letterSpacing="1.4">BUTTONS</text>
      <rect x="32" y="148" width="98" height="26" rx="13" fill="#1c2722" />
      <text x="81" y="165" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="8" fontWeight="600" fill="#fff">Primary</text>
      <rect x="140" y="148" width="98" height="26" rx="13" fill="#fdfcf8" stroke="#1c2722" strokeWidth="1.2" />
      <text x="189" y="165" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="8" fontWeight="600" fill="#1c2722">Secondary</text>
      <rect x="248" y="148" width="98" height="26" rx="13" fill="#5e8470" />
      <text x="297" y="165" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="8" fontWeight="600" fill="#fff">Accent</text>
      {/* Component preview */}
      <text x="32" y="208" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="600" fill="#7a857f" letterSpacing="1.4">KOMPONENTEN</text>
      <rect x="32" y="220" width="356" height="58" rx="6" fill="#f3f1eb" />
      <rect x="46" y="234" width="80" height="30" rx="3" fill="#7fa389" opacity="0.4" />
      <rect x="138" y="234" width="60" height="6" rx="1" fill="#1c2722" />
      <rect x="138" y="246" width="120" height="3" rx="1" fill="#7a857f" />
      <rect x="138" y="254" width="100" height="3" rx="1" fill="#a8b0a8" />
      <rect x="320" y="240" width="60" height="18" rx="9" fill="#1c2722" />
    </svg>
  );
}

export default async function WebdesignPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const hero = await getHomeImage("webdesign-hero");

  const cards = [
    {
      kicker: "Webseiten",
      title: "Markenwebsites & Landingpages",
      desc: "Modern, hochwertig, schnell. SEO-optimiert und auf allen Endgeräten brillant.",
      mockup: <BrowserMockup />,
    },
    {
      kicker: "Onlineshops",
      title: "E-Commerce-Lösungen",
      desc: "B2B- und B2C-Shops mit Zahlungsabwicklung, Versand und Mitarbeiter-Shops.",
      mockup: <PhoneMockup />,
    },
    {
      kicker: "Corporate Design",
      title: "Markenauftritt & UI",
      desc: "Logo, Farbwelt, Typografie und ein konsistentes Design-System für alle Kanäle.",
      mockup: <UIKitMockup />,
    },
  ];

  return (
    <SiteShell>
      <section
        className="wd-hero"
        style={hero ? { backgroundImage: `url(${hero})` } : undefined}
      >
        <div className="wd-hero-overlay" />
        <div className="wd-hero-inner">
          <h1 className="wd-hero-title">
            Gestalten Sie Ihre <br />digitale Präsenz.
          </h1>
          <p className="wd-hero-sub">
            Moderne, schnelle und SEO-optimierte Websites für Ihre Marke.
          </p>
          <Link href="/kontakt" className="wd-hero-btn">
            Entdecken
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="wd-section">
        <div className="wrap">
          <div className="wd-section-head">
            <span className="wd-kicker">Unsere Lösungen</span>
            <h2 className="wd-section-h">
              Alles, was Ihre Marke online braucht.
            </h2>
          </div>
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
        <h2 className="mm-page-cta-h">Bereit für Ihre neue Website?</h2>
        <p className="mm-page-cta-p">Kostenloses Konzept und Angebot in 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
