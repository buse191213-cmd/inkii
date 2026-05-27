"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sendInquiryMail } from "@/lib/mail";

export type MerklisteState = { ok: boolean; error?: string };

type SubmitItem = { code: string; name: string; qty: number };

/** Erstellt aus den Merkzettel-Artikeln eine einzige gebündelte Anfrage. */
export async function submitMerklisteInquiry(
  _prev: MerklisteState,
  formData: FormData
): Promise<MerklisteState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  let items: SubmitItem[] = [];
  try {
    const raw = JSON.parse(String(formData.get("items") ?? "[]"));
    if (Array.isArray(raw)) {
      items = raw
        .map((i) => ({
          code: String(i?.code ?? "").trim(),
          name: String(i?.name ?? "").trim(),
          qty: Math.max(1, Number(i?.qty) || 1),
        }))
        .filter((i) => i.name);
    }
  } catch {
    /* ungültige Daten ignorieren */
  }

  if (!name || !email) {
    return { ok: false, error: "Bitte Name und E-Mail ausfüllen." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." };
  }
  if (items.length === 0) {
    return { ok: false, error: "Ihr Merkzettel ist leer." };
  }

  const list = items
    .map((i) => `• ${i.code ? i.code + " – " : ""}${i.name} (Menge: ${i.qty})`)
    .join("\n");
  const subject = `Merkzettel-Anfrage – ${items.length} Artikel`;
  const message = (note ? `${note}\n\n` : "") + `Angefragte Artikel:\n${list}`;

  try {
    await db.inquiry.create({
      data: { name, email, phone, company, subject, message, status: "new" },
    });
    sendInquiryMail({ name, email, phone, company, subject, message })
      .catch((err) => console.warn("[merkzettel] Mail-Fehler:", err));
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Senden fehlgeschlagen. Bitte erneut versuchen." };
  }
}
