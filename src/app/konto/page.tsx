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

// Status: minimal monochrome
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
      {/* Stats Row — Editorial */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 0, marginBottom: 50, border: "1px solid #e5e5e5" }}>
        <StatCard
          href="/konto/bestellungen"
          label="Bestellungen"
          value={String(totalOrders)}
        />
        <StatCard
          href="/konto/anfragen"
          label="Anfragen"
          value={String(anfrageCount)}
        />
        <StatCard
          label="Gesamtumsatz"
          value={`${euro(totalSpent._sum.totalCents ?? 0)} €`}
        />
        <StatCard
          label="Kunde seit"
          value={germanDate(customer.createdAt)}
        />
      </div>

      {/* Bestellungen Block */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <h2 style={{
            fontSize: "1.4rem",
            fontWeight: 300,
            margin: 0,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            letterSpacing: "-0.01em",
          }}>
            Letzte Bestellungen
          </h2>
          <Link href="/konto/bestellungen" style={{
            fontSize: 11,
            color: "#000",
            textDecoration: "underline",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}>
            Alle anzeigen
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: "60px 30px", textAlign: "center", border: "1px solid #e5e5e5" }}>
            <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>Noch keine Bestellungen.</p>
            <Link
              href="/werbemittel"
              style={{
                display: "inline-block",
                background: "#000",
                color: "#fff",
                padding: "12px 28px",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 11,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
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
                    padding: "18px 22px",
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
                      {germanDate(o.createdAt)} · {o._count.items} Artikel
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "5px 12px",
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
      </div>

      <style>{`
        .order-row:hover {
          background: #fafafa;
        }
      `}</style>
    </>
  );
}

function StatCard({ href, label, value }: { href?: string; label: string; value: string }) {
  const content = (
    <div style={{
      padding: "26px 22px",
      borderRight: "1px solid #e5e5e5",
      background: "#fff",
      transition: "background 0.15s",
      cursor: href ? "pointer" : "default",
      height: "100%",
      boxSizing: "border-box",
    }} className={href ? "stat-clickable" : ""}>
      <div style={{
        fontSize: 10,
        color: "#999",
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        fontWeight: 600,
        marginBottom: 14,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 300,
        color: "#000",
        fontFamily: "Georgia, serif",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  );
  if (href) {
    return (
      <>
        <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          {content}
        </Link>
        <style>{`.stat-clickable:hover { background: #fafafa; }`}</style>
      </>
    );
  }
  return content;
}
