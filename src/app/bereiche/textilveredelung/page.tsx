import Link from "next/link";
import Image from "next/image";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Textilveredelung | INKII Works",
  description: "Siebdruck, Stickerei, DTF-Druck, Flockdruck und Patches — alle Veredelungsmethoden im Überblick.",
  alternates: { canonical: "/bereiche/textilveredelung" },
};

export default async function TextilveredelungDetailPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.textilSub;
  const heroImg = await getHomeImage("tv-hero");
  const imgs = [
    await getHomeImage("tv-method-1"),
    await getHomeImage("tv-method-2"),
    await getHomeImage("tv-method-3"),
    await getHomeImage("tv-method-4"),
    await getHomeImage("tv-method-5"),
  ];

  return (
    <SiteShell>
      {/* Hero */}
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

      {/* Showroom — 5 yöntem, 2+3 grid */}
      <section className="showroom">
        <div className="showroom-grid">
          {t.details.slice(0, 2).map((m, i) => (
            <article key={m.title} className="showroom-card">
              <div className="showroom-media">
                {imgs[i] ? (
                  <Image src={imgs[i]} alt={m.title} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="showroom-placeholder"><span>{m.title}</span></div>
                )}
                <div className="showroom-num">0{i + 1}</div>
              </div>
              <div className="showroom-body">
                <h2 className="showroom-title">{m.title}</h2>
                <p className="showroom-text">{m.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="showroom-grid showroom-grid-3" style={{ marginTop: 28 }}>
          {t.details.slice(2, 5).map((m, i) => (
            <article key={m.title} className="showroom-card">
              <div className="showroom-media">
                {imgs[i + 2] ? (
                  <Image src={imgs[i + 2]} alt={m.title} fill sizes="(max-width: 900px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="showroom-placeholder"><span>{m.title}</span></div>
                )}
                <div className="showroom-num">0{i + 3}</div>
              </div>
              <div className="showroom-body">
                <h2 className="showroom-title">{m.title}</h2>
                <p className="showroom-text">{m.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">{t.ctaTitle}</h2>
        <p className="mm-page-cta-p">{t.ctaText}</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{t.ctaBtn}</Link>
      </section>
    </SiteShell>
  );
}
