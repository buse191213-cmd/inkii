import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import PageHero from "@/components/PageHero";
import AreasSection from "@/components/AreasSection";
import { RawIcon, ProductIcon } from "@/lib/icons";
import { db } from "@/lib/db";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leistungen – Textilveredelung, Werbemittel & Teamwear | INKII",
  description:
    "Beratung, Gestaltung, Veredelung und Lieferung aus einer Hand. Entdecken Sie das Leistungsspektrum von INKII und einen Auszug unserer Arbeiten.",
};

const ICON = {
  shirt:
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3l3 2 3-2 5 4-3 3v11H7V10L4 7z"/></svg>',
  team:
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M14 20c0-3 2-4.5 4-4.5"/></svg>',
  work:
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v4H9zM5 7h14v14H5z"/></svg>',
  gift:
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18M3 9l2-5h14l2 5M3 9v11h18V9"/></svg>',
  shop:
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="3" width="12" height="18" rx="2"/></svg>',
  idea:
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 014 10v3H8v-3a6 6 0 014-10z"/></svg>',
  arrow:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

// Reihenfolge passend zum Wörterbuch (services).
const serviceIcons = [ICON.shirt, ICON.team, ICON.work, ICON.gift, ICON.shop, ICON.idea];

type DbProduct = {
  id: string;
  name: string;
  code: string;
  icon: string;
  images: string;
  category: { name: string } | null;
};

function split(s: string): string[] {
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

export default async function LeistungenPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const l = d.leistungen;
  const heroImg = await getHomeImage("ls-hero");

  const dbProducts = await db.product.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const showcase = (dbProducts as DbProduct[]).map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    icon: p.icon,
    category: p.category?.name ?? l.showFallbackCat,
    image: split(p.images)[0] ?? null,
  }));

  return (
    <SiteShell>
      {/* HERO */}
      <PageHero
        image={heroImg}
        crumbs={[
          { label: d.nav.home, href: "/" },
          { label: d.nav.leistungen },
        ]}
        title={l.h1}
        intro={l.intro}
      />

      {/* GESCHÄFTSBEREICHE */}
      <AreasSection t={d.areas} />

      {/* LEISTUNGEN */}
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{l.servKicker}</span>
            <h2 className="big">{l.servTitle}</h2>
          </div>
          <div className="lst-services">
            {l.services.map((s, i) => (
              <div key={i} className="lst-svc reveal">
                <div className="lst-svc-top">
                  <span className="lst-svc-ic">
                    <RawIcon svg={serviceIcons[i]} />
                  </span>
                  <span className="lst-svc-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="alt-bg">
        <div className="wrap">
          <div className="section-head reveal showcase-head">
            <span className="kicker">{l.showKicker}</span>
            <h2 className="big">{l.showTitle}</h2>
            <p>
              {l.showTextA}
              {showcase.length}
              {l.showTextB}
            </p>
          </div>

          {showcase.length === 0 ? (
            <div className="cat-empty">{l.showEmpty}</div>
          ) : (
            <div className="showcase-grid reveal">
              {showcase.map((p) => (
                <Link
                  key={p.id}
                  href={`/werbemittel/${p.id}`}
                  className={`show-tile${p.image ? "" : " no-img"}`}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} />
                  ) : (
                    <span className="show-icon">
                      <ProductIcon name={p.icon} />
                    </span>
                  )}
                  <div className={`show-cap${p.image ? "" : " is-static"}`}>
                    <div className="sc-tag">{p.category}</div>
                    <div className="sc-name">{p.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="showcase-foot">
            <Link className="btn btn-ghost" href="/werbemittel">
              {l.showFoot}
            </Link>
          </div>
        </div>
      </section>

      {/* TECHNIKEN */}
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{l.techKicker}</span>
            <h2 className="big">{l.techTitle}</h2>
          </div>
          <div className="tech-strip reveal">
            {l.techniques.map((t) => (
              <div key={t.t} className="tech-item">
                <h4>{t.t}</h4>
                <p>{t.p}</p>
              </div>
            ))}
          </div>
          <div className="tech-foot">
            <Link className="f-link" href="/veredelung">
              {l.techFoot} <RawIcon svg={ICON.arrow} />
            </Link>
          </div>
        </div>
      </section>

      {/* ABLAUF */}
      <section className="alt-bg">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{l.stepsKicker}</span>
            <h2 className="big">{l.stepsTitle}</h2>
          </div>
          <div className="process-grid reveal">
            {l.steps.map((s, i) => (
              <div key={s.t} className="proc-step">
                <span className="proc-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-strip">
        <h2>{l.ctaTitle}</h2>
        <p>{l.ctaText}</p>
        <div className="cta-actions">
          <Link className="btn btn-primary" href="/kontakt">
            {l.ctaBtn1}
          </Link>
          <Link className="btn btn-light" href="/werbemittel">
            {l.ctaBtn2}
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
