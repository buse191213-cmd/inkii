"use server";

import { sendInquiryMail, verifySmtp, type MailResult } from "@/lib/mail";

export async function getSmtpStatus(): Promise<{
  configured: boolean;
  host?: string;
  port?: string;
  user?: string;
  from?: string;
  admin?: string;
  verifyOk?: boolean;
  verifyError?: string;
}> {
  const configured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
  if (!configured) return { configured };
  const verify = await verifySmtp();
  return {
    configured,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
    admin: process.env.MAIL_ADMIN || process.env.SMTP_USER,
    verifyOk: verify.ok,
    verifyError: verify.error,
  };
}

export async function sendTestMail(targetEmail: string): Promise<MailResult> {
  if (!targetEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(targetEmail)) {
    return { adminOk: false, customerOk: false, adminError: "Ungültige E-Mail-Adresse." };
  }
  return await sendInquiryMail({
    name: "Mail-Test (Admin-Panel)",
    email: targetEmail,
    phone: "+49 160 6767001",
    company: "INKII Works",
    subject: "Mail-Test vom Admin-Panel",
    message:
      "Dies ist eine Test-Nachricht über IONOS SMTP.\n\n" +
      "Wenn alles funktioniert, erhalten Sie ZWEI Mails:\n" +
      "1) Shop-Benachrichtigung an info@inkiiworks.de\n" +
      `2) Kunden-Bestätigung an ${targetEmail}`,
  });
}
