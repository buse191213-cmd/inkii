import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Werbeartikel | INKII Works",
  description: "Showroom für Werbeartikel: Taschen, Büromaterial, Trinkflaschen & Becher, Werbegeschenke — alles mit Ihrem Logo.",
  alternates: { canonical: "/bereiche/werbeartikel" },
};

export default async function WerbeartikelDetailPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.werbeSub;
  const heroImg = await getHomeImage("area-2");
  const imgs = [
    await getHomeImage("wa-1"),
    await getHomeImage("wa-2"),
    await getHomeImage("wa-3"),
    await getHomeImage("wa-4"),
  ];

  return (
    <SiteShell>
      <section
        className="mm-page-hero"
        style={heroImg ? { backgroundImage: `url(${heroImg})` } : undefined}
      >
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">{d.nav.home}</Link>
            <span className="mm-dot">•</span>
            <Link href="/bereiche">{d.nav.bereiche}</Link>
            <span className="mm-dot">•</span>
            <span className="active">{t.kicker}</span>
          </div>
          <h1 className="mm-page-h1">{t.h1}</h1>
          <p className="mm-page-lead">{t.intro}</p>
        </div>
      </section>

      <section className="mm-page-section bereich-grid">
        <div className="wrap">
          <div className="mm-page-tiles cols-2" style={{ marginBottom: 14 }}>
            {t.categories.slice(0, 2).map((c, i) => (
              <div
                key={c.title}
                className="mm-page-tile"
                style={imgs[i] ? { backgroundImage: `url(${imgs[i]})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{c.title}</h3>
                <p className="mm-page-tile-desc">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="mm-page-tiles cols-2">
            {t.categories.slice(2, 4).map((c, i) => (
              <div
                key={c.title}
                className="mm-page-tile"
                style={imgs[i + 2] ? { backgroundImage: `url(${imgs[i + 2]})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 3}</div>
                <h3 className="mm-page-tile-title">{c.title}</h3>
                <p className="mm-page-tile-desc">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">{t.ctaTitle}</h2>
        <p className="mm-page-cta-p">{t.ctaText}</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{t.ctaBtn}</Link>
      </section>
    </SiteShell>
  );
}
