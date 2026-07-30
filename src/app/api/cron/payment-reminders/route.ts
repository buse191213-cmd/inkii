import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.inkiiworks.de";

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
}

function euro(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

/**
 * Rendert die Zahlungserinnerung im einheitlichen Premium-Stil (Emerald).
 */
function renderReminderEmail(params: {
  firstName: string;
  orderNumber: string;
  totalCents: number;
  isSecond: boolean;
  payUrl: string;
}): string {
  const { firstName, orderNumber, totalCents, isSecond, payUrl } = params;
  const headline = isSecond ? "Letzte Erinnerung: Ihre Bestellung wartet" : "Ihre Bestellung ist fast fertig!";
  const intro = isSecond
    ? "Ihre Bestellung ist noch nicht abgeschlossen. Damit wir sie bearbeiten können, schließen Sie bitte die Zahlung ab. Andernfalls wird die Bestellung in Kürze automatisch storniert."
    : "Wir haben Ihre Bestellung erhalten, aber die Zahlung wurde noch nicht abgeschlossen. Schließen Sie Ihre Zahlung jetzt ab, um die Bearbeitung zu starten.";
  return `
<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f5f3;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#10b981 0%,#059669 50%,#34d399 100%);padding:44px 28px 38px;text-align:center;color:#fff;">
    <div style="margin-bottom:12px;">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;">
        <circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>
      </svg>
    </div>
    <h1 style="margin:0;font-size:24px;font-weight:800;">${headline}</h1>
    <p style="margin:8px 0 0;font-size:15px;opacity:0.95;">Bestellnummer ${orderNumber}</p>
  </div>
  <div style="padding:32px 28px 8px;">
    <p style="margin:0 0 20px;font-size:16px;color:#1f2937;">Hallo <strong>${firstName}</strong> 👋</p>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">${intro}</p>
    <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Bestellnummer:</td><td style="padding:4px 0;font-size:13px;text-align:right;font-weight:600;color:#1f2937;">${orderNumber}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Betrag:</td><td style="padding:4px 0;font-size:13px;text-align:right;font-weight:600;color:#1f2937;">${euro(totalCents)}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${payUrl}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:16px 40px;text-decoration:none;font-weight:700;font-size:16px;border-radius:8px;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
        Jetzt Zahlung abschließen →
      </a>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.6;">Bei Fragen stehen wir Ihnen jederzeit zur Verfügung:</p>
    <p style="margin:0 0 8px;font-size:14px;">
      📧 <a href="mailto:info@inkiiworks.de" style="color:#10b981;font-weight:600;text-decoration:none;">info@inkiiworks.de</a>
    </p>
  </div>
  <div style="background:#f8fafc;padding:24px 28px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
      <strong style="color:#10b981;">INKII WORKS</strong> · Sener Kirli<br>
      Westuferstr. 25 · 45356 Essen<br>
      <a href="https://www.inkiiworks.de" style="color:#94a3b8;text-decoration:none;">www.inkiiworks.de</a> · USt-IdNr: DE353055316
    </p>
  </div>
</div>
</body></html>`.trim();
}

export async function GET(req: NextRequest) {
  // Absicherung: nur mit korrektem CRON_SECRET (Vercel setzt Authorization-Header)
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSmtpConfigured()) {
    return NextResponse.json({ ok: false, error: "SMTP nicht konfiguriert" });
  }

  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);

  let sent1 = 0;
  let sent2 = 0;

  try {
    const transporter = makeTransporter();
    const from = process.env.SMTP_FROM || `"INKII Works" <${process.env.SMTP_USER}>`;

    // Unbezahlte Online-Bestellungen (kein Rechnung), die auf Zahlung warten
    const pending = await db.order.findMany({
      where: {
        status: "WARTEND_ZAHLUNG",
        paymentStatus: { not: "PAID" },
        paymentMethod: { not: "rechnung" },
        // nicht älter als 3 Tage (danach nicht mehr erinnern)
        createdAt: { gte: threeDaysAgo },
      },
      include: { customer: true },
    });

    for (const order of pending) {
      if (!order.customer?.email) continue;
      const payUrl = `${SITE_URL}/kasse`;
      const reminders = (order as { paymentReminders?: number }).paymentReminders ?? 0;

      // 2. Erinnerung: älter als 24h und noch keine 2. gesendet
      if (order.createdAt <= oneDayAgo && reminders < 2) {
        const html = renderReminderEmail({
          firstName: order.customer.firstName,
          orderNumber: order.orderNumber,
          totalCents: order.totalCents,
          isSecond: true,
          payUrl,
        });
        await transporter.sendMail({
          from,
          to: order.customer.email,
          subject: `Letzte Erinnerung — Zahlung für ${order.orderNumber} abschließen`,
          html,
        });
        await db.order.update({ where: { id: order.id }, data: { paymentReminders: 2 } });
        sent2++;
        continue;
      }

      // 1. Erinnerung: älter als 1h und noch keine gesendet
      if (order.createdAt <= oneHourAgo && reminders < 1) {
        const html = renderReminderEmail({
          firstName: order.customer.firstName,
          orderNumber: order.orderNumber,
          totalCents: order.totalCents,
          isSecond: false,
          payUrl,
        });
        await transporter.sendMail({
          from,
          to: order.customer.email,
          subject: `Ihre Bestellung ${order.orderNumber} — Zahlung abschließen`,
          html,
        });
        await db.order.update({ where: { id: order.id }, data: { paymentReminders: 1 } });
        sent1++;
      }
    }

    return NextResponse.json({ ok: true, firstReminders: sent1, secondReminders: sent2, checked: pending.length });
  } catch (e) {
    console.error("[payment-reminders] error:", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Fehler" }, { status: 500 });
  }
}
