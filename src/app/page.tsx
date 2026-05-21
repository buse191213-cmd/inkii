import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { getHeroVideoSrc } from "@/lib/hero-video";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroVideoSrc = await getHeroVideoSrc();
  const tile1 = await getHomeImage("home-tile-1");
  const tile2 = await getHomeImage("home-tile-2");
  const svcDruck = await getHomeImage("area-1");
  const svcWerbe = await getHomeImage("area-2");
  const svcWeb = await getHomeImage("area-3");
  const svcMkt = await getHomeImage("area-4");

  const services = [
    { label: "DRUCK", href: "/bereiche", img: svcDruck },
    { label: "WERBETECHNIK", href: "/bereiche", img: svcWerbe },
    { label: "WEBDESIGN", href: "/bereiche", img: svcWeb },
    { label: "MARKETING", href: "/bereiche", img: svcMkt },
  ];

  return (
    <SiteShell>
      {/* === HERO — Vollbild-Video mit Titel === */}
      <section className="hero-full">
        {heroVideoSrc ? (
          <video
            className="hero-bg-video"
            autoPlay
            loop
            muted
            playsInline
            poster=""
          >
            <source src={heroVideoSrc} />
          </video>
        ) : (
          <div className="hero-bg-fallback" />
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            RUNDUM<span className="hero-dash">-</span>MERCH<span className="hero-dash">-</span>SERVICE
          </h1>
          <p className="hero-sub">
            Textilveredelung, Werbemittel & Druck — alles aus einer Hand.
          </p>
          <div className="hero-cta-row">
            <Link href="/werbemittel" className="btn-hero-light">
              Alle Produkte
            </Link>
            <Link href="/kontakt" className="btn-hero-outline">
              Kontakt
            </Link>
          </div>
        </div>
      </section>

      {/* === 2 große Bildkacheln === */}
      <section className="home-tiles">
        <Link href="/werbemittel" className="home-tile">
          <div
            className="home-tile-img"
            style={tile1 ? { backgroundImage: `url(${tile1})` } : undefined}
          />
          <div className="home-tile-label">
            INDIVIDUELLE
            <br />
            BEKLEIDUNG
          </div>
        </Link>
        <Link href="/werbemittel" className="home-tile">
          <div
            className="home-tile-img"
            style={tile2 ? { backgroundImage: `url(${tile2})` } : undefined}
          />
          <div className="home-tile-label">
            INDIVIDUELLE
            <br />
            TASCHEN
          </div>
        </Link>
      </section>

      {/* === 4 Service-Boxen: Druck / Werbetechnik / Webdesign / Marketing === */}
      <section className="home-services">
        {services.map((s) => (
          <Link key={s.label} href={s.href} className="svc-box">
            <div
              className="svc-img"
              style={s.img ? { backgroundImage: `url(${s.img})` } : undefined}
            />
            <div className="svc-overlay" />
            <div className="svc-label">{s.label}</div>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
