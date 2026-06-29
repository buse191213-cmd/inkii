import { db } from "@/lib/db";

const DEFAULTS = {
  name: "INKII WORKS",
  owner: "Sener Kirli",
  street: "Westuferstr. 25",
  zip: "45356",
  city: "Essen",
  country: "Deutschland",
  phone: "+49 160 6767001",
  email: "info@inkiiworks.de",
  web: "www.inkiiworks.de",
  ustId: "DE353055316",
  taxNumber: "",
  bankName: "",
  iban: "",
  bic: "",
  taxRate: 19,
  paymentTermDays: 14,
};

export async function getCompanyInfo() {
  const info = await db.companyInfo.findFirst();
  if (info) return info;
  // İlk kez ise oluştur
  return db.companyInfo.create({ data: DEFAULTS });
}
