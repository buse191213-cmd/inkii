import { getCurrentCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Bestellungen | Mein Konto" };
export const dynamic = "force-dynamic";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS_LABELS: Record<string, { label: string; tone: "neutral" | "warn" | "ok" | "info" | "dark" }> = {
  NEU: { label: "Neu", tone: "info" },
  WARTEND: { label: "Wartend", tone: "warn" },
  BEZAHLT: { label: "Bezahlt", tone: "ok" },
  IN_PRODUKTION: { label: "In Produktion", tone: "info" },
  VERSANDBEREIT: { label: "Versandbereit", tone: "info" },
  VERSENDET: { label: "Versendet", tone: "dark" },
  ZUGESTELLT: { label: "Zugestellt", tone: "ok" },
  ABGESCHLOSSEN: { label: "Abgeschlossen", tone: "neutral" },
  STORNIERT: { label: "Storniert", tone: "warn" },
};

const TONE_STYLE: Record<string, { bg: string; color: string; border?: string }> = {
  neutral: { bg: "#f5f5f5", color: "#666" },
  info: { bg: "#fff", color: "#000", border: "1px solid #000" },
  warn: { bg: "#fff", color: "#000", border: "1px dashed #000" },
  ok: { bg: "#000", color: "#fff" },
  dark: { bg: "#000", color: "#fff" },
};

export default async function KontoBestellungenPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const orders = await db.order.findMany({
    where: { customerId: customer.id },
    include: { _count: { select: { items: true } } },
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
          Alle Bestellungen
        </h2>
        <span style={{
          fontSize: 11,
          color: "#999",
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}>
          {orders.length} {orders.length === 1 ? "Bestellung" : "Bestellungen"}
        </span>
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: "60px 30px", textAlign: "center", border: "1px solid #e5e5e5" }}>
          <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>Noch keine Bestellungen.</p>
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
            Zum Katalog
          </Link>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e5e5" }}>
          {orders.map((o, idx) => {
            const status = STATUS_LABELS[o.status] || { label: o.status, tone: "neutral" as const };
            const tone = TONE_STYLE[status.tone];
            return (
              <Link
                key={o.id}
                href={`/konto/bestellungen/${o.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 24,
                  padding: "20px 22px",
                  borderBottom: idx === orders.length - 1 ? "none" : "1px solid #e5e5e5",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background 0.15s",
                }}
                className="order-row"
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#000", letterSpacing: "0.5px", marginBottom: 4 }}>
                    {o.orderNumber}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {germanDate(o.createdAt)} · {o._count.items} Artikel · {o.paymentMethod}
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
                    whiteSpace: "nowrap",
                  }}
                >
                  {status.label}
                </span>
                <div style={{
                  fontWeight: 600,
                  fontSize: 15,
                  textAlign: "right",
                  minWidth: 90,
                  fontFamily: "Georgia, serif",
                }}>
                  {euro(o.totalCents)} €
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .order-row:hover {
          background: #fafafa;
        }
      `}</style>
    </>
  );
}
