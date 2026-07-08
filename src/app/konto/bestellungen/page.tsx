import { getCurrentCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata = { title: "Bestellungen | Mein Konto" };
export const dynamic = "force-dynamic";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS_COLORS: Record<string, { bg: string; color: string; key: string }> = {
  NEU:            { bg: "#e0e7ff", color: "#3730a3", key: "neu" },
  WARTEND:        { bg: "#fef3c7", color: "#92400e", key: "wartend" },
  BEZAHLT:        { bg: "#d1fae5", color: "#065f46", key: "bezahlt" },
  IN_PRODUKTION:  { bg: "#f3e8ff", color: "#6b21a8", key: "inProduktion" },
  VERSANDBEREIT:  { bg: "#fed7aa", color: "#9a3412", key: "versandbereit" },
  VERSENDET:      { bg: "#dbeafe", color: "#1e40af", key: "versendet" },
  ZUGESTELLT:     { bg: "#d1fae5", color: "#065f46", key: "zugestellt" },
  ABGESCHLOSSEN:  { bg: "#f1f5f9", color: "#475569", key: "abgeschlossen" },
  STORNIERT:      { bg: "#fee2e2", color: "#991b1b", key: "storniert" },
};

export default async function KontoBestellungenPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const locale = await getLocale();
  const tk = getDictionary(locale).konto;

  const orders = await db.order.findMany({
    where: { customerId: customer.id },
    include: { _count: { select: { items: true } } },
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
          Alle Bestellungen
        </h2>
        <span style={{
          fontSize: 11,
          color: "#999",
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontWeight: 700,
        }}>
          {orders.length} {orders.length === 1 ? tk.bestellungSg : tk.bestellungPl}
        </span>
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: "60px 30px", textAlign: "center", border: "1px solid #e5e5e5", borderRadius: 4 }}>
          <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>{tk.keineBestellungen}</p>
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
            Zum Katalog
          </Link>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 4 }}>
          {orders.map((o, idx) => {
            const sc = STATUS_COLORS[o.status]; const s = sc ? { label: tk.status[sc.key as keyof typeof tk.status], bg: sc.bg, color: sc.color } : { label: o.status, bg: "#f5f5f5", color: "#666" };
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
                className="row-hover"
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0f1a16", letterSpacing: "0.3px", marginBottom: 4 }}>
                    {o.orderNumber}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {germanDate(o.createdAt)} · {o._count.items} {tk.artikel} · {o.paymentMethod}
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
                  whiteSpace: "nowrap",
                  borderRadius: 4,
                }}>
                  {s.label}
                </span>
                <div style={{ fontWeight: 700, fontSize: 14, textAlign: "right", minWidth: 90, color: "#0f1a16" }}>
                  {euro(o.totalCents)} €
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`.row-hover:hover{background:#fafafa}`}</style>
    </>
  );
}
