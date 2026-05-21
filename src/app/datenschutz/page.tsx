import SiteShell from "@/components/SiteShell";
import PageHero from "@/components/PageHero";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata: Metadata = {
  title: "Datenschutz | INKII",
  description: "Datenschutzerklärung gemäß DSGVO.",
  robots: { index: true, follow: true },
};

export default async function DatenschutzPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  return (
    <SiteShell>
      <PageHero
        image={null}
        crumbs={[{ label: d.nav.home, href: "/" }, { label: "Datenschutz" }]}
        title="Datenschutzerklärung"
        intro="Informationen zur Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO."
      />

      <section>
        <div className="wrap legal-prose">
          <h2>1. Verantwortlicher</h2>
          <p>
            INKIISTUDIO, Inhaber Sener Kirli, Westuferstr. 25, 45356 Essen,{" "}
            <a href="mailto:info@inkiistudio.de">info@inkiistudio.de</a>
          </p>

          <h2>2. Verarbeitung personenbezogener Daten</h2>
          <p>
            Wir verarbeiten personenbezogene Daten nur, soweit dies zur
            Vertragsabwicklung, Kundenkommunikation oder aufgrund gesetzlicher Pflichten
            erforderlich ist.
          </p>

          <h2>3. Weitergabe</h2>
          <p>
            Eine Weitergabe erfolgt nur an Dienstleister (Versand, Zahlungsanbieter)
            oder wenn gesetzlich vorgeschrieben.
          </p>

          <h2>4. Rechte der Betroffenen</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung sowie Widerspruch.
          </p>

          <h2>5. Cookies &amp; Server-Logs</h2>
          <p>
            Diese Website verwendet nur technisch notwendige Cookies. Server-Logs werden
            zur Sicherstellung des Betriebs verarbeitet.
          </p>

          <h2>6. Kontakt Datenschutz</h2>
          <p>
            Fragen zum Datenschutz bitte an:{" "}
            <a href="mailto:info@inkiistudio.de">info@inkiistudio.de</a>
          </p>

          <p className="legal-link-row">
            <Link href="/impressum">→ Impressum</Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
