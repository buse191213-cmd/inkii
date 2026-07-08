import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActionsClient from "./OrderActionsClient";

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!order) notFound();

  const status = STATUS_LABELS[order.status] || { label: order.status, color: "#475569", bg: "#f1f5f9" };

  return (
    <>
      <p className="crumb">
        Admin / <Link href="/admin/bestellungen" style={{ color: "#004537" }}>Bestellungen</Link> <b>/ {order.orderNumber}</b>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, marginTop: 16 }}>
        {/* SOL: Detaylar */}
        <div>
          {/* Status + Aksiyon */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head">
              <h3>{order.orderNumber}</h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <a
                  href={`/api/rechnung/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "5px 12px",
                    background: "#fff",
                    color: "#004537",
                    border: "1px solid #004537",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  📄 Rechnung PDF
                </a>
                <span
                  style={{
                    padding: "5px 12px",
                    background: status.bg,
                    color: status.color,
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 4,
                  }}
                >
                  {status.label}
                </span>
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                <span>📅 Erstellt: {germanDate(order.createdAt)}</span>
                {order.paidAt && <span>💰 Bezahlt: {germanDate(order.paidAt)}</span>}
                {order.shippedAt && <span>📦 Versendet: {germanDate(order.shippedAt)}</span>}
                {order.deliveredAt && <span>✅ Zugestellt: {germanDate(order.deliveredAt)}</span>}
              </div>

              <OrderActionsClient
                orderId={order.id}
                currentStatus={order.status}
                trackingNumber={order.trackingNumber}
                shippingCarrier={order.shippingCarrier}
                adminNote={order.adminNote}
              />
            </div>
          </div>

          {/* Ürünler */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head">
              <h3>Bestellte Artikel ({order.items.length})</h3>
            </div>
            <div className="panel-body">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                    <th style={{ ...th, textAlign: "left" }}>Artikel</th>
                    <th style={{ ...th, textAlign: "right" }}>Stk</th>
                    <th style={{ ...th, textAlign: "right" }}>Einzelpreis</th>
                    <th style={{ ...th, textAlign: "right" }}>Summe</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ ...td, display: "flex", gap: 10, alignItems: "center" }}>
                        {item.productImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.productImage} alt={item.productName} style={{ width: 40, height: 40, objectFit: "contain", background: "#f4f5f3" }} />
                        ) : (
                          <div style={{ width: 40, height: 40, background: "#f4f5f3" }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.productName}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {item.productCode}
                            {item.color && ` · ${item.color}`}
                            {item.size && ` · ${item.size}`}
                          </div>
                          {item.hasDtf && (
                            <div style={{ fontSize: 11, color: "#0d9488", marginTop: 2 }}>
                              + Transfer{item.dtfSize ? ` (${item.dtfSize})` : ""} ({euro(item.dtfPriceCents)} €)
                            </div>
                          )}
                          {item.hasDtf && item.dtfDesignUrl && (() => {
                            let d: {
                              front?: string | null; back?: string | null;
                              frontSize?: { widthCm: number; heightCm: number } | null;
                              backSize?: { widthCm: number; heightCm: number } | null;
                              frontMockup?: string | null; backMockup?: string | null;
                            } = {};
                            try { d = JSON.parse(item.dtfDesignUrl); } catch { /* ignore */ }
                            const thumbs: Array<{ label: string; logo: string; mockup?: string | null; size?: { widthCm: number; heightCm: number } | null; logoFile: string; mockupFile: string }> = [];
                            if (d.front) thumbs.push({ label: "Vorderseite", logo: d.front, mockup: d.frontMockup, size: d.frontSize, logoFile: `${item.productCode}-vorne-logo.png`, mockupFile: `${item.productCode}-vorne-mockup.jpg` });
                            if (d.back) thumbs.push({ label: "Rückseite", logo: d.back, mockup: d.backMockup, size: d.backSize, logoFile: `${item.productCode}-hinten-logo.png`, mockupFile: `${item.productCode}-hinten-mockup.jpg` });
                            if (thumbs.length === 0) return null;
                            return (
                              <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
                                {thumbs.map((t, i) => (
                                  <div key={i} style={{ textAlign: "center", minWidth: 110 }}>
                                    <div style={{
                                      width: 110, height: 110,
                                      border: "1px solid #e3e6df", borderRadius: 8,
                                      background: "#fff", display: "flex",
                                      alignItems: "center", justifyContent: "center", overflow: "hidden",
                                    }}>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={t.mockup || t.logo} alt={t.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46", marginTop: 4 }}>{t.label}</div>
                                    {t.size && (
                                      <div style={{ fontSize: 10, color: "#5a6660" }}>
                                        {t.size.widthCm.toLocaleString("de-DE")} × {t.size.heightCm.toLocaleString("de-DE")} cm
                                      </div>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 5 }}>
                                      <a
                                        href={t.logo}
                                        download={t.logoFile}
                                        style={{
                                          fontSize: 10, color: "#fff", background: "#004537",
                                          fontWeight: 700, textDecoration: "none",
                                          padding: "5px 8px", borderRadius: 5,
                                        }}
                                      >
                                        ⬇ Logo (Druck)
                                      </a>
                                      {t.mockup && (
                                        <a
                                          href={t.mockup}
                                          download={t.mockupFile}
                                          style={{
                                            fontSize: 10, color: "#004537", background: "#fff",
                                            border: "1px solid #004537", fontWeight: 700,
                                            textDecoration: "none", padding: "5px 8px", borderRadius: 5,
                                          }}
                                        >
                                          ⬇ Mockup
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>{item.quantity}</td>
                      <td style={{ ...td, textAlign: "right" }}>
                        {item.unitPriceCents > 0 ? `${euro(item.unitPriceCents + item.dtfPriceCents)} €` : "—"}
                      </td>
                      <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                        {item.lineTotalCents > 0 ? `${euro(item.lineTotalCents)} €` : "auf Anfrage"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {(order.customerNote || order.adminNote) && (
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-head"><h3>Notizen</h3></div>
              <div className="panel-body">
                {order.customerNote && (
                  <div style={{ marginBottom: 12 }}>
                    <strong style={{ fontSize: 13 }}>Kundennotiz:</strong>
                    <p style={{ fontSize: 13, marginTop: 4, padding: 10, background: "#f8fafc", whiteSpace: "pre-wrap" }}>
                      {order.customerNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SAĞ: Kunde + Toplam */}
        <aside>
          {/* Kunde */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head"><h3>Kunde</h3></div>
            <div className="panel-body" style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {order.customer.salutation} {order.customer.firstName} {order.customer.lastName}
              </div>
              {order.customer.firmname && (
                <div style={{ marginBottom: 4 }}>🏢 {order.customer.firmname}</div>
              )}
              {order.customer.ustId && (
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>USt-IdNr: {order.customer.ustId}</div>
              )}
              <div style={{ marginBottom: 4 }}>
                <a href={`mailto:${order.customer.email}`} style={{ color: "#004537" }}>✉️ {order.customer.email}</a>
              </div>
              {order.customer.phone && (
                <div style={{ marginBottom: 8 }}>
                  <a href={`tel:${order.customer.phone}`} style={{ color: "#004537" }}>📞 {order.customer.phone}</a>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "10px 0" }} />

              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 12, color: "#64748b" }}>Rechnungsadresse:</strong>
                <div style={{ marginTop: 4, lineHeight: 1.5 }}>
                  {order.customer.billingStreet}<br />
                  {order.customer.billingZip} {order.customer.billingCity}<br />
                  {order.customer.billingCountry}
                </div>
              </div>

              {order.customer.shippingDiffers && order.customer.shippingStreet && (
                <div>
                  <strong style={{ fontSize: 12, color: "#64748b" }}>Lieferadresse:</strong>
                  <div style={{ marginTop: 4, lineHeight: 1.5 }}>
                    {order.customer.shippingStreet}<br />
                    {order.customer.shippingZip} {order.customer.shippingCity}<br />
                    {order.customer.shippingCountry}
                  </div>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "10px 0" }} />

              <Link
                href={`/admin/kunden/${order.customer.id}`}
                style={{ color: "#004537", fontSize: 12, fontWeight: 600 }}
              >
                Kundenprofil ansehen →
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="panel">
            <div className="panel-head"><h3>Summen</h3></div>
            <div className="panel-body" style={{ fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>Zwischensumme</span>
                <span>{euro(order.subtotalCents)} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>Versand</span>
                <span>{euro(order.shippingCents)} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#64748b" }}>
                <span>MwSt. {order.taxRate}%</span>
                <span>{euro(order.taxCents)} €</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #cbd5e1", marginTop: 6, fontWeight: 700, fontSize: 16 }}>
                <span>Gesamt</span>
                <span>{euro(order.totalCents)} €</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "10px 0" }} />
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Zahlung: <strong>{order.paymentMethod === "paypal" ? "PayPal" : order.paymentMethod === "klarna" ? "Klarna" : order.paymentMethod === "rechnung" ? "Rechnung" : order.paymentMethod}</strong>
                <br />
                Status: {order.paymentStatus}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

const th: React.CSSProperties = { padding: "10px 14px", fontWeight: 600, fontSize: 12 };
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top" };
