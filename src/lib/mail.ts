// Mail-Versand via IONOS SMTP (nodemailer).
//
// Verschickt zwei Mails parallel:
//   1) Admin-Benachrichtigung an info@inkiiworks.de
//   2) Bestätigung an den Kunden
//
// Setup in Vercel (Production + Preview + Development):
//   SMTP_HOST=smtp.ionos.de
//   SMTP_PORT=465
//   SMTP_USER=info@inkiiworks.de
//   SMTP_PASS=...
//   SMTP_FROM="INKII Works <info@inkiiworks.de>"
//   MAIL_ADMIN=info@inkiiworks.de
//   SITE_URL=https://inkii.vercel.app   (optional; default ist diese URL)

import nodemailer from "nodemailer";

const SITE_URL = process.env.SITE_URL || "https://inkii.vercel.app";
const LOGO_URL = `${SITE_URL}/inkii-logo.png`;

export type InquiryItem = {
  code?: string | null;
  name: string;
  image?: string | null;
  color?: string | null;
  colorLabel?: string | null;
  sizes?: { name: string; qty: number }[] | null;
  qty: number;
  note?: string | null;
};

type InquiryMail = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  /** Optional: Bei Merkzettel-Anfragen Liste der Artikel mit Bild/Farbe. */
  items?: InquiryItem[];
};

export type MailResult = {
  adminOk: boolean;
  customerOk: boolean;
  adminError?: string;
  customerError?: string;
  skipped?: boolean;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildItemsHtml(items: InquiryItem[]): string {
  if (!items || items.length === 0) return "";
  const rows = items
    .map((it) => {
      const img = it.image
        ? `<img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.name)}" style="width:120px;height:120px;object-fit:contain;background:#f8f9f6;border-radius:8px;border:1px solid #e8e8e6;display:block;padding:6px;box-sizing:border-box"/>`
        : `<div style="width:120px;height:120px;border-radius:8px;border:1px solid #e8e8e6;background:#f4f5f1;display:flex;align-items:center;justify-content:center;color:#9ea7a2;font-size:11px;letter-spacing:.1em;font-weight:700">INKII</div>`;
      const colorHtml = it.color
        ? `<div style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:13px;color:#5a6660"><span style="width:14px;height:14px;border-radius:50%;background:${escapeHtml(it.color)};border:1px solid rgba(0,0,0,.12);display:inline-block;flex-shrink:0"></span><span>${escapeHtml(it.colorLabel || it.color)}</span></div>`
        : "";
      const sizesHtml = it.sizes && it.sizes.length > 0
        ? `<div style="margin-top:6px">${it.sizes.map(s => `<span style="display:inline-block;padding:3px 9px;background:#f1f4ef;color:#1c2722;border-radius:999px;font-size:12px;margin-right:4px;margin-bottom:3px;border:1px solid #e3e6df"><b>${escapeHtml(s.name)}</b> × ${s.qty}</span>`).join("")}</div>`
        : "";
      const noteHtml = it.note
        ? `<div style="margin-top:8px;font-size:13px;color:#5a6660;border-left:2px solid #5e8470;padding:4px 0 4px 10px;background:#fafbf9;border-radius:0 4px 4px 0"><b style="color:#1c2722">Anmerkung:</b> ${escapeHtml(it.note)}</div>`
        : "";
      const codeHtml = it.code
        ? `<div style="font-size:11px;color:#9ea7a2;letter-spacing:.05em;font-family:'SF Mono',Menlo,monospace;margin-bottom:4px">${escapeHtml(it.code)}</div>`
        : "";
      return `<tr>
<td style="padding:16px 0 16px 12px;border-bottom:1px solid #f0f0ec;vertical-align:top;width:140px">${img}</td>
<td style="padding:16px 14px;border-bottom:1px solid #f0f0ec;vertical-align:top">
${codeHtml}
<div style="font-size:15px;font-weight:700;color:#1c2722;line-height:1.3">${escapeHtml(it.name)}</div>
${colorHtml}${sizesHtml}${noteHtml}
</td>
<td style="padding:16px 12px 16px 0;border-bottom:1px solid #f0f0ec;vertical-align:top;text-align:right;white-space:nowrap">
<div style="font-size:20px;font-weight:800;color:#1c2722">${it.qty}</div>
<div style="font-size:11px;color:#9ea7a2;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Stück</div>
</td>
</tr>`;
    })
    .join("");
  const total = items.reduce((s, i) => s + (i.qty || 0), 0);
  return `<table style="width:100%;margin-top:20px;border-collapse:collapse;border:1px solid #e3e6df;border-radius:10px;overflow:hidden"><thead><tr><th colspan="3" style="background:#fafbf9;text-align:left;padding:14px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7a857f;font-weight:700;border-bottom:1px solid #e3e6df">Artikel · ${items.length} Variante${items.length === 1 ? "" : "n"} · ${total} Stück gesamt</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function buildLogoBlock(): string {
  return `<div style="text-align:left;margin-bottom:22px"><img src="${LOGO_URL}" alt="INKII Works" style="max-width:140px;height:auto;display:block"/></div>`;
}

function buildAdminHtml(d: InquiryMail): string {
  const msgFallback = d.items && d.items.length > 0 ? "" : `<div style="margin-top:22px;padding:20px;background:#fafbf9;border-radius:10px;font-size:14px;line-height:1.65;border:1px solid #e8e8e6;white-space:pre-wrap;color:#3b4540">${escapeHtml(d.message).replace(/\n/g, "<br/>")}</div>`;
  const itemsBlock = d.items && d.items.length > 0 ? buildItemsHtml(d.items) : "";
  return `<!doctype html>
<html><body style="font-family:Arial,Helvetica,sans-serif;background:#f4f5f1;padding:24px;color:#1c2722;margin:0;">
<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e3e6df;">
${buildLogoBlock()}
<p style="margin:0 0 8px 0;color:#7a857f;font-size:11px;letter-spacing:.15em;text-transform:uppercase;">Neue Anfrage über inkiiworks.de</p>
<h2 style="font-size:17px;margin:0 0 18px 0;color:#1c2722;font-weight:700;">${escapeHtml(d.subject)}</h2>
<table style="width:100%;font-size:14px;line-height:1.6;border-collapse:collapse;">
<tr><td style="color:#7a857f;width:110px;padding:6px 0;border-bottom:1px solid #f0f0ec;">Name</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;"><b>${escapeHtml(d.name)}</b></td></tr>
<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">E-Mail</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;"><a href="mailto:${escapeHtml(d.email)}" style="color:#1c2722;text-decoration:none;">${escapeHtml(d.email)}</a></td></tr>
${d.phone ? `<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">Telefon</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;">${escapeHtml(d.phone)}</td></tr>` : ""}
${d.company ? `<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">Firma</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;">${escapeHtml(d.company)}</td></tr>` : ""}
</table>
${itemsBlock}
${msgFallback}
<a href="mailto:${escapeHtml(d.email)}?subject=Re:%20${encodeURIComponent(d.subject)}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#1c2722;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:.04em">Antworten →</a>
<p style="margin-top:22px;padding-top:14px;border-top:1px solid #e8e8e6;font-size:11px;color:#9ea7a2;line-height:1.5">INKII Works · Westuferstr. 25, 45356 Essen · <a href="${SITE_URL}" style="color:#9ea7a2">inkiiworks.de</a></p>
</div></body></html>`;
}

function buildCustomerHtml(d: InquiryMail): string {
  const itemsBlock = d.items && d.items.length > 0 ? buildItemsHtml(d.items) : `<div style="margin:18px 0;padding:18px;background:#fafbf9;border:1px solid #e8e8e6;border-radius:10px"><p style="margin:0 0 10px 0;font-size:11px;color:#7a857f;letter-spacing:.08em;text-transform:uppercase;font-weight:600">Ihre Anfrage</p><p style="margin:0 0 8px 0;font-size:14px;color:#1c2722"><b>${escapeHtml(d.subject)}</b></p><div style="font-size:13px;line-height:1.6;color:#5a6660;white-space:pre-wrap">${escapeHtml(d.message).replace(/\n/g, "<br/>")}</div></div>`;
  return `<!doctype html>
<html><body style="font-family:Arial,Helvetica,sans-serif;background:#f4f5f1;padding:24px;color:#1c2722;margin:0;">
<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e3e6df;">
${buildLogoBlock()}
<p style="margin:0 0 8px 0;color:#7a857f;font-size:11px;letter-spacing:.15em;text-transform:uppercase;">Bestätigung Ihrer Anfrage</p>
<h2 style="font-size:20px;margin:0 0 14px 0;color:#1c2722;font-weight:700;letter-spacing:-.01em">Vielen Dank, ${escapeHtml(d.name)}!</h2>
<p style="font-size:14px;line-height:1.65;color:#3b4540;margin:0 0 18px 0;">Wir haben Ihre Anfrage erhalten und melden uns innerhalb von <b>24 Stunden</b> mit einem persönlichen Angebot.</p>
${itemsBlock}
<div style="margin-top:24px;padding:18px;background:#1c2722;border-radius:10px;color:#fff">
<p style="margin:0 0 6px 0;font-size:11px;color:#9aa39e;letter-spacing:.1em;text-transform:uppercase;font-weight:600">Bei Rückfragen</p>
<p style="margin:0;font-size:15px;line-height:1.5"><b style="font-size:17px">+49 160 6767001</b><br/><a href="mailto:info@inkiiworks.de" style="color:#fff;text-decoration:underline">info@inkiiworks.de</a></p>
</div>
<p style="margin-top:22px;padding-top:14px;border-top:1px solid #e8e8e6;font-size:11px;color:#9ea7a2;line-height:1.5">INKII Works · Inh. Sener Kirli · Westuferstr. 25, 45356 Essen<br/><a href="${SITE_URL}" style="color:#9ea7a2">inkiiworks.de</a></p>
</div></body></html>`;
}

function buildAdminText(d: InquiryMail): string {
  const lines: string[] = [];
  lines.push(`Neue Anfrage über inkiiworks.de\n`);
  lines.push(`Name:    ${d.name}`);
  lines.push(`E-Mail:  ${d.email}`);
  if (d.phone) lines.push(`Telefon: ${d.phone}`);
  if (d.company) lines.push(`Firma:   ${d.company}`);
  lines.push("\n─────────────────────────────");
  lines.push(d.subject);
  lines.push("─────────────────────────────\n");
  lines.push(d.message);
  lines.push("\n─────────────────────────────");
  lines.push(`Antworten an: ${d.email}`);
  return lines.join("\n");
}

function buildCustomerText(d: InquiryMail): string {
  return (
    `Hallo ${d.name},\n\n` +
    `vielen Dank für Ihre Anfrage!\n\n` +
    `Wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden mit einem persönlichen Angebot.\n\n` +
    `Ihre Anfrage:\n${d.subject}\n\n${d.message}\n\n` +
    `Bei Rückfragen:\n+49 160 6767001 · info@inkiiworks.de\n\n` +
    `Mit freundlichen Grüßen\nIhr INKII Works Team\n` +
    `Westuferstr. 25, 45356 Essen · inkiiworks.de`
  );
}

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function makeTransporter() {
  const port = Number(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    // Vercel-Funktionen haben 10s Timeout im Free-Tier — wir setzen kürzere
    // SMTP-Timeouts, damit wir auch bei Verbindungsproblemen schnell
    // antworten können statt das Form-Submit hängen zu lassen.
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
}

export async function sendInquiryMail(d: InquiryMail): Promise<MailResult> {
  if (!isSmtpConfigured()) {
    console.warn("[mail] SMTP nicht konfiguriert");
    return { adminOk: false, customerOk: false, skipped: true };
  }
  const transporter = makeTransporter();
  const from = process.env.SMTP_FROM || `"INKII Works" <${process.env.SMTP_USER}>`;
  const adminTo = process.env.MAIL_ADMIN || process.env.SMTP_USER!;

  const result: MailResult = { adminOk: false, customerOk: false };

  try {
    await transporter.sendMail({
      from, to: adminTo, replyTo: d.email,
      subject: `[INKII] ${d.subject} — ${d.name}`,
      text: buildAdminText(d),
      html: buildAdminHtml(d),
    });
    result.adminOk = true;
    console.log(`[mail] Admin-Mail gesendet → ${adminTo}`);
  } catch (err: unknown) {
    result.adminError = err instanceof Error ? err.message : "SMTP-Fehler";
    console.warn("[mail] Admin-Mail fehlgeschlagen:", result.adminError);
  }

  // Kurze Pause zwischen den Mails — manche SMTP-Anbieter (z. B. IONOS)
  // werten zwei Mails in <1s als Burst und blocken die zweite mit
  // "450 Mail send limit exceeded".
  await new Promise((r) => setTimeout(r, 1500));

  try {
    await transporter.sendMail({
      from, to: d.email, replyTo: adminTo,
      subject: `Bestätigung Ihrer Anfrage | INKII Works`,
      text: buildCustomerText(d),
      html: buildCustomerHtml(d),
    });
    result.customerOk = true;
    console.log(`[mail] Kunden-Mail gesendet → ${d.email}`);
  } catch (err: unknown) {
    result.customerError = err instanceof Error ? err.message : "SMTP-Fehler";
    console.warn("[mail] Kunden-Mail fehlgeschlagen:", result.customerError);
  }

  return result;
}

export async function verifySmtp(): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) return { ok: false, error: "SMTP-Variablen fehlen" };
  try {
    const transporter = makeTransporter();
    await transporter.verify();
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Verbindungsfehler" };
  }
}
