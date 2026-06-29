"use server";

import { db } from "@/lib/db";
import { generateInvoicePDF, generateInvoiceNumber, type InvoiceData } from "@/lib/invoice-pdf";
import { getCompanyInfo } from "@/lib/company-info";
import nodemailer from "nodemailer";

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

function euro(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Send order confirmation email AFTER successful payment.
 * Includes PDF invoice attachment.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!isSmtpConfigured()) return { ok: false, error: "SMTP nicht konfiguriert" };

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    });
    if (!order) return { ok: false, error: "Bestellung nicht gefunden" };

    const company = await getCompanyInfo();

    // PDF Rechnung
    let invoiceNumber = order.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = generateInvoiceNumber(order.createdAt, order.orderNumber);
      await db.order.update({ where: { id: orderId }, data: { invoiceNumber } });
    }

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
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
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

    // Items HTML
    const itemsHtml = order.items
      .map(
        (i) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          ${i.productName}<br>
          <small style="color: #666;">${i.productCode}${i.color ? ` · ${i.color}` : ""}${i.size ? ` · ${i.size}` : ""}${i.hasDtf ? ` · + DTF ${i.dtfSize}` : ""}</small>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${i.quantity} Stk</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${euro(i.lineTotalCents)} €</td>
      </tr>
    `
      )
      .join("");

    const paymentLabel = order.paymentMethod === "paypal" ? "PayPal" :
                        order.paymentMethod === "klarna" ? "Klarna" :
                        order.paymentMethod === "rechnung" ? "Auf Rechnung" :
                        order.paymentMethod;

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: linear-gradient(135deg, #004537 0%, #006b56 100%); padding: 24px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 22px;">Zahlung erhalten</h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 13px;">Vielen Dank für Ihre Bestellung!</p>
        </div>
        <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-top: none;">
          <p>Sehr geehrte/r ${order.customer.salutation} ${order.customer.firstName} ${order.customer.lastName},</p>
          <p>wir haben Ihre Zahlung erhalten und mit der Bearbeitung Ihrer Bestellung begonnen.</p>

          <div style="background: #f0fdf4; padding: 14px; margin: 16px 0; border-left: 3px solid #004537;">
            <strong>Bestellnummer:</strong> ${order.orderNumber}<br>
            <strong>Zahlungsmethode:</strong> ${paymentLabel}<br>
            <strong>Status:</strong> ✓ Bezahlt
          </div>

          <p style="margin-top: 20px; padding: 12px; background: #ecfeff; border-left: 3px solid #0891b2;">
            📄 <strong>Ihre Rechnung finden Sie als PDF im Anhang.</strong>
          </p>

          <h3 style="margin-top: 28px;">Ihre Bestellung</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
            <thead>
              <tr style="background: #f4f5f3;">
                <th style="padding: 8px; text-align: left; font-size: 13px;">Artikel</th>
                <th style="padding: 8px; text-align: right; font-size: 13px;">Menge</th>
                <th style="padding: 8px; text-align: right; font-size: 13px;">Summe</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right;">Zwischensumme:</td>
                <td style="padding: 8px; text-align: right;">${euro(order.subtotalCents)} €</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right;">Versand:</td>
                <td style="padding: 8px; text-align: right;">${euro(order.shippingCents)} €</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right; color: #666;">MwSt. ${order.taxRate}%:</td>
                <td style="padding: 8px; text-align: right; color: #666;">${euro(order.taxCents)} €</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px 8px; text-align: right; font-weight: 700; border-top: 2px solid #004537;">Gesamt:</td>
                <td style="padding: 10px 8px; text-align: right; font-weight: 700; border-top: 2px solid #004537; font-size: 16px;">${euro(order.totalCents)} €</td>
              </tr>
            </tfoot>
          </table>

          <p style="margin-top: 28px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
            Bei Fragen schreiben Sie uns: <a href="mailto:${company.email}" style="color: #004537;">${company.email}</a><br>
            ${company.name} · ${company.owner} · ${company.street} · ${company.zip} ${company.city}
          </p>
        </div>
      </div>
    `;

    const transporter = makeTransporter();
    const from = process.env.SMTP_FROM || `"INKII Works" <${process.env.SMTP_USER}>`;

    // Müşteri
    await transporter.sendMail({
      from,
      to: order.customer.email,
      subject: `INKII Works — Zahlung erhalten (${order.orderNumber})`,
      html: customerHtml,
      attachments: [{
        filename: `Rechnung-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      }],
    });

    // Admin
    const adminEmail = process.env.SMTP_ADMIN_TO || process.env.SMTP_USER;
    if (adminEmail) {
      await transporter.sendMail({
        from,
        to: adminEmail,
        subject: `📦 Neue Bestellung (BEZAHLT): ${order.orderNumber} — ${euro(order.totalCents)} €`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #004537;">Neue bezahlte Bestellung</h2>
            <p><strong>${order.orderNumber}</strong> · ${paymentLabel} · ${euro(order.totalCents)} €</p>
            <p>${order.customer.firstName} ${order.customer.lastName} · ${order.customer.email}</p>
            ${order.customer.firmname ? `<p>Firma: ${order.customer.firmname}</p>` : ""}
            <p style="margin-top: 16px;">
              <a href="https://www.inkiiworks.de/admin/bestellungen/${order.id}" style="background: #004537; color: #fff; padding: 10px 20px; text-decoration: none;">
                In Admin öffnen →
              </a>
            </p>
          </div>
        `,
      });
    }

    return { ok: true };
  } catch (e) {
    console.error("Confirmation mail failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
