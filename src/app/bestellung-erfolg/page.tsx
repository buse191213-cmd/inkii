import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { db } from "@/lib/db";
import { getCompanyInfo } from "@/lib/company-info";

export const metadata = {
  title: "Bestellung erfolgreich | INKII Works",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ nr?: string }>;
};

function euro(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default async function BestellungErfolgPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderNumber = params.nr ?? "";

  // Banka bilgileri için sipariş çek (sadece rechnung + henüz ödenmemiş ise göster)
  let showBankDetails = false;
  let totalCents = 0;
  let company: Awaited<ReturnType<typeof getCompanyInfo>> | null = null;

  if (orderNumber) {
    const order = await db.order.findUnique({
      where: { orderNumber },
      select: { paymentMethod: true, paymentStatus: true, totalCents: true },
    });
    if (order && order.paymentMethod === "rechnung" && order.paymentStatus !== "PAID") {
      showBankDetails = true;
      totalCents = order.totalCents;
      company = await getCompanyInfo();
    }
  }

  return (
    <SiteShell>
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "80px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 16 }}>✓</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16, color: "#004537" }}>
          Vielen Dank für Ihre Bestellung!
        </h1>
        {orderNumber && (
          <p style={{ fontSize: 18, color: "#1f2937", marginBottom: 24 }}>
            Bestellnummer: <strong>{orderNumber}</strong>
          </p>
        )}
        <p style={{ color: "#64748b", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          Wir haben Ihre Bestellung erhalten und eine Bestätigung an Ihre E-Mail-Adresse gesendet.
          {showBankDetails ? " Bitte überweisen Sie den Betrag auf folgendes Konto:" : " Wir setzen uns in Kürze mit Ihnen in Verbindung."}
        </p>

        {/* Banka Bilgileri Kutusu — sadece Auf Rechnung + ödenmemiş ise */}
        {showBankDetails && company && (
          <div
            style={{
              background: "#f0fdf4",
              padding: 24,
              marginBottom: 32,
              border: "2px solid #004537",
              textAlign: "left",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: "#004537", fontSize: 18, fontWeight: 700 }}>
              💳 Zahlung per Banküberweisung
            </h3>
            <p style={{ margin: "0 0 18px 0", fontSize: 14, color: "#1f2937", lineHeight: 1.6 }}>
              Bitte überweisen Sie den Gesamtbetrag von{" "}
              <strong>{euro(totalCents)} €</strong> innerhalb von{" "}
              <strong>{company.paymentTermDays || 14} Tagen</strong> auf folgendes Konto:
            </p>
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <tbody>
                {company.bankName && (
                  <tr>
                    <td style={tdLabel}>Bank:</td>
                    <td style={tdValue}>{company.bankName}</td>
                  </tr>
                )}
                <tr>
                  <td style={tdLabel}>Kontoinhaber:</td>
                  <td style={tdValue}>
                    {company.name}
                    {company.owner ? ` (${company.owner})` : ""}
                  </td>
                </tr>
                {company.iban && (
                  <tr>
                    <td style={tdLabel}>IBAN:</td>
                    <td style={{ ...tdValue, fontFamily: "monospace", fontSize: 15, letterSpacing: "0.5px" }}>
                      {company.iban}
                    </td>
                  </tr>
                )}
                {company.bic && (
                  <tr>
                    <td style={tdLabel}>BIC:</td>
                    <td style={{ ...tdValue, fontFamily: "monospace" }}>{company.bic}</td>
                  </tr>
                )}
                <tr style={{ borderTop: "1px dashed #004537" }}>
                  <td style={{ ...tdLabel, paddingTop: 12 }}>Verwendungszweck:</td>
                  <td style={{ ...tdValue, paddingTop: 12, fontFamily: "monospace", color: "#004537", fontSize: 15 }}>
                    {orderNumber}
                  </td>
                </tr>
                <tr>
                  <td style={tdLabel}>Betrag:</td>
                  <td style={{ ...tdValue, fontSize: 18, color: "#004537" }}>{euro(totalCents)} €</td>
                </tr>
              </tbody>
            </table>
            <p
              style={{
                margin: "16px 0 0 0",
                padding: 12,
                background: "#fffbeb",
                borderLeft: "3px solid #f59e0b",
                fontSize: 12,
                color: "#78350f",
                lineHeight: 1.6,
              }}
            >
              ⚠️ <strong>Wichtig:</strong> Bitte geben Sie unbedingt die Bestellnummer{" "}
              <strong style={{ fontFamily: "monospace" }}>{orderNumber}</strong> als Verwendungszweck an,
              damit wir Ihre Zahlung schnell zuordnen können.
            </p>
          </div>
        )}

        <div
          style={{
            background: "#f9fafb",
            padding: 20,
            marginBottom: 32,
            border: "1px solid #e5e7eb",
            textAlign: "left",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#1f2937" }}>
            Nächste Schritte
          </h3>
          <ol style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: "#475569", margin: 0 }}>
            <li>Sie erhalten eine Bestätigung mit Produktions- und Lieferzeitraum.</li>
            <li>Nach Fertigstellung wird Ihre Bestellung versendet, mit Tracking-Information.</li>
          </ol>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/werbemittel"
            style={{
              display: "inline-block",
              background: "#004537",
              color: "#fff",
              padding: "12px 28px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Weiter einkaufen
          </Link>
          <Link
            href="/konto/bestellungen"
            style={{
              display: "inline-block",
              border: "1px solid #004537",
              color: "#004537",
              padding: "12px 28px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Meine Bestellungen
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

const tdLabel: React.CSSProperties = {
  padding: "6px 0",
  color: "#64748b",
  width: 140,
  verticalAlign: "top",
};

const tdValue: React.CSSProperties = {
  padding: "6px 0",
  fontWeight: 600,
  color: "#1f2937",
};
