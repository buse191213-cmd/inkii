import { getCurrentCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Übersicht | Mein Konto | INKII Works" };
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

export default async function KontoUebersichtPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const [orders, anfrageCount] = await Promise.all([
    db.order.findMany({
      where: { customerId: customer.id },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.inquiry.count({ where: { email: customer.email } }),
  ]);

  const totalOrders = await db.order.count({ where: { customerId: customer.id } });
  const totalSpent = await db.order.aggregate({
    where: { customerId: customer.id },
    _sum: { totalCents: true },
  });

  return (
    <>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>Übersicht</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <Link href="/konto/bestellungen" style={{ background: "#fff", padding: 16, border: "1px solid #e5e7eb", textDecoration: "none", color: "inherit", display: "block" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Bestellungen</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1f2937" }}>{totalOrders}</div>
        </Link>
        <Link href="/konto/anfragen" style={{ background: "#fff", padding: 16, border: "1px solid #e5e7eb", textDecoration: "none", color: "inherit", display: "block" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Anfragen</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1f2937" }}>{anfrageCount}</div>
        </Link>
        <div style={{ background: "#fff", padding: 16, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Gesamtumsatz</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1f2937" }}>{euro(totalSpent._sum.totalCents ?? 0)} €</div>
        </div>
        <div style={{ background: "#fff", padding: 16, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Kunde seit</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1f2937" }}>{germanDate(customer.createdAt)}</div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Letzte Bestellungen</h3>
          <Link href="/konto/bestellungen" style={{ fontSize: 13, color: "#004537", textDecoration: "none", fontWeight: 600 }}>
            Alle anzeigen →
          </Link>
        </div>
        {orders.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
            <p style={{ marginBottom: 16, fontSize: 14 }}>Noch keine Bestellungen.</p>
            <Link href="/werbemittel" style={{ display: "inline-block", background: "#004537", color: "#fff", padding: "10px 20px", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>Zum Katalog →</Link>
          </div>
        ) : (
          <div>
            {orders.map((o) => {
              const status = STATUS_LABELS[o.status] || { label: o.status, color: "#475569", bg: "#f1f5f9" };
              return (
                <Link key={o.id} href={`/konto/bestellungen/${o.id}`} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, padding: "12px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center", textDecoration: "none", color: "inherit" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#004537" }}>{o.orderNumber}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{germanDate(o.createdAt)} · {o._count.items} Artikel</div>
                  </div>
                  <span style={{ padding: "3px 10px", background: status.bg, color: status.color, fontSize: 11, fontWeight: 600, borderRadius: 4 }}>{status.label}</span>
                  <div style={{ fontWeight: 700, fontSize: 14, textAlign: "right" }}>{euro(o.totalCents)} €</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
