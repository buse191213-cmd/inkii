"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import nodemailer from "nodemailer";

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

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!isSmtpConfigured()) return;
  const transporter = makeTransporter();
  const from = process.env.SMTP_FROM || `"INKII Works" <${process.env.SMTP_USER}>`;
  await transporter.sendMail({ from, to, subject, html });
}

const STATUS_EMAILS: Record<string, { subject: string; intro: string }> = {
  BEZAHLT: {
    subject: "Zahlung eingegangen",
    intro: "Wir haben Ihre Zahlung erhalten. Vielen Dank! Wir starten nun mit der Bearbeitung Ihrer Bestellung.",
  },
  IN_PRODUKTION: {
    subject: "Ihre Bestellung ist in Produktion",
    intro: "Wir haben mit der Produktion Ihrer Bestellung begonnen. Sie werden informiert, sobald wir versandbereit sind.",
  },
  VERSANDBEREIT: {
    subject: "Ihre Bestellung ist versandbereit",
    intro: "Ihre Bestellung ist fertig und wird in Kürze versendet.",
  },
  VERSENDET: {
    subject: "Ihre Bestellung wurde versendet",
    intro: "Ihre Bestellung ist auf dem Weg zu Ihnen.",
  },
  ZUGESTELLT: {
    subject: "Ihre Bestellung wurde zugestellt",
    intro: "Ihre Bestellung wurde laut Versanddienstleister zugestellt. Wir hoffen, alles ist zu Ihrer Zufriedenheit!",
  },
  ABGESCHLOSSEN: {
    subject: "Bestellung abgeschlossen",
    intro: "Ihre Bestellung ist nun abgeschlossen. Vielen Dank für Ihr Vertrauen!",
  },
  STORNIERT: {
    subject: "Bestellung storniert",
    intro: "Ihre Bestellung wurde storniert. Bei Fragen kontaktieren Sie uns bitte.",
  },
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

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ ok: boolean; error?: string; emailSent?: boolean }> {
  try {
    if (!(await isAuthenticated())) return { ok: false, error: "Nicht autorisiert" };

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    });
    if (!order) return { ok: false, error: "Bestellung nicht gefunden" };

    // Zeitstempel-Updates je nach Status
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "BEZAHLT" && !order.paidAt) {
      updates.paidAt = new Date();
      updates.paymentStatus = "PAID";
    }
    if (newStatus === "VERSENDET" && !order.shippedAt) {
      updates.shippedAt = new Date();
    }
    if (newStatus === "ZUGESTELLT" && !order.deliveredAt) {
      updates.deliveredAt = new Date();
    }

    await db.order.update({ where: { id: orderId }, data: updates });

    // E-Mail
    let emailSent = false;
    const emailDef = STATUS_EMAILS[newStatus];
    if (emailDef) {
      try {
        let trackingHtml = "";
        if (newStatus === "VERSENDET" && order.trackingNumber && order.shippingCarrier) {
          const url = carrierTrackingUrl(order.shippingCarrier, order.trackingNumber);
          trackingHtml = `
            <p style="background: #f0fdf4; padding: 12px; margin: 16px 0;">
              <strong>Verfolgen Sie Ihre Sendung:</strong><br>
              ${order.shippingCarrier} · ${order.trackingNumber}<br>
              ${url ? `<a href="${url}" style="color: #004537;">→ Sendungsverfolgung öffnen</a>` : ""}
            </p>
          `;
        }
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #004537;">${emailDef.subject}</h2>
            <p>Sehr geehrte/r ${order.customer.salutation} ${order.customer.firstName} ${order.customer.lastName},</p>
            <p>${emailDef.intro}</p>
            <p><strong>Bestellnummer:</strong> ${order.orderNumber}</p>
            ${trackingHtml}
            <p style="margin-top: 24px; color: #666; font-size: 12px;">
              Bei Fragen schreiben Sie uns: <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a><br>
              INKII WORKS · Sener Kirli · Westuferstr. 25 · 45356 Essen
            </p>
          </div>
        `;
        await sendMail(order.customer.email, `INKII Works — ${emailDef.subject} (${order.orderNumber})`, html);
        emailSent = true;
      } catch (e) {
        console.error("Status-Email fehlgeschlagen:", e);
      }
    }

    revalidatePath(`/admin/bestellungen/${orderId}`);
    revalidatePath("/admin/bestellungen");
    return { ok: true, emailSent };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}

export async function updateOrderTracking(
  orderId: string,
  carrier: string,
  trackingNumber: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await isAuthenticated())) return { ok: false, error: "Nicht autorisiert" };
    await db.order.update({
      where: { id: orderId },
      data: { shippingCarrier: carrier, trackingNumber },
    });
    revalidatePath(`/admin/bestellungen/${orderId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}

export async function updateOrderAdminNote(
  orderId: string,
  note: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await isAuthenticated())) return { ok: false, error: "Nicht autorisiert" };
    await db.order.update({ where: { id: orderId }, data: { adminNote: note } });
    revalidatePath(`/admin/bestellungen/${orderId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
