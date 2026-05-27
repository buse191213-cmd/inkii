// HINWEIS: Wegen Cloudflare-Bot-Protection (HTTP 403 "Just a moment...")
// kann Web3Forms NICHT vom Server aus aufgerufen werden.
// Wir nutzen jetzt browser-seitigen Versand via src/lib/mail-client.ts.
//
// Diese Datei bleibt als No-Op erhalten, damit bestehende Server-Actions
// (kontakt/actions.ts, merkzettel/actions.ts) ihre alten sendInquiryMail()-
// Aufrufe weiter machen können — sie tun jetzt nichts, der Versand passiert
// im Client-Code parallel zum Server-Action-Aufruf.

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

/** Server-Side ist Web3Forms nicht erreichbar (Cloudflare).
 *  Der Versand passiert browser-seitig — siehe lib/mail-client.ts. */
export async function sendInquiryMail(_data: InquiryMail): Promise<MailResult> {
  // Bewusst leer: Anfrage wird auf dem Client verschickt.
  // Dieses Modul existiert nur, damit bestehende Importe nicht brechen.
  return { ok: true, skipped: true };
}
