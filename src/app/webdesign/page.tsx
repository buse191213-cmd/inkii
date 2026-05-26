import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Webdesign | INKII Works",
  description: "Moderne Websites und Online-Shops aus einer Hand — Webdesign by INKII WORKS.",
};

export default async function WebdesignPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const hero = await getHomeImage("webdesign-hero");
  const t1 = await getHomeImage("webdesign-1");
  const t2 = await getHomeImage("webdesign-2");
  const t3 = await getHomeImage("webdesign-3");
  const t4 = await getHomeImage("webdesign-4");

  const services = [
    {
      label: "Webseiten",
      desc: "Moderne, responsive Websites mit klarem Design und schneller Ladezeit.",
      img: t1,
    },
    {
      label: "Onlineshops",
      desc: "B2B- und B2C-Shops für Ihre Produkte — vom Kassensystem bis zur Lieferung.",
      img: t2,
    },
    {
      label: "Mitarbeiter-Shops",
      desc: "Eigene Bestellplattform für Firmenkleidung und Werbeartikel.",
      img: t3,
    },
    {
      label: "Wartung & Hosting",
      desc: "Updates, Backups, sichere Server — Ihre Website läuft, ohne dass Sie etwas tun.",
      img: t4,
    },
  ];

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
            <span className="active">Webdesign</span>
          </div>
          <h1 className="mm-page-h1">Webdesign.</h1>
          <p className="mm-page-lead">
            Moderne Websites und Online-Shops aus einer Hand — Design, Entwicklung und Pflege.
          </p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-4">
            {services.map((s, i) => (
              <div
                key={s.label}
                className="mm-page-tile"
                style={s.img ? { backgroundImage: `url(${s.img})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{s.label}</h3>
                <p className="mm-page-tile-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Bereit für Ihre neue Website?</h2>
        <p className="mm-page-cta-p">Kostenloses Konzept und Angebot in 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
