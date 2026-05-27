"use server";

import { sendInquiryMail, type MailResult } from "@/lib/mail";

export async function sendTestMail(targetEmail: string): Promise<MailResult & { configured: boolean }> {
  const configured = Boolean(process.env.WEB3FORMS_ACCESS_KEY);
  if (!targetEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(targetEmail)) {
    return { configured, ok: false, error: "Ungültige E-Mail-Adresse." };
  }
  const result = await sendInquiryMail({
    name: "Mail-Test (Admin-Panel)",
    email: targetEmail,
    phone: "+49 160 6767001",
    company: "INKII Works",
    subject: "Mail-Test vom Admin-Panel",
    message:
      "Dies ist eine Test-Nachricht aus dem INKII-Admin-Panel.\n\n" +
      "Wenn der Versand funktioniert, erhalten Sie ZWEI Mails:\n" +
      "1) Eine Shop-Benachrichtigung an info@inkiiworks.de (Web3Forms-Hauptadresse)\n" +
      `2) Eine automatische Bestätigung an ${targetEmail} (Autoresponse)`,
  });
  return { ...result, configured };
}
