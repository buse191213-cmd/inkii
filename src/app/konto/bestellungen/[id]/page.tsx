import { getCurrentCustomer } from "@/lib/customer-auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import ReorderButton from "./ReorderButton";

export const dynamic = "force-dynamic";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_STEPS = [
  { key: "BEZAHLT", label: "Zahlung bestätigt", icon: "💰" },
  { key: "IN_PRODUKTION", label: "In Produktion", icon: "🔨" },
  { key: "VERSANDBEREIT", label: "Versandbereit", icon: "📦" },
  { key: "VERSENDET", label: "Versendet", icon: "🚚" },
  { key: "ZUGESTELLT", label: "Zugestellt", icon: "✅" },
];

const STATUS_ORDER: Record<string, number> = {
  NEU: 0, WARTEND: 0, BEZAHLT: 1, IN_PRODUKTION: 2, VERSANDBEREIT: 3,
  VERSENDET: 4, ZUGESTELLT: 5, ABGESCHLOSSEN: 5, STORNIERT: -1, RUECKERSTATTET: -1,
};

function carrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const t = encodeURIComponent(trackingNumber);
  switch (carrier) {
    case "DHL": return `https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode=${t}`;
    case "DPD": return `https://tracking.dpd.de/status/de_DE/parcel/${t}`;
    case "Hermes": return `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#${t}`;
    case "GLS": return `https://gls-group.com/DE/de/paketverfolgung?match=${t}`;
    case "UPS": return `https://www.ups.com/track?tracknum=${t}`;
    default: return "";
  }
}

export default async function KundenBestellungDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) notFound();

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });

  // Yetki: sadece kendi siparişi
  if (!order || order.customerId !== customer.id) notFound();

  const currentStep = STATUS_ORDER[order.status] ?? 0;
  const isCancelled = order.status === "STORNIERT" || order.status === "RUECKERSTATTET";
  const trackingUrl = order.trackingNumber && order.shippingCarrier
    ? carrierTrackingUrl(order.shippingCarrier, order.trackingNumber)
    : "";

  return (
    <>
      <Link href="/konto/bestellungen" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>
        ← Zu meinen Bestellungen
      </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginTop: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Bestellung {order.orderNumber}</h1>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
              {germanDate(order.createdAt)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={`/api/rechnung/${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 18px",
                background: "#fff",
                color: "#0f1a16",
                border: "1px solid #0f1a16",
                fontWeight: 600,
                fontSize: 12,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                borderRadius: 4,
              }}
            >
              📄 Rechnung
            </a>
            <ReorderButton
              items={order.items.map((i) => ({
                productId: i.productId,
                productCode: i.productCode,
                productName: i.productName,
                productImage: i.productImage,
                color: i.color,
                size: i.size,
                quantity: i.quantity,
                unitPriceCents: i.unitPriceCents,
                hasDtf: i.hasDtf,
                dtfSize: i.dtfSize,
                dtfPriceCents: i.dtfPriceCents,
                dtfDesignUrl: i.dtfDesignUrl,
              }))}
            />
          </div>
        </div>

        {/* TIMELINE - Status izleyici */}
        {!isCancelled && (
          <div style={{ background: "#fff", padding: 24, border: "1px solid #e5e7eb", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Status</h3>
            <div className="status-timeline" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              {STATUS_STEPS.map((step, idx) => {
                const done = currentStep >= idx + 1;
                const active = currentStep === idx + 1 || (currentStep === 5 && idx === 4);
                return (
                  <div
                    key={step.key}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* Connector line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 18,
                          left: "50%",
                          right: "-50%",
                          height: 3,
                          background: done && currentStep >= idx + 2 ? "#004537" : "#e5e7eb",
                          zIndex: 0,
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        width: 38,
                        height: 38,
                        margin: "0 auto",
                        background: done ? "#004537" : "#f1f5f9",
                        color: done ? "#fff" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        fontSize: 18,
                        border: active ? "3px solid #fef3c7" : "none",
                        boxShadow: active ? "0 0 0 3px #f59e0b" : "none",
                      }}
                    >
                      {step.icon}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: done ? "#1f2937" : "#94a3b8", fontWeight: done ? 600 : 400, lineHeight: 1.3 }}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div style={{ background: "#fee2e2", padding: 16, border: "1px solid #fca5a5", marginBottom: 24, color: "#991b1b" }}>
            <strong>Diese Bestellung wurde {order.status === "STORNIERT" ? "storniert" : "zurückerstattet"}.</strong>
            <br />
            <small>Bei Fragen kontaktieren Sie uns bitte.</small>
          </div>
        )}

        {/* Tracking - wenn verfügbar */}
        {trackingUrl && (
          <div style={{ background: "#f0fdf4", padding: 16, border: "1px solid #86efac", marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#065f46" }}>
              🚚 Sendungsverfolgung
            </h3>
            <p style={{ fontSize: 13, margin: 0, marginBottom: 8 }}>
              <strong>{order.shippingCarrier}</strong> · Tracking-Nummer: <code>{order.trackingNumber}</code>
            </p>
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "#004537",
                color: "#fff",
                padding: "8px 18px",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              Sendung verfolgen →
            </a>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }} className="detail-layout">
          {/* Artikel + Adresse */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Bestellte Artikel</h3>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr auto auto",
                    gap: 12,
                    padding: "14px 14px",
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
                  }}
                >
                  {item.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.productImage} alt={item.productName} style={{ width: 60, height: 60, objectFit: "contain", background: "#f4f5f3", borderRadius: 4 }} />
                  ) : (
                    <div style={{ width: 60, height: 60, background: "#f4f5f3", borderRadius: 4 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.productName}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {item.color && `Farbe: ${item.color}`}
                      {item.size && ` · Größe: ${item.size}`}
                      {" · "}{item.quantity} Stk
                    </div>
                    {item.hasDtf && (
                      <div style={{ fontSize: 11, color: "#0d9488", marginTop: 2 }}>
                        + DTF Druck {item.dtfSize}
                      </div>
                    )}
                  </div>
                  <ReorderButton
                    mode="single"
                    items={[{
                      productId: item.productId,
                      productCode: item.productCode,
                      productName: item.productName,
                      productImage: item.productImage,
                      color: item.color,
                      size: item.size,
                      quantity: item.quantity,
                      unitPriceCents: item.unitPriceCents,
                      hasDtf: item.hasDtf,
                      dtfSize: item.dtfSize,
                      dtfPriceCents: item.dtfPriceCents,
                      dtfDesignUrl: item.dtfDesignUrl,
                    }]}
                  />
                  <div style={{ fontWeight: 600, fontSize: 14, textAlign: "right", minWidth: 80 }}>
                    {item.lineTotalCents > 0 ? `${euro(item.lineTotalCents)} €` : "auf Anfrage"}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 12 }}>Lieferadresse</h3>
            <div style={{ background: "#f8fafc", padding: 16, border: "1px solid #e5e7eb", fontSize: 13, lineHeight: 1.6 }}>
              <strong>{customer.salutation} {customer.firstName} {customer.lastName}</strong>
              {customer.firmname && <><br />{customer.firmname}</>}
              <br />
              {customer.shippingDiffers && customer.shippingStreet ? (
                <>
                  {customer.shippingStreet}<br />
                  {customer.shippingZip} {customer.shippingCity}<br />
                  {customer.shippingCountry}
                </>
              ) : (
                <>
                  {customer.billingStreet}<br />
                  {customer.billingZip} {customer.billingCity}<br />
                  {customer.billingCountry}
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside>
            <div style={{ background: "#f8fafc", padding: 20, border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Zusammenfassung</h3>
              <div style={{ fontSize: 13 }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", borderTop: "1px solid #cbd5e1", marginTop: 6, fontWeight: 700, fontSize: 16 }}>
                  <span>Gesamt</span>
                  <span>{euro(order.totalCents)} €</span>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />

              <div style={{ fontSize: 12, color: "#475569" }}>
                Zahlung: <strong>{order.paymentMethod === "paypal" ? "PayPal" : order.paymentMethod === "klarna" ? "Klarna" : order.paymentMethod === "rechnung" ? "Auf Rechnung" : order.paymentMethod}</strong>
                <br />
                Status: {order.paymentStatus === "PAID" ? "✓ Bezahlt" : order.paymentStatus === "PENDING" ? "Ausstehend" : order.paymentStatus}
              </div>
            </div>
          </aside>
        </div>

        <style>{`
          @media (max-width: 800px) {
            .detail-layout {
              grid-template-columns: 1fr !important;
            }
            .status-timeline {
              flex-direction: column !important;
              gap: 16px !important;
            }
            .status-timeline > div > div:first-child {
              display: none !important;
            }
          }
        `}</style>
    </>
  );
}
