"use server";

import { sendInquiryMail, type MailResult } from "@/lib/mail";

export async function sendTestMail(targetEmail: string): Promise<MailResult & { configured: boolean }> {
  const configured = Boolean(process.env.WEB3FORMS_ACCESS_KEY);
  if (!targetEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(targetEmail)) {
    return { configured, shopOk: false, customerOk: false, shopError: "Ungültige E-Mail-Adresse." };
  }
  const result = await sendInquiryMail({
    name: "Mail-Test (Admin)",
    email: targetEmail,
    phone: "+49 160 6767001",
    company: "INKII Works",
    subject: "Mail-Test vom Admin-Panel",
    message:
      "Dies ist eine Test-Nachricht aus dem INKII-Admin-Panel.\n\n" +
      "Wenn Sie diese Mail erhalten haben, ist der Mail-Versand über Web3Forms korrekt konfiguriert.\n\n" +
      "Es werden zwei Mails verschickt:\n" +
      "1) Diese an info@inkiiworks.de (Shop-Benachrichtigung)\n" +
      "2) Eine zweite Bestätigung an die unten angegebene Kunden-Adresse",
  });
  return { ...result, configured };
}
