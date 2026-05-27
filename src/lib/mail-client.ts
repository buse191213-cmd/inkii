/* Browser-seitiger Mail-Versand via Web3Forms.
 *
 * Wichtig: Web3Forms steht hinter Cloudflare und blockiert Server-Side-Requests
 * (HTTP 403 "Just a moment..."). Vom Browser aus geht es problemlos durch.
 *
 * Der Access-Key ist KEIN Secret — er ist nur ein Routing-Identifier, kann
 * öffentlich im Client-Code stehen. Deshalb in NEXT_PUBLIC_ Variable.
 *
 * Setup (in Vercel + lokaler .env):
 *   NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */

const ENDPOINT = "https://api.web3forms.com/submit";

export type ClientMailInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
};

export type ClientMailResult = {
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

function buildShopHtml(d: ClientMailInput): string {
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
</div></body></html>`;
}

function buildCustomerText(d: ClientMailInput): string {
  return (
    `Hallo ${d.name},\n\n` +
    `vielen Dank für Ihre Anfrage!\n\n` +
    `Wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden ` +
    `mit einem persönlichen Angebot.\n\n` +
    `Ihre Anfrage:\n${d.subject}\n\n${d.message}\n\n` +
    `Bei Rückfragen:\n+49 160 6767001 · info@inkiiworks.de\n\n` +
    `Mit freundlichen Grüßen\nIhr INKII Works Team\n` +
    `Westuferstr. 25, 45356 Essen · inkiiworks.de`
  );
}

/** Schickt die Anfrage direkt aus dem Browser an Web3Forms.
 *  - Shop-Mail an die Access-Key-Adresse (info@inkiiworks.de)
 *  - Autoresponse-Bestätigung an d.email (NUR wenn im Web3Forms-Dashboard
 *    unter Settings → Auto-Response der Toggle aktiviert ist)
 *  Wirft keine Errors. */
export async function sendInquiryFromBrowser(
  d: ClientMailInput
): Promise<ClientMailResult> {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return { ok: false, skipped: true };
  }

  // Sauberer Text-Body — Web3Forms rendert das im Standard-Template direkt.
  const lines: string[] = [];
  lines.push(`Neue Anfrage über inkiiworks.de`);
  lines.push("");
  lines.push(`Name:    ${d.name}`);
  lines.push(`E-Mail:  ${d.email}`);
  if (d.phone) lines.push(`Telefon: ${d.phone}`);
  if (d.company) lines.push(`Firma:   ${d.company}`);
  lines.push("");
  lines.push("─────────────────────────────");
  lines.push(d.subject);
  lines.push("─────────────────────────────");
  lines.push("");
  lines.push(d.message);
  lines.push("");
  lines.push("─────────────────────────────");
  lines.push(`Antworten an: ${d.email}`);
  const fullMessage = lines.join("\n");

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `[INKII] ${d.subject} — ${d.name}`,
        from_name: "INKII Website",
        replyto: d.email,
        // Kunden-Daten — Web3Forms-Standard-Template zeigt sie automatisch an
        name: d.name,
        email: d.email,
        phone: d.phone || "",
        company: d.company || "",
        // Hauptinhalt
        message: fullMessage,
        // Auto-Response (Toggle muss im Web3Forms-Dashboard aktiv sein)
        autoresponse_subject: "Bestätigung Ihrer Anfrage | INKII Works",
        autoresponse_message: buildCustomerText(d),
        botcheck: "",
      }),
    });
    const rawText = await res.text();
    let parsed: { success?: boolean; message?: string } = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { message: rawText.slice(0, 160) };
    }
    if (res.ok && parsed.success) {
      return { ok: true };
    }
    return {
      ok: false,
      error: `HTTP ${res.status}: ${parsed.message || "Web3Forms-Fehler"}`,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Netzwerkfehler",
    };
  }
}
