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
};

export default async function UeberUnsPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
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
          <h1 className="mm-page-h1">Wir machen Marken sichtbar.</h1>
          <p className="mm-page-lead">
            INKII WORKS — Ihr Partner für Textilveredelung, Werbemittel und Druck. Persönlich,
            schnell und nachhaltig.
          </p>
        </div>
      </section>

      {/* 3 Werte als Tiles */}
      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-section-head">
            <span className="mm-page-kicker">Was uns ausmacht</span>
            <h2 className="mm-page-h2">Drei Werte, ein Versprechen.</h2>
          </div>
          <div className="mm-page-tiles cols-3">
            <div
              className="mm-page-tile"
              style={tile1 ? { backgroundImage: `url(${tile1})` } : undefined}
            >
              <div className="mm-page-tile-label">01 — Persönlich</div>
              <h3 className="mm-page-tile-title">Direkter Kontakt</h3>
              <p className="mm-page-tile-desc">Ein Ansprechpartner von der Idee bis zur Lieferung.</p>
            </div>
            <div
              className="mm-page-tile"
              style={tile2 ? { backgroundImage: `url(${tile2})` } : undefined}
            >
              <div className="mm-page-tile-label">02 — Schnell</div>
              <h3 className="mm-page-tile-title">Angebot in 24h</h3>
              <p className="mm-page-tile-desc">Kostenlose Designs und unverbindliche Preise binnen 24 Stunden.</p>
            </div>
            <div className="mm-page-tile">
              <div className="mm-page-tile-label">03 — Nachhaltig</div>
              <h3 className="mm-page-tile-title">Bewusst produziert</h3>
              <p className="mm-page-tile-desc">Faire Materialien, regionale Partner, langlebige Qualität.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="mm-page-section alt">
          <div className="wrap">
            <div className="mm-page-section-head">
              <span className="mm-page-kicker">Unser Team</span>
              <h2 className="mm-page-h2">Die Menschen hinter INKII.</h2>
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
        <h2 className="mm-page-cta-h">Bereit für Ihr Projekt?</h2>
        <p className="mm-page-cta-p">Lassen Sie uns reden. Wir liefern kostenlose Designs in 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
