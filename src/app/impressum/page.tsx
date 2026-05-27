import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | INKII Works",
  description: "Impressum und Allgemeine Geschäftsbedingungen der INKII Works.",
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: true },
};

export default async function ImpressumPage() {
  return (
    <SiteShell>
      <section>
        <div className="wrap legal-prose">
          <p className="legal-crumb">
            <Link href="/">Startseite</Link> <span>/</span> Impressum
          </p>

          <h1 className="legal-h1">Impressum</h1>

          <h2>INKII WORKS — Rechtstexte &amp; Website-Inhalte</h2>
          <p>
            <strong>INKII WORKS</strong>
            <br />Inhaber: Sener Kirli
            <br />Westuferstr. 25
            <br />45356 Essen
            <br />Deutschland
          </p>

          <p>
            E-Mail: <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a>
            <br />Telefon: <a href="tel:+4920184362510">0201 / 84362510</a>
            <br />Mobil: <a href="tel:+491606767001">0160 / 6767001</a>
          </p>

          <p>
            Umsatzsteuer-ID: <strong>DE353055316</strong>
            <br />Steuernummer: <strong>111/5145/4871</strong>
          </p>

          <p>
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
            <br />Sener Kirli, Westuferstr. 25, 45356 Essen
          </p>

          <p>
            Online-Streitbeilegung:{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
              https://ec.europa.eu/consumers/odr
            </a>
            <br />
            Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2>Allgemeine Geschäftsbedingungen (AGB)</h2>

          <h3>1. Geltungsbereich</h3>
          <p>
            Diese AGB gelten für alle Lieferungen und Leistungen der INKII WORKS an
            Verbraucher (§ 13 BGB) und Unternehmer (§ 14 BGB).
          </p>

          <h3>2. Vertragspartner</h3>
          <p>
            INKII WORKS, Inhaber Sener Kirli, Westuferstr. 25, 45356 Essen.
          </p>

          <h3>3. Angebot und Vertragsschluss</h3>
          <p>
            Unsere Angebote sind freibleibend. Ein Vertrag kommt durch unsere
            Auftragsbestätigung oder mit Lieferung der Ware zustande.
          </p>

          <h3>4. Preise und Lieferung</h3>
          <p>
            Alle Preise sind in Euro inkl. MwSt. Versandkosten werden gesondert
            ausgewiesen. Lieferzeiten werden individuell angegeben.
          </p>

          <h3>5. Zahlung</h3>
          <p>
            Zahlung per Vorkasse oder nach Vereinbarung auf das Konto:
            <br />IBAN: <strong>DE30 3605 0105 0002 3808 97</strong>
            <br />BIC: <strong>SPESDE3EXXX</strong>
          </p>

          <h3>6. Eigentumsvorbehalt</h3>
          <p>Bis zur vollständigen Bezahlung bleibt die Ware unser Eigentum.</p>

          <h3>7. Gewährleistung</h3>
          <p>
            Es gelten die gesetzlichen Sachmängelrechte. Gegenüber Unternehmern beträgt
            die Gewährleistungsfrist 12 Monate.
          </p>

          <h3>8. Haftung</h3>
          <p>
            Wir haften unbegrenzt für Vorsatz und grobe Fahrlässigkeit. Bei leichter
            Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten.
          </p>

          <h3>9. Widerrufsrecht</h3>
          <p>
            Verbrauchern steht ein Widerrufsrecht nach Maßgabe der folgenden
            Widerrufsbelehrung zu.
          </p>

          <h3>10. Gerichtsstand</h3>
          <p>Es gilt deutsches Recht. Gerichtsstand ist Essen.</p>

          <h2>Widerrufsbelehrung</h2>
          <p>
            Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag
            zu widerrufen. Die Frist beträgt 14 Tage ab dem Tag, an dem Sie oder ein von
            Ihnen benannter Dritter die Waren in Besitz genommen haben.
          </p>
          <p>
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (INKII WORKS, Westuferstr. 25,
            45356 Essen, <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a>)
            mittels einer eindeutigen Erklärung (z. B. per Brief oder E-Mail) informieren.
          </p>
          <p>
            <strong>Folgen des Widerrufs:</strong> Wenn Sie diesen Vertrag widerrufen,
            erstatten wir alle Zahlungen, einschließlich der Lieferkosten, innerhalb von
            14 Tagen nach Erhalt der Rücksendung. Die Rücksendekosten trägt der Käufer.
          </p>

          <h2>Muster-Widerrufsformular</h2>
          <p>
            An INKII WORKS, Westuferstr. 25, 45356 Essen,{" "}
            <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a>
          </p>
          <p>
            Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über
            den Kauf der folgenden Waren / die Erbringung der folgenden Dienstleistung:
          </p>
          <p>
            Bestellt am: ____________
            <br />Erhalten am: ____________
          </p>
          <p>
            Name des Verbrauchers: _______________________________
            <br />Anschrift des Verbrauchers: ____________________________
          </p>
          <p>
            Datum: ___________________________
            <br />Unterschrift (nur bei Mitteilung auf Papier): ___________________________
          </p>

          <p className="legal-link-row">
            <Link href="/datenschutz">→ Datenschutzerklärung</Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
