import Link from "next/link";
import { db } from "@/lib/db";
import { ProductIcon } from "@/lib/icons";
import { formatNumber, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const INQ_TAG: Record<string, [string, string]> = {
  new: ["orange", "Neu"],
  progress: ["blue", "In Bearbeitung"],
  done: ["green", "Erledigt"],
};

const STAT_IC = {
  inq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  prod: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7"/></svg>',
  stack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/></svg>',
  cat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
};

export default async function DashboardPage() {
  const [openInq, activeProd, totalProd, catCount, recentInq, topProd, categories] =
    await Promise.all([
      db.inquiry.count({ where: { status: { not: "done" } } }),
      db.product.count({ where: { status: "active" } }),
      db.product.count(),
      db.category.count(),
      db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      db.product.findMany({
        orderBy: { stock: "desc" },
        take: 5,
        include: { category: true },
      }),
      db.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
    ]);

  const stats = [
    { ic: STAT_IC.inq, val: openInq, label: "Offene Anfragen" },
    { ic: STAT_IC.prod, val: activeProd, label: "Aktive Produkte" },
    { ic: STAT_IC.stack, val: totalProd, label: "Produkte gesamt" },
    { ic: STAT_IC.cat, val: catCount, label: "Kategorien" },
  ];

  const maxCat = Math.max(1, ...categories.map((c) => c._count.products));

  return (
    <>
      <p className="crumb">
        Admin <b>/ Dashboard</b>
      </p>

      <div className="stat-row">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <div className="st-top">
              <div
                className="st-ic"
                dangerouslySetInnerHTML={{ __html: s.ic }}
              />
            </div>
            <div className="st-val">{s.val}</div>
            <div className="st-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>Produkte je Kategorie</h3>
            <Link href="/admin/categories">Kategorien</Link>
          </div>
          <div className="panel-body">
            <div className="chart">
              {categories.map((c) => (
                <div key={c.id} className="bar-col">
                  <div className="bar">
                    <i style={{ height: `${(c._count.products / maxCat) * 100}%` }} />
                  </div>
                  <span className="bar-lbl">{c.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Neueste Anfragen</h3>
            <Link href="/admin/inquiries">Alle ansehen</Link>
          </div>
          <div className="table-wrap">
            <table>
              <tbody>
                {recentInq.length === 0 && (
                  <tr>
                    <td>
                      <div className="empty">Noch keine Anfragen.</div>
                    </td>
                  </tr>
                )}
                {recentInq.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className="t-name">{i.name}</div>
                      <div className="t-code">{i.subject}</div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`tag ${INQ_TAG[i.status]?.[0] ?? "gray"}`}>
                        {INQ_TAG[i.status]?.[1] ?? i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <h3>Top-Produkte nach Lagerbestand</h3>
          <Link href="/admin/products">Zu den Produkten</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategorie</th>
                <th>Lagerbestand</th>
                <th>Status</th>
                <th>Angelegt</th>
              </tr>
            </thead>
            <tbody>
              {topProd.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-prod">
                      <div className="t-thumb">
                        {p.images && p.images.split(",").filter(Boolean)[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images.split(",").filter(Boolean)[0]}
                            alt={p.name}
                          />
                        ) : (
                          <ProductIcon name={p.icon} />
                        )}
                      </div>
                      <div>
                        <div className="t-name">{p.name}</div>
                        <div className="t-code">{p.code}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category.name}</td>
                  <td>
                    <b>{formatNumber(p.stock)}</b> Stk
                  </td>
                  <td>
                    <span className={`tag ${p.status === "active" ? "green" : "gray"}`}>
                      {p.status === "active" ? "Aktiv" : "Entwurf"}
                    </span>
                  </td>
                  <td className="t-code">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
