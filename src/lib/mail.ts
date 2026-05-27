// Mail-Versand via IONOS SMTP (nodemailer).
//
// Verschickt zwei Mails parallel:
//   1) Admin-Benachrichtigung an info@inkiiworks.de
//   2) Bestätigung an den Kunden
//
// Beide kommen vom verifizierten Absender info@inkiiworks.de — professionelle
// Zustellung, kein Drittanbieter-Branding, kein Spam-Risiko.
//
// Setup in Vercel → Environment Variables (Production + Preview + Development):
//   SMTP_HOST=smtp.ionos.de          (oder smtp.ionos.com, smtp.1und1.de)
//   SMTP_PORT=465                    (SSL) — alternativ 587 (STARTTLS)
//   SMTP_USER=info@inkiiworks.de     (vollständige Mail-Adresse)
//   SMTP_PASS=...                    (Passwort des Mail-Postfachs)
//   SMTP_FROM="INKII Works <info@inkiiworks.de>"
//   MAIL_ADMIN=info@inkiiworks.de    (Empfänger der Admin-Benachrichtigung)

import nodemailer from "nodemailer";

type InquiryMail = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
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

function buildAdminHtml(d: InquiryMail): string {
  const msg = escapeHtml(d.message).replace(/\n/g, "<br/>");
  return `<!doctype html>
<html><body style="font-family:Arial,sans-serif;background:#f4f5f1;padding:24px;color:#1c2722;margin:0;">
<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e3e6df;">
<div style="font-family:Georgia,serif;font-size:22px;font-weight:800;letter-spacing:.15em;color:#1c2722;margin-bottom:4px;">INKII</div>
<p style="margin:0 0 22px 0;color:#7a857f;font-size:11px;letter-spacing:.15em;text-transform:uppercase;">Neue Anfrage über inkiiworks.de</p>
<h2 style="font-size:17px;margin:0 0 18px 0;color:#1c2722;">${escapeHtml(d.subject)}</h2>
<table style="width:100%;font-size:14px;line-height:1.6;border-collapse:collapse;">
<tr><td style="color:#7a857f;width:110px;padding:6px 0;border-bottom:1px solid #f0f0ec;">Name</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;"><b>${escapeHtml(d.name)}</b></td></tr>
<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">E-Mail</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;"><a href="mailto:${escapeHtml(d.email)}" style="color:#1c2722;text-decoration:none;">${escapeHtml(d.email)}</a></td></tr>
${d.phone ? `<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">Telefon</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;">${escapeHtml(d.phone)}</td></tr>` : ""}
${d.company ? `<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">Firma</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;">${escapeHtml(d.company)}</td></tr>` : ""}
</table>
<div style="margin-top:22px;padding:20px;background:#fafbf9;border-radius:10px;font-size:14px;line-height:1.65;border:1px solid #e8e8e6;white-space:pre-wrap;">${msg}</div>
<a href="mailto:${escapeHtml(d.email)}?subject=Re:%20${encodeURIComponent(d.subject)}" style="display:inline-block;margin-top:20px;padding:11px 22px;background:#1c2722;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:.04em;">Antworten</a>
</div></body></html>`;
}

function buildCustomerHtml(d: InquiryMail): string {
  const msg = escapeHtml(d.message).replace(/\n/g, "<br/>");
  return `<!doctype html>
<html><body style="font-family:Arial,sans-serif;background:#f4f5f1;padding:24px;color:#1c2722;margin:0;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e3e6df;">
<div style="font-family:Georgia,serif;font-size:22px;font-weight:800;letter-spacing:.15em;color:#1c2722;margin-bottom:4px;">INKII</div>
<p style="margin:0 0 22px 0;color:#7a857f;font-size:11px;letter-spacing:.15em;text-transform:uppercase;">Bestätigung Ihrer Anfrage</p>
<h2 style="font-size:18px;margin:0 0 14px 0;color:#1c2722;">Vielen Dank, ${escapeHtml(d.name)}!</h2>
<p style="font-size:14px;line-height:1.65;color:#3b4540;margin:0 0 18px 0;">Wir haben Ihre Anfrage erhalten und melden uns innerhalb von <b>24 Stunden</b> mit einem persönlichen Angebot.</p>
<div style="background:#fafbf9;border:1px solid #e8e8e6;border-radius:10px;padding:18px;margin:18px 0;">
<p style="margin:0 0 10px 0;font-size:12px;color:#7a857f;letter-spacing:.08em;text-transform:uppercase;font-weight:600;">Ihre Anfrage</p>
<p style="margin:0 0 8px 0;font-size:14px;color:#1c2722;"><b>${escapeHtml(d.subject)}</b></p>
<div style="font-size:13px;line-height:1.6;color:#5a6660;white-space:pre-wrap;">${msg}</div>
</div>
<p style="font-size:13px;line-height:1.6;color:#5a6660;margin:18px 0 0 0;">Bei Rückfragen erreichen Sie uns direkt:<br/><b>+49 160 6767001</b> · <a href="mailto:info@inkiiworks.de" style="color:#1c2722;">info@inkiiworks.de</a></p>
<p style="margin-top:24px;font-size:11px;color:#9ea7a2;border-top:1px solid #e8e8e6;padding-top:14px;line-height:1.5;">INKII Works · Inh. Sener Kirli · Westuferstr. 25, 45356 Essen · <a href="https://inkiiworks.de" style="color:#9ea7a2;">inkiiworks.de</a></p>
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
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
}

/** Verschickt Admin- und Kunden-Mail über IONOS SMTP. */
export async function sendInquiryMail(d: InquiryMail): Promise<MailResult> {
  if (!isSmtpConfigured()) {
    console.warn("[mail] SMTP nicht konfiguriert — übersprungen");
    return { adminOk: false, customerOk: false, skipped: true };
  }
  const transporter = makeTransporter();
  const from = process.env.SMTP_FROM || `"INKII Works" <${process.env.SMTP_USER}>`;
  const adminTo = process.env.MAIL_ADMIN || process.env.SMTP_USER!;

  const result: MailResult = { adminOk: false, customerOk: false };

  // 1) Admin-Benachrichtigung
  try {
    await transporter.sendMail({
      from,
      to: adminTo,
      replyTo: d.email, // "Antworten" → direkt an Kunden
      subject: `[INKII] ${d.subject} — ${d.name}`,
      text: buildAdminText(d),
      html: buildAdminHtml(d),
    });
    result.adminOk = true;
  } catch (err: unknown) {
    result.adminError = err instanceof Error ? err.message : "SMTP-Fehler";
    console.warn("[mail] Admin-Mail fehlgeschlagen:", result.adminError);
  }

  // 2) Kunden-Bestätigung
  try {
    await transporter.sendMail({
      from,
      to: d.email,
      replyTo: adminTo,
      subject: `Bestätigung Ihrer Anfrage | INKII Works`,
      text: buildCustomerText(d),
      html: buildCustomerHtml(d),
    });
    result.customerOk = true;
  } catch (err: unknown) {
    result.customerError = err instanceof Error ? err.message : "SMTP-Fehler";
    console.warn("[mail] Kunden-Mail fehlgeschlagen:", result.customerError);
  }

  return result;
}

/** Verifiziert die SMTP-Verbindung (für den Test-Button im Admin-Panel). */
export async function verifySmtp(): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "SMTP-Variablen fehlen" };
  }
  try {
    const transporter = makeTransporter();
    await transporter.verify();
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Verbindungsfehler" };
  }
}
