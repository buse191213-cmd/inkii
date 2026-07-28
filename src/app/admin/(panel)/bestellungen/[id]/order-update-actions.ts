"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import nodemailer from "nodemailer";
import { generateInvoicePDF, generateInvoiceNumber, type InvoiceData } from "@/lib/invoice-pdf";
import { getCompanyInfo } from "@/lib/company-info";
import { renderShippedEmail, shippedEmailSubject } from "@/lib/shipped-email";

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function makeTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  const opts = {
    host: process.env.SMTP_HOST!,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return nodemailer.createTransport(opts as any);
}

type Attachment = { filename: string; content: Buffer; contentType: string };

async function sendMail(
  to: string,
  subject: string,
  html: string,
  attachments?: Attachment[]
): Promise<void> {
  if (!isSmtpConfigured()) return;
  const transporter = makeTransporter();
  const from = process.env.SMTP_FROM || `"INKII Works" <${process.env.SMTP_USER}>`;
  await transporter.sendMail({ from, to, subject, html, attachments });
}

const STATUS_EMAILS: Record<string, { subject: string; intro: string }> = {
  BEZAHLT: {
    subject: "Zahlung eingegangen",
    intro: "Wir haben Ihre Zahlung erhalten. Vielen Dank! Wir beginnen nun mit der Bearbeitung Ihrer Bestellung.",
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

// Reihenfolge der Hauptschritte für die Status-Zeitleiste in der E-Mail.
const STATUS_FLOW: { key: string; label: string }[] = [
  { key: "BEZAHLT", label: "Zahlung erhalten" },
  { key: "IN_PRODUKTION", label: "In Produktion" },
  { key: "VERSANDBEREIT", label: "Versandbereit" },
  { key: "VERSENDET", label: "Versendet" },
  { key: "ZUGESTELLT", label: "Zugestellt" },
];

/**
 * Rendert eine horizontale Status-Zeitleiste als E-Mail-taugliches HTML
 * (Tabellen-Layout, Inline-Styles — funktioniert in Outlook/Gmail/Apple Mail).
 * Erledigte + aktueller Schritt sind grün, kommende Schritte grau.
 */
function renderStatusTimeline(currentStatus: string): string {
  // ABGESCHLOSSEN zählt wie ZUGESTELLT (letzter Schritt erreicht).
  const effective = currentStatus === "ABGESCHLOSSEN" ? "ZUGESTELLT" : currentStatus;
  const currentIndex = STATUS_FLOW.findIndex((s) => s.key === effective);
  if (currentIndex < 0) return ""; // z.B. STORNIERT → keine Zeitleiste

  const cells = STATUS_FLOW.map((step, i) => {
    const done = i <= currentIndex;
    const dotBg = done ? "#004537" : "#e5e7eb";
    const dotColor = done ? "#ffffff" : "#9ca3af";
    const labelColor = done ? "#004537" : "#9ca3af";
    const labelWeight = i === currentIndex ? "700" : "400";
    const mark = done ? "&#10003;" : `${i + 1}`;
    return `
      <td align="center" valign="top" style="width:20%;padding:0 2px;font-family:Arial,sans-serif;">
        <div style="width:26px;height:26px;line-height:26px;border-radius:50%;background:${dotBg};color:${dotColor};font-size:13px;font-weight:700;margin:0 auto;">${mark}</div>
        <div style="font-size:11px;color:${labelColor};font-weight:${labelWeight};margin-top:6px;line-height:1.3;">${step.label}</div>
      </td>`;
  }).join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0 8px 0;border-collapse:collapse;">
      <tr>${cells}</tr>
    </table>`;
}

/**
 * Standard-Footer für ALLE Kunden-E-Mails (einheitlich).
 */
function renderEmailFooter(): string {
  return `
    <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e7eb;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;line-height:1.7;">
      <p style="margin:0 0 6px 0;">Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.<br>
      Schreiben Sie uns: <a href="mailto:info@inkiiworks.de" style="color:#004537;text-decoration:none;">info@inkiiworks.de</a></p>
      <p style="margin:8px 0 0 0;color:#9ca3af;">
        <strong style="color:#004537;">INKII WORKS</strong> · Sener Kirli · Westuferstr. 25 · 45356 Essen<br>
        <a href="https://www.inkiiworks.de" style="color:#9ca3af;text-decoration:none;">www.inkiiworks.de</a> · USt-IdNr.: DE353055316
      </p>
    </div>`;
}

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
    if (!(await isAuthenticated())) {
      console.warn("[order-status] Nicht autorisiert");
      return { ok: false, error: "Nicht autorisiert" };
    }

    console.log(`[order-status] ${orderId} → ${newStatus}`);

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    });
    if (!order) {
      console.error(`[order-status] Bestellung nicht gefunden: ${orderId}`);
      return { ok: false, error: "Bestellung nicht gefunden" };
    }

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
    console.log(`[order-status] ✓ Updated ${orderId} → ${newStatus}`);

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

        // PDF Rechnung erstellen (BEZAHLT veya ABGESCHLOSSEN durumlarında ekle)
        const attachments: Attachment[] = [];
        const attachInvoice = newStatus === "BEZAHLT" || newStatus === "ABGESCHLOSSEN";
        if (attachInvoice) {
          try {
            let invoiceNumber = order.invoiceNumber;
            if (!invoiceNumber) {
              invoiceNumber = generateInvoiceNumber(order.createdAt, order.orderNumber);
              await db.order.update({ where: { id: orderId }, data: { invoiceNumber } });
            }
            const company = await getCompanyInfo();
            const pdfData: InvoiceData = {
              invoiceNumber,
              orderNumber: order.orderNumber,
              invoiceDate: order.paidAt || new Date(),
              customer: {
                salutation: order.customer.salutation,
                firstName: order.customer.firstName,
                lastName: order.customer.lastName,
                firmname: order.customer.firmname,
                ustId: order.customer.ustId,
                email: order.customer.email,
                phone: order.customer.phone,
                billingStreet: order.customer.billingStreet,
                billingZip: order.customer.billingZip,
                billingCity: order.customer.billingCity,
                billingCountry: order.customer.billingCountry,
                shippingDiffers: order.customer.shippingDiffers,
                shippingStreet: order.customer.shippingStreet,
                shippingZip: order.customer.shippingZip,
                shippingCity: order.customer.shippingCity,
                shippingCountry: order.customer.shippingCountry,
              },
              items: order.items.map((i) => ({
                productName: i.productName,
                productCode: i.productCode,
                color: i.color,
                size: i.size,
                quantity: i.quantity,
                unitPriceCents: i.unitPriceCents,
                dtfPriceCents: i.dtfPriceCents,
                lineTotalCents: i.lineTotalCents,
                hasDtf: i.hasDtf,
                dtfSize: i.dtfSize,
              })),
              subtotalCents: order.subtotalCents,
              shippingCents: order.shippingCents,
              taxRate: order.taxRate,
              taxCents: order.taxCents,
              totalCents: order.totalCents,
              paymentMethod: order.paymentMethod,
              paymentStatus: "PAID",
              paidAt: order.paidAt || new Date(),
              company: {
                name: company.name,
                owner: company.owner,
                street: company.street,
                zip: company.zip,
                city: company.city,
                country: company.country,
                phone: company.phone,
                email: company.email,
                web: company.web,
                ustId: company.ustId,
                taxNumber: company.taxNumber,
                bankName: company.bankName,
                iban: company.iban,
                bic: company.bic,
                paymentTermDays: company.paymentTermDays,
              },
            };
            const pdfBuffer = await generateInvoicePDF(pdfData);
            attachments.push({
              filename: `Rechnung-${invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            });
          } catch (pdfErr) {
            console.error("PDF Rechnung-Generierung fehlgeschlagen:", pdfErr);
          }
        }

        // VERSENDET: özel premium template kullan
        if (newStatus === "VERSENDET" && order.trackingNumber && order.shippingCarrier) {
          const shippedHtml = renderShippedEmail({
            customerSalutation: order.customer.salutation,
            customerFirstName: order.customer.firstName,
            customerLastName: order.customer.lastName,
            orderNumber: order.orderNumber,
            carrier: order.shippingCarrier,
            trackingNumber: order.trackingNumber,
          });
          await sendMail(
            order.customer.email,
            shippedEmailSubject(order.orderNumber),
            shippedHtml,
            undefined
          );
          emailSent = true;
        } else {
          // Andere Status: Template mit Status-Zeitleiste + Standard-Footer
          const timelineHtml = renderStatusTimeline(newStatus);
          const greeting = order.customer.salutation
            ? `Sehr geehrte/r ${order.customer.salutation} ${order.customer.lastName},`
            : `Sehr geehrte/r ${order.customer.firstName} ${order.customer.lastName},`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
              <div style="background: #004537; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: .5px;">INKII WORKS</span>
              </div>
              <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
                <h2 style="color: #004537; margin: 0 0 16px 0; font-size: 19px;">${emailDef.subject}</h2>
                <p style="margin: 0 0 12px 0; line-height: 1.6;">${greeting}</p>
                <p style="margin: 0 0 8px 0; line-height: 1.6;">${emailDef.intro}</p>
                ${timelineHtml}
                <p style="margin: 16px 0 0 0; line-height: 1.6;"><strong>Bestellnummer:</strong> ${order.orderNumber}</p>
                ${attachments.length > 0 ? '<p style="background: #f0fdf4; border-left: 3px solid #004537; padding: 12px 14px; margin: 16px 0; font-size: 14px;"><strong>Die zugehörige Rechnung finden Sie als PDF im Anhang.</strong></p>' : ""}
                ${trackingHtml}
                ${renderEmailFooter()}
              </div>
            </div>
          `;
          await sendMail(
            order.customer.email,
            `INKII Works — ${emailDef.subject} (${order.orderNumber})`,
            html,
            attachments.length > 0 ? attachments : undefined
          );
          emailSent = true;
        }
      } catch (e) {
        console.error("Status-Email fehlgeschlagen:", e);
      }
    }

    revalidatePath(`/admin/bestellungen/${orderId}`);
    revalidatePath("/admin/bestellungen");
    return { ok: true, emailSent };
  } catch (e) {
    console.error("[order-status] Fehler:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}

export async function updateOrderTracking(
  orderId: string,
  carrier: string,
  trackingNumber: string
): Promise<{ ok: boolean; error?: string; statusChanged?: boolean; emailSent?: boolean }> {
  try {
    if (!(await isAuthenticated())) return { ok: false, error: "Nicht autorisiert" };

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    });
    if (!order) return { ok: false, error: "Bestellung nicht gefunden" };

    // Tracking numarası eklendi/değiştirildi mi?
    const hasTracking = trackingNumber.trim().length > 0;
    const trackingChanged = hasTracking && (
      order.trackingNumber !== trackingNumber.trim() ||
      order.shippingCarrier !== carrier
    );

    // Status otomatik VERSENDET'e geçilebilir mi?
    // Sadece henüz versendet/zugestellt/abgeschlossen değilse
    const canAutoShip = hasTracking && trackingChanged && [
      "NEU", "WARTEND", "BEZAHLT", "IN_PRODUKTION", "VERSANDBEREIT"
    ].includes(order.status);

    const updates: Record<string, unknown> = {
      shippingCarrier: carrier,
      trackingNumber: trackingNumber.trim(),
    };

    if (canAutoShip) {
      updates.status = "VERSENDET";
      updates.shippedAt = new Date();
    }

    await db.order.update({ where: { id: orderId }, data: updates });

    let emailSent = false;
    if (canAutoShip) {
      // VERSENDET mailini gönder (premium template)
      try {
        const html = renderShippedEmail({
          customerSalutation: order.customer.salutation,
          customerFirstName: order.customer.firstName,
          customerLastName: order.customer.lastName,
          orderNumber: order.orderNumber,
          carrier,
          trackingNumber: trackingNumber.trim(),
        });
        await sendMail(
          order.customer.email,
          shippedEmailSubject(order.orderNumber),
          html
        );
        emailSent = true;
      } catch (e) {
        console.error("Versendet-Email fehlgeschlagen:", e);
      }
    }

    revalidatePath(`/admin/bestellungen/${orderId}`);
    revalidatePath("/admin/bestellungen");
    return { ok: true, statusChanged: canAutoShip, emailSent };
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
