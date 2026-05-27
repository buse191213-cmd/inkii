// Verschickt Benachrichtigungs-Mails an info@inkiiworks.de
// wenn eine neue Anfrage (Kontakt-Formular oder Merkzettel) eintrifft.
//
// Nutzt Web3Forms — keine Domain-Verifikation, keine Server-Konfiguration nötig.
// Setup:
//   1. https://web3forms.com aufrufen, E-Mail (info@inkiiworks.de) eingeben.
//   2. Access-Key wird per Mail zugesandt (sofort).
//   3. In Vercel → Settings → Environment Variables eintragen:
//        WEB3FORMS_ACCESS_KEY = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//   4. (Optional) WEB3FORMS_TO = info@inkiiworks.de   — Empfänger
//
// Wenn WEB3FORMS_ACCESS_KEY fehlt, wird die Mail einfach übersprungen
// (Formular speichert trotzdem in die DB, Admin sieht sie unter /admin/inquiries).

const ENDPOINT = "https://api.web3forms.com/submit";
const TO = process.env.WEB3FORMS_TO || "info@inkiiworks.de";

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

/** Baut den HTML-Body der Mail im INKII-Design auf. */
function buildHtml(d: InquiryMail): string {
  const msg = escapeHtml(d.message).replace(/\n/g, "<br/>");
  return `
<!doctype html>
<html><body style="font-family:Arial,sans-serif;background:#f4f5f1;padding:24px;color:#1c2722;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e3e6df;">
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:800;letter-spacing:.15em;color:#1c2722;margin-bottom:4px;">INKII</div>
    <p style="margin:0 0 22px 0;color:#7a857f;font-size:11px;letter-spacing:.15em;text-transform:uppercase;">Neue Anfrage über inkiiworks.de</p>
    <h2 style="font-size:17px;margin:0 0 18px 0;color:#1c2722;">${escapeHtml(d.subject)}</h2>
    <table style="width:100%;font-size:14px;line-height:1.6;border-collapse:collapse;">
      <tr><td style="color:#7a857f;width:110px;padding:6px 0;border-bottom:1px solid #f0f0ec;">Name</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;"><b>${escapeHtml(d.name)}</b></td></tr>
      <tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">E-Mail</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;"><a href="mailto:${escapeHtml(d.email)}" style="color:#1c2722;text-decoration:none;">${escapeHtml(d.email)}</a></td></tr>
      ${d.phone ? `<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">Telefon</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;"><a href="tel:${escapeHtml(d.phone)}" style="color:#1c2722;text-decoration:none;">${escapeHtml(d.phone)}</a></td></tr>` : ""}
      ${d.company ? `<tr><td style="color:#7a857f;padding:6px 0;border-bottom:1px solid #f0f0ec;">Firma</td><td style="padding:6px 0;border-bottom:1px solid #f0f0ec;">${escapeHtml(d.company)}</td></tr>` : ""}
    </table>
    <div style="margin-top:22px;padding:20px;background:#fafbf9;border-radius:10px;font-size:14px;line-height:1.65;border:1px solid #e8e8e6;white-space:pre-wrap;">
${msg}
    </div>
    <a href="mailto:${escapeHtml(d.email)}?subject=Re:%20${encodeURIComponent(d.subject)}" style="display:inline-block;margin-top:20px;padding:11px 22px;background:#1c2722;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:.04em;">Antworten →</a>
    <p style="margin-top:22px;font-size:11px;color:#9ea7a2;border-top:1px solid #e8e8e6;padding-top:14px;">
      Diese Nachricht wurde von einem Formular auf inkiiworks.de versendet.
      Antworten gehen direkt an ${escapeHtml(d.email)}.
    </p>
  </div>
</body></html>`;
}

/** Sendet die Anfrage-Benachrichtigung via Web3Forms. Wirft KEINE Errors,
 *  damit ein Mailproblem das Formular nicht blockiert. */
export async function sendInquiryMail(data: InquiryMail): Promise<void> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.warn("[mail] WEB3FORMS_ACCESS_KEY fehlt — Mail wird übersprungen.");
    return;
  }

  // Aussagekräftiger Titel im Posteingang
  const titledSubject = `${data.subject} — ${data.name}`;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        // Empfänger steht im Web3Forms-Dashboard hinterlegt — TO ist nur informativ
        to: TO,
        // Antworten landen direkt beim Kunden
        replyto: data.email,
        from_name: "INKII Website",
        // Diese Felder erscheinen im Web3Forms-Dashboard / Mailbody
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        company: data.company || "",
        subject: titledSubject,
        // Plain-Text-Version (für Mailclients ohne HTML)
        message: data.message,
        // HTML-Variante für schöne Darstellung
        html: buildHtml(data),
        // Bot-Schutz: Web3Forms blockt verdächtige Submissions automatisch
        botcheck: "",
      }),
    });

    const json: { success?: boolean; message?: string } = await res
      .json()
      .catch(() => ({}));

    if (!res.ok || !json.success) {
      console.warn("[mail] Web3Forms-Antwort nicht ok:", res.status, json.message ?? "");
    }
  } catch (err) {
    console.warn("[mail] Versand fehlgeschlagen:", err);
  }
}
