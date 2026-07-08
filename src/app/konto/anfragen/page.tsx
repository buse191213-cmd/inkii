import { getCurrentCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata = { title: "Anfragen | Mein Konto" };
export const dynamic = "force-dynamic";

function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const ANFRAGE_STATUS: Record<string, { bg: string; color: string; de: string; tr: string; en: string }> = {
  new:      { bg: "#e0e7ff", color: "#3730a3", de: "Neu", tr: "Yeni", en: "New" },
  progress: { bg: "#fef3c7", color: "#92400e", de: "In Bearbeitung", tr: "İşlemde", en: "In progress" },
  done:     { bg: "#d1fae5", color: "#065f46", de: "Erledigt", tr: "Tamamlandı", en: "Done" },
};

export default async function KontoAnfragenPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const locale = await getLocale();
  const tk = getDictionary(locale).konto;

  const inquiries = await db.inquiry.findMany({
    where: { email: customer.email },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
        <h2 style={{
          fontSize: "1.3rem",
          fontWeight: 600,
          margin: 0,
          color: "#0f1a16",
          letterSpacing: "-0.01em",
        }}>
          {tk.nav.anfragen}
        </h2>
        <span style={{
          fontSize: 11,
          color: "#999",
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontWeight: 700,
        }}>
          {inquiries.length} {inquiries.length === 1 ? tk.anfrageSg : tk.anfragePl}
        </span>
      </div>

      {inquiries.length === 0 ? (
        <div style={{ padding: "60px 30px", textAlign: "center", border: "1px solid #e5e5e5", borderRadius: 4 }}>
          <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>{tk.keineAnfragen}</p>
          <Link href="/werbemittel" style={{
            display: "inline-block",
            background: "#0f1a16",
            color: "#fff",
            padding: "12px 28px",
            fontWeight: 600,
            textDecoration: "none",
            fontSize: 11,
            letterSpacing: "3px",
            textTransform: "uppercase",
            borderRadius: 4,
          }}>
            Produkte ansehen
          </Link>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 4 }}>
          {inquiries.map((i, idx) => {
            const sc = ANFRAGE_STATUS[i.status] || ANFRAGE_STATUS.new; const s = { label: locale === "tr" ? sc.tr : locale === "en" ? sc.en : sc.de, bg: sc.bg, color: sc.color };
            return (
              <div
                key={i.id}
                style={{
                  padding: "20px 22px",
                  borderBottom: idx === inquiries.length - 1 ? "none" : "1px solid #e5e5e5",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: i.message ? 12 : 0 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0f1a16", marginBottom: 4 }}>
                      {i.subject}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>
                      {germanDate(i.createdAt)}
                    </div>
                  </div>
                  <span style={{
                    padding: "6px 12px",
                    background: s.bg,
                    color: s.color,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    borderRadius: 4,
                  }}>
                    {s.label}
                  </span>
                </div>
                {i.message && (
                  <p style={{
                    fontSize: 13,
                    color: "#475569",
                    margin: 0,
                    padding: 14,
                    background: "#fafafa",
                    borderLeft: "2px solid #0f1a16",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    borderRadius: "0 4px 4px 0",
                  }}>
                    {i.message.slice(0, 300)}{i.message.length > 300 ? "…" : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
