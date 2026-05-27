// Mail-Versand via Web3Forms.
//
// WICHTIG: Web3Forms ignoriert das "to"-Feld — Mails gehen IMMER an die
// E-Mail, mit der der Access-Key registriert wurde (info@inkiiworks.de).
// Für die Kunden-Bestätigung nutzen wir die offizielle Autoresponse-Funktion:
// Web3Forms verschickt dann automatisch eine zweite Mail an die im Formular
// angegebene E-Mail (data.email).
//
// Setup (3 Schritte):
//   1. https://web3forms.com → "Create Access Key" → Mail eingeben
//      (z. B. info@inkiiworks.de). Key kommt sofort.
//   2. Bestätigungsmail im Postfach klicken (sonst bleibt der Key inaktiv!).
//   3. In Vercel → Settings → Environment Variables:
//        WEB3FORMS_ACCESS_KEY = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//      Danach Vercel → Deployments → letzten Eintrag → ⋯ → Redeploy.

const ENDPOINT = "https://api.web3forms.com/submit";

type InquiryMail = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
};

export type MailResult = {
  ok: boolean;
  error?: string;
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

/** Bestätigungs-Mail (Plain-Text) für den Kunden — Web3Forms versendet sie
 *  über das Autoresponse-Feature automatisch an data.email. */
function buildCustomerText(d: InquiryMail): string {
  return (
    `Hallo ${d.name},\n\n` +
    `vielen Dank für Ihre Anfrage!\n\n` +
    `Wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden ` +
    `mit einem persönlichen Angebot.\n\n` +
    `Ihre Anfrage:\n` +
    `${d.subject}\n\n` +
    `${d.message}\n\n` +
    `Bei Rückfragen erreichen Sie uns direkt:\n` +
    `+49 160 6767001 · info@inkiiworks.de\n\n` +
    `Mit freundlichen Grüßen\n` +
    `Ihr INKII Works Team\n` +
    `Westuferstr. 25, 45356 Essen\n` +
    `inkiiworks.de`
  );
}

/** HTML-Body für die Shop-Benachrichtigung. */
function buildShopHtml(d: InquiryMail): string {
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
${d.phone ? `<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">Telefon</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;"><a href="tel:${escapeHtml(d.phone)}" style="color:#1c2722;text-decoration:none;">${escapeHtml(d.phone)}</a></td></tr>` : ""}
${d.company ? `<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">Firma</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;">${escapeHtml(d.company)}</td></tr>` : ""}
</table>
<div style="margin-top:22px;padding:20px;background:#fafbf9;border-radius:10px;font-size:14px;line-height:1.65;border:1px solid #e8e8e6;white-space:pre-wrap;">${msg}</div>
<a href="mailto:${escapeHtml(d.email)}?subject=Re:%20${encodeURIComponent(d.subject)}" style="display:inline-block;margin-top:20px;padding:11px 22px;background:#1c2722;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:.04em;">Antworten</a>
</div></body></html>`;
}

/** Verschickt eine Submission an Web3Forms:
 *  - Admin-Mail an info@inkiiworks.de (Empfänger des Access-Keys)
 *  - Autoresponse-Bestätigung an den Kunden (data.email)
 *  Wirft KEINE Errors. */
export async function sendInquiryMail(data: InquiryMail): Promise<MailResult> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.warn("[mail] WEB3FORMS_ACCESS_KEY fehlt — Mail übersprungen.");
    return { ok: false, skipped: true };
  }

  try {
    const body = {
      access_key: accessKey,
      subject: `[INKII] ${data.subject} — ${data.name}`,
      from_name: "INKII Website",
      replyto: data.email,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      company: data.company || "",
      message: data.message,
      html: buildShopHtml(data),
      // Web3Forms Autoresponse → 2. Mail an data.email
      autoresponse_subject: "Bestätigung Ihrer Anfrage | INKII Works",
      autoresponse_message: buildCustomerText(data),
      botcheck: "",
    };

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Web3Forms macht eine Origin-Check, wenn Allowed Domains gesetzt sind.
        // Server-side fetch sendet keinen Origin — wir setzen ihn manuell.
        Origin: process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "https://inkii.vercel.app",
      },
      body: JSON.stringify(body),
    });

    // Web3Forms gibt bei Fehlern manchmal Plain-Text statt JSON zurück.
    // Beide Wege absichern.
    const rawText = await res.text();
    let parsed: { success?: boolean; message?: string } = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { message: rawText.slice(0, 200) };
    }

    if (res.ok && parsed.success) {
      console.log(`[mail] Versand OK → Admin & Auto-Reply an ${data.email}`);
      return { ok: true };
    }
    const errorMsg = `HTTP ${res.status}: ${parsed.message || rawText.slice(0, 120) || "Web3Forms-Fehler"}`;
    console.warn("[mail] Web3Forms:", errorMsg);
    return { ok: false, error: errorMsg };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Netzwerkfehler";
    console.warn("[mail] Netzwerkfehler:", msg);
    return { ok: false, error: msg };
  }
}
