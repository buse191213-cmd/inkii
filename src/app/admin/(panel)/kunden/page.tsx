import { db } from "@/lib/db";
import Link from "next/link";
import DeleteCustomerButton from "./DeleteCustomerButton";

export const dynamic = "force-dynamic";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function KundenPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";

  const customers = await db.customer.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { firmname: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    include: {
      orders: { select: { totalCents: true, status: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <p className="crumb">
        Admin <b>/ Kunden</b>
      </p>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-body">
          <form action="/admin/kunden" method="GET" style={{ display: "flex", gap: 8 }}>
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Suche: Name, E-Mail, Firma, Telefon…"
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
                href="/admin/kunden"
                style={{ padding: "10px 16px", background: "#f1f5f9", color: "#475569", textDecoration: "none", fontWeight: 600, fontSize: 13, alignSelf: "center" }}
              >
                Zurücksetzen
              </Link>
            )}
          </form>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="panel">
          <div className="panel-body" style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
            Keine Kunden gefunden.
          </div>
        </div>
      ) : (
        <div className="adm">
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: 12, color: "#64748b" }}>
                <th style={th}>Name / Firma</th>
                <th style={th}>Kontakt</th>
                <th style={th}>Adresse</th>
                <th style={{ ...th, textAlign: "right" }}>Bestellungen</th>
                <th style={{ ...th, textAlign: "right" }}>Umsatz</th>
                <th style={th}>Seit</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const totalRevenue = c.orders.reduce((sum, o) => sum + o.totalCents, 0);
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #e5e7eb", fontSize: 13 }}>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>
                        {c.salutation} {c.firstName} {c.lastName}
                      </div>
                      {c.firmname && <div style={{ fontSize: 11, color: "#64748b" }}>🏢 {c.firmname}</div>}
                      {c.ustId && <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.ustId}</div>}
                    </td>
                    <td style={td}>
                      <div style={{ fontSize: 12 }}>{c.email}</div>
                      {c.phone && <div style={{ fontSize: 11, color: "#64748b" }}>{c.phone}</div>}
                    </td>
                    <td style={td}>
                      <div style={{ fontSize: 12 }}>
                        {c.billingZip} {c.billingCity}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.billingCountry}</div>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>{c._count.orders}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{euro(totalRevenue)} €</td>
                    <td style={{ ...td, fontSize: 12, color: "#64748b" }}>{germanDate(c.createdAt)}</td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <span style={{ display: "inline-flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
                        <Link
                          href={`/admin/kunden/${c.id}`}
                          style={{ color: "#004537", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
                        >
                          Details →
                        </Link>
                        <DeleteCustomerButton
                          customerId={c.id}
                          customerName={`${c.firstName} ${c.lastName}`}
                          orderCount={c._count.orders}
                        />
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

const th: React.CSSProperties = { padding: "10px 14px", fontWeight: 600 };
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "middle" };
