import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sportartikel | INKII Works",
  description: "Team- und Sportbekleidung mit Logo und Branding.",
};

export default async function SportartikelPage() {
  const hero = await getHomeImage("sport-1");
  const s1 = await getHomeImage("sport-1");
  const s2 = await getHomeImage("sport-2");
  const s3 = await getHomeImage("sport-3");
  const s4 = await getHomeImage("sport-4");
  const s5 = await getHomeImage("sport-5");
  const s6 = await getHomeImage("sport-6");
  const s7 = await getHomeImage("sport-7");
  const s8 = await getHomeImage("sport-8");

  const row1 = [s1, s2, s3];
  const row2 = [s4, s5, s6, s7, s8];

  return (
    <SiteShell>
      <section
        className="mm-page-hero"
        style={hero ? { backgroundImage: `url(${hero})` } : undefined}
      >
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">Home</Link>
            <span className="mm-dot">•</span>
            <Link href="/leistungen">Leistungen</Link>
            <span className="mm-dot">•</span>
            <span className="active">Sportartikel</span>
          </div>
          <h1 className="mm-page-h1">Sportartikel.</h1>
          <p className="mm-page-lead">
            Team- und Sportbekleidung mit Logo und Branding.
          </p>
        </div>
      </section>

      {/* Görsel grid: üstte 3, altta 5 — yazısız */}
      <section className="mm-page-section">
        <div className="wrap">
          <div className="sport-row sport-row-3">
            {row1.map((img, i) => (
              <div
                key={`r1-${i}`}
                className="sport-cell"
                style={img ? { backgroundImage: `url(${img})` } : undefined}
              />
            ))}
          </div>
          <div className="sport-row sport-row-5">
            {row2.map((img, i) => (
              <div
                key={`r2-${i}`}
                className="sport-cell"
                style={img ? { backgroundImage: `url(${img})` } : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Outfits für Ihr Team — auf Anfrage.</h2>
        <p className="mm-page-cta-p">Schicken Sie uns Ihr Logo, wir liefern die Outfits.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">Kontakt</Link>
      </section>
    </SiteShell>
  );
}
