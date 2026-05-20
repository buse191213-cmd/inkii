"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type InquiryState = { ok: boolean; error?: string };

/** Speichert eine Kontaktanfrage in der Datenbank. */
export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !subject) {
    return { ok: false, error: "Bitte Name, E-Mail und Betreff ausfüllen." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." };
  }

  try {
    await db.inquiry.create({
      data: { name, email, phone, company, subject, message, status: "new" },
    });
    // Admin-Bereich aktualisieren, damit die neue Anfrage sofort erscheint
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }
}
