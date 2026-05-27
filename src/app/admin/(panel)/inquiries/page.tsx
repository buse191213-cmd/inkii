import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import InquiryManager, { AdminInquiry } from "./InquiryManager";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const dbInquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Alle Produkte einmal laden, damit wir Bilder/Namen über den Produktcode zuordnen können
  const products = await db.product.findMany({
    select: { code: true, name: true, images: true },
  });
  const productMap: Record<string, { name: string; image: string }> = {};
  for (const p of products) {
    const firstImage = (p.images ?? "").split(",").map((s: string) => s.trim()).filter(Boolean)[0] ?? "";
    productMap[p.code] = { name: p.name, image: firstImage };
  }

  const inquiries: AdminInquiry[] = dbInquiries.map((i) => ({
    id: i.id,
    name: i.name,
    email: i.email,
    phone: i.phone,
    company: i.company,
    subject: i.subject,
    message: i.message,
    status: i.status,
    date: formatDate(i.createdAt),
  }));

  return <InquiryManager inquiries={inquiries} productMap={productMap} />;
}
