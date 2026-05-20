import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import InquiryManager, { AdminInquiry } from "./InquiryManager";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const dbInquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

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

  return <InquiryManager inquiries={inquiries} />;
}
