"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sendInquiryMail } from "@/lib/mail";

export type MerklisteState = { ok: boolean; error?: string };

type SubmitSize = { name: string; qty: number };
type SubmitItem = {
  code: string;
  name: string;
  qty: number;
  sizes?: SubmitSize[] | null;
  note?: string | null;
};

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
          sizes: Array.isArray(i?.sizes)
            ? i.sizes
                .map((s: { name?: unknown; qty?: unknown }) => ({
                  name: String(s?.name ?? "").trim(),
                  qty: Math.max(1, Number(s?.qty) || 1),
                }))
                .filter((s: SubmitSize) => s.name)
            : null,
          note: typeof i?.note === "string" ? i.note.trim() : null,
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

  // Lesbare Liste aufbauen — mit Größen-Details, falls vorhanden
  const lines: string[] = [];
  for (const it of items) {
    if (it.sizes && it.sizes.length > 0) {
      // Pro Größe eine eigene Zeile, damit Admin alles klar sieht
      for (const s of it.sizes) {
        lines.push(`• ${it.code ? it.code + " – " : ""}${it.name} – Größe ${s.name} (Menge: ${s.qty})`);
      }
      lines.push(`  → Gesamt für ${it.name}: ${it.qty} Stück`);
    } else {
      lines.push(`• ${it.code ? it.code + " – " : ""}${it.name} (Menge: ${it.qty})`);
    }
    if (it.note) {
      lines.push(`  ↪ Anmerkung: ${it.note}`);
    }
  }
  const list = lines.join("\n");
  const totalItems = items.length;
  const subject = `Merkzettel-Anfrage – ${totalItems} ${totalItems === 1 ? "Artikel" : "Artikel"}`;
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
