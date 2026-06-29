import { getCurrentCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Anfragen | Mein Konto" };
export const dynamic = "force-dynamic";

function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS: Record<string, { label: string; tone: "neutral" | "warn" | "ok" | "info" | "dark" }> = {
  new: { label: "Neu", tone: "info" },
  progress: { label: "In Bearbeitung", tone: "warn" },
  done: { label: "Erledigt", tone: "ok" },
};

const TONE_STYLE: Record<string, { bg: string; color: string; border?: string }> = {
  neutral: { bg: "#f5f5f5", color: "#666" },
  info: { bg: "#fff", color: "#000", border: "1px solid #000" },
  warn: { bg: "#fff", color: "#000", border: "1px dashed #000" },
  ok: { bg: "#000", color: "#fff" },
  dark: { bg: "#000", color: "#fff" },
};

export default async function KontoAnfragenPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const inquiries = await db.inquiry.findMany({
    where: { email: customer.email },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
        <h2 style={{
          fontSize: "1.4rem",
          fontWeight: 300,
          margin: 0,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          letterSpacing: "-0.01em",
        }}>
          Anfragen
        </h2>
        <span style={{
          fontSize: 11,
          color: "#999",
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}>
          {inquiries.length} {inquiries.length === 1 ? "Anfrage" : "Anfragen"}
        </span>
      </div>

      {inquiries.length === 0 ? (
        <div style={{ padding: "60px 30px", textAlign: "center", border: "1px solid #e5e5e5" }}>
          <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>Noch keine Anfragen.</p>
          <Link href="/werbemittel" style={{
            display: "inline-block",
            background: "#000",
            color: "#fff",
            padding: "12px 28px",
            fontWeight: 600,
            textDecoration: "none",
            fontSize: 11,
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}>
            Produkte ansehen
          </Link>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e5e5" }}>
          {inquiries.map((i, idx) => {
            const status = STATUS[i.status] || STATUS.new;
            const tone = TONE_STYLE[status.tone];
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
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#000", marginBottom: 4 }}>
                      {i.subject}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>
                      {germanDate(i.createdAt)}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "6px 12px",
                      background: tone.bg,
                      color: tone.color,
                      border: tone.border || "none",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {status.label}
                  </span>
                </div>
                {i.message && (
                  <p style={{
                    fontSize: 13,
                    color: "#666",
                    margin: 0,
                    padding: 14,
                    background: "#fafafa",
                    borderLeft: "2px solid #000",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
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
