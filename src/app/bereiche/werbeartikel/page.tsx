import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Werbeartikel | INKII Works",
  description: "Werbeartikel die Ihr Unternehmen sichtbar machen — Taschen, Trinkflaschen, Büroartikel und mehr.",
};

export default async function WerbeartikelDetailPage() {
  const heroImg = await getHomeImage("area-2");
  const img1 = await getHomeImage("feat-3");

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
            <Link href="/bereiche">Bereiche</Link>
            <span className="mm-dot">•</span>
            <span className="active">Werbeartikel</span>
          </div>
          <h1 className="mm-page-h1">Werbeartikel.</h1>
          <p className="mm-page-lead">
            Textildruck &amp; Bestickung für Taschen und mehr.
          </p>
        </div>
      </section>

      {/* SEKTION: Image sol + Text sağ */}
      <section className="mm-split">
        <div
          className="mm-split-img"
          style={img1 ? { backgroundImage: `url(${img1})` } : undefined}
        />
        <div className="mm-split-body">
          <span className="mm-page-kicker">Werbeartikel, die Ihr Unternehmen sichtbar machen.</span>
          <h2 className="mm-page-h2">Funktion trifft Markenwirkung.</h2>
          <p>
            Ob Taschen, Trinkflaschen oder Büroartikel — gemeinsam mit INKII Works
            gestalten wir hochwertige Werbeartikel, die Ihre Marke im Alltag präsent
            halten. Durch individuelle Veredelung und sorgfältig ausgewählte Produkte
            entstehen praktische Markenbotschafter mit echtem Mehrwert.
          </p>
          <ul className="mm-feature-list">
            <li><span>✓</span> Große Auswahl an Werbeartikeln für Unternehmen</li>
            <li><span>✓</span> Individuelle Veredelung mit Ihrem Logo oder Design</li>
            <li><span>✓</span> Alltagsprodukte mit hoher Markenpräsenz</li>
            <li><span>✓</span> Hochwertige Umsetzung in Zusammenarbeit mit INKII Works</li>
          </ul>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Ihre Werbeartikel — auf Anfrage.</h2>
        <p className="mm-page-cta-p">Stöbern Sie im Katalog oder schicken Sie uns Ihre Idee.</p>
        <Link href="/werbemittel" className="mm-page-cta-btn">Zum Katalog</Link>
      </section>
    </SiteShell>
  );
}
