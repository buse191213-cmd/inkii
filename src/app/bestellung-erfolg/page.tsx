import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { db } from "@/lib/db";
import { getCompanyInfo } from "@/lib/company-info";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

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
  const locale = await getLocale();
  const ts = getDictionary(locale).success;

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
          {ts.thankYou}
        </h1>
        {orderNumber && (
          <p style={{ fontSize: 18, color: "#1f2937", marginBottom: 24 }}>
            {ts.orderNumber}: <strong>{orderNumber}</strong>
          </p>
        )}
        <p style={{ color: "#64748b", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          {ts.received}
          {showBankDetails ? ` ${ts.bankTransfer}` : ` ${ts.contactSoon}`}
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
              💳 {ts.payTitle}
            </h3>
            <p style={{ margin: "0 0 18px 0", fontSize: 14, color: "#1f2937", lineHeight: 1.6 }}>
              {ts.payInstruction}{" "}
              <strong>{euro(totalCents)} €</strong> {ts.within}{" "}
              <strong>{company.paymentTermDays || 14} {ts.days}</strong>.
            </p>
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <tbody>
                {company.bankName && (
                  <tr>
                    <td style={tdLabel}>{ts.bank}</td>
                    <td style={tdValue}>{company.bankName}</td>
                  </tr>
                )}
                <tr>
                  <td style={tdLabel}>{ts.accountHolder}</td>
                  <td style={tdValue}>
                    {company.owner || company.name}
                  </td>
                </tr>
                {company.iban && (
                  <tr>
                    <td style={tdLabel}>{ts.iban}</td>
                    <td style={{ ...tdValue, fontFamily: "monospace", fontSize: 15, letterSpacing: "0.5px" }}>
                      {company.iban}
                    </td>
                  </tr>
                )}
                {company.bic && (
                  <tr>
                    <td style={tdLabel}>{ts.bic}</td>
                    <td style={{ ...tdValue, fontFamily: "monospace" }}>{company.bic}</td>
                  </tr>
                )}
                <tr style={{ borderTop: "1px dashed #004537" }}>
                  <td style={{ ...tdLabel, paddingTop: 12 }}>{ts.reference}</td>
                  <td style={{ ...tdValue, paddingTop: 12, fontFamily: "monospace", color: "#004537", fontSize: 15 }}>
                    {orderNumber}
                  </td>
                </tr>
                <tr>
                  <td style={tdLabel}>{ts.amount}</td>
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
              ⚠️ <strong>{ts.important}</strong> {ts.referenceNote}
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
            {ts.whatNext}
          </h3>
          <ol style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: "#475569", margin: 0 }}>
            <li>{ts.step1}</li>
            <li>{ts.step2}</li>
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
            {ts.continueShopping}
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
            {ts.toAccount}
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
