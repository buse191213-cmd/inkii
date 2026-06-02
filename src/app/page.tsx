import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import BodyClass from "@/components/BodyClass";
import { getHeroVideoSrc } from "@/lib/hero-video";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.home;
  const heroVideoSrc = await getHeroVideoSrc();
  const tile1 = await getHomeImage("home-tile-1");
  const tile2 = await getHomeImage("home-tile-2");
  const svcDruck = await getHomeImage("area-1");
  const svcWerbe = await getHomeImage("area-2");
  const svcWeb = await getHomeImage("area-3");
  const svcMkt = await getHomeImage("area-4");
  const svcFahrzeug = await getHomeImage("fb-banner");

  const services = [
    { label: t.services[0].label, sub: t.services[0].sub, href: "/bereiche/textilveredelung", img: svcDruck },
    { label: t.services[1].label, sub: t.services[1].sub, href: "/bereiche/werbeartikel", img: svcWerbe },
    { label: t.services[2].label, sub: t.services[2].sub, href: "/webdesign", img: svcWeb },
    { label: t.services[3].label, sub: t.services[3].sub, href: "/marketing", img: svcMkt },
  ];

  return (
    <SiteShell>
      <BodyClass name="is-home" />
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
            Hochwertige Textilveredelung und Werbeartikel aus einer Hand.
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
        <Link href="/werbemittel?cat=kleidung" className="home-tile">
          <div
            className="home-tile-img"
            style={tile1 ? { backgroundImage: `url(${tile1})` } : undefined}
          />
          <div className="home-tile-label">
            {t.tileLeftL1}
            <br />
            {t.tileLeftL2}
          </div>
        </Link>
        <Link href="/werbemittel?cat=werbeartikel" className="home-tile">
          <div
            className="home-tile-img"
            style={tile2 ? { backgroundImage: `url(${tile2})` } : undefined}
          />
          <div className="home-tile-label">
            {t.tileRightL1}
            <br />
            {t.tileRightL2}
          </div>
        </Link>
      </section>

      {/* === 4 Service-Boxen === */}
      <section className="home-services">
        {services.map((s) => (
          <Link key={s.label} href={s.href} className="svc-box">
            <div
              className="svc-img"
              style={s.img ? { backgroundImage: `url(${s.img})` } : undefined}
            />
            <div className="svc-overlay" />
            <div className="svc-text">
              <div className="svc-label">{s.label}</div>
              {s.sub && <div className="svc-sub">{s.sub}</div>}
            </div>
          </Link>
        ))}
      </section>

      {/* === Fahrzeugbeschriftung Banner — uzunlamasına === */}
      <section className="home-fahrzeug">
        <Link
          href="/fahrzeugbeschriftung"
          className="fahrzeug-banner"
          style={svcFahrzeug ? { backgroundImage: `url(${svcFahrzeug})` } : undefined}
        >
          <div className="fahrzeug-overlay" />
          <div className="fahrzeug-text">
            <div className="fahrzeug-label">{t.fahrzeugLabel}</div>
            <div className="fahrzeug-sub">{t.fahrzeugSub}</div>
            <div className="fahrzeug-sub2">{t.fahrzeugSub2}</div>
          </div>
        </Link>
      </section>

      {/* === Tagline unter den Kacheln === */}
      <section className="home-tagline">
        <div className="wrap">
          <p>Ihr Partner für Textilveredelung und Werbemittel — von der Gestaltung bis zur Lieferung.</p>
        </div>
      </section>
    </SiteShell>
  );
}
