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
  /* Mood-Bilder: 4 Slots — der Admin kann später Originalbilder
     (Fußball, Tennis, Tischtennis, Boxen) per /admin/homepage hochladen. */
  const mood1 = await getHomeImage("sport-1");
  const mood2 = await getHomeImage("sport-2");
  const mood3 = await getHomeImage("sport-3");
  const mood4 = await getHomeImage("sport-4");

  const tiles = [
    { label: "Fußball", img: mood1 },
    { label: "Tennis", img: mood2 },
    { label: "Tischtennis", img: mood3 },
    { label: "Boxen", img: mood4 },
  ];

  return (
    <SiteShell>
      <section
        className="mm-page-hero"
        style={mood1 ? { backgroundImage: `url(${mood1})` } : undefined}
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

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-4">
            {tiles.map((t) => (
              <div
                key={t.label}
                className="mm-page-tile"
                style={t.img ? { backgroundImage: `url(${t.img})` } : undefined}
              >
                <h3 className="mm-page-tile-title">{t.label}</h3>
              </div>
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
