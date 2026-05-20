import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import PageHero from "@/components/PageHero";
import type { Metadata } from "next";
import { RawIcon } from "@/lib/icons";
import { getHomeImages } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nachhaltigkeit – faire & ressourcenschonende Produktion | INKII",
  description:
    "Faire Textilien und umweltschonende Veredelungsverfahren – nachhaltige Werbemittel und Bekleidung, gut für Marke und Umwelt.",
};

const ICON = {
  leaf: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 014 13c0-5 7-9 16-9 0 9-4 16-9 16zM4 21c4-8 8-11 13-13"/></svg>',
  drop: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c4 5 7 8 7 12a7 7 0 01-14 0c0-4 3-7 7-12z"/></svg>',
  cycle: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5M17 4v3h-3M7 20v-3h3"/></svg>',
  box: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 4v10l-8 4-8-4V7zM4 7l8 4 8-4M12 11v10"/></svg>',
  sun: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
  hand: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 100-18 9 9 0 000 18zM8 12l3 3 5-6"/></svg>',
};

// Reihenfolge passend zum Wörterbuch (pillars) und zu den Bild-Slots nh-1..nh-6.
const pillarIcons = [ICON.leaf, ICON.drop, ICON.cycle, ICON.box, ICON.sun, ICON.hand];

export default async function NachhaltigkeitPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const n = d.nachhaltigkeit;
  const img = await getHomeImages();

  const heroImg = img["nh-hero"];
  const bandImg = img["nh-band"];

  return (
    <SiteShell>
      {/* HERO */}
      <PageHero
        image={heroImg}
        crumbs={[
          { label: d.nav.home, href: "/" },
          { label: d.nav.nachhaltigkeit },
        ]}
        title={n.h1}
        intro={n.intro}
      />

      {/* PILLARS */}
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{n.pillarsKicker}</span>
            <h2 className="big">{n.pillarsTitle}</h2>
          </div>
          <div className="nh-grid">
            {n.pillars.map((p, i) => {
              const cardImg = img[`nh-${i + 1}`];
              return (
                <article key={i} className="nh-card reveal" data-tone={i}>
                  <div
                    className={`nh-card-img${cardImg ? " has-photo" : ""}`}
                    style={
                      cardImg ? { backgroundImage: `url(${cardImg})` } : undefined
                    }
                  >
                    {!cardImg && (
                      <span className="nh-card-ic">
                        <RawIcon svg={pillarIcons[i]} />
                      </span>
                    )}
                  </div>
                  <div className="nh-card-body">
                    <h3>{p.t}</h3>
                    <p>{p.p}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* NATURBILD-BANNER */}
      <div className="nh-band-wrap">
        <div
          className={`nh-band${bandImg ? "" : " is-grad"}`}
          style={bandImg ? { backgroundImage: `url(${bandImg})` } : undefined}
        >
          <div className="nh-band-overlay" />
          <div className="nh-band-text reveal">
            <span className="kicker">{n.bannerKicker}</span>
            <h2>{n.bannerTitle}</h2>
            <p>{n.bannerText}</p>
          </div>
        </div>
      </div>

      {/* ZAHLEN */}
      <section className="nh-stats-sec">
        <div className="section-head reveal">
          <span className="kicker">{n.statsKicker}</span>
          <h2 className="big">{n.statsTitle}</h2>
        </div>
        <div className="nh-stats-band">
          {n.stats.map((s, i) => (
            <div key={i} className="nh-stat reveal">
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-strip">
        <h2>{n.ctaTitle}</h2>
        <p>{n.ctaText}</p>
        <Link className="btn btn-primary" href="/kontakt">{n.ctaBtn}</Link>
      </div>
    </SiteShell>
  );
}
