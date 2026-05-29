import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { getHomeImage } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Textilveredelung | INKII Works",
  description: "Veredelungsmethoden für professionelle Unternehmensbekleidung – Stickerei, DTF, Siebdruck und mehr.",
  alternates: { canonical: "/bereiche/textilveredelung" },
};

export default async function TextilveredelungDetailPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.textilSub;
  const heroImg = await getHomeImage("area-1");
  const img1 = await getHomeImage("feat-1");
  const img2 = await getHomeImage("feat-2");

  return (
    <SiteShell>
      <section
        className="mm-page-hero"
        style={heroImg ? { backgroundImage: `url(${heroImg})` } : undefined}
      >
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">{d.nav.home}</Link>
            <span className="mm-dot">•</span>
            <Link href="/bereiche">{d.nav.bereiche}</Link>
            <span className="mm-dot">•</span>
            <span className="active">{t.kicker}</span>
          </div>
          <h1 className="mm-page-h1">{t.h1}</h1>
          <p className="mm-page-lead">{t.intro}</p>
        </div>
      </section>

      <section className="mm-split">
        <div className="mm-split-img" style={img1 ? { backgroundImage: `url(${img1})` } : undefined} />
        <div className="mm-split-body">
          <span className="mm-page-kicker">{t.methods[0].title}</span>
          <h2 className="mm-page-h2">{t.methods[0].title}</h2>
          <p>{t.methods[0].text}</p>
          <p>{t.methods[1].text}</p>
        </div>
      </section>

      <section className="mm-split mm-split-reverse">
        <div className="mm-split-img" style={img2 ? { backgroundImage: `url(${img2})` } : undefined} />
        <div className="mm-split-body">
          <span className="mm-page-kicker">{t.methods[2].title}</span>
          <h2 className="mm-page-h2">{t.methods[2].title}</h2>
          <p>{t.methods[2].text}</p>
          <p>{t.methods[3].text}</p>
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">{t.ctaTitle}</h2>
        <p className="mm-page-cta-p">{t.ctaText}</p>
        <Link href="/kontakt" className="mm-page-cta-btn">{t.ctaBtn}</Link>
      </section>
    </SiteShell>
  );
}
