import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Textilveredelung | INKII Works",
  description: "Siebdruck, Stickerei, DTF-Druck, Flockdruck und Patches — alle Veredelungsmethoden im Überblick.",
  alternates: { canonical: "/bereiche/textilveredelung" },
};

export default async function TextilveredelungDetailPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.textilSub;
  const heroImg = await getHomeImage("area-1");
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

      {/* 5 yöntem yan yana (mm-page-tile pattern, /veredelung ile aynı) */}
      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-5">
            {t.details.map((m, i) => (
              <div
                key={m.title}
                className="mm-page-tile"
                style={imgs[i] ? { backgroundImage: `url(${imgs[i]})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{m.title}</h3>
                <p className="mm-page-tile-desc">{m.text}</p>
              </div>
            ))}
          </div>
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
