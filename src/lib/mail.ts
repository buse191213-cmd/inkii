// Verschickt Benachrichtigungs-Mails an den Shop-Inhaber UND eine
// automatische Bestätigung an den Kunden — beides via Web3Forms.
//
// Setup (3 Schritte):
//   1. https://web3forms.com → E-Mail (info@inkiiworks.de) eingeben → Access-Key
//      kommt sofort per Mail. Bestätigungslink in dieser Mail KLICKEN, sonst
//      bleibt der Key inaktiv.
//   2. In Vercel → Settings → Environment Variables eintragen:
//        WEB3FORMS_ACCESS_KEY = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//   3. Im Web3Forms-Dashboard unter "Settings" → "Allowed Domains"
//      die Vercel-Domain hinzufügen (z. B. inkii.vercel.app, inkiiworks.de).
//
// Nach jedem ENV-Update muss Vercel REDEPLOYED werden (Deployments → ⋯ → Redeploy).
//
// Wenn WEB3FORMS_ACCESS_KEY fehlt, wird die Mail einfach übersprungen
// (Formular speichert trotzdem in die DB; Admin sieht sie unter /admin/inquiries).

const ENDPOINT = "https://api.web3forms.com/submit";
const SHOP_TO = process.env.WEB3FORMS_TO || "info@inkiiworks.de";
const SHOP_NAME = "INKII Works";

type InquiryMail = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
};

export type MailResult = {
  shopOk: boolean;
  customerOk: boolean;
  shopError?: string;
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

/** HTML-Body für die Shop-Benachrichtigung (geht an info@inkiiworks.de). */
function buildShopHtml(d: InquiryMail): string {
  const msg = escapeHtml(d.message).replace(/\n/g, "<br/>");
  return `
<!doctype html>
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
    <a href="mailto:${escapeHtml(d.email)}?subject=Re:%20${encodeURIComponent(d.subject)}" style="display:inline-block;margin-top:20px;padding:11px 22px;background:#1c2722;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:.04em;">Antworten →</a>
    <p style="margin-top:22px;font-size:11px;color:#9ea7a2;border-top:1px solid #e8e8e6;padding-top:14px;">Antworten gehen direkt an ${escapeHtml(d.email)}.</p>
  </div>
</body></html>`;
}

/** HTML-Body für die Kundenbestätigung. */
function buildCustomerHtml(d: InquiryMail): string {
  const msg = escapeHtml(d.message).replace(/\n/g, "<br/>");
  return `
<!doctype html>
<html><body style="font-family:Arial,sans-serif;background:#f4f5f1;padding:24px;color:#1c2722;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e3e6df;">
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:800;letter-spacing:.15em;color:#1c2722;margin-bottom:4px;">INKII</div>
    <p style="margin:0 0 22px 0;color:#7a857f;font-size:11px;letter-spacing:.15em;text-transform:uppercase;">Bestätigung Ihrer Anfrage</p>
    <h2 style="font-size:18px;margin:0 0 14px 0;color:#1c2722;">Vielen Dank, ${escapeHtml(d.name)}!</h2>
    <p style="font-size:14px;line-height:1.65;color:#3b4540;margin:0 0 18px 0;">
      Wir haben Ihre Anfrage erhalten und melden uns innerhalb von <b>24 Stunden</b> mit einem persönlichen Angebot.
    </p>
    <div style="background:#fafbf9;border:1px solid #e8e8e6;border-radius:10px;padding:18px;margin:18px 0;">
      <p style="margin:0 0 10px 0;font-size:12px;color:#7a857f;letter-spacing:.08em;text-transform:uppercase;font-weight:600;">Ihre Anfrage</p>
      <p style="margin:0 0 8px 0;font-size:14px;color:#1c2722;"><b>${escapeHtml(d.subject)}</b></p>
      <div style="font-size:13px;line-height:1.6;color:#5a6660;white-space:pre-wrap;">${msg}</div>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#5a6660;margin:18px 0 0 0;">
      Bei Rückfragen erreichen Sie uns direkt:<br/>
      <b>+49 160 6767001</b> · <a href="mailto:info@inkiiworks.de" style="color:#1c2722;">info@inkiiworks.de</a>
    </p>
    <p style="margin-top:24px;font-size:11px;color:#9ea7a2;border-top:1px solid #e8e8e6;padding-top:14px;line-height:1.5;">
      INKII Works · Westuferstr. 25, 45356 Essen · <a href="https://inkiiworks.de" style="color:#9ea7a2;">inkiiworks.de</a>
    </p>
  </div>
</body></html>`;
}

/** Sendet eine einzelne Mail via Web3Forms. */
async function sendOne(
  accessKey: string,
  payload: Record<string, string>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ access_key: accessKey, ...payload }),
    });
    const json: { success?: boolean; message?: string } = await res
      .json()
      .catch(() => ({}));
    if (res.ok && json.success) {
      return { ok: true };
    }
    return {
      ok: false,
      error: `HTTP ${res.status}: ${json.message ?? "Unbekannter Fehler"}`,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Netzwerkfehler",
    };
  }
}

/** Verschickt sowohl Shop-Benachrichtigung als auch Kundenbestätigung.
 *  Wirft KEINE Errors — Probleme blockieren das Formular nicht. */
export async function sendInquiryMail(data: InquiryMail): Promise<MailResult> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.warn("[mail] WEB3FORMS_ACCESS_KEY fehlt — Mail wird übersprungen.");
    return { shopOk: false, customerOk: false, skipped: true };
  }

  const result: MailResult = { shopOk: false, customerOk: false };

  // 1) Mail an Shop (Admin sieht alle Details)
  const shopRes = await sendOne(accessKey, {
    to: SHOP_TO,
    from_name: "INKII Website",
    replyto: data.email,
    subject: `[INKII] ${data.subject} — ${data.name}`,
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    company: data.company || "",
    message: data.message,
    html: buildShopHtml(data),
    botcheck: "",
  });
  result.shopOk = shopRes.ok;
  if (!shopRes.ok) {
    result.shopError = shopRes.error;
    console.warn("[mail] Shop-Mail fehlgeschlagen:", shopRes.error);
  } else {
    console.log("[mail] Shop-Mail an", SHOP_TO, "gesendet.");
  }

  // 2) Bestätigungs-Mail an Kunden
  const customerRes = await sendOne(accessKey, {
    to: data.email,
    from_name: SHOP_NAME,
    replyto: SHOP_TO,
    subject: `Bestätigung: ${data.subject} | INKII Works`,
    name: SHOP_NAME,
    email: SHOP_TO,
    message: `Vielen Dank für Ihre Anfrage, ${data.name}!\n\nWir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden mit einem persönlichen Angebot.\n\nIhre Anfrage:\n${data.message}\n\n— INKII Works\n+49 160 6767001 · info@inkiiworks.de`,
    html: buildCustomerHtml(data),
    botcheck: "",
  });
  result.customerOk = customerRes.ok;
  if (!customerRes.ok) {
    result.customerError = customerRes.error;
    console.warn("[mail] Kunden-Mail fehlgeschlagen:", customerRes.error);
  } else {
    console.log("[mail] Kunden-Mail an", data.email, "gesendet.");
  }

  return result;
}
