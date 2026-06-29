"use server";

import { db } from "@/lib/db";
import { getCurrentCustomerId, verifyPassword, hashPassword, clearCustomerSession } from "@/lib/customer-auth";
import { revalidatePath } from "next/cache";

export type ProfileUpdate = {
  salutation: string;
  firstName: string;
  lastName: string;
  phone: string;
  firmname: string;
  ustId: string;
};

export async function updateProfile(data: ProfileUpdate): Promise<{ ok: boolean; error?: string }> {
  try {
    const id = await getCurrentCustomerId();
    if (!id) return { ok: false, error: "Nicht angemeldet" };
    if (!data.firstName.trim() || !data.lastName.trim()) {
      return { ok: false, error: "Vor- und Nachname sind Pflicht." };
    }
    await db.customer.update({
      where: { id },
      data: {
        salutation: data.salutation,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        firmname: data.firmname.trim(),
        ustId: data.ustId.trim(),
      },
    });
    revalidatePath("/konto");
    revalidatePath("/konto/profil");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}

export type AddressUpdate = {
  billingStreet: string;
  billingZip: string;
  billingCity: string;
  billingCountry: string;
  shippingDiffers: boolean;
  shippingStreet: string;
  shippingZip: string;
  shippingCity: string;
  shippingCountry: string;
};

export async function updateAddress(data: AddressUpdate): Promise<{ ok: boolean; error?: string }> {
  try {
    const id = await getCurrentCustomerId();
    if (!id) return { ok: false, error: "Nicht angemeldet" };
    if (!data.billingStreet.trim() || !data.billingZip.trim() || !data.billingCity.trim()) {
      return { ok: false, error: "Rechnungsadresse ist Pflicht." };
    }
    await db.customer.update({
      where: { id },
      data: {
        billingStreet: data.billingStreet.trim(),
        billingZip: data.billingZip.trim(),
        billingCity: data.billingCity.trim(),
        billingCountry: data.billingCountry,
        shippingDiffers: data.shippingDiffers,
        shippingStreet: data.shippingDiffers ? data.shippingStreet.trim() : "",
        shippingZip: data.shippingDiffers ? data.shippingZip.trim() : "",
        shippingCity: data.shippingDiffers ? data.shippingCity.trim() : "",
        shippingCountry: data.shippingDiffers ? data.shippingCountry : "DE",
      },
    });
    revalidatePath("/konto/adressen");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const id = await getCurrentCustomerId();
    if (!id) return { ok: false, error: "Nicht angemeldet" };
    if (newPassword.length < 6) return { ok: false, error: "Neues Passwort muss mindestens 6 Zeichen lang sein." };

    const customer = await db.customer.findUnique({ where: { id } });
    if (!customer || !customer.password) return { ok: false, error: "Konto nicht gefunden" };

    if (!verifyPassword(currentPassword, customer.password)) {
      return { ok: false, error: "Aktuelles Passwort ist falsch." };
    }

    await db.customer.update({
      where: { id },
      data: { password: hashPassword(newPassword) },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}

export async function deactivateAccount(password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const id = await getCurrentCustomerId();
    if (!id) return { ok: false, error: "Nicht angemeldet" };

    const customer = await db.customer.findUnique({ where: { id } });
    if (!customer || !customer.password) return { ok: false, error: "Konto nicht gefunden" };

    if (!verifyPassword(password, customer.password)) {
      return { ok: false, error: "Passwort ist falsch." };
    }

    await db.customer.update({
      where: { id },
      data: { isActive: false },
    });
    await clearCustomerSession();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
