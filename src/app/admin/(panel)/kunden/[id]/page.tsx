import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
  RUECKERSTATTET: { label: "Rückerstattet", color: "#7c2d12", bg: "#fed7aa" },
};

export default async function KundeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  const totalRevenue = customer.orders.reduce((sum, o) => sum + o.totalCents, 0);
  const totalOrders = customer.orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <>
      <p className="crumb">
        Admin / <Link href="/admin/kunden" style={{ color: "#004537" }}>Kunden</Link> <b>/ {customer.firstName} {customer.lastName}</b>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginTop: 16 }}>
        {/* SOL: Sipariş Geçmişi */}
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            <div style={statCard}>
              <div style={statLbl}>Bestellungen</div>
              <div style={statVal}>{totalOrders}</div>
            </div>
            <div style={statCard}>
              <div style={statLbl}>Gesamtumsatz</div>
              <div style={statVal}>{euro(totalRevenue)} €</div>
            </div>
            <div style={statCard}>
              <div style={statLbl}>⌀ Bestellung</div>
              <div style={statVal}>{euro(avgOrderValue)} €</div>
            </div>
          </div>

          {/* Bestellverlauf */}
          <div className="panel">
            <div className="panel-head">
              <h3>Bestellverlauf</h3>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {customer.orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#64748b", fontSize: 13 }}>
                  Noch keine Bestellungen.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                      <th style={{ ...th, textAlign: "left" }}>Bestellung</th>
                      <th style={{ ...th, textAlign: "left" }}>Datum</th>
                      <th style={{ ...th, textAlign: "left" }}>Pos.</th>
                      <th style={{ ...th, textAlign: "right" }}>Summe</th>
                      <th style={{ ...th, textAlign: "left" }}>Status</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((o) => {
                      const status = STATUS_LABELS[o.status] || { label: o.status, color: "#475569", bg: "#f1f5f9" };
                      return (
                        <tr key={o.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                          <td style={td}>
                            <Link href={`/admin/bestellungen/${o.id}`} style={{ color: "#004537", fontWeight: 600 }}>
                              {o.orderNumber}
                            </Link>
                          </td>
                          <td style={td}>{germanDate(o.createdAt)}</td>
                          <td style={td}>{o._count.items}</td>
                          <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{euro(o.totalCents)} €</td>
                          <td style={td}>
                            <span style={{ padding: "3px 8px", background: status.bg, color: status.color, fontSize: 11, fontWeight: 600, borderRadius: 4 }}>
                              {status.label}
                            </span>
                          </td>
                          <td style={{ ...td, textAlign: "right" }}>
                            <Link href={`/admin/bestellungen/${o.id}`} style={{ color: "#004537", fontSize: 12 }}>
                              Details →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ: Müşteri Detay */}
        <aside>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head"><h3>Kontakt</h3></div>
            <div className="panel-body" style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                {customer.salutation} {customer.firstName} {customer.lastName}
              </div>
              {customer.firmname && (
                <div style={{ marginBottom: 8, color: "#475569" }}>🏢 {customer.firmname}</div>
              )}
              {customer.ustId && (
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>USt-IdNr: {customer.ustId}</div>
              )}

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10, marginTop: 10 }}>
                <div style={{ marginBottom: 6 }}>
                  <a href={`mailto:${customer.email}`} style={{ color: "#004537" }}>✉️ {customer.email}</a>
                </div>
                {customer.phone && (
                  <div>
                    <a href={`tel:${customer.phone}`} style={{ color: "#004537" }}>📞 {customer.phone}</a>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Kunde seit</div>
                <div>{germanDate(customer.createdAt)}</div>
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head"><h3>Rechnungsadresse</h3></div>
            <div className="panel-body" style={{ fontSize: 13, lineHeight: 1.6 }}>
              {customer.billingStreet}<br />
              {customer.billingZip} {customer.billingCity}<br />
              {customer.billingCountry}
            </div>
          </div>

          {customer.shippingDiffers && customer.shippingStreet && (
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-head"><h3>Lieferadresse</h3></div>
              <div className="panel-body" style={{ fontSize: 13, lineHeight: 1.6 }}>
                {customer.shippingStreet}<br />
                {customer.shippingZip} {customer.shippingCity}<br />
                {customer.shippingCountry}
              </div>
            </div>
          )}

          {customer.notes && (
            <div className="panel">
              <div className="panel-head"><h3>Notiz (intern)</h3></div>
              <div className="panel-body" style={{ fontSize: 13, whiteSpace: "pre-wrap", color: "#475569" }}>
                {customer.notes}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

const th: React.CSSProperties = { padding: "10px 14px", fontWeight: 600, fontSize: 12 };
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "middle" };

const statCard: React.CSSProperties = {
  background: "#fff",
  padding: 16,
  border: "1px solid #e5e7eb",
};
const statLbl: React.CSSProperties = {
  fontSize: 11,
  color: "#64748b",
  fontWeight: 600,
  textTransform: "uppercase",
  marginBottom: 6,
};
const statVal: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#1f2937",
};
