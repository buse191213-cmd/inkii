import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung | INKII Works",
  description: "Widerrufsbelehrung und Widerrufsrecht für Verbraucher bei INKII WORKS.",
  alternates: { canonical: "/widerrufsbelehrung" },
  robots: { index: true, follow: true },
};

export default async function WiderrufsbelehrungPage() {
  return (
    <SiteShell>
      <section>
        <div className="wrap legal-prose">
          <p className="legal-crumb">
            <Link href="/">Startseite</Link> <span>/</span> Widerrufsbelehrung
          </p>

          <h1 className="legal-h1">Widerrufsbelehrung</h1>

          <h2>Widerrufsrecht</h2>
          <p>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
          </p>
          <p>
            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter,
            der nicht der Beförderer ist, die Ware in Besitz genommen haben bzw. hat.
          </p>
          <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns</p>
          <p>
            <strong>INKII WORKS</strong>
            <br />Inhaber: Sener Kirli
            <br />Westuferstr. 25
            <br />45356 Essen
            <br />Deutschland
            <br />E-Mail: <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a>
          </p>
          <p>
            mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über
            Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
          </p>
          <p>
            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des
            Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
          </p>

          <h2>Folgen des Widerrufs</h2>
          <p>
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten
            haben, einschließlich der Lieferkosten (mit Ausnahme zusätzlicher Kosten, die sich daraus ergeben,
            dass Sie eine andere Art der Lieferung als die von uns angebotene günstigste Standardlieferung
            gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an
            dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.
          </p>
          <p>
            Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen
            Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart.
            Ihnen werden wegen dieser Rückzahlung in keinem Fall Entgelte berechnet.
          </p>
          <p>
            Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie
            den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben &ndash; je nachdem, welches der
            frühere Zeitpunkt ist.
          </p>
          <p>
            Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an
            dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben.
          </p>
          <p>Die unmittelbaren Kosten der Rücksendung der Waren tragen Sie.</p>

          <h2>Ausschluss bzw. vorzeitiges Erlöschen des Widerrufsrechts</h2>
          <p>Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren,</p>
          <ul>
            <li>
              die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung
              durch den Verbraucher maßgeblich ist oder
            </li>
            <li>die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind.</li>
          </ul>
          <p>
            Dies gilt insbesondere für individuell bedruckte, bestickte oder anderweitig personalisierte
            Produkte (z. B. Textilien, Werbeartikel, Druckprodukte oder Designs nach Kundenvorgabe).
          </p>
          <p>
            Das Widerrufsrecht erlischt vorzeitig bei Verträgen zur Lieferung versiegelter Waren, wenn ihre
            Versiegelung nach der Lieferung entfernt wurde, sofern dies zutrifft.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
