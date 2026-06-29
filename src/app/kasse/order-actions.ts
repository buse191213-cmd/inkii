"use server";

import { db } from "@/lib/db";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import nodemailer from "nodemailer";

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[mail] SMTP nicht konfiguriert");
    return;
  }
  const transporter = makeTransporter();
  const from = process.env.SMTP_FROM || `"INKII Works" <${process.env.SMTP_USER}>`;
  await transporter.sendMail({ from, to, subject, html });
}

type CustomerData = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firmname: string;
  ustId: string;
  billingStreet: string;
  billingZip: string;
  billingCity: string;
  billingCountry: string;
  shippingDiffers: boolean;
  shippingStreet: string;
  shippingZip: string;
  shippingCity: string;
  shippingCountry: string;
};

type CartItemData = {
  productId: string;
  productCode: string;
  productName: string;
  productImage: string;
  color: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  hasDtf: boolean;
  dtfSize: string;
  dtfPriceCents: number;
  dtfDesignUrl: string;
};

type OrderInput = {
  customer: CustomerData;
  items: CartItemData[];
  paymentMethod: string;
  customerNote: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INKI-${year}-${random}`;
}

export async function createOrder(
  input: OrderInput
): Promise<{ ok: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    const c = input.customer;

    // 0) Login durumu — varsa müşteriye direkt bağla
    const loggedInCustomerId = await getCurrentCustomerId();

    // 1) Customer'ı bul veya oluştur
    let customer = loggedInCustomerId
      ? await db.customer.findUnique({ where: { id: loggedInCustomerId } })
      : await db.customer.findUnique({ where: { email: c.email } });
    if (!customer) {
      customer = await db.customer.create({
        data: {
          email: c.email,
          salutation: c.salutation,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
          firmname: c.firmname,
          ustId: c.ustId,
          billingStreet: c.billingStreet,
          billingZip: c.billingZip,
          billingCity: c.billingCity,
          billingCountry: c.billingCountry,
          shippingDiffers: c.shippingDiffers,
          shippingStreet: c.shippingStreet,
          shippingZip: c.shippingZip,
          shippingCity: c.shippingCity,
          shippingCountry: c.shippingCountry,
          isGuest: true,
        },
      });
    } else {
      // Update existing customer data
      customer = await db.customer.update({
        where: { id: customer.id },
        data: {
          salutation: c.salutation,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone || customer.phone,
          firmname: c.firmname || customer.firmname,
          ustId: c.ustId || customer.ustId,
          billingStreet: c.billingStreet,
          billingZip: c.billingZip,
          billingCity: c.billingCity,
          billingCountry: c.billingCountry,
          shippingDiffers: c.shippingDiffers,
          shippingStreet: c.shippingStreet,
          shippingZip: c.shippingZip,
          shippingCity: c.shippingCity,
          shippingCountry: c.shippingCountry,
        },
      });
    }

    // 2) Order oluştur
    const orderNumber = generateOrderNumber();

    // Status: Rechnung → WARTEND, anderen → NEU (PayPal/Klarna sonra ödeyince BEZAHLT olur)
    const initialStatus = input.paymentMethod === "rechnung" ? "WARTEND" : "NEU";

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: initialStatus,
        subtotalCents: input.subtotalCents,
        taxCents: input.taxCents,
        taxRate: 19.0,
        shippingCents: input.shippingCents,
        totalCents: input.totalCents,
        paymentMethod: input.paymentMethod,
        paymentStatus: "PENDING",
        customerNote: input.customerNote,
        items: {
          create: input.items.map((i) => ({
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
            lineTotalCents: (i.unitPriceCents + i.dtfPriceCents) * i.quantity,
          })),
        },
      },
    });

    // 3) E-Mail bildirimleri — sadece "rechnung" yöntemi için hemen at
    // PayPal/Klarna: ödeme başarısı sonrası ayrı flow'da mail gider
    if (input.paymentMethod !== "rechnung") {
      return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
    }

    try {
      const itemsHtml = input.items
        .map(
          (i) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${i.productName}<br>
            <small style="color: #666;">${i.productCode}${i.color ? ` · ${i.color}` : ""}${i.size ? ` · ${i.size}` : ""}${i.hasDtf ? ` · + DTF ${i.dtfSize}` : ""}</small>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${i.quantity} Stk</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${euro((i.unitPriceCents + i.dtfPriceCents) * i.quantity)} €</td>
        </tr>
      `
        )
        .join("");

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #004537;">Bestellbestätigung — ${orderNumber}</h2>
          <p>Sehr geehrte/r ${c.salutation} ${c.firstName} ${c.lastName},</p>
          <p>vielen Dank für Ihre Bestellung bei INKII Works. Wir haben Ihre Anfrage erhalten und melden uns in Kürze bei Ihnen.</p>

          <h3>Ihre Bestellung</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f4f5f3;">
                <th style="padding: 8px; text-align: left;">Artikel</th>
                <th style="padding: 8px; text-align: right;">Menge</th>
                <th style="padding: 8px; text-align: right;">Summe</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <table style="width: 100%; margin-top: 16px;">
            <tr>
              <td style="padding: 4px;">Zwischensumme:</td>
              <td style="padding: 4px; text-align: right;">${euro(input.subtotalCents)} €</td>
            </tr>
            <tr>
              <td style="padding: 4px;">Versand:</td>
              <td style="padding: 4px; text-align: right;">${euro(input.shippingCents)} €</td>
            </tr>
            <tr>
              <td style="padding: 4px; color: #666;">davon MwSt. 19%:</td>
              <td style="padding: 4px; text-align: right; color: #666;">${euro(input.taxCents)} €</td>
            </tr>
            <tr style="font-weight: bold; font-size: 1.1em;">
              <td style="padding: 8px; border-top: 2px solid #004537;">Gesamt:</td>
              <td style="padding: 8px; border-top: 2px solid #004537; text-align: right;">${euro(input.totalCents)} €</td>
            </tr>
          </table>

          <p style="margin-top: 24px;">
            <strong>Zahlungsmethode:</strong> Auf Rechnung<br>
            <strong>Lieferadresse:</strong> ${c.shippingDiffers ? `${c.shippingStreet}, ${c.shippingZip} ${c.shippingCity}` : `${c.billingStreet}, ${c.billingZip} ${c.billingCity}`}
          </p>

          ${
            input.paymentMethod === "rechnung"
              ? `<p style="background: #fef3c7; padding: 12px; margin-top: 16px;">
                  <strong>Auf Rechnung:</strong> Die Zahlung erfolgt per Banküberweisung nach Erhalt der Ware. Sie erhalten in Kürze eine separate Rechnung.
                </p>`
              : `<p style="background: #f0fdf4; padding: 12px; margin-top: 16px;">
                  Sie erhalten eine separate E-Mail mit der Zahlungsabwicklung.
                </p>`
          }

          <p style="margin-top: 24px; color: #666; font-size: 12px;">
            INKII WORKS · Sener Kirli · Westuferstr. 25 · 45356 Essen · USt-ID: DE353055316
          </p>
        </div>
      `;

      // Customer e-mail
      await sendMail(c.email, `INKII Works — Bestellbestätigung ${orderNumber}`, html);

      // Admin e-mail
      await sendMail(
        process.env.MAIL_ADMIN ?? "info@inkiiworks.de",
        `Neue Bestellung: ${orderNumber} — ${euro(input.totalCents)} €`,
        `
          <div style="font-family: Arial, sans-serif;">
            <h2>Neue Bestellung eingegangen</h2>
            <p><strong>${orderNumber}</strong> · ${euro(input.totalCents)} €</p>
            <p>Kunde: ${c.salutation} ${c.firstName} ${c.lastName} (${c.email})${c.firmname ? `<br>Firma: ${c.firmname}` : ""}${c.phone ? `<br>Tel: ${c.phone}` : ""}</p>
            <p>Zahlung: ${input.paymentMethod}</p>
            ${itemsHtml ? `<table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>` : ""}
            ${input.customerNote ? `<p><strong>Kundennotiz:</strong><br>${input.customerNote.replace(/\n/g, "<br>")}</p>` : ""}
            <p style="margin-top: 16px;">
              <a href="${process.env.SITE_URL ?? "https://www.inkiiworks.de"}/admin/bestellungen">→ Im Admin öffnen</a>
            </p>
          </div>
        `
      );
    } catch (mailErr) {
      console.error("Mail-Versand fehlgeschlagen:", mailErr);
      // E-mail hatası order'ı durdurmaz
    }

    return { ok: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (e) {
    console.error("Order creation failed:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Bestellung konnte nicht gespeichert werden.",
    };
  }
}
