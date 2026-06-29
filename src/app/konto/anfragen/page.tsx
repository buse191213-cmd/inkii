import { getCurrentCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Anfragen | Mein Konto" };
export const dynamic = "force-dynamic";

function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Neu", color: "#1d4ed8", bg: "#dbeafe" },
  progress: { label: "In Bearbeitung", color: "#92400e", bg: "#fef3c7" },
  done: { label: "Erledigt", color: "#065f46", bg: "#d1fae5" },
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
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>
        Anfragen & Angebote ({inquiries.length})
      </h2>

      {inquiries.length === 0 ? (
        <div style={{ background: "#f8fafc", padding: 40, textAlign: "center", border: "1px solid #e5e7eb" }}>
          <p style={{ color: "#64748b", marginBottom: 16 }}>Noch keine Anfragen.</p>
          <Link
            href="/werbemittel"
            style={{
              display: "inline-block",
              background: "#004537",
              color: "#fff",
              padding: "10px 22px",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Produkte ansehen →
          </Link>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
          {inquiries.map((i) => {
            const status = STATUS[i.status] || STATUS.new;
            return (
              <div
                key={i.id}
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{i.subject}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {germanDate(i.createdAt)}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      background: status.bg,
                      color: status.color,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 4,
                    }}
                  >
                    {status.label}
                  </span>
                </div>
                {i.message && (
                  <p style={{ fontSize: 13, color: "#475569", marginTop: 8, whiteSpace: "pre-wrap", padding: 10, background: "#f8fafc", lineHeight: 1.5 }}>
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
