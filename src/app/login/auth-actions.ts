"use server";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword, setCustomerSession, clearCustomerSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function makeTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    // IONOS-tauglich: kurze Timeouts + neue Verbindung
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    pool: false,
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
  });
}

async function sendVerificationEmail(email: string, name: string, code: string): Promise<{ ok: boolean; error?: string }> {
  console.log(`[verify] Code für ${email}: ${code}`); // Vercel logs için
  if (!isSmtpConfigured()) {
    const err = "SMTP nicht konfiguriert (SMTP_HOST, SMTP_USER, SMTP_PASS fehlen)";
    console.warn("[mail]", err);
    return { ok: false, error: err };
  }
  try {
    const transporter = makeTransporter();
    const from = process.env.SMTP_FROM || `"INKII Works" <${process.env.SMTP_USER}>`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #004537 0%, #006b56 100%); padding: 30px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 22px;">INKII Works</h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 13px;">E-Mail Bestätigung</p>
        </div>
        <div style="padding: 32px 28px; background: #fff; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 15px; color: #1f2937; margin-top: 0;">Hallo ${name},</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            willkommen bei INKII Works! Bitte bestätigen Sie Ihre E-Mail-Adresse mit dem folgenden Code:
          </p>

          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background: #f0fdf4; border: 2px solid #004537; padding: 18px 36px; border-radius: 6px;">
              <div style="font-size: 36px; font-weight: 700; color: #004537; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Der Code ist 30 Minuten gültig. Falls Sie keine Registrierung vorgenommen haben,
            können Sie diese E-Mail ignorieren.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

          <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
            INKII WORKS · Sener Kirli<br>
            Westuferstr. 25 · 45356 Essen<br>
            USt-ID: DE353055316
          </p>
        </div>
      </div>
    `;
    await transporter.sendMail({
      from,
      to: email,
      subject: `INKII Works — Ihr Bestätigungscode: ${code}`,
      html,
      text: `Ihr Bestätigungscode: ${code}\n\nDer Code ist 30 Minuten gültig.\n\nINKII Works`,
    });
    console.log(`[mail] ✓ Verification email sent to ${email}`);
    return { ok: true };
  } catch (e) {
    const err = e instanceof Error ? e.message : "Unbekannter SMTP-Fehler";
    console.error(`[mail] ✗ Fehler beim Senden an ${email}:`, err);
    return { ok: false, error: err };
  }
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function loginCustomer(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isValidEmail(email)) return { ok: false, error: "Bitte gültige E-Mail eingeben." };
  if (!password) return { ok: false, error: "Passwort fehlt." };

  const customer = await db.customer.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!customer || !customer.password) {
    return { ok: false, error: "E-Mail oder Passwort ungültig." };
  }
  if (!customer.isActive) {
    return { ok: false, error: "Dieses Konto ist deaktiviert. Bitte kontaktieren Sie info@inkiiworks.de" };
  }
  if (!verifyPassword(password, customer.password)) {
    return { ok: false, error: "E-Mail oder Passwort ungültig." };
  }
  if (!customer.emailVerified) {
    return { ok: false, error: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihr Postfach." };
  }
  await setCustomerSession(customer.id);
  return { ok: true };
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  salutation: string;
  firstName: string;
  lastName: string;
  phone: string;
  firmname: string;
  ustId: string;
  billingStreet: string;
  billingZip: string;
  billingCity: string;
  billingCountry: string;
}): Promise<{ ok: true; email: string; mailSent: boolean; mailError?: string } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) return { ok: false, error: "Bitte gültige E-Mail eingeben." };
  if (input.password.length < 6) return { ok: false, error: "Passwort muss mindestens 6 Zeichen lang sein." };
  if (!input.firstName.trim() || !input.lastName.trim()) {
    return { ok: false, error: "Vor- und Nachname sind Pflicht." };
  }

  const existing = await db.customer.findUnique({ where: { email } });
  if (existing && existing.password && existing.emailVerified) {
    return { ok: false, error: "Diese E-Mail ist bereits registriert. Bitte einloggen." };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 Minuten

  if (existing) {
    // Update existing (Gast oder unverified)
    await db.customer.update({
      where: { id: existing.id },
      data: {
        password: hashPassword(input.password),
        salutation: input.salutation,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        firmname: input.firmname,
        ustId: input.ustId,
        billingStreet: input.billingStreet,
        billingZip: input.billingZip,
        billingCity: input.billingCity,
        billingCountry: input.billingCountry,
        isGuest: false,
        emailVerified: false,
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
      },
    });
  } else {
    await db.customer.create({
      data: {
        email,
        password: hashPassword(input.password),
        salutation: input.salutation,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        firmname: input.firmname,
        ustId: input.ustId,
        billingStreet: input.billingStreet,
        billingZip: input.billingZip,
        billingCity: input.billingCity,
        billingCountry: input.billingCountry,
        isGuest: false,
        emailVerified: false,
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
      },
    });
  }

  // Send code
  const mailResult = await sendVerificationEmail(email, `${input.firstName} ${input.lastName}`, code);

  return { ok: true, email, mailSent: mailResult.ok, mailError: mailResult.error };
}

export async function verifyEmailCode(
  email: string,
  code: string
): Promise<AuthResult> {
  const customer = await db.customer.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!customer) return { ok: false, error: "Konto nicht gefunden." };
  if (customer.emailVerified) {
    await setCustomerSession(customer.id);
    return { ok: true };
  }
  if (!customer.verificationCode || customer.verificationCode !== code.trim()) {
    return { ok: false, error: "Code ist falsch." };
  }
  if (!customer.verificationCodeExpiresAt || customer.verificationCodeExpiresAt < new Date()) {
    return { ok: false, error: "Code ist abgelaufen. Bitte neuen Code anfordern." };
  }
  await db.customer.update({
    where: { id: customer.id },
    data: {
      emailVerified: true,
      verificationCode: "",
      verificationCodeExpiresAt: null,
    },
  });
  await setCustomerSession(customer.id);
  return { ok: true };
}

export async function resendVerificationCode(email: string): Promise<AuthResult> {
  const customer = await db.customer.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!customer) return { ok: false, error: "Konto nicht gefunden." };
  if (customer.emailVerified) return { ok: false, error: "E-Mail ist bereits bestätigt." };

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await db.customer.update({
    where: { id: customer.id },
    data: { verificationCode: code, verificationCodeExpiresAt: expiresAt },
  });
  const result = await sendVerificationEmail(customer.email, `${customer.firstName} ${customer.lastName}`, code);
  if (!result.ok) {
    return { ok: false, error: `Code konnte nicht gesendet werden: ${result.error}` };
  }
  return { ok: true };
}

export async function logoutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
