import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import HeroMedia from "@/components/HeroMedia";
import AreasSection from "@/components/AreasSection";
import { RawIcon } from "@/lib/icons";
import { getHeroVideoSrc } from "@/lib/hero-video";
import { getHomeImages } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

const ICON = {
  print: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v6l-3 3 3 3v6m12-18v6l3 3-3 3v6"/></svg>',
  star: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z"/></svg>',
  gift: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18M3 9l2-5h14l2 5M3 9v11h18V9"/></svg>',
  work: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v4H9zM5 7h14v14H5zM9 12h6M9 16h6"/></svg>',
  shop: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/></svg>',
  leaf: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2c3 3 3 17 0 20"/></svg>',
  arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  catA: '<svg viewBox="0 0 100 100" fill="none" stroke="#3f9c5c" stroke-width="3.5"><path d="M30 25l20-10 20 10v12l-10 5v33H40V42l-10-5z"/><path d="M40 40h20"/></svg>',
  catB: '<svg viewBox="0 0 100 100" fill="none" stroke="#8aa31f" stroke-width="3.5"><circle cx="50" cy="42" r="20"/><path d="M30 78c0-12 9-20 20-20s20 8 20 20"/><path d="M50 22v-8"/></svg>',
  catC: '<svg viewBox="0 0 100 100" fill="none" stroke="#3f9c5c" stroke-width="3.5"><path d="M35 30h30l8 14-12 6v30H39V50l-12-6z"/><circle cx="50" cy="60" r="9"/></svg>',
  catD: '<svg viewBox="0 0 100 100" fill="none" stroke="#3f9c5c" stroke-width="3.5"><circle cx="50" cy="50" r="24"/><path d="M50 30v20l14 8"/></svg>',
};

// Struktur ohne Texte – Texte kommen aus dem Wörterbuch (per Index).
const featureMeta = [
  { slot: "feat-1", ic: ICON.print, href: "/veredelung", accent: false },
  { slot: "feat-2", ic: ICON.star, href: "/leistungen", accent: true },
  { slot: "feat-3", ic: ICON.gift, href: "/werbemittel", accent: false },
  { slot: "feat-4", ic: ICON.work, href: "/veredelung", accent: false },
  { slot: "feat-5", ic: ICON.shop, href: "/leistungen", accent: false },
  { slot: "feat-6", ic: ICON.leaf, href: "/nachhaltigkeit", accent: false },
];

const categoryMeta = [
  { slot: "cat-1", cls: "cc1", ic: ICON.catA, n: "01", href: "/leistungen" },
  { slot: "cat-2", cls: "cc2", ic: ICON.catB, n: "02", href: "/werbemittel" },
  { slot: "cat-3", cls: "cc3", ic: ICON.catC, n: "03", href: "/veredelung" },
  { slot: "cat-4", cls: "cc4", ic: ICON.catD, n: "04", href: "/leistungen" },
];

export default async function HomePage() {
  const heroVideoSrc = await getHeroVideoSrc();
  const homeImages = await getHomeImages();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const h = dict.home;

  return (
    <SiteShell>
      {/* HERO */}
      <section className="hero" style={{ paddingTop: 96 }}>
        <HeroMedia videoSrc={heroVideoSrc} />
        <div className="wrap">
          <div className="hero-inner">
            <span className="eyebrow">
              <span className="pulse"></span> {h.hero.eyebrow}
            </span>
            <h1 className="reveal">
              {h.hero.titleLine1}
              <br />
              <em>{h.hero.titleLine2}</em>
            </h1>
            <p className="lead reveal">{h.hero.lead}</p>
            <div className="cta-row reveal">
              <Link className="btn btn-primary" href="/werbemittel">
                {h.hero.ctaPrimary}
              </Link>
              <Link className="btn btn-ghost" href="/leistungen">
                {h.hero.ctaGhost}
              </Link>
            </div>
            <div className="hero-stats reveal">
              {h.hero.stats.map((s) => (
                <div className="s" key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GESCHÄFTSBEREICHE */}
      <AreasSection t={dict.areas} />

      {/* CATEGORIES */}
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{h.cats.kicker}</span>
            <h2 className="big">{h.cats.title}</h2>
            <p>{h.cats.text}</p>
          </div>
          <div className="cat-grid">
            {categoryMeta.map((c, i) => {
              const img = homeImages[c.slot];
              const cat = h.categories[i];
              return (
                <Link key={c.n} href={c.href} className={`cat-card ${c.cls} reveal`}>
                  <div className="c-art">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="c-art-img" src={img} alt="" />
                    ) : (
                      <RawIcon svg={c.ic} />
                    )}
                  </div>
                  <div>
                    <span className="c-tag">{c.n}</span>
                    <h3>{cat.title}</h3>
                  </div>
                  <div className="c-foot">
                    <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>
                      {cat.tag}
                    </span>
                    <div className="c-arrow">→</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTRO STRIP */}
      <div className="intro-strip reveal">
        <div>
          <h2>
            {h.intro.titlePre} <span className="hl">{h.intro.titleHl}</span>{" "}
            {h.intro.titlePost}
          </h2>
          <p>{h.intro.text}</p>
        </div>
        <div className="steps">
          {h.intro.steps.map((s, i) => (
            <div className="step" key={s.title}>
              <span className="num">{i + 1}</span>
              <div>
                <b>{s.title}</b>
                <span>{s.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="alt-bg" style={{ marginTop: 100 }}>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{h.feat.kicker}</span>
            <h2 className="big">{h.feat.title}</h2>
            <p>{h.feat.text}</p>
          </div>
          <div className="feat-grid feat-joined">
            {featureMeta.map((f, i) => {
              const img = homeImages[f.slot];
              const ft = h.features[i];
              return (
                <div
                  key={f.slot}
                  className={`feat-card reveal${f.accent ? " accent" : ""}${img ? " has-img" : ""}`}
                  style={img ? { backgroundImage: `url(${img})` } : undefined}
                >
                  <div className="f-ic"><RawIcon svg={f.ic} /></div>
                  <h3>{ft.title}</h3>
                  <p>{ft.text}</p>
                  <Link className="f-link" href={f.href}>
                    {h.feat.more} <RawIcon svg={ICON.arrow} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOTLINE */}
      <div className="hotline reveal" style={{ marginTop: 100 }}>
        <div>
          <span className="kicker">{h.hotline.kicker}</span>
          <h2>{h.hotline.title}</h2>
          <a href="tel:+490000000000" className="phone">0000 – 000 00 00</a>
          <div className="hrs">{h.hotline.hours}</div>
        </div>
        <Link className="btn btn-primary" href="/kontakt">
          {h.hotline.cta}
        </Link>
      </div>
    </SiteShell>
  );
}
