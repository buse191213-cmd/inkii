"use server";

import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type CompanyInfoInput = {
  name: string;
  owner: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  web: string;
  ustId: string;
  taxNumber: string;
  bankName: string;
  iban: string;
  bic: string;
  taxRate: number;
  paymentTermDays: number;
};

export async function saveCompanyInfo(input: CompanyInfoInput): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await isAuthenticated())) return { ok: false, error: "Nicht autorisiert" };

    const existing = await db.companyInfo.findFirst();
    if (existing) {
      await db.companyInfo.update({ where: { id: existing.id }, data: input });
    } else {
      await db.companyInfo.create({ data: input });
    }
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
