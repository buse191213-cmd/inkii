import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateInvoicePDF, generateInvoiceNumber, type InvoiceData } from "@/lib/invoice-pdf";
import { getCompanyInfo } from "@/lib/company-info";
import { isAuthenticated } from "@/lib/auth";
import { getCurrentCustomerId } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const [order, company] = await Promise.all([
    db.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    }),
    getCompanyInfo(),
  ]);

  if (!order) {
    return NextResponse.json({ error: "Bestellung nicht gefunden" }, { status: 404 });
  }

  // Yetki: admin VEYA sipariş sahibi müşteri
  const isAdmin = await isAuthenticated();
  const customerId = await getCurrentCustomerId();
  const isOwner = customerId && customerId === order.customerId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
  }

  // Rechnungsnummer
  let invoiceNumber = order.invoiceNumber;
  if (!invoiceNumber) {
    invoiceNumber = generateInvoiceNumber(order.createdAt, order.orderNumber);
    await db.order.update({
      where: { id: orderId },
      data: { invoiceNumber },
    });
  }

  const data: InvoiceData = {
    invoiceNumber,
    orderNumber: order.orderNumber,
    invoiceDate: order.paidAt || order.createdAt,
    customer: {
      salutation: order.customer.salutation,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      firmname: order.customer.firmname,
      ustId: order.customer.ustId,
      email: order.customer.email,
      phone: order.customer.phone,
      billingStreet: order.customer.billingStreet,
      billingZip: order.customer.billingZip,
      billingCity: order.customer.billingCity,
      billingCountry: order.customer.billingCountry,
      shippingDiffers: order.customer.shippingDiffers,
      shippingStreet: order.customer.shippingStreet,
      shippingZip: order.customer.shippingZip,
      shippingCity: order.customer.shippingCity,
      shippingCountry: order.customer.shippingCountry,
    },
    items: order.items.map((i) => ({
      productName: i.productName,
      productCode: i.productCode,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      dtfPriceCents: i.dtfPriceCents,
      lineTotalCents: i.lineTotalCents,
      hasDtf: i.hasDtf,
      dtfSize: i.dtfSize,
    })),
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxRate: order.taxRate,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paidAt: order.paidAt,
    company: {
      name: company.name,
      owner: company.owner,
      street: company.street,
      zip: company.zip,
      city: company.city,
      country: company.country,
      phone: company.phone,
      email: company.email,
      web: company.web,
      ustId: company.ustId,
      taxNumber: company.taxNumber,
      bankName: company.bankName,
      iban: company.iban,
      bic: company.bic,
      paymentTermDays: company.paymentTermDays,
    },
  };

  const pdfBuffer = await generateInvoicePDF(data);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Rechnung-${invoiceNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
