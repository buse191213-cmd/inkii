"use server";

import { db } from "@/lib/db";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { getCompanyInfo } from "@/lib/company-info";
import nodemailer from "nodemailer";
import { put } from "@vercel/blob";

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

/**
 * base64 dataURL'i Vercel Blob'a upload eder, public https URL döner.
 * Mailde base64 görseller çalışmaz — bu yüzden gerçek URL'e çeviririz.
 * Zaten http(s) URL ise dokunmadan döner. Hata olursa null döner.
 */
async function uploadDataUrlToBlob(dataUrl: string | null | undefined, filename: string): Promise<string | null> {
  if (!dataUrl) return null;
  // Zaten normal URL ise dokunma
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) return dataUrl;
  if (!dataUrl.startsWith("data:")) return null;
  try {
    // data:image/png;base64,XXXX → buffer
    const match = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) return null;
    const mime = match[1];
    const ext = mime.split("/")[1] || "png";
    const buffer = Buffer.from(match[2], "base64");
    const blob = await put(`orders/${Date.now()}-${filename}.${ext}`, buffer, {
      access: "public",
      contentType: mime,
    });
    return blob.url;
  } catch (err) {
    console.error("[Order] Blob upload failed:", err);
    return null;
  }
}

/**
 * Bir item'ın dtfDesignUrl JSON'undaki tüm base64 görselleri Blob'a taşır.
 */
async function migrateDesignImages(dtfDesignUrl: string, code: string): Promise<string> {
  if (!dtfDesignUrl) return dtfDesignUrl;
  try {
    const d = JSON.parse(dtfDesignUrl) as {
      front?: string | null; back?: string | null;
      frontSize?: unknown; backSize?: unknown;
      frontMockup?: string | null; backMockup?: string | null;
    };
    const [front, back, frontMockup, backMockup] = await Promise.all([
      uploadDataUrlToBlob(d.front, `${code}-front-logo`),
      uploadDataUrlToBlob(d.back, `${code}-back-logo`),
      uploadDataUrlToBlob(d.frontMockup, `${code}-front-mockup`),
      uploadDataUrlToBlob(d.backMockup, `${code}-back-mockup`),
    ]);
    return JSON.stringify({
      front: front || d.front || null,
      back: back || d.back || null,
      frontSize: d.frontSize || null,
      backSize: d.backSize || null,
      frontMockup: frontMockup || null,
      backMockup: backMockup || null,
    });
  } catch {
    return dtfDesignUrl;
  }
}

async function generateOrderNumber(): Promise<string> {
  const yearShort = String(new Date().getFullYear()).slice(-2); // "26"
  const prefix = `INKI${yearShort}-`;

  // Bu yıl için en son sipariş numarasını bul
  const lastOrder = await db.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let nextNum = 10000;
  if (lastOrder?.orderNumber) {
    // "INKI26-10042" → 10042
    const parts = lastOrder.orderNumber.split("-");
    const lastNum = parseInt(parts[1] || "0", 10);
    if (!isNaN(lastNum) && lastNum >= 10000) {
      nextNum = lastNum + 1;
    }
  }

  return `${prefix}${nextNum}`;
}

export async function createOrder(
  input: OrderInput
): Promise<{ ok: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    const c = input.customer;

    // GÜVENLİK: Fiyatsız ("Preis auf Anfrage") ürün siparişe giremez.
    // Aksi halde müşteri sadece DTF+Versand ödeyip ürünü bedava alabilirdi.
    const zeroPriced = input.items.filter((i) => !i.unitPriceCents || i.unitPriceCents <= 0);
    if (zeroPriced.length > 0) {
      return {
        ok: false,
        error: `Für folgende Artikel gilt Preis auf Anfrage – bitte fordern Sie ein Angebot an: ${zeroPriced.map((i) => i.productName).join(", ")}`,
      };
    }

    // 0) Login durumu — varsa müşteriye direkt bağla
    const loggedInCustomerId = await getCurrentCustomerId();

    // E-Mail normalisieren (Registrierung speichert lowercase/trimmed —
    // ohne Normalisierung schlägt findUnique fehl und create wirft Unique-Fehler)
    const normalizedEmail = c.email.trim().toLowerCase();

    // 1) Customer'ı bul veya oluştur
    let customer = loggedInCustomerId
      ? await db.customer.findUnique({ where: { id: loggedInCustomerId } })
      : await db.customer.findUnique({ where: { email: normalizedEmail } });
    if (!customer) {
      try {
        customer = await db.customer.create({
          data: {
            email: normalizedEmail,
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
      } catch (createErr) {
        // Race condition / bereits vorhanden → nochmal laden statt Fehler werfen
        customer = await db.customer.findUnique({ where: { email: normalizedEmail } });
        if (!customer) {
          console.error("[createOrder] customer create failed", createErr);
          return {
            ok: false,
            error: "Mit dieser E-Mail existiert bereits ein Konto. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail-Adresse.",
          };
        }
      }
    } else {
      // Registriertes Konto (mit Passwort) → Gast-Checkout nicht erlaubt.
      // Nur wenn nicht eingeloggt: zum Login auffordern.
      if (!loggedInCustomerId && customer.password) {
        return {
          ok: false,
          error: "Für diese E-Mail existiert bereits ein Konto. Bitte melden Sie sich an, um fortzufahren.",
        };
      }
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
    const orderNumber = await generateOrderNumber();

    // Status: Rechnung → WARTEND, anderen → NEU (PayPal/Klarna sonra ödeyince BEZAHLT olur)
    const initialStatus = input.paymentMethod === "rechnung" ? "WARTEND" : "NEU";

    // Design görsellerini (base64) Vercel Blob'a taşı → mailde çalışan https URL
    const itemsWithBlobDesigns = await Promise.all(
      input.items.map(async (i) => ({
        ...i,
        dtfDesignUrl: i.hasDtf && i.dtfDesignUrl
          ? await migrateDesignImages(i.dtfDesignUrl, i.productCode)
          : i.dtfDesignUrl,
      }))
    );

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
          create: itemsWithBlobDesigns.map((i) => ({
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
      const company = await getCompanyInfo();
      const itemsHtml = itemsWithBlobDesigns
        .map(
          (i) => {
            // Design görüntülerini çıkar (JSON {front, back, frontSize, backSize})
            let designImgs = "";
            if (i.hasDtf && i.dtfDesignUrl) {
              try {
                const d = JSON.parse(i.dtfDesignUrl) as {
                  front?: string | null; back?: string | null;
                  frontSize?: { widthCm: number; heightCm: number } | null;
                  backSize?: { widthCm: number; heightCm: number } | null;
                  frontMockup?: string | null; backMockup?: string | null;
                };
                const buildThumb = (logoUrl: string, mockupUrl: string | null | undefined, label: string, size?: { widthCm: number; heightCm: number } | null, code?: string) => {
                  const preview = mockupUrl || logoUrl; // mockup varsa göster
                  const sizeStr = size
                    ? `<br><span style="font-size:9px;color:#5a6660;">${size.widthCm.toLocaleString("de-DE")} × ${size.heightCm.toLocaleString("de-DE")} cm</span>`
                    : "";
                  const sideLabel = label === "Vorderseite" ? "vorne" : "hinten";
                  const logoDl = `<a href="${logoUrl}" download="${code}-${sideLabel}-logo.png" style="font-size:9px;color:#004537;font-weight:700;">⬇ Logo</a>`;
                  const mockupDl = mockupUrl
                    ? ` · <a href="${mockupUrl}" download="${code}-${sideLabel}-mockup.jpg" style="font-size:9px;color:#004537;font-weight:700;">⬇ Mockup</a>`
                    : "";
                  return `<div style="display:inline-block;text-align:center;margin-right:12px;vertical-align:top;"><img src="${preview}" alt="${label}" style="width:90px;height:90px;object-fit:contain;border:1px solid #e3e6df;border-radius:6px;background:#fff;" /><br><span style="font-size:10px;color:#065f46;font-weight:600;">${label}</span>${sizeStr}<br>${logoDl}${mockupDl}</div>`;
                };
                const thumbs: string[] = [];
                if (d.front) thumbs.push(buildThumb(d.front, d.frontMockup, "Vorderseite", d.frontSize, i.productCode));
                if (d.back) thumbs.push(buildThumb(d.back, d.backMockup, "Rückseite", d.backSize, i.productCode));
                if (thumbs.length > 0) {
                  designImgs = `<div style="margin-top:10px;">${thumbs.join("")}</div>`;
                }
              } catch { /* ignore */ }
            }
            return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${i.productName}<br>
            <small style="color: #666;">${i.productCode}${i.color ? ` · ${i.color}` : ""}${i.size ? ` · ${i.size}` : ""}${i.hasDtf ? ` · + Transfer${i.dtfSize ? ` (${i.dtfSize})` : ""}` : ""}</small>
            ${designImgs}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">${i.quantity} Stk</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">${euro((i.unitPriceCents + i.dtfPriceCents) * i.quantity)} €</td>
        </tr>
      `;
          }
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
              ? `
                <div style="margin-top: 28px; padding: 20px; border: 2px solid #004537; background: #f0fdf4;">
                  <h3 style="margin: 0 0 12px 0; color: #004537; font-size: 16px;">💳 Zahlung per Banküberweisung</h3>
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">
                    Bitte überweisen Sie den Gesamtbetrag von <strong>${euro(input.totalCents)} €</strong> auf folgendes Konto:
                  </p>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #0d9488; font-weight: 600;">
                    ℹ️ Nach Eingang Ihrer Zahlung wird Ihre Bestellung bearbeitet und produziert.
                  </p>
                  <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                    ${company.bankName ? `
                    <tr>
                      <td style="padding: 6px 0; color: #666; width: 130px;">Bank:</td>
                      <td style="padding: 6px 0; font-weight: 600;">${company.bankName}</td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Kontoinhaber:</td>
                      <td style="padding: 6px 0; font-weight: 600;">${company.owner || company.name}</td>
                    </tr>
                    ${company.iban ? `
                    <tr>
                      <td style="padding: 6px 0; color: #666;">IBAN:</td>
                      <td style="padding: 6px 0; font-family: 'Courier New', monospace; font-weight: 700; font-size: 15px;">${company.iban}</td>
                    </tr>` : ""}
                    ${company.bic ? `
                    <tr>
                      <td style="padding: 6px 0; color: #666;">BIC:</td>
                      <td style="padding: 6px 0; font-family: 'Courier New', monospace; font-weight: 600;">${company.bic}</td>
                    </tr>` : ""}
                    <tr style="border-top: 1px dashed #004537;">
                      <td style="padding: 10px 0 6px 0; color: #666;">Verwendungszweck:</td>
                      <td style="padding: 10px 0 6px 0; font-family: 'Courier New', monospace; font-weight: 700; color: #004537;">${orderNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Betrag:</td>
                      <td style="padding: 6px 0; font-weight: 700; font-size: 16px; color: #004537;">${euro(input.totalCents)} €</td>
                    </tr>
                  </table>
                  <p style="margin: 16px 0 0 0; font-size: 12px; color: #475569; line-height: 1.5;">
                    ⚠️ <strong>Wichtig:</strong> Bitte geben Sie unbedingt die Bestellnummer <strong>${orderNumber}</strong> als Verwendungszweck an, damit wir Ihre Zahlung schnell zuordnen können.
                  </p>
                </div>`
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
