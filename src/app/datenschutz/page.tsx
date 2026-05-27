import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz | INKII Works",
  description: "Datenschutzerklärung gemäß DSGVO.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: true },
};

export default async function DatenschutzPage() {
  return (
    <SiteShell>
      <section>
        <div className="wrap legal-prose">
          <p className="legal-crumb">
            <Link href="/">Startseite</Link> <span>/</span> Datenschutz
          </p>

          <h1 className="legal-h1">Datenschutzerklärung</h1>

          <h2>1. Verantwortlicher</h2>
          <p>
            INKII WORKS, Inhaber Sener Kirli, Westuferstr. 25, 45356 Essen,{" "}
            <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a>
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
            <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a>
          </p>

          <p className="legal-link-row">
            <Link href="/impressum">→ Impressum</Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
