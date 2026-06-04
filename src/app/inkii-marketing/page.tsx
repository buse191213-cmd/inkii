import Link from "next/link";
import Image from "next/image";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "INKII MARKETING — Webdesign & Online-Marketing",
  description: "Webdesign, Social Media, SEO, Google Ads, Branding und Corporate Design — die Digital-Marke von INKII.",
  alternates: { canonical: "/inkii-marketing" },
};

export default async function InkiiMarketingPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.inkiiMarketing;
  const heroImg = await getHomeImage("im-hero");
  const sImgs = [
    await getHomeImage("im-s1"),
    await getHomeImage("im-s2"),
    await getHomeImage("im-s3"),
    await getHomeImage("im-s4"),
  ];

  return (
    <SiteShell>
      {/* Hero */}
      <section className="im-hero">
        {heroImg && (
          <Image src={heroImg} alt={t.h1} fill sizes="100vw" style={{ objectFit: "cover" }} priority />
        )}
        <div className="im-hero-overlay" />
        <div className="im-hero-inner">
          <div className="im-tagline">{t.tagline}</div>
          <h1 className="im-h1">{t.h1}</h1>
          <p className="im-intro">{t.intro}</p>
        </div>
      </section>

      {/* 4 Service Karten */}
      <section className="im-services">
        <div className="im-services-grid">
          {t.services.map((s, i) => {
            const img = sImgs[i];
            return (
              <article key={s.title} className="im-card">
                <div className="im-card-media">
                  {img ? (
                    <Image src={img} alt={s.title} fill sizes="(max-width:900px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                  ) : (
                    <div className="im-card-placeholder">0{i + 1}</div>
                  )}
                  <div className="im-card-num">0{i + 1}</div>
                </div>
                <div className="im-card-body">
                  <h2 className="im-card-title">{s.title}</h2>
                  <p className="im-card-desc">{s.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="im-cta">
        <h2>{t.ctaH}</h2>
        <p>{t.ctaP}</p>
        <Link href="/kontakt" className="im-cta-btn">{t.ctaBtn}</Link>
        <Link href="/" className="im-works-back">{t.worksLink}</Link>
      </section>
    </SiteShell>
  );
}
