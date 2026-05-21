"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type InquiryState = { ok: boolean; error?: string };

/** Speichert eine Kontaktanfrage in der Datenbank.
 *  Felder (Vorname/Nachname/Projekttyp/Budget/Projektfrist) werden im
 *  vorhandenen Schema kombiniert: Vor- + Nachname zu `name`, die zusätzlichen
 *  Angaben werden strukturiert an die Nachricht angehängt. So bleibt das
 *  bestehende Inquiry-Modell unverändert. */
export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  const vorname = String(formData.get("vorname") ?? "").trim();
  const nachname = String(formData.get("nachname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const projektTyp = String(formData.get("projektTyp") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const projektFrist = String(formData.get("projektFrist") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const name = `${vorname} ${nachname}`.trim();

  if (!name || !email) {
    return { ok: false, error: "Bitte Vor- und Nachname sowie E-Mail ausfüllen." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." };
  }

  // Zusatzangaben strukturiert in die Nachricht einfügen
  const extras: string[] = [];
  if (projektTyp) extras.push(`Projekttyp: ${projektTyp}`);
  if (budget) extras.push(`Budget: ${budget}`);
  if (projektFrist) extras.push(`Projektfrist: ${projektFrist}`);

  const fullMessage = extras.length
    ? `${extras.join("\n")}\n\n---\n${message}`
    : message;

  // Betreff aus Projekttyp ableiten, falls vorhanden — sonst Standard.
  const subject = projektTyp || "Neue Kontaktanfrage";

  try {
    await db.inquiry.create({
      data: { name, email, phone, company, subject, message: fullMessage, status: "new" },
    });
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }
}
