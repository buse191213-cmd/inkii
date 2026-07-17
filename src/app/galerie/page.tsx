import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Ausgewählte Textildruck- und Veredelungsarbeiten von INKII Works — DTF, Siebdruck, Stickerei und mehr. Sehen Sie Beispiele unserer Qualität.",
  alternates: { canonical: "/galerie" },
};

export default async function GaleriePage() {
  let items: { id: string; imageUrl: string; title: string }[] = [];
  try {
    items = await db.galleryItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    items = [];
  }

  return (
    <SiteShell>
      <section className="mm-page-hero">
        <div className="mm-page-hero-inner">
          <div className="mm-page-crumb">
            <Link href="/">Home</Link>
            <span className="mm-dot">•</span>
            <span className="active">Galerie</span>
          </div>
          <h1 className="mm-page-h1">Unsere Arbeiten</h1>
          <p className="mm-page-lead">
            Ein Einblick in unsere Textildruck- und Veredelungsprojekte — von
            DTF über Siebdruck bis Stickerei. Jedes Stück steht für unsere
            Qualität und Sorgfalt.
          </p>
        </div>
      </section>

      <section className="galerie-section">
        <div className="wrap-wide">
          {items.length === 0 ? (
            <p className="galerie-empty">
              Bald finden Sie hier eine Auswahl unserer Arbeiten.
            </p>
          ) : (
            <div className="galerie-grid">
              {items.map((item) => (
                <figure key={item.id} className="galerie-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title || "INKII Works Arbeit"}
                    loading="lazy"
                    decoding="async"
                  />
                  {item.title && (
                    <figcaption className="galerie-cap">{item.title}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mm-page-cta">
        <h2 className="mm-page-cta-h">Haben Sie ein eigenes Projekt?</h2>
        <p className="mm-page-cta-p">
          Von der Idee bis zum fertigen Textil — wir setzen Ihr Design um.
        </p>
        <Link href="/kontakt" className="mm-page-cta-btn">
          Jetzt anfragen
        </Link>
      </section>
    </SiteShell>
  );
}
