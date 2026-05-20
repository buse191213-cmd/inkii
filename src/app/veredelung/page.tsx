import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import PageHero from "@/components/PageHero";
import type { Metadata } from "next";
import { RawIcon } from "@/lib/icons";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Textilveredelung – Siebdruck, Stickerei & Digitaldruck | INKII",
  description:
    "Professionelle Textilveredelung: Siebdruck, Digitaldruck, Stickerei und Lasergravur – Ihr Logo langlebig und präzise auf jedes Textil.",
};

const CHECK = '<svg viewBox="0 0 120 120" fill="none" stroke="#2f7a47" stroke-width="3.5"><circle cx="60" cy="60" r="40"/><path d="M44 60l11 11 22-24"/></svg>';

export default async function VeredelungPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const v = d.veredelung;
  const heroImg = await getHomeImage("vd-hero");

  return (
    <SiteShell>
      <PageHero
        image={heroImg}
        crumbs={[
          { label: d.nav.home, href: "/" },
          { label: d.nav.veredelung },
        ]}
        title={v.h1}
        intro={v.intro}
      />

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{v.methodsKicker}</span>
            <h2 className="big">{v.methodsTitle}</h2>
            <p>{v.methodsText}</p>
          </div>
          <div className="method-grid">
            {v.methods.map((m, i) => (
              <div key={i} className="method-card reveal">
                <span className="m-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{m.t}</h3>
                <p>{m.p}</p>
                <span className="m-tag">{m.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="alt-bg">
        <div className="wrap">
          <div className="split">
            <div className="split-visual"><RawIcon svg={CHECK} /></div>
            <div className="split-text">
              <span className="kicker">{v.splitKicker}</span>
              <h2>{v.splitTitle}</h2>
              <p>{v.splitText}</p>
              <ul className="ticks">
                {v.ticks.map((t) => (
                  <li key={t}><span className="tk">✓</span> {t}</li>
                ))}
              </ul>
              <div className="cta-row">
                <Link className="btn btn-primary btn-sm" href="/kontakt">
                  {v.splitCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-strip">
        <h2>{v.ctaTitle}</h2>
        <p>{v.ctaText}</p>
        <Link className="btn btn-primary" href="/kontakt">{v.ctaBtn}</Link>
      </div>
    </SiteShell>
  );
}
