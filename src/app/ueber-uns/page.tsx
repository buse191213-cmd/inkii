import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Über uns | INKII",
  description: "Lernen Sie INKII WORKS kennen – Ihr Partner für Textilveredelung & Werbemittel.",
  alternates: { canonical: "/ueber-uns" },
};

export default async function UeberUnsPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const u = d.ueberUns;
  const heroImg = await getHomeImage("uu-hero");
  const tile1 = await getHomeImage("home-tile-1");
  const tile2 = await getHomeImage("home-tile-2");

  type TeamRow = { id: string; department: string; name: string; role: string; email: string; photoUrl: string };
  const team = (await db.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })) as TeamRow[];

  return (
    <SiteShell>
      {/* Hero */}
      <section
        className="mm-page-hero"
        style={heroImg ? { backgroundImage: `url(${heroImg})` } : undefined}
      >
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">Home</Link>
            <span className="mm-dot">•</span>
            <span className="active">Über Uns</span>
          </div>
          <h1 className="mm-page-h1">{u.h1}</h1>
          <p className="mm-page-lead">{u.intro}</p>
        </div>
      </section>

      {/* Story: "Was als kleine ... begann, ist heute ..." */}
      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-story-grid">
            <div>
              <span className="mm-page-kicker">{u.storyKicker}</span>
              <h2 className="mm-page-h2">{u.storyTitle}</h2>
            </div>
            <div className="mm-story-text">
              <p>{u.intro}</p>
              <p>{u.storyText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Werte */}
      <section className="mm-page-section alt">
        <div className="wrap">
          <div className="mm-page-section-head">
            <span className="mm-page-kicker">{u.valuesKicker}</span>
            <h2 className="mm-page-h2">{u.valuesTitle}</h2>
          </div>
          <div className="mm-page-tiles cols-3">
            {u.values.map((v, i) => (
              <div
                key={v.t}
                className="mm-page-tile"
                style={
                  i === 0 && tile1
                    ? { backgroundImage: `url(${tile1})` }
                    : i === 1 && tile2
                    ? { backgroundImage: `url(${tile2})` }
                    : undefined
                }
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{v.t}</h3>
                <p className="mm-page-tile-desc">{v.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="mm-page-section">
          <div className="wrap">
            <div className="mm-page-section-head">
              <span className="mm-page-kicker">{u.teamKicker}</span>
              <h2 className="mm-page-h2">{u.teamTitle}</h2>
            </div>
            <div className="mm-team-grid">
              {team.map((t) => (
                <div key={t.id} className="mm-team-card">
                  <div className="mm-team-photo">
                    {t.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photoUrl} alt={t.name} />
                    )}
                  </div>
                  <p className="mm-team-name">{t.name}</p>
                  <p className="mm-team-role">{t.role || t.department}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">{u.ctaTitle}</h2>
        <p className="mm-page-cta-p">{u.ctaText}</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{u.ctaBtn}</Link>
      </section>
    </SiteShell>
  );
}
