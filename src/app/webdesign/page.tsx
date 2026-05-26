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

/* === HTML/CSS-Mockups (keine Bilder) === */

function BrowserMockup() {
  return (
    <div className="wd-browser">
      <div className="wd-browser-chrome">
        <span className="wd-dot wd-dot-r" />
        <span className="wd-dot wd-dot-y" />
        <span className="wd-dot wd-dot-g" />
        <div className="wd-url">inkiiworks.de</div>
      </div>
      <div className="wd-browser-page">
        <div className="wd-browser-nav">
          <div className="wd-logo-block" />
          <div className="wd-nav-links">
            <span /><span /><span /><span />
          </div>
        </div>
        <div className="wd-hero-row">
          <div className="wd-hero-copy">
            <div className="wd-line wd-line-h1" />
            <div className="wd-line wd-line-h1" style={{ width: "55%" }} />
            <div className="wd-line wd-line-p" />
            <div className="wd-line wd-line-p" style={{ width: "62%" }} />
            <div className="wd-fake-btn" />
          </div>
          <div className="wd-hero-circle" />
        </div>
        <div className="wd-product-row">
          <div className="wd-product"><span /><span /></div>
          <div className="wd-product"><span /><span /></div>
          <div className="wd-product"><span /><span /></div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="wd-phone-stage">
      <div className="wd-phone">
        <div className="wd-phone-notch" />
        <div className="wd-phone-screen">
          <div className="wd-app-statusbar">
            <span className="wd-app-time" />
            <span className="wd-app-icons">
              <i /><i /><i />
            </span>
          </div>
          <div className="wd-app-hero" />
          <div className="wd-app-text">
            <div className="wd-line wd-line-mh" />
            <div className="wd-line wd-line-mp" style={{ width: "60%" }} />
          </div>
          <div className="wd-app-grid">
            <div className="wd-app-item"><div /><span /><span style={{ width: "50%" }} /></div>
            <div className="wd-app-item"><div /><span /><span style={{ width: "50%" }} /></div>
            <div className="wd-app-item"><div /><span /><span style={{ width: "50%" }} /></div>
            <div className="wd-app-item"><div /><span /><span style={{ width: "50%" }} /></div>
          </div>
          <div className="wd-app-cta" />
          <div className="wd-app-tabs">
            <i className="active" /><i /><i /><i />
          </div>
        </div>
      </div>
    </div>
  );
}

function UIKitMockup() {
  const palette = ["#1c2722", "#5e8470", "#7fa389", "#cfd9a8", "#fdfcf8"];
  return (
    <div className="wd-uikit">
      <div className="wd-uikit-section">
        <div className="wd-uikit-label">FARBEN</div>
        <div className="wd-color-row">
          {palette.map((c) => (
            <span key={c} className="wd-color" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="wd-uikit-section">
        <div className="wd-uikit-label">TYPOGRAFIE</div>
        <div className="wd-typo">
          <span className="wd-typo-aa">Aa</span>
          <span className="wd-typo-heading">Heading</span>
        </div>
        <div className="wd-typo-sub">The quick brown fox jumps over the lazy dog</div>
      </div>
      <div className="wd-uikit-section">
        <div className="wd-uikit-label">BUTTONS</div>
        <div className="wd-btn-row">
          <span className="wd-btn-mock wd-btn-primary">Primary</span>
          <span className="wd-btn-mock wd-btn-secondary">Secondary</span>
        </div>
      </div>
    </div>
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
            <h2 className="wd-section-h">Alles, was Ihre Marke online braucht.</h2>
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
