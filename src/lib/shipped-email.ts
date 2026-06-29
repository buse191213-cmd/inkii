// Premium "Versendet" email template — visuell und schnell verständlich

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

const CARRIER_COLORS: Record<string, { bg: string; text: string }> = {
  DHL: { bg: "#FFCC00", text: "#D40511" },
  DPD: { bg: "#414042", text: "#DC0032" },
  Hermes: { bg: "#0099CC", text: "#fff" },
  GLS: { bg: "#FFD800", text: "#06038D" },
  UPS: { bg: "#351C15", text: "#FFB500" },
  "Deutsche Post": { bg: "#FFCC00", text: "#000" },
};

export type ShippedMailParams = {
  customerSalutation: string;
  customerFirstName: string;
  customerLastName: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
};

export function renderShippedEmail(p: ShippedMailParams): string {
  const url = carrierTrackingUrl(p.carrier, p.trackingNumber);
  const carrierStyle = CARRIER_COLORS[p.carrier] || { bg: "#004537", text: "#fff" };

  return `
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ihre Bestellung ist unterwegs!</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f3;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">

  <!-- ════════ TOP BANNER ════════ -->
  <div style="background:linear-gradient(135deg,#004537 0%,#006b56 50%,#00a878 100%);padding:48px 28px 40px;text-align:center;color:#fff;">

    <!-- Truck Icon -->
    <div style="font-size:72px;line-height:1;margin-bottom:8px;">🚚</div>

    <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.3px;">
      Unterwegs zu Ihnen!
    </h1>
    <p style="margin:8px 0 0;font-size:15px;opacity:0.95;">
      Ihre Bestellung wurde versendet
    </p>
  </div>

  <!-- ════════ STATUS TIMELINE ════════ -->
  <div style="background:#fafbfc;padding:28px 28px 24px;border-bottom:1px solid #e5e7eb;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td align="center" width="20%">
          <div style="width:36px;height:36px;background:#004537;color:#fff;border-radius:50%;display:inline-block;line-height:36px;text-align:center;font-size:16px;font-weight:700;">✓</div>
          <div style="margin-top:6px;font-size:11px;color:#004537;font-weight:600;">Bezahlt</div>
        </td>
        <td align="center" style="border-top:3px solid #004537;height:36px;">
        </td>
        <td align="center" width="20%">
          <div style="width:36px;height:36px;background:#004537;color:#fff;border-radius:50%;display:inline-block;line-height:36px;text-align:center;font-size:16px;font-weight:700;">✓</div>
          <div style="margin-top:6px;font-size:11px;color:#004537;font-weight:600;">Produktion</div>
        </td>
        <td align="center" style="border-top:3px solid #004537;height:36px;">
        </td>
        <td align="center" width="20%">
          <!-- AKTIF -->
          <div style="width:42px;height:42px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff;border-radius:50%;display:inline-block;line-height:42px;text-align:center;font-size:20px;font-weight:700;box-shadow:0 0 0 4px #fef3c7;">🚚</div>
          <div style="margin-top:6px;font-size:12px;color:#92400e;font-weight:700;">Versendet</div>
        </td>
        <td align="center" style="border-top:3px dashed #cbd5e1;height:36px;">
        </td>
        <td align="center" width="20%">
          <div style="width:36px;height:36px;background:#f1f5f9;color:#94a3b8;border-radius:50%;display:inline-block;line-height:36px;text-align:center;font-size:16px;">⏳</div>
          <div style="margin-top:6px;font-size:11px;color:#94a3b8;font-weight:500;">Zustellung</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- ════════ TRACKING CARD ════════ -->
  <div style="padding:32px 28px 8px;">

    <p style="margin:0 0 20px;font-size:16px;color:#1f2937;">
      Hallo <strong>${p.customerFirstName}</strong> 👋
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
      Gute Nachricht! Ihr Paket ist jetzt auf dem Weg zu Ihnen.<br>
      Voraussichtliche Lieferzeit: <strong>1-3 Werktage</strong> 📅
    </p>

    <!-- Tracking Box -->
    <div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:2px solid #004537;border-radius:12px;padding:24px;margin-bottom:24px;">

      <!-- Carrier Badge -->
      <div style="text-align:center;margin-bottom:18px;">
        <span style="display:inline-block;background:${carrierStyle.bg};color:${carrierStyle.text};padding:8px 22px;border-radius:24px;font-size:18px;font-weight:800;letter-spacing:0.5px;">
          📦 ${p.carrier}
        </span>
      </div>

      <!-- Tracking Number -->
      <div style="background:#fff;border-radius:8px;padding:14px;text-align:center;margin-bottom:18px;">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:4px;">
          Sendungsnummer
        </div>
        <div style="font-size:20px;font-weight:700;color:#1f2937;font-family:'Courier New',monospace;letter-spacing:1px;word-break:break-all;">
          ${p.trackingNumber}
        </div>
      </div>

      <!-- Big CTA Button -->
      ${url ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center">
            <a href="${url}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#004537,#006b56);color:#fff;padding:16px 36px;text-decoration:none;font-weight:700;font-size:16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,69,55,0.3);">
              🔍 Jetzt Sendung verfolgen →
            </a>
          </td>
        </tr>
      </table>
      ` : ""}
    </div>

    <!-- Order Info -->
    <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#64748b;">Bestellnummer:</td>
          <td style="padding:4px 0;font-size:13px;text-align:right;font-weight:600;color:#1f2937;">${p.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#64748b;">Lieferadresse:</td>
          <td style="padding:4px 0;font-size:13px;text-align:right;color:#64748b;">Wie in der Bestellung</td>
        </tr>
      </table>
    </div>

    <!-- What to do -->
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 16px;margin-bottom:24px;border-radius:4px;">
      <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:4px;">
        💡 Tipp
      </div>
      <div style="font-size:13px;color:#92400e;line-height:1.5;">
        Halten Sie Ihre Sendungsnummer bereit, falls Sie beim Paketdienst nachfragen möchten. Bei <strong>${p.carrier}</strong> können Sie auch per SMS oder App über Updates informiert werden.
      </div>
    </div>

    <!-- Contact -->
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.6;">
      Sollte etwas nicht stimmen oder das Paket nicht in 5 Werktagen ankommen, kontaktieren Sie uns bitte:
    </p>
    <p style="margin:0;font-size:14px;">
      📧 <a href="mailto:info@inkiiworks.de" style="color:#004537;font-weight:600;text-decoration:none;">info@inkiiworks.de</a>
      &nbsp;·&nbsp;
      📞 <a href="tel:+4916067677001" style="color:#004537;font-weight:600;text-decoration:none;">+49 160 6767001</a>
    </p>
  </div>

  <!-- ════════ FOOTER ════════ -->
  <div style="background:#f8fafc;padding:24px 28px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
      <strong style="color:#004537;">INKII WORKS</strong> · Sener Kirli<br>
      Westuferstr. 25 · 45356 Essen<br>
      <span style="color:#94a3b8;">USt-IdNr: DE353055316</span>
    </p>
  </div>

</div>
</body>
</html>
  `.trim();
}

export function shippedEmailSubject(orderNumber: string): string {
  return `🚚 Unterwegs zu Ihnen! Ihre Bestellung ${orderNumber} wurde versendet`;
}
