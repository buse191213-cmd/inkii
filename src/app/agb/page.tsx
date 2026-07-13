import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB | INKII Works",
  description:
    "Allgemeine Geschäftsbedingungen der INKII WORKS für Textilveredelung, Werbemittel und individuelle Bedruckung.",
  alternates: { canonical: "/agb" },
  robots: { index: true, follow: true },
};

export default async function AgbPage() {
  return (
    <SiteShell>
      <section>
        <div className="wrap legal-prose">
          <p className="legal-crumb">
            <Link href="/">Home</Link> <span>/</span> AGB
          </p>

          <h1 className="legal-h1">Allgemeine Geschäftsbedingungen</h1>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle
            Verträge zwischen INKII WORKS, Inhaber Sener Kirli, Westuferstr. 25, 45356 Essen
            (nachfolgend „Anbieter") und dem Kunden über die Website www.inkiiworks.de.
          </p>

          <h2>§ 1 Geltungsbereich</h2>
          <p>
            (1) Diese AGB gelten für alle über den Online-Shop des Anbieters geschlossenen
            Verträge über die Lieferung von Waren sowie über individuelle Veredelungsleistungen
            (Textildruck, Stickerei, Transferdruck und vergleichbare Leistungen).
          </p>
          <p>
            (2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der
            Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
          </p>
          <p>
            (3) Verbraucher im Sinne dieser AGB ist jede natürliche Person, die ein Rechtsgeschäft
            zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer
            selbständigen beruflichen Tätigkeit zugerechnet werden können. Unternehmer ist eine
            natürliche oder juristische Person oder eine rechtsfähige Personengesellschaft, die
            bei Abschluss eines Rechtsgeschäfts in Ausübung ihrer gewerblichen oder selbständigen
            beruflichen Tätigkeit handelt.
          </p>

          <h2>§ 2 Vertragsschluss</h2>
          <p>
            (1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes
            Angebot, sondern eine unverbindliche Aufforderung zur Bestellung dar.
          </p>
          <p>
            (2) Durch Anklicken des Bestellbuttons gibt der Kunde ein verbindliches Angebot zum
            Kauf der im Warenkorb enthaltenen Waren ab. Der Anbieter bestätigt den Eingang der
            Bestellung unverzüglich per E-Mail. Diese Eingangsbestätigung stellt noch keine
            Annahme des Angebots dar.
          </p>
          <p>
            (3) Der Vertrag kommt zustande, sobald der Anbieter die Bestellung durch eine
            gesonderte Auftragsbestätigung annimmt oder die Ware versendet.
          </p>
          <p>
            (4) Bei Artikeln mit dem Hinweis „Preis auf Anfrage" kommt kein Kaufvertrag über den
            Online-Shop zustande. Hier erstellt der Anbieter dem Kunden auf Basis der Anfrage ein
            individuelles Angebot. Der Vertrag kommt erst mit ausdrücklicher Annahme dieses
            Angebots durch den Kunden zustande.
          </p>

          <h2>§ 3 Individuell gestaltete Produkte</h2>
          <p>
            (1) Ein wesentlicher Teil des Leistungsangebots besteht in der Veredelung von Textilien
            und Werbeartikeln nach Kundenvorgaben (individuelle Anfertigung).
          </p>
          <p>
            (2) Der Kunde ist für die von ihm hochgeladenen Motive, Logos, Grafiken und Texte
            allein verantwortlich. Er sichert zu, dass er über sämtliche erforderlichen Rechte
            (insbesondere Urheber-, Marken-, Namens- und Persönlichkeitsrechte) verfügt und dass
            die Inhalte nicht gegen geltendes Recht verstoßen.
          </p>
          <p>
            (3) Der Anbieter ist nicht verpflichtet, die übermittelten Inhalte auf mögliche
            Rechtsverletzungen zu prüfen. Der Anbieter ist berechtigt, Aufträge abzulehnen, wenn
            der begründete Verdacht einer Rechtsverletzung oder eines Verstoßes gegen die guten
            Sitten besteht.
          </p>
          <p>
            (4) Der Kunde stellt den Anbieter von sämtlichen Ansprüchen Dritter frei, die aufgrund
            der vom Kunden bereitgestellten Inhalte gegen den Anbieter geltend gemacht werden,
            einschließlich angemessener Kosten der Rechtsverteidigung.
          </p>
          <p>
            (5) Farbabweichungen zwischen der Bildschirmdarstellung bzw. der Vorschau (Mockup) und
            dem gelieferten Produkt sind technisch bedingt möglich und stellen keinen Mangel dar,
            soweit sie im branchenüblichen Rahmen liegen.
          </p>

          <h2>§ 4 Preise und Versandkosten</h2>
          <p>
            (1) Alle angegebenen Preise sind Endpreise und enthalten die gesetzliche
            Mehrwertsteuer. Hinzu kommen die angegebenen Versandkosten.
          </p>
          <p>
            (2) Die Versandkosten werden im Bestellvorgang gesondert ausgewiesen und sind vom
            Kunden zu tragen, sofern nicht ausdrücklich eine versandkostenfreie Lieferung
            zugesagt wurde.
          </p>
          <p>
            (3) Kosten für Veredelungsleistungen (z. B. Transferdruck) werden im Bestellvorgang
            gesondert ausgewiesen.
          </p>

          <h2>§ 5 Zahlungsbedingungen</h2>
          <p>
            (1) Die Zahlung erfolgt wahlweise per PayPal oder per Rechnung, soweit die jeweilige
            Zahlungsart im Bestellvorgang angeboten wird.
          </p>
          <p>
            (2) Bei Zahlung auf Rechnung ist der Rechnungsbetrag innerhalb von 14 Tagen ab
            Rechnungsdatum ohne Abzug zur Zahlung fällig, sofern nichts anderes vereinbart ist.
          </p>
          <p>
            (3) Der Anbieter behält sich vor, bei individuell angefertigten Produkten oder bei
            größeren Auftragsvolumen eine Vorauszahlung oder Anzahlung zu verlangen.
          </p>
          <p>
            (4) Gerät der Kunde in Zahlungsverzug, ist der Anbieter berechtigt, Verzugszinsen in
            gesetzlicher Höhe zu verlangen.
          </p>

          <h2>§ 6 Lieferung und Produktionszeit</h2>
          <p>
            (1) Die Lieferung erfolgt innerhalb Deutschlands an die vom Kunden angegebene
            Lieferadresse.
          </p>
          <p>
            (2) Angaben zu Produktions- und Lieferzeiten sind unverbindliche Circa-Angaben, sofern
            sie nicht ausdrücklich als verbindlich bezeichnet werden. Die Produktionszeit bei
            individuell veredelten Produkten beginnt erst mit der Freigabe des finalen Motivs
            durch den Kunden.
          </p>
          <p>
            (3) Verzögert sich die Lieferung aus Gründen, die der Anbieter nicht zu vertreten hat
            (insbesondere höhere Gewalt, Lieferausfälle von Vorlieferanten), verlängert sich die
            Lieferfrist entsprechend. Der Anbieter informiert den Kunden hierüber unverzüglich.
          </p>

          <h2>§ 7 Widerrufsrecht</h2>
          <p>
            (1) Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht zu. Die Einzelheiten
            ergeben sich aus der{" "}
            <Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link>.
          </p>
          <p>
            (2) <strong>Wichtiger Hinweis:</strong> Das Widerrufsrecht besteht nicht bei Verträgen
            zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine
            individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die
            eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind
            (§ 312g Abs. 2 Nr. 1 BGB). Dies betrifft insbesondere alle individuell bedruckten,
            bestickten oder anderweitig veredelten Produkte.
          </p>

          <h2>§ 8 Eigentumsvorbehalt</h2>
          <p>
            Die gelieferte Ware bleibt bis zur vollständigen Bezahlung Eigentum des Anbieters.
          </p>

          <h2>§ 9 Gewährleistung</h2>
          <p>
            (1) Es gelten die gesetzlichen Gewährleistungsrechte.
          </p>
          <p>
            (2) Der Kunde ist verpflichtet, die gelieferte Ware unverzüglich nach Erhalt zu prüfen
            und erkennbare Mängel unverzüglich anzuzeigen. Bei Unternehmern gilt § 377 HGB.
          </p>
          <p>
            (3) Geringfügige, branchenübliche Abweichungen in Farbe, Größe, Position des Drucks
            oder Materialbeschaffenheit stellen keinen Mangel dar.
          </p>

          <h2>§ 10 Haftung</h2>
          <p>
            (1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des
            Körpers oder der Gesundheit sowie bei Vorsatz und grober Fahrlässigkeit.
          </p>
          <p>
            (2) Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten
            (Kardinalpflichten) ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden
            begrenzt.
          </p>
          <p>
            (3) Im Übrigen ist die Haftung ausgeschlossen. Die Haftung nach dem
            Produkthaftungsgesetz bleibt unberührt.
          </p>

          <h2>§ 11 Nutzungsrechte an Gestaltungen</h2>
          <p>
            (1) Erstellt der Anbieter im Rahmen des Auftrags eigene Entwürfe oder Designs, erhält
            der Kunde ein einfaches Nutzungsrecht für den vereinbarten Zweck.
          </p>
          <p>
            (2) Der Anbieter ist berechtigt, produzierte Arbeiten zu Referenzzwecken zu
            veröffentlichen (z. B. auf der Website oder in sozialen Medien), sofern der Kunde dem
            nicht widerspricht. Ein Widerspruch ist jederzeit formlos per E-Mail möglich.
          </p>

          <h2>§ 12 Streitbeilegung</h2>
          <p>
            (1) Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
            bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p>
            (2) Der Anbieter ist nicht bereit und nicht verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2>§ 13 Schlussbestimmungen</h2>
          <p>
            (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
            UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur, soweit hierdurch der durch
            zwingende Bestimmungen des Rechts des Staates des gewöhnlichen Aufenthalts gewährte
            Schutz nicht entzogen wird.
          </p>
          <p>
            (2) Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder
            öffentlich-rechtliches Sondervermögen, ist Gerichtsstand für alle Streitigkeiten der
            Sitz des Anbieters.
          </p>
          <p>
            (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die
            Wirksamkeit der übrigen Bestimmungen davon unberührt.
          </p>

          <p style={{ marginTop: 40, fontSize: ".85rem", color: "#8a938d" }}>
            Stand: Juli 2026
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
