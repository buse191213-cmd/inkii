import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bereiche",
  description: "Textilveredelung, Werbemittel, Webdesign und Marketing — alle Leistungen von INKII Works auf einen Blick.",
  alternates: { canonical: "/bereiche" },
};

export default async function BereichePage() {
  const d = getDictionary(await getLocale());
  const t = d.bereiche;
  const heroImg = await getHomeImage("bereiche-hero");
  const a1 = await getHomeImage("area-1");
  const a2 = await getHomeImage("area-2");

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
          <div className="mm-page-tiles cols-2">
            <Link
              href="/bereiche/textilveredelung"
              className="mm-page-tile mm-page-tile-link"
              style={a1 ? { backgroundImage: `url(${a1})` } : undefined}
            >
              <div className="mm-page-tile-label">{t.textil.cta}</div>
              <h3 className="mm-page-tile-title">{t.textil.title}</h3>
              <p className="mm-page-tile-desc">{t.textil.text}</p>
            </Link>
            <Link
              href="/bereiche/werbeartikel"
              className="mm-page-tile mm-page-tile-link"
              style={a2 ? { backgroundImage: `url(${a2})` } : undefined}
            >
              <div className="mm-page-tile-label">{t.werbe.cta}</div>
              <h3 className="mm-page-tile-title">{t.werbe.title}</h3>
              <p className="mm-page-tile-desc">{t.werbe.text}</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Lassen Sie uns Ihr Projekt umsetzen.</h2>
        <p className="mm-page-cta-p">Wir liefern Ihnen ein kostenloses Angebot innerhalb 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
