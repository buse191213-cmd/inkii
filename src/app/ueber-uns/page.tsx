import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import PageHero from "@/components/PageHero";
import type { Metadata } from "next";
import { RawIcon } from "@/lib/icons";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Über uns – Ihr Partner für Textilveredelung | INKII",
  description:
    "Lernen Sie INKII kennen: persönlicher Partner für Textildruck, Teamwear und Werbemittel – von der Idee bis zur Lieferung.",
};

const STORY = '<svg viewBox="0 0 120 120" fill="none" stroke="#2f7a47" stroke-width="3.5"><rect x="24" y="30" width="72" height="60"/><path d="M24 46h72M38 30v-8M82 30v-8M40 64h16M40 76h36"/></svg>';
const PERSON = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="9" r="4"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/></svg>';

// Jahreszahlen passend zum Wörterbuch (timeline).
const timelineYears = ["2010", "2015", "2020", "2026"];

export default async function UeberUnsPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const u = d.ueberUns;
  const heroImg = await getHomeImage("uu-hero");
  // Team aus der Datenbank. Wenn keine Einträge existieren, greifen wir
  // auf die im Wörterbuch hinterlegten Beispiel-Abteilungen zurück.
  type TeamRow = { id: string; department: string; name: string; role: string; email: string; photoUrl: string };
  const dbTeam = (await db.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })) as TeamRow[];

  return (
    <SiteShell>
      <PageHero
        image={heroImg}
        crumbs={[
          { label: d.nav.home, href: "/" },
          { label: d.nav.ueberUns },
        ]}
        title={u.h1}
        intro={u.intro}
      />

      <section>
        <div className="wrap">
          <div className="split">
            <div className="split-visual"><RawIcon svg={STORY} /></div>
            <div className="split-text">
              <span className="kicker">{u.storyKicker}</span>
              <h2>{u.storyTitle}</h2>
              <p>{u.storyText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="alt-bg">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{u.valuesKicker}</span>
            <h2 className="big">{u.valuesTitle}</h2>
          </div>
          <div className="feat-grid">
            {u.values.map((v, i) => (
              <div key={i} className="feat-card reveal">
                <h3>{v.t}</h3>
                <p>{v.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{u.timelineKicker}</span>
            <h2 className="big">{u.timelineTitle}</h2>
          </div>
          <div className="timeline">
            {u.timeline.map((t, i) => (
              <div key={timelineYears[i]} className="tl-item reveal">
                <div className="tl-year">{timelineYears[i]}</div>
                <h3>{t.t}</h3>
                <p>{t.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="alt-bg">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{u.teamKicker}</span>
            <h2 className="big">{u.teamTitle}</h2>
          </div>
          <div className="team-grid">
            {dbTeam.length > 0
              ? dbTeam.map((m) => (
                  <div key={m.id} className="team-card reveal">
                    <div className="team-av">
                      {m.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photoUrl} alt={m.name || m.department} className="team-av-img" />
                      ) : (
                        <RawIcon svg={PERSON} />
                      )}
                    </div>
                    <div className="t-body">
                      <h3>{m.department}</h3>
                      {m.name && <span className="t-name-line">{m.name}</span>}
                      {m.role && <span>{m.role}</span>}
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="t-mail">
                          {m.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              : u.team.map((m, i) => (
                  <div key={i} className="team-card reveal">
                    <div className="team-av"><RawIcon svg={PERSON} /></div>
                    <div className="t-body">
                      <h3>{m.n}</h3>
                      <span>{m.r}</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <div className="cta-strip">
        <h2>{u.ctaTitle}</h2>
        <p>{u.ctaText}</p>
        <Link className="btn btn-primary" href="/kontakt">{u.ctaBtn}</Link>
      </div>
    </SiteShell>
  );
}
