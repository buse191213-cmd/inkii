import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Textilveredelung | INKII Works",
  description: "Veredelungsmethoden für professionelle Unternehmensbekleidung – Stickerei, DTF, Siebdruck und mehr.",
};

export default async function TextilveredelungDetailPage() {
  const heroImg = await getHomeImage("area-1");

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
            <span className="active">Textilveredelung</span>
          </div>
          <h1 className="mm-page-h1">Veredelungsmethoden</h1>
          <p className="mm-page-lead">
            Von hochwertiger Stickerei über moderne DTF-Verfahren bis hin zu effizientem
            Siebdruck für größere Stückzahlen — gemeinsam mit INKII Works realisieren wir
            individuelle Veredelungslösungen für professionelle Unternehmensbekleidung.
          </p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-story-grid">
            <div>
              <span className="mm-page-kicker">Beratung</span>
              <h2 className="mm-page-h2">Die passende Methode für Ihre Marke.</h2>
            </div>
            <div className="mm-story-text">
              <p>
                Je nach Einsatzbereich unterscheiden sich die Verfahren in Wirkung,
                Strapazierfähigkeit und Produktionsumfang. So finden wir gemeinsam die
                passende Umsetzung für Ihre Marke und Anforderungen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mm-page-section alt">
        <div className="wrap">
          <div className="mm-page-section-head">
            <span className="mm-page-kicker">Ihr Logo. Perfekt in Szene gesetzt.</span>
            <h2 className="mm-page-h2">Maximale Flexibilität in der Veredelung.</h2>
            <p className="mm-page-sub">
              Ob Brust, Rücken oder Ärmel — gemeinsam mit INKII Works platzieren wir Ihr
              Firmenlogo exakt dort, wo es die größte Wirkung entfaltet. Mit vielfältigen
              Platzierungsoptionen setzen wir Ihr Corporate Design präzise und hochwertig um.
            </p>
          </div>
          <ul className="mm-feature-list">
            <li><span>✓</span> Vielfältige Platzierungsoptionen für maximale Freiheit</li>
            <li><span>✓</span> Individuelle Anpassung von Größe und Position</li>
            <li><span>✓</span> Digitale Vorschau vor Produktionsstart</li>
            <li><span>✓</span> Umsetzung mehrerer Logos möglich</li>
          </ul>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Bereit für Ihre Veredelung?</h2>
        <p className="mm-page-cta-p">Schicken Sie uns Ihr Logo — wir machen den Rest.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">Kontakt</Link>
      </section>
    </SiteShell>
  );
}
