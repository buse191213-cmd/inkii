import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Textilveredelung",
  description: "Siebdruck, Stickerei, DTF, Flockdruck und Patches — alle Veredelungsmethoden bei INKII Works in Essen.",
  alternates: { canonical: "/veredelung" },
};

export default async function VeredelungPage() {
  const d = getDictionary(await getLocale());
  const t = d.veredelung;
  const heroImg = await getHomeImage("vd-hero");
  const f1 = await getHomeImage("feat-1");
  const f2 = await getHomeImage("feat-2");
  const f3 = await getHomeImage("feat-3");
  const f4 = await getHomeImage("feat-4");
  const f5 = await getHomeImage("feat-5");
  const imgs = [f1, f2, f3, f4, f5];

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
          <div className="mm-page-tiles cols-5">
            {t.methods.map((m, i) => (
              <div
                key={m.name}
                className="mm-page-tile"
                style={imgs[i] ? { backgroundImage: `url(${imgs[i]})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{m.name}</h3>
                <p className="mm-page-tile-desc">{m.sub}</p>
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
