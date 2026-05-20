import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import PageHero from "@/components/PageHero";
import { AREA_ICONS } from "@/components/AreasSection";
import { RawIcon } from "@/lib/icons";
import { getHomeImages } from "@/lib/home-images";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bereiche – Druck, Werbetechnik, Webdesign & Marketing | INKII",
  description:
    "Druck, Werbetechnik, Webdesign und Marketing – der komplette Markenauftritt aus einer Hand bei INKII.",
};

export default async function BereichePage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const b = d.bereiche;
  const images = await getHomeImages();

  return (
    <SiteShell>
      <PageHero
        image={images["bereiche-hero"]}
        crumbs={[
          { label: d.nav.home, href: "/" },
          { label: d.nav.bereiche },
        ]}
        title={b.h1}
        intro={b.intro}
      />

      <section>
        <div className="wrap">
          {b.items.map((it, i) => {
            const img = images[`area-${i + 1}`];
            return (
              <div
                key={i}
                className={`bz-row reveal${i % 2 === 1 ? " rev" : ""}`}
              >
                <div
                  className={`bz-media${img ? "" : ` is-grad-${i}`}`}
                  style={img ? { backgroundImage: `url(${img})` } : undefined}
                >
                  {!img && (
                    <span className="bz-ic">
                      <RawIcon svg={AREA_ICONS[i]} />
                    </span>
                  )}
                </div>
                <div className="bz-text">
                  <span className="bz-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2>{d.areas.items[i].name}</h2>
                  <p className="bz-lead">{it.lead}</p>
                  <ul className="bz-points">
                    {it.points.map((p, j) => (
                      <li key={j}>
                        <span className="bz-tk">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="cta-strip">
        <h2>{b.ctaTitle}</h2>
        <p>{b.ctaText}</p>
        <Link className="btn btn-primary" href="/kontakt">{b.ctaBtn}</Link>
      </div>
    </SiteShell>
  );
}
