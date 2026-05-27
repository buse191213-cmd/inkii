// Verschickt Benachrichtigungs-Mails an info@inkiiworks.de
// wenn eine neue Anfrage (Kontakt-Formular oder Merkzettel) eintrifft.
//
// Nutzt Resend's REST-API direkt (kein npm-Paket nötig).
// Setup: in Vercel → Settings → Environment Variables:
//   RESEND_API_KEY  = re_xxxxxxxxxxxxx   (von resend.com/api-keys)
//   MAIL_FROM       = "INKII WORKS <noreply@inkiiworks.de>"  (optional, default onboarding@resend.dev)
//   MAIL_TO         = "info@inkiiworks.de"                   (optional, default = derselbe)
//
// Wenn RESEND_API_KEY fehlt, wird die Mail einfach übersprungen
// (Formular speichert trotzdem in die DB).

const ADMIN_MAIL = process.env.MAIL_TO || "info@inkiiworks.de";
const FROM = process.env.MAIL_FROM || "INKII WORKS <onboarding@resend.dev>";

type InquiryMail = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(d: InquiryMail): string {
  const msg = escapeHtml(d.message).replace(/\n/g, "<br/>");
  return `
<!doctype html>
<html><body style="font-family:Arial,sans-serif;background:#f4f5f1;padding:24px;color:#1c2722;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e3e6df;">
    <h2 style="font-size:18px;margin:0 0 4px 0;color:#1c2722;">Neue Anfrage über inkiiworks.de</h2>
    <p style="margin:0 0 24px 0;color:#7a857f;font-size:13px;">${escapeHtml(d.subject)}</p>
    <table style="width:100%;font-size:14px;line-height:1.6;">
      <tr><td style="color:#7a857f;width:110px;">Name</td><td><b>${escapeHtml(d.name)}</b></td></tr>
      <tr><td style="color:#7a857f;">E-Mail</td><td><a href="mailto:${escapeHtml(d.email)}" style="color:#1c2722;">${escapeHtml(d.email)}</a></td></tr>
      ${d.phone ? `<tr><td style="color:#7a857f;">Telefon</td><td><a href="tel:${escapeHtml(d.phone)}" style="color:#1c2722;">${escapeHtml(d.phone)}</a></td></tr>` : ""}
      ${d.company ? `<tr><td style="color:#7a857f;">Firma</td><td>${escapeHtml(d.company)}</td></tr>` : ""}
    </table>
    <div style="margin-top:24px;padding:20px;background:#fafbf9;border-radius:10px;font-size:14px;line-height:1.6;border:1px solid #e8e8e6;">
      ${msg}
    </div>
    <p style="margin-top:24px;font-size:11px;color:#9ea7a2;border-top:1px solid #e8e8e6;padding-top:14px;">
      Diese Nachricht stammt von einem Formular auf inkiiworks.de.
    </p>
  </div>
</body></html>`;
}

export async function sendInquiryMail(data: InquiryMail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Kein API-Key gesetzt → still überspringen, nicht den Submit blockieren
    console.warn("[mail] RESEND_API_KEY fehlt — Mail wird nicht gesendet.");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [ADMIN_MAIL],
        reply_to: data.email,
        subject: `${data.subject} — ${data.name}`,
        html: buildHtml(data),
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn("[mail] Resend-Antwort nicht ok:", res.status, txt);
    }
  } catch (err) {
    console.warn("[mail] Versand fehlgeschlagen:", err);
  }
}
