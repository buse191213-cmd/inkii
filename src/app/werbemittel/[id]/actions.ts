"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sendInquiryMail } from "@/lib/mail";

type SubmitArgs = {
  productId: string;
  productCode: string;
  productName: string;
  name: string;
  email: string;
  phone: string;
  note: string;
  items: { size: string; qty: number }[];
  totalQty: number;
};

export async function submitProductInquiry(args: SubmitArgs): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!args.name.trim() || !args.email.trim()) {
      return { ok: false, error: "Name und E-Mail sind erforderlich." };
    }
    if (args.totalQty <= 0) {
      return { ok: false, error: "Bitte mindestens 1 Stück angeben." };
    }

    // Lesbare Nachricht aufbauen (passt zum bestehenden Inquiry-Modell)
    const lines: string[] = [];
    lines.push(`Produkt-Anfrage für ${args.productName} (${args.productCode})`);
    lines.push("");
    lines.push("Angefragte Mengen:");
    for (const it of args.items) {
      if (it.qty > 0) {
        lines.push(`• ${args.productCode} – ${args.productName} – Größe ${it.size} (Menge: ${it.qty})`);
      }
    }
    lines.push("");
    lines.push(`Gesamtmenge: ${args.totalQty} Stück`);
    if (args.note) {
      lines.push("");
      lines.push("Anmerkung:");
      lines.push(args.note);
    }

    const message = lines.join("\n");
    const subject = `Produkt-Anfrage: ${args.productName} — ${args.totalQty} Stück`;

    await db.inquiry.create({
      data: {
        name: args.name,
        email: args.email,
        phone: args.phone,
        company: "",
        subject,
        message,
        status: "new",
      },
    });

    // Mail asynchron senden — Fehler dürfen den Flow nicht abbrechen
    sendInquiryMail({
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: "",
      subject,
      message,
    }).catch((e) => console.warn("[detail] mail send failed:", e));

    revalidatePath("/admin/inquiries");
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unerwarteter Fehler.";
    return { ok: false, error: msg };
  }
}
