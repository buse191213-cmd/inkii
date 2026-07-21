"use server";

import { db } from "@/lib/db";
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

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function sendQuoteRequest(input: {
  customer: { firstName: string; lastName: string; email: string; phone: string; firmname: string };
  items: { productName: string; productCode: string; color: string; size: string; quantity: number; hasDtf: boolean; dtfSize: string; productImage?: string; dtfDesignUrl?: string }[];
  message: string;
  subtotalCents: number;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { customer: c, items, message, subtotalCents } = input;

    // Inquiry kaydet
    const itemsList = items
      .map(
        (i) => {
          const imgPart = i.productImage ? `\n   Produktbild: ${i.productImage}` : "";
          const designPart = i.dtfDesignUrl ? `\n   Kunden-Design: ${i.dtfDesignUrl}` : "";
          return `• ${i.productName} (${i.productCode})${i.color ? ` · ${i.color}` : ""}${i.size ? ` · ${i.size}` : ""} · ${i.quantity} Stk${i.hasDtf ? ` · + DTF ${i.dtfSize}` : ""}${imgPart}${designPart}`;
        }
      )
      .join("\n");

    await db.inquiry.create({
      data: {
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone,
        company: c.firmname,
        subject: `Angebotsanfrage Warenkorb (${items.length} Artikel)`,
        message: `${message}\n\nGewünschte Artikel:\n${itemsList}${subtotalCents > 0 ? `\n\nVorl. Summe: ${euro(subtotalCents)} €` : ""}`,
        status: "new",
      },
    });

    // Admin-Mail: mit Produktbild + hochgeladenem Design (falls vorhanden)
    const adminItemsHtml = items
      .map((i) => {
        const prodImg = i.productImage
          ? `<img src="${i.productImage}" alt="" width="70" height="70" style="width:70px;height:70px;object-fit:contain;background:#f4f5f3;border:1px solid #eee;border-radius:6px;vertical-align:middle;margin-right:10px;">`
          : "";
        const designImg = i.dtfDesignUrl
          ? `<div style="margin-top:6px;"><small style="color:#666;">Kunden-Design:</small><br><img src="${i.dtfDesignUrl}" alt="" width="90" style="max-width:90px;height:auto;border:1px solid #eee;border-radius:6px;margin-top:4px;"></div>`
          : "";
        return `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #eee;vertical-align:top;">
              ${prodImg}
              <span style="vertical-align:middle;">
                <strong>${i.productName}</strong><br>
                <small style="color:#666;">${i.productCode}${i.color ? ` · ${i.color}` : ""}${i.size ? ` · ${i.size}` : ""}${i.hasDtf ? ` · + DTF ${i.dtfSize}` : ""}</small>
              </span>
              ${designImg}
            </td>
            <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;vertical-align:top;">${i.quantity} Stk</td>
          </tr>
        `;
      })
      .join("");

    // Customer e-mail
    const itemsHtml = items
      .map(
        (i) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${i.productName}<br>
            <small style="color: #666;">${i.productCode}${i.color ? ` · ${i.color}` : ""}${i.size ? ` · ${i.size}` : ""}${i.hasDtf ? ` · + DTF ${i.dtfSize}` : ""}</small>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${i.quantity} Stk</td>
        </tr>
      `
      )
      .join("");

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #004537;">Vielen Dank für Ihre Anfrage!</h2>
        <p>Sehr geehrte/r ${c.firstName} ${c.lastName},</p>
        <p>wir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden mit einem individuellen Angebot.</p>

        <h3>Ihre Anfrage</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f4f5f3;">
              <th style="padding: 8px; text-align: left;">Artikel</th>
              <th style="padding: 8px; text-align: right;">Menge</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        ${message ? `<p style="margin-top: 16px;"><strong>Ihre Nachricht:</strong><br>${message.replace(/\n/g, "<br>")}</p>` : ""}

        <p style="margin-top: 24px; color: #666; font-size: 12px;">
          INKII WORKS · Sener Kirli · Westuferstr. 25 · 45356 Essen · USt-ID: DE353055316
        </p>
      </div>
    `;

    try {
      await sendMail(c.email, "INKII Works — Anfrage eingegangen", customerHtml);
      await sendMail(
        process.env.MAIL_ADMIN ?? "info@inkiiworks.de",
        `Neue Angebotsanfrage: ${c.firstName} ${c.lastName} (${items.length} Artikel)`,
        `
          <div style="font-family: Arial, sans-serif;">
            <h2>Neue Angebotsanfrage</h2>
            <p>Kunde: ${c.firstName} ${c.lastName}<br>
            E-Mail: <a href="mailto:${c.email}">${c.email}</a><br>
            ${c.phone ? `Tel: ${c.phone}<br>` : ""}
            ${c.firmname ? `Firma: ${c.firmname}<br>` : ""}</p>
            ${message ? `<p><strong>Nachricht:</strong><br>${message.replace(/\n/g, "<br>")}</p>` : ""}
            <table style="width: 100%; border-collapse: collapse;">${adminItemsHtml}</table>
            ${subtotalCents > 0 ? `<p>Vorläufige Summe: <strong>${euro(subtotalCents)} €</strong></p>` : ""}
          </div>
        `
      );
    } catch (mailErr) {
      console.error("Mail fehlgeschlagen:", mailErr);
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
