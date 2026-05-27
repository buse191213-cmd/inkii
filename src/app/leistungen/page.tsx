import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getHomeImage } from "@/lib/home-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leistungen | INKII",
  description: "Unsere Leistungen: Textildruck, Werbemittel, Teamwear, Onlineshops und mehr.",
  alternates: { canonical: "/leistungen" },
};

export default async function LeistungenPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const heroImg = await getHomeImage("ls-hero");
  const f1 = await getHomeImage("feat-1");
  const f2 = await getHomeImage("feat-2");
  const f3 = await getHomeImage("feat-3");
  const f4 = await getHomeImage("feat-4");
  const f5 = await getHomeImage("feat-5");
  const f6 = await getHomeImage("feat-6");
  const f7 = await getHomeImage("feat-7");
  const f8 = await getHomeImage("feat-8");

  const services = [
    {
      label: "Professionelle Textilveredelung",
      desc: "Siebdruck, Stickerei, DTF, Flockdruck und Patches — alle Verfahren aus einer Hand.",
      img: f1, href: "/veredelung",
    },
    {
      label: "Firmen- und Berufsbekleidung",
      desc: "Workwear und Corporate Wear, individuell veredelt mit Ihrem Logo.",
      img: f2, href: "/werbemittel?cat=kleidung",
    },
    {
      label: "Team- & Sportbekleidung",
      desc: "Trikots, Hoodies und Team-Outfits für Vereine und Mannschaften.",
      img: f3, href: "/leistungen/sportartikel",
    },
    {
      label: "Hochwertige Werbemittel",
      desc: "Tassen, Taschen, Powerbanks, Stifte und mehr — als Markenbotschafter.",
      img: f4, href: "/werbemittel",
    },
    {
      label: "INKII Works Shop",
      desc: "Stöbern Sie durch unser komplettes Sortiment — alle Produkte auf einen Blick.",
      img: f5, href: "/werbemittel",
    },
    {
      label: "Webdesign & digitale Lösungen",
      desc: "Moderne Websites, Landingpages und individuelle digitale Lösungen.",
      img: f6, href: "/webdesign",
    },
    {
      label: "Onlineshops für Unternehmen",
      desc: "Eigene Mitarbeiter- und Vereinsshops mit textilen Produkten — schlüsselfertig.",
      img: f7, href: "/werbemittel",
    },
    {
      label: "Ganzheitliche Marketinglösungen mit INKII Works",
      desc: "Performance, SEO, Social Media und Automation — Wachstum aus einer Hand.",
      img: f8, href: "/marketing",
    },
  ];

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
            <span className="active">Leistungen</span>
          </div>
          <h1 className="mm-page-h1">Alles aus einer Hand.</h1>
          <p className="mm-page-lead">
            Von Textildruck bis Onlineshop — wir liefern den kompletten Werbemittel-Service.
          </p>
        </div>
      </section>

      <section className="mm-page-section">
        <div className="wrap">
          <div className="mm-page-tiles cols-4">
            {services.map((s, i) => (
              <Link
                key={s.label}
                href={s.href}
                className="mm-page-tile mm-page-tile-link"
                style={s.img ? { backgroundImage: `url(${s.img})` } : undefined}
              >
                <div className="mm-page-tile-label">0{i + 1}</div>
                <h3 className="mm-page-tile-title">{s.label}</h3>
                <p className="mm-page-tile-desc">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Was darf es sein?</h2>
        <p className="mm-page-cta-p">Schicken Sie uns Ihre Anfrage — kostenlose Designs &amp; Angebot in 24 Stunden.</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{d.nav.kontakt}</Link>
      </section>
    </SiteShell>
  );
}
