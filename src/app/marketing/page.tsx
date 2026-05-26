import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketing | INKII Works",
  description: "Ganzheitliche Marketinglösungen — Branding, Social Media, SEO und Kampagnen.",
};

export default async function MarketingPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const hero = await getHomeImage("marketing-hero");
  const t1 = await getHomeImage("marketing-1");
  const t2 = await getHomeImage("marketing-2");
  const t3 = await getHomeImage("marketing-3");
  const t4 = await getHomeImage("marketing-4");

  const services = [
    {
      label: "Branding",
      desc: "Logo, Corporate Design und Markenidentität — alles aus einer Hand.",
      img: t1,
    },
    {
      label: "Social Media",
      desc: "Content, Reels und Anzeigen für Instagram, TikTok und LinkedIn.",
      img: t2,
    },
    {
      label: "SEO & Google Ads",
      desc: "Mehr Sichtbarkeit bei Google — organisch und durch gezielte Anzeigen.",
      img: t3,
    },
    {
      label: "Kampagnen",
      desc: "Crossmediale Kampagnen, Newsletter und E-Mail-Marketing.",
      img: t4,
    },
  ];

  return (
    <SiteShell>
      <section
        className="mm-page-hero"
        style={hero ? { backgroundImage: `url(${hero})` } : undefined}
      >
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">Home</Link>
            <span className="mm-dot">•</span>
            <span className="active">Marketing</span>
          </div>
          <h1 className="mm-page-h1">Marketing.</h1>
          <p className="mm-page-lead">
            Ganzheitliche Marketinglösungen — von der Marke bis zur Kampagne.
          </p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-4">
            {services.map((s, i) => (
              <div
                key={s.label}
                className="mm-page-tile"
                style={s.img ? { backgroundImage: `url(${s.img})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{s.label}</h3>
                <p className="mm-page-tile-desc">{s.desc}</p>
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
