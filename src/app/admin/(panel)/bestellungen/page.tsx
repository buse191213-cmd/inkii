import { db } from "@/lib/db";
import Link from "next/link";
import DeleteOrderButton from "./DeleteOrderButton";

export const dynamic = "force-dynamic";

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

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

type SearchParams = {
  status?: string;
  search?: string;
};

export default async function BestellungenPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "";
  const search = params.search ?? "";

  // Tüm siparişleri çek
  const orders = await db.order.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { customer: { email: { contains: search, mode: "insensitive" } } },
              { customer: { firstName: { contains: search, mode: "insensitive" } } },
              { customer: { lastName: { contains: search, mode: "insensitive" } } },
              { customer: { firmname: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      items: { take: 1 },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Status counts for filter chips
  const statusCounts = await db.order.groupBy({
    by: ["status"],
    _count: true,
  });
  const totalCount = orders.length;
  const counts: Record<string, number> = {};
  statusCounts.forEach((s) => { counts[s.status] = s._count; });

  return (
    <>
      <p className="crumb">
        Admin <b>/ Bestellungen</b>
      </p>

      {/* Filtre + Arama */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-body">
          {/* Status filtre chip'leri */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <Link
              href="/admin/bestellungen"
              style={{
                ...chipStyle,
                background: !statusFilter ? "#004537" : "#f1f5f9",
                color: !statusFilter ? "#fff" : "#475569",
              }}
            >
              Alle ({totalCount})
            </Link>
            {Object.entries(STATUS_LABELS).map(([k, v]) => {
              const count = counts[k] || 0;
              if (count === 0 && statusFilter !== k) return null;
              return (
                <Link
                  key={k}
                  href={`/admin/bestellungen?status=${k}`}
                  style={{
                    ...chipStyle,
                    background: statusFilter === k ? v.color : v.bg,
                    color: statusFilter === k ? "#fff" : v.color,
                  }}
                >
                  {v.label} ({count})
                </Link>
              );
            })}
          </div>

          {/* Arama */}
          <form action="/admin/bestellungen" method="GET" style={{ display: "flex", gap: 8 }}>
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Suche: Bestellnummer, Name, E-Mail, Firma…"
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#004537",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Suchen
            </button>
            {search && (
              <Link
                href={statusFilter ? `/admin/bestellungen?status=${statusFilter}` : "/admin/bestellungen"}
                style={{
                  padding: "10px 16px",
                  background: "#f1f5f9",
                  color: "#475569",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  alignSelf: "center",
                }}
              >
                Zurücksetzen
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* Liste */}
      {orders.length === 0 ? (
        <div className="panel">
          <div className="panel-body" style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
            <p>Keine Bestellungen gefunden.</p>
          </div>
        </div>
      ) : (
        <div className="adm">
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, color: "#64748b" }}>
                <th style={th}>Bestellnummer</th>
                <th style={th}>Datum</th>
                <th style={th}>Kunde</th>
                <th style={th}>Artikel</th>
                <th style={{ ...th, textAlign: "right" }}>Summe</th>
                <th style={th}>Zahlung</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const status = STATUS_LABELS[o.status] || { label: o.status, color: "#475569", bg: "#f1f5f9" };
                return (
                  <tr key={o.id} style={{ borderTop: "1px solid #e5e7eb", fontSize: 13 }}>
                    <td style={td}>
                      <Link href={`/admin/bestellungen/${o.id}`} style={{ color: "#004537", fontWeight: 600, textDecoration: "none" }}>
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td style={td}>{germanDate(o.createdAt)}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 500 }}>
                        {o.customer.firstName} {o.customer.lastName}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {o.customer.firmname || o.customer.email}
                      </div>
                    </td>
                    <td style={td}>{o._count.items} {o._count.items === 1 ? "Pos." : "Positionen"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{euro(o.totalCents)} €</td>
                    <td style={td}>
                      <span style={{ fontSize: 11, padding: "3px 8px", background: "#f1f5f9", borderRadius: 4, color: "#475569" }}>
                        {o.paymentMethod === "paypal" ? "PayPal" : o.paymentMethod === "klarna" ? "Klarna" : o.paymentMethod === "rechnung" ? "Rechnung" : o.paymentMethod}
                      </span>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          background: status.bg,
                          color: status.color,
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 4,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <span style={{ display: "inline-flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
                        <Link href={`/admin/bestellungen/${o.id}`} style={{ color: "#004537", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                          Details →
                        </Link>
                        <DeleteOrderButton orderId={o.id} orderNumber={o.orderNumber} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const th: React.CSSProperties = {
  padding: "10px 14px",
  fontWeight: 600,
};

const td: React.CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "middle",
};

const chipStyle: React.CSSProperties = {
  padding: "5px 12px",
  fontSize: 12,
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: 12,
};
