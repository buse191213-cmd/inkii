import Link from "next/link";
import Image from "next/image";
import SiteShell from "@/components/SiteShell";
import BodyClass from "@/components/BodyClass";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";
import { getMarketingVideoSrc } from "@/lib/hero-video";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "INKII MARKETING — Webdesign & Online-Marketing",
  description: "Webdesign, Social Media, SEO, Google Ads, Branding und Corporate Design — die Digital-Marke von INKII.",
  alternates: { canonical: "/inkii-marketing" },
};

export default async function InkiiMarketingPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.inkiiMarketing;
  const videoSrc = await getMarketingVideoSrc();
  const tileWeb = await getHomeImage("area-3");      // Web Design (önceki servis kutusu görseli)
  const tileMkt = await getHomeImage("area-4");      // Marketing (önceki servis kutusu görseli)

  return (
    <SiteShell>
      <BodyClass name="is-marketing" />

      {/* === HERO — Video === */}
      <section className="hero-full">
        {videoSrc ? (
          <video
            className="hero-bg-video"
            autoPlay
            loop
            muted
            playsInline
            poster=""
          >
            <source src={videoSrc} />
          </video>
        ) : (
          <div className="hero-bg-fallback" />
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            RUNDUM<span className="hero-dash">-</span>DIGITAL<span className="hero-dash">-</span>SERVICE
          </h1>
          <p className="hero-sub">
            Kreatives Webdesign und strategisches Marketing aus einer Hand.
          </p>
          <div className="hero-cta-row">
            <Link href="#services" className="btn-hero-light">{t.ctaBtn}</Link>
            <Link href="/" className="btn-hero-outline">{t.worksLink}</Link>
          </div>
        </div>

        {/* Marquee */}
        <div className="hero-marquee" aria-hidden="true">
          <div className="hero-marquee-track">
            <span>{t.tagline}</span>
            <span>•</span>
            <span>{t.tagline}</span>
            <span>•</span>
            <span>{t.tagline}</span>
            <span>•</span>
          </div>
        </div>
      </section>

      {/* === 2 büyük kart: Web Design + Marketing === */}
      <section className="home-tiles" id="services">
        <Link href="/webdesign" className="home-tile">
          <div className="home-tile-img">
            {tileWeb && (
              <Image src={tileWeb} alt={t.services[0].title} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            )}
          </div>
          <div className="home-tile-label">
            {t.services[0].title}
            {t.services[0].sub && <><br />{t.services[0].sub}</>}
          </div>
        </Link>
        <Link href="/marketing" className="home-tile">
          <div className="home-tile-img">
            {tileMkt && (
              <Image src={tileMkt} alt={t.services[1].title} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            )}
          </div>
          <div className="home-tile-label">
            {t.services[1].title}
            {t.services[1].sub && <><br />{t.services[1].sub}</>}
          </div>
        </Link>
      </section>

      {/* === CTA === */}
      <section className="im-cta">
        <h2>{t.ctaH}</h2>
        <p>{t.ctaP}</p>
        <Link href="/kontakt" className="im-cta-btn">{t.ctaBtn}</Link>
      </section>
    </SiteShell>
  );
}
