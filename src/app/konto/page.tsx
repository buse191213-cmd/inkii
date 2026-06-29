import SiteShell from "@/components/SiteShell";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export const metadata = { title: "Mein Konto | INKII Works" };
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

export default async function KontoPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login?next=/konto");

  const orders = await db.order.findMany({
    where: { customerId: customer.id },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalSpent = orders.reduce((sum, o) => sum + o.totalCents, 0);

  return (
    <SiteShell>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
              Hallo, {customer.firstName}!
            </h1>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
              Willkommen in Ihrem Konto.
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
          <div style={statCard}>
            <div style={statLbl}>Bestellungen</div>
            <div style={statVal}>{orders.length}</div>
          </div>
          <div style={statCard}>
            <div style={statLbl}>Gesamtumsatz</div>
            <div style={statVal}>{euro(totalSpent)} €</div>
          </div>
          <div style={statCard}>
            <div style={statLbl}>Kunde seit</div>
            <div style={statVal}>{germanDate(customer.createdAt)}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }} className="konto-layout">
          {/* Sipariş Geçmişi */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Meine Bestellungen</h3>
            {orders.length === 0 ? (
              <div style={{ background: "#f8fafc", padding: 32, textAlign: "center" }}>
                <p style={{ color: "#64748b", marginBottom: 16 }}>Noch keine Bestellungen.</p>
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
                  Zum Katalog →
                </Link>
              </div>
            ) : (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
                {orders.map((o) => {
                  const status = STATUS_LABELS[o.status] || { label: o.status, color: "#475569", bg: "#f1f5f9" };
                  return (
                    <Link
                      key={o.id}
                      href={`/konto/bestellungen/${o.id}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        gap: 14,
                        padding: "14px 16px",
                        borderBottom: "1px solid #f1f5f9",
                        alignItems: "center",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#004537" }}>
                          {o.orderNumber}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {germanDate(o.createdAt)} · {o._count.items} {o._count.items === 1 ? "Artikel" : "Artikel"}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "3px 10px",
                          background: status.bg,
                          color: status.color,
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {status.label}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: 14, textAlign: "right", minWidth: 80 }}>
                        {euro(o.totalCents)} €
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profil */}
          <aside>
            <div style={{ background: "#f8fafc", padding: 20, border: "1px solid #e5e7eb", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Meine Daten</h3>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600 }}>{customer.salutation} {customer.firstName} {customer.lastName}</div>
                {customer.firmname && <div style={{ color: "#475569" }}>🏢 {customer.firmname}</div>}
                <div style={{ color: "#64748b" }}>{customer.email}</div>
                {customer.phone && <div style={{ color: "#64748b" }}>{customer.phone}</div>}
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: 20, border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Adresse</h3>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                {customer.billingStreet}<br />
                {customer.billingZip} {customer.billingCity}<br />
                {customer.billingCountry}
              </div>
            </div>
          </aside>
        </div>

        <style>{`
          @media (max-width: 800px) {
            .konto-layout {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </SiteShell>
  );
}

const statCard: React.CSSProperties = {
  background: "#fff",
  padding: 18,
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
