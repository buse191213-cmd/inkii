"use server";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword, setCustomerSession, clearCustomerSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

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
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) return { ok: false, error: "Bitte gültige E-Mail eingeben." };
  if (input.password.length < 6) return { ok: false, error: "Passwort muss mindestens 6 Zeichen lang sein." };
  if (!input.firstName.trim() || !input.lastName.trim()) {
    return { ok: false, error: "Vor- und Nachname sind Pflicht." };
  }

  // Email zaten kayıtlı mı?
  const existing = await db.customer.findUnique({ where: { email } });
  if (existing && existing.password) {
    return { ok: false, error: "Diese E-Mail ist bereits registriert. Bitte einloggen." };
  }

  // Gast olarak varsa → şifre ekle, hesap'a çevir
  if (existing) {
    const updated = await db.customer.update({
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
      },
    });
    await setCustomerSession(updated.id);
    return { ok: true };
  }

  // Yeni müşteri oluştur
  const customer = await db.customer.create({
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
    },
  });
  await setCustomerSession(customer.id);
  return { ok: true };
}

export async function logoutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
