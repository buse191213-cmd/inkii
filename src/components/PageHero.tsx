import { Fragment } from "react";
import Link from "next/link";

export type Crumb = { label: string; href?: string };

/**
 * Großer, bildfüllender Seitenkopf. Mit Bild: Vollflächiges Foto + Text darüber.
 * Ohne Bild: farbiger Verlauf mit dezenter Grafik.
 */
export default function PageHero({
  image,
  crumbs,
  title,
  intro,
}: {
  image: string | null;
  crumbs: Crumb[];
  title: string;
  intro: string;
}) {
  return (
    <section
      className={`img-hero${image ? "" : " is-grad"}`}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      {!image && (
        <div className="img-hero-deco" aria-hidden="true">
          <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice">
            <circle cx="950" cy="120" r="66" fill="rgba(255,255,255,0.13)" />
            <circle cx="950" cy="120" r="40" fill="rgba(255,255,255,0.12)" />
            <path d="M0 320Q210 250 440 300T880 288 1200 322V420H0Z" fill="rgba(255,255,255,0.07)" />
            <path d="M0 362Q270 300 560 348T1090 342 1200 360V420H0Z" fill="rgba(255,255,255,0.06)" />
          </svg>
        </div>
      )}
      <div className="img-hero-overlay" />
      <div className="wrap img-hero-inner">
        <div className="breadcrumb">
          {crumbs.map((c, i) => (
            <Fragment key={c.label}>
              {i > 0 && <span> / </span>}
              {c.href ? (
                <Link href={c.href}>{c.label}</Link>
              ) : (
                <span>{c.label}</span>
              )}
            </Fragment>
          ))}
        </div>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
    </section>
  );
}
