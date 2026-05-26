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
  const img1 = await getHomeImage("feat-1");
  const img2 = await getHomeImage("feat-2");

  return (
    <SiteShell>
      {/* HERO */}
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
          <h1 className="mm-page-h1">Textilveredelung.</h1>
          <p className="mm-page-lead">
            Textildruck &amp; Bestickung für Firmen- und Berufsbekleidung sowie für Team-
            und Sportbekleidung.
          </p>
        </div>
      </section>

      {/* SEKTION 1: Veredelungsmethoden (Image sol + Text sağ) */}
      <section className="mm-split">
        <div
          className="mm-split-img"
          style={img1 ? { backgroundImage: `url(${img1})` } : undefined}
        />
        <div className="mm-split-body">
          <span className="mm-page-kicker">Veredelungsmethoden</span>
          <h2 className="mm-page-h2">Die passende Methode für Ihre Marke.</h2>
          <p>
            Von hochwertiger Stickerei über moderne DTF-Verfahren bis hin zu effizientem
            Siebdruck für größere Stückzahlen — gemeinsam mit INKII Works realisieren wir
            individuelle Veredelungslösungen für professionelle Unternehmensbekleidung.
          </p>
          <p>
            Je nach Einsatzbereich unterscheiden sich die Verfahren in Wirkung,
            Strapazierfähigkeit und Produktionsumfang. So finden wir gemeinsam die passende
            Umsetzung für Ihre Marke und Anforderungen.
          </p>
        </div>
      </section>

      {/* SEKTION 2: Logo perfekt in Szene (Text sol + Image sağ) */}
      <section className="mm-split mm-split-reverse">
        <div
          className="mm-split-img"
          style={img2 ? { backgroundImage: `url(${img2})` } : undefined}
        />
        <div className="mm-split-body">
          <span className="mm-page-kicker">Ihr Logo. Perfekt in Szene gesetzt.</span>
          <h2 className="mm-page-h2">Maximale Flexibilität in der Veredelung.</h2>
          <p>
            Ob Brust, Rücken oder Ärmel — gemeinsam mit INKII Works platzieren wir Ihr
            Firmenlogo exakt dort, wo es die größte Wirkung entfaltet. Mit vielfältigen
            Platzierungsoptionen setzen wir Ihr Corporate Design präzise und hochwertig um.
          </p>
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
