import Link from "next/link";
import Image from "next/image";
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
      <section className="mm-page-hero">
        {heroImg && (
          <Image src={heroImg} alt={t.h1} fill sizes="100vw" style={{ objectFit: "cover" }} priority />
        )}
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

      {/* Showroom — 4 Kategorien als Karten */}
      <section className="showroom">
        <div className="showroom-grid">
          {t.categories.slice(0, 4).map((c, i) => (
            <article key={c.title} className="showroom-card">
              <div className="showroom-media">
                {imgs[i] ? (
                  <Image src={imgs[i]} alt={c.title} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="showroom-placeholder">
                    <span>{c.title}</span>
                  </div>
                )}
                <div className="showroom-num">0{i + 1}</div>
              </div>
              <div className="showroom-body">
                <h2 className="showroom-title">{c.title}</h2>
                <p className="showroom-text">{c.text}</p>
              </div>
            </article>
          ))}
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
