import Link from "next/link";
import Image from "next/image";
import SiteShell from "@/components/SiteShell";
import BodyClass from "@/components/BodyClass";
import JsonLd from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";
import { getHeroVideoSrc } from "@/lib/hero-video";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const revalidate = 60;

export default async function HomePage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.home;
  const heroVideoSrc = await getHeroVideoSrc();
  const tile1 = await getHomeImage("home-tile-1");
  const tile2 = await getHomeImage("home-tile-2");
  const svcDruck = await getHomeImage("area-1");
  const svcWerbe = await getHomeImage("area-2");
  const svcFahrzeug = await getHomeImage("fb-banner");

  const services = [
    { label: t.services[0].label, sub: t.services[0].sub, href: "/bereiche/textilveredelung", img: svcDruck },
    { label: t.services[1].label, sub: t.services[1].sub, href: "/bereiche/werbeartikel", img: svcWerbe },
  ];

  return (
    <SiteShell>
      <BodyClass name="is-home" />
      <JsonLd data={faqSchema()} />
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
            {locale === "tr" ? (
              <>KOMPLE<span className="hero-dash">-</span>BASKI<span className="hero-dash">-</span>HİZMETİ</>
            ) : locale === "en" ? (
              <>COMPLETE<span className="hero-dash">-</span>MERCH<span className="hero-dash">-</span>SERVICE</>
            ) : (
              <>RUNDUM<span className="hero-dash">-</span>MERCH<span className="hero-dash">-</span>SERVICE</>
            )}
          </h1>
          <p className="hero-sub">
            {locale === "tr"
              ? "Tek elden yüksek kaliteli tekstil baskı ve promosyon ürünleri."
              : locale === "en"
              ? "High-quality textile printing and promotional products from a single source."
              : "Hochwertige Textilveredelung und Werbeartikel aus einer Hand."}
          </p>
          <div className="hero-cta-row">
            <Link href="/werbemittel" className="btn-hero-light">
              {locale === "tr" ? "Tüm Ürünler" : locale === "en" ? "All Products" : "Alle Produkte"}
            </Link>
            <Link href="/kontakt" className="btn-hero-outline">
              {locale === "tr" ? "İletişim" : locale === "en" ? "Contact" : "Kontakt"}
            </Link>
          </div>
        </div>

        {/* Sağ alt — kayan reklam metni */}
        <div className="hero-marquee" aria-hidden="true">
          <div className="hero-marquee-track">
            <span>{d.utility.center}</span>
            <span>•</span>
            <span>{d.utility.center}</span>
            <span>•</span>
            <span>{d.utility.center}</span>
            <span>•</span>
          </div>
        </div>
      </section>

      {/* === 2 große Bildkacheln === */}
      <section className="home-tiles">
        <Link href="/werbemittel?cat=kleidung" className="home-tile">
          <div className="home-tile-img">
            {tile1 && (
              <Image src={tile1} alt={t.tileLeftL1} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            )}
          </div>
          <div className="home-tile-label">
            {t.tileLeftL1}
            <br />
            {t.tileLeftL2}
          </div>
        </Link>
        <Link href="/werbemittel?cat=werbeartikel" className="home-tile">
          <div className="home-tile-img">
            {tile2 && (
              <Image src={tile2} alt={t.tileRightL1} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            )}
          </div>
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
            <div className="svc-img">
              {s.img && (
                <Image src={s.img} alt={s.label} fill sizes="(max-width: 768px) 100vw, 25vw" style={{ objectFit: "cover" }} />
              )}
            </div>
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
        <Link href="/fahrzeugbeschriftung" className="fahrzeug-banner">
          {svcFahrzeug && (
            <Image src={svcFahrzeug} alt={t.fahrzeugSub} fill sizes="100vw" style={{ objectFit: "cover" }} priority={false} />
          )}
          <div className="fahrzeug-overlay" />
          <div className="fahrzeug-text">
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
