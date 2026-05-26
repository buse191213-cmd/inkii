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

export default async function WebdesignPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const hero = await getHomeImage("webdesign-hero");
  const t1 = await getHomeImage("webdesign-1");
  const t2 = await getHomeImage("webdesign-2");
  const t3 = await getHomeImage("webdesign-3");

  const cards = [
    {
      kicker: "Webseiten",
      title: "Markenwebsites & Landingpages",
      desc: "Modern, hochwertig, schnell. SEO-optimiert und auf allen Endgeräten brillant.",
      img: t1,
    },
    {
      kicker: "Onlineshops",
      title: "E-Commerce-Lösungen",
      desc: "B2B- und B2C-Shops mit Zahlungsabwicklung, Versand und Mitarbeiter-Shops.",
      img: t2,
    },
    {
      kicker: "Corporate Design",
      title: "Markenauftritt & UI",
      desc: "Logo, Farbwelt, Typografie und ein konsistentes Design-System für alle Kanäle.",
      img: t3,
    },
  ];

  return (
    <SiteShell>
      {/* HERO — zentriert, mit großem Mockup-Hintergrund */}
      <section
        className="wd-hero"
        style={hero ? { backgroundImage: `url(${hero})` } : undefined}
      >
        <div className="wd-hero-overlay" />
        <div className="wd-hero-inner">
          <div className="wd-hero-eyebrow">
            <span className="wd-dot" />
            INKII WORKS &nbsp;·&nbsp; Digital Studio
          </div>
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

      {/* LÖSUNGEN — 3 Cards mit großem Mockup-Bild oben */}
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
                <div
                  className="wd-card-img"
                  style={c.img ? { backgroundImage: `url(${c.img})` } : undefined}
                />
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
