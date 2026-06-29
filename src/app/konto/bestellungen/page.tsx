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

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  NEU: { label: "Neu", color: "#1d4ed8", bg: "#dbeafe" },
  WARTEND: { label: "Wartend", color: "#92400e", bg: "#fef3c7" },
  BEZAHLT: { label: "Bezahlt", color: "#065f46", bg: "#d1fae5" },
  IN_PRODUKTION: { label: "In Produktion", color: "#6b21a8", bg: "#f3e8ff" },
  VERSANDBEREIT: { label: "Versandbereit", color: "#9a3412", bg: "#fed7aa" },
  VERSENDET: { label: "Versendet", color: "#0e7490", bg: "#cffafe" },
  ZUGESTELLT: { label: "Zugestellt", color: "#15803d", bg: "#dcfce7" },
  ABGESCHLOSSEN: { label: "Abgeschlossen", color: "#475569", bg: "#e2e8f0" },
  STORNIERT: { label: "Storniert", color: "#991b1b", bg: "#fee2e2" },
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
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>Alle Bestellungen ({orders.length})</h2>

      {orders.length === 0 ? (
        <div style={{ background: "#f8fafc", padding: 40, textAlign: "center", border: "1px solid #e5e7eb" }}>
          <p style={{ color: "#64748b", marginBottom: 16 }}>Noch keine Bestellungen.</p>
          <Link href="/werbemittel" style={{ display: "inline-block", background: "#004537", color: "#fff", padding: "10px 22px", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
            Zum Katalog →
          </Link>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
          {orders.map((o) => {
            const status = STATUS_LABELS[o.status] || { label: o.status, color: "#475569", bg: "#f1f5f9" };
            return (
              <Link key={o.id} href={`/konto/bestellungen/${o.id}`} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, padding: "14px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center", textDecoration: "none", color: "inherit" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#004537" }}>{o.orderNumber}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{germanDate(o.createdAt)} · {o._count.items} Artikel · Zahlung: {o.paymentMethod}</div>
                </div>
                <span style={{ padding: "4px 10px", background: status.bg, color: status.color, fontSize: 11, fontWeight: 600, borderRadius: 4 }}>{status.label}</span>
                <div style={{ fontWeight: 700, fontSize: 14, textAlign: "right" }}>{euro(o.totalCents)} €</div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
