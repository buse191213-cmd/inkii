import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata: Metadata = {
  title: "Seite nicht gefunden | INKII",
  description: "Die aufgerufene Seite existiert nicht oder wurde verschoben.",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const t = getDictionary(await getLocale()).notFound;

  return (
    <SiteShell>
      <section className="notfound">
        <div className="wrap nf-inner">
          <span className="nf-code">404</span>
          <h1>{t.h1}</h1>
          <p>{t.text}</p>
          <div className="nf-actions">
            <Link className="btn btn-primary" href="/">{t.btnHome}</Link>
            <Link className="btn btn-ghost" href="/werbemittel">{t.btnCatalog}</Link>
            <Link className="btn btn-ghost" href="/kontakt">{t.btnContact}</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
