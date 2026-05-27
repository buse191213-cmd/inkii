import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nachhaltigkeit",
  description: "Faire Textilien, wassersparende Verfahren und langlebige Veredelung — Nachhaltigkeit ist Teil unserer DNA bei INKII Works.",
  alternates: { canonical: "/nachhaltigkeit" },
};

export default async function NachhaltigkeitPage() {
  const d = getDictionary(await getLocale());
  const t = d.nachhaltigkeit;
  const heroImg = await getHomeImage("nh-hero");
  const nh1 = await getHomeImage("nh-1");
  const nh2 = await getHomeImage("nh-2");
  const nh3 = await getHomeImage("nh-3");
  const nh4 = await getHomeImage("nh-4");
  const nh5 = await getHomeImage("nh-5");
  const nh6 = await getHomeImage("nh-6");
  const imgs = [nh1, nh2, nh3, nh4, nh5, nh6];

  const cards = t.cards.map((c, i) => ({ ...c, img: imgs[i] }));
  // Fisher–Yates Shuffle
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return (
    <SiteShell>
      <section
        className="mm-page-hero"
        style={heroImg ? { backgroundImage: `url(${heroImg})` } : undefined}
      >
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">Home</Link>
            <span className="mm-dot">•</span>
            <span className="active">{t.kicker}</span>
          </div>
          <h1 className="mm-page-h1">{t.h1}</h1>
          <p className="mm-page-lead">{t.intro}</p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-3">
            {shuffled.map((c) => (
              <div
                key={c.title}
                className="mm-page-tile"
                style={c.img ? { backgroundImage: `url(${c.img})` } : undefined}
              >
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
