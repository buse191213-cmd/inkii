import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bereiche | INKII",
  description: "Textilveredelung und Werbeartikel – die Bereiche von INKII WORKS.",
};

export default async function BereichePage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
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
            <span className="active">Bereiche</span>
          </div>
          <h1 className="mm-page-h1">Vier Bereiche, ein starkes Team.</h1>
          <p className="mm-page-lead">
            Textilveredelung, Werbemittel, Webdesign und Marketing — alles bei INKII Works.
          </p>
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
              <div className="mm-page-tile-label">01 Textilveredelung</div>
              <h3 className="mm-page-tile-title">Textildruck &amp; Bestickung</h3>
              <p className="mm-page-tile-desc">
                Für Firmen- und Berufsbekleidung sowie für Team- und Sportbekleidung.
              </p>
            </Link>
            <Link
              href="/bereiche/werbeartikel"
              className="mm-page-tile mm-page-tile-link"
              style={a2 ? { backgroundImage: `url(${a2})` } : undefined}
            >
              <div className="mm-page-tile-label">02 Werbeartikel</div>
              <h3 className="mm-page-tile-title">Veredelte Markenartikel</h3>
              <p className="mm-page-tile-desc">
                Textildruck &amp; Bestickung für Taschen, Trinkflaschen, Büroartikel und mehr.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Lassen Sie uns Ihr Projekt umsetzen.</h2>
        <p className="mm-page-cta-p">Wir liefern Ihnen ein kostenloses Angebot in 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
