"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import nodemailer from "nodemailer";
import { generateInvoicePDF, generateInvoiceNumber, type InvoiceData } from "@/lib/invoice-pdf";
import { getCompanyInfo } from "@/lib/company-info";
import { renderShippedEmail, shippedEmailSubject, renderStatusEmail } from "@/lib/shipped-email";

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

const STATUS_EMAILS: Record<string, { subject: string; intro: string; bannerIcon: string; bannerTitle: string; bannerSubtitle: string }> = {
  BEZAHLT: {
    subject: "Zahlung eingegangen",
    intro: "Wir haben Ihre Zahlung erhalten. Vielen Dank! Wir beginnen nun mit der Bearbeitung Ihrer Bestellung.",
    bannerIcon: "💳",
    bannerTitle: "Zahlung erhalten!",
    bannerSubtitle: "Vielen Dank für Ihre Zahlung",
  },
  IN_PRODUKTION: {
    subject: "Ihre Bestellung ist in Produktion",
    intro: "Wir haben mit der Produktion Ihrer Bestellung begonnen. Sobald Ihre Bestellung versandbereit ist, werden wir Sie selbstverständlich informieren.",
    bannerIcon: "🏭",
    bannerTitle: "In Produktion!",
    bannerSubtitle: "Wir fertigen Ihre Bestellung",
  },
  VERSANDBEREIT: {
    subject: "Ihre Bestellung ist versandbereit",
    intro: "Ihre Bestellung ist fertig und wird in Kürze versendet.",
    bannerIcon: "📦",
    bannerTitle: "Versandbereit!",
    bannerSubtitle: "Ihre Bestellung ist fertig",
  },
  VERSENDET: {
    subject: "Ihre Bestellung wurde versendet",
    intro: "Ihre Bestellung ist auf dem Weg zu Ihnen.",
    bannerIcon: "🚚",
    bannerTitle: "Unterwegs zu Ihnen!",
    bannerSubtitle: "Ihre Bestellung wurde versendet",
  },
  ZUGESTELLT: {
    subject: "Ihre Bestellung wurde zugestellt",
    intro: "Laut Versanddienstleister wurde Ihre Bestellung erfolgreich zugestellt. Wir hoffen, dass alles zu Ihrer Zufriedenheit ist und wünschen Ihnen viel Freude mit Ihrer Bestellung.",
    bannerIcon: "🎉",
    bannerTitle: "Zugestellt!",
    bannerSubtitle: "Ihre Bestellung ist angekommen",
  },
  ABGESCHLOSSEN: {
    subject: "Bestellung abgeschlossen",
    intro: "Ihre Bestellung ist nun abgeschlossen. Vielen Dank für Ihr Vertrauen!",
    bannerIcon: "✅",
    bannerTitle: "Abgeschlossen!",
    bannerSubtitle: "Vielen Dank für Ihr Vertrauen",
  },
  STORNIERT: {
    subject: "Bestellung storniert",
    intro: "Ihre Bestellung wurde storniert. Bei Fragen kontaktieren Sie uns bitte.",
    bannerIcon: "❌",
    bannerTitle: "Bestellung storniert",
    bannerSubtitle: "Ihre Bestellung wurde storniert",
  },
};

// Reihenfolge der Hauptschritte für die Status-Zeitleiste in der E-Mail.
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
          // Andere Status: einheitliches Premium-Template (wie Versand-Mail)
          const html = renderStatusEmail({
            status: newStatus,
            bannerIcon: emailDef.bannerIcon,
            bannerTitle: emailDef.bannerTitle,
            bannerSubtitle: emailDef.bannerSubtitle,
            customerFirstName: order.customer.firstName,
            intro: emailDef.intro,
            orderNumber: order.orderNumber,
            invoiceAttached: attachments.length > 0,
          });
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
