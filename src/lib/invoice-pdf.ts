import PDFDocument from "pdfkit";

// Tek tip euro formatı (DE)
function euro(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function germanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export type InvoiceData = {
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: Date;
  customer: {
    salutation: string;
    firstName: string;
    lastName: string;
    firmname: string;
    ustId: string;
    email: string;
    phone: string;
    billingStreet: string;
    billingZip: string;
    billingCity: string;
    billingCountry: string;
    shippingDiffers: boolean;
    shippingStreet: string;
    shippingZip: string;
    shippingCity: string;
    shippingCountry: string;
  };
  items: Array<{
    productName: string;
    productCode: string;
    color: string;
    size: string;
    quantity: number;
    unitPriceCents: number;
    dtfPriceCents: number;
    lineTotalCents: number;
    hasDtf: boolean;
    dtfSize: string;
  }>;
  subtotalCents: number;
  shippingCents: number;
  taxRate: number;
  taxCents: number;
  totalCents: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: Date | null;
  company: {
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
    paymentTermDays: number;
  };
};

const PRIMARY = "#004537";
const TEXT = "#1f2937";
const MUTED = "#64748b";

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const COMPANY = data.company;
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Rechnung ${data.invoiceNumber}`,
          Author: COMPANY.name,
          Subject: "Rechnung",
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (b: Buffer) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // ───── HEADER ─────
      doc
        .fontSize(22)
        .fillColor(PRIMARY)
        .text(COMPANY.name, 50, 50, { continued: false });
      doc
        .fontSize(9)
        .fillColor(MUTED)
        .text(`${COMPANY.owner} · ${COMPANY.street} · ${COMPANY.zip} ${COMPANY.city}`, 50, 78);

      // Sağ üst: Rechnung başlığı + numara
      doc
        .fontSize(20)
        .fillColor(TEXT)
        .text("RECHNUNG", 400, 50, { width: 145, align: "right" });
      doc
        .fontSize(9)
        .fillColor(MUTED)
        .text(`Nr. ${data.invoiceNumber}`, 400, 75, { width: 145, align: "right" })
        .text(`Datum: ${germanDate(data.invoiceDate)}`, 400, 88, { width: 145, align: "right" })
        .text(`Bestellung: ${data.orderNumber}`, 400, 101, { width: 145, align: "right" });

      // Trennlinie
      doc
        .moveTo(50, 130)
        .lineTo(545, 130)
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .stroke();

      // ───── ABSENDER + EMPFÄNGER ─────
      // Sol: Empfänger (Kunde)
      doc
        .fontSize(8)
        .fillColor(MUTED)
        .text(`${COMPANY.name} · ${COMPANY.street} · ${COMPANY.zip} ${COMPANY.city}`, 50, 145);

      const c = data.customer;
      doc.fontSize(10).fillColor(TEXT);
      let y = 165;
      if (c.firmname) {
        doc.text(c.firmname, 50, y, { width: 250 });
        y += 14;
      }
      doc.text(`${c.salutation || ""} ${c.firstName} ${c.lastName}`.trim(), 50, y, { width: 250 });
      y += 14;
      doc.text(c.billingStreet, 50, y, { width: 250 });
      y += 14;
      doc.text(`${c.billingZip} ${c.billingCity}`, 50, y, { width: 250 });
      y += 14;
      if (c.billingCountry && c.billingCountry !== "DE") {
        doc.text(c.billingCountry, 50, y, { width: 250 });
        y += 14;
      }

      // Sağ: Lieferadresse (varsa)
      if (c.shippingDiffers && c.shippingStreet) {
        doc.fontSize(8).fillColor(MUTED).text("Lieferadresse:", 350, 145);
        doc.fontSize(10).fillColor(TEXT);
        let yShip = 165;
        if (c.firmname) {
          doc.text(c.firmname, 350, yShip, { width: 195 });
          yShip += 14;
        }
        doc.text(`${c.salutation || ""} ${c.firstName} ${c.lastName}`.trim(), 350, yShip, { width: 195 });
        yShip += 14;
        doc.text(c.shippingStreet, 350, yShip, { width: 195 });
        yShip += 14;
        doc.text(`${c.shippingZip} ${c.shippingCity}`, 350, yShip, { width: 195 });
      }

      // ───── ARTIKEL TABELLE ─────
      const tableTop = 260;
      doc
        .fontSize(9)
        .fillColor("#fff");
      doc.rect(50, tableTop, 495, 22).fill(PRIMARY);

      doc
        .fillColor("#fff")
        .fontSize(9)
        .text("Pos", 55, tableTop + 7, { width: 25 })
        .text("Beschreibung", 85, tableTop + 7, { width: 240 })
        .text("Menge", 330, tableTop + 7, { width: 50, align: "right" })
        .text("EP", 385, tableTop + 7, { width: 70, align: "right" })
        .text("Summe", 460, tableTop + 7, { width: 80, align: "right" });

      // Tabelle Zeilen
      let rowY = tableTop + 28;
      doc.fillColor(TEXT).fontSize(9);
      data.items.forEach((item, idx) => {
        // Zebra
        if (idx % 2 === 1) {
          doc.rect(50, rowY - 4, 495, 32).fill("#f8fafc").fillColor(TEXT);
        }

        const unitPrice = item.unitPriceCents + item.dtfPriceCents;
        const description = `${item.productName} (${item.productCode})${item.color ? ` · ${item.color}` : ""}${item.size ? ` · ${item.size}` : ""}${item.hasDtf ? ` · DTF ${item.dtfSize}` : ""}`;

        doc.fillColor(TEXT)
          .text(String(idx + 1), 55, rowY, { width: 25 })
          .text(description, 85, rowY, { width: 240 })
          .text(String(item.quantity), 330, rowY, { width: 50, align: "right" })
          .text(unitPrice > 0 ? `${euro(unitPrice)} €` : "—", 385, rowY, { width: 70, align: "right" })
          .text(item.lineTotalCents > 0 ? `${euro(item.lineTotalCents)} €` : "—", 460, rowY, { width: 80, align: "right" });

        rowY += 28;
        if (rowY > 700) {
          doc.addPage();
          rowY = 60;
        }
      });

      // Trennlinie
      doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor("#e5e7eb").stroke();
      rowY += 14;

      // ───── SUMMEN ─────
      const sumX = 380;
      doc.fontSize(10).fillColor(TEXT);
      doc.text("Zwischensumme:", sumX, rowY, { width: 110, align: "right" });
      doc.text(`${euro(data.subtotalCents)} €`, sumX + 110, rowY, { width: 50, align: "right" });
      rowY += 16;

      doc.text("Versand:", sumX, rowY, { width: 110, align: "right" });
      doc.text(`${euro(data.shippingCents)} €`, sumX + 110, rowY, { width: 50, align: "right" });
      rowY += 16;

      doc.fillColor(MUTED).text(`zzgl. MwSt. ${data.taxRate}%:`, sumX, rowY, { width: 110, align: "right" });
      doc.text(`${euro(data.taxCents)} €`, sumX + 110, rowY, { width: 50, align: "right" });
      rowY += 16;

      // Gesamt — büyük
      doc.rect(sumX - 10, rowY - 4, 175, 26).fill(PRIMARY);
      doc.fontSize(12).fillColor("#fff");
      doc.text("Gesamtbetrag:", sumX, rowY + 4, { width: 110, align: "right" });
      doc.text(`${euro(data.totalCents)} €`, sumX + 110, rowY + 4, { width: 50, align: "right" });
      rowY += 40;

      // ───── ZAHLUNGS-INFO ─────
      doc.fontSize(10).fillColor(TEXT);
      doc.text("Zahlungsinformation", 50, rowY);
      doc.moveTo(50, rowY + 14).lineTo(545, rowY + 14).strokeColor("#e5e7eb").stroke();
      rowY += 22;

      const paymentLabel = data.paymentMethod === "paypal" ? "PayPal" :
                          data.paymentMethod === "klarna" ? "Klarna" :
                          data.paymentMethod === "rechnung" ? "Auf Rechnung" :
                          data.paymentMethod;

      doc.fontSize(9);
      doc.text(`Zahlungsmethode: ${paymentLabel}`, 50, rowY);
      rowY += 14;
      doc.text(`Status: ${data.paymentStatus === "PAID" ? "Bezahlt" : "Ausstehend"}`, 50, rowY);
      rowY += 14;
      if (data.paidAt) {
        doc.text(`Zahldatum: ${germanDate(data.paidAt)}`, 50, rowY);
        rowY += 14;
      }

      // Rechnung olarak ödeme yöntemi seçildiyse → IBAN bilgisi göster
      if (data.paymentMethod === "rechnung" && data.paymentStatus !== "PAID") {
        rowY += 8;
        doc.fillColor(PRIMARY).text("Bitte überweisen Sie den Betrag auf folgendes Konto:", 50, rowY);
        rowY += 16;
        doc.fillColor(TEXT);
        doc.text(`Bank: ${COMPANY.bankName}`, 50, rowY); rowY += 12;
        doc.text(`IBAN: ${COMPANY.iban}`, 50, rowY); rowY += 12;
        doc.text(`BIC: ${COMPANY.bic}`, 50, rowY); rowY += 12;
        doc.text(`Verwendungszweck: ${data.invoiceNumber}`, 50, rowY); rowY += 12;
        rowY += 4;
        doc.fillColor(MUTED).fontSize(8).text("Zahlbar innerhalb von 14 Tagen ohne Abzug.", 50, rowY);
        rowY += 14;
      }

      // ───── FOOTER ─────
      const footerY = 760;
      doc
        .fontSize(7)
        .fillColor(MUTED)
        .text(`${COMPANY.name} · ${COMPANY.owner}`, 50, footerY, { width: 165 })
        .text(`${COMPANY.street}`, 50, footerY + 10)
        .text(`${COMPANY.zip} ${COMPANY.city}`, 50, footerY + 20);

      doc
        .text(`Tel: ${COMPANY.phone}`, 220, footerY, { width: 160 })
        .text(`E-Mail: ${COMPANY.email}`, 220, footerY + 10)
        .text(`Web: ${COMPANY.web}`, 220, footerY + 20);

      doc
        .text(`USt-IdNr: ${COMPANY.ustId}`, 390, footerY, { width: 160, align: "right" })
        .text(`${COMPANY.bankName}`, 390, footerY + 10, { align: "right" })
        .text(`IBAN: ${COMPANY.iban}`, 390, footerY + 20, { align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generateInvoiceNumber(orderCreatedAt: Date, orderNumberSuffix: string): string {
  const year = orderCreatedAt.getFullYear();
  const month = String(orderCreatedAt.getMonth() + 1).padStart(2, "0");
  // INKI-2026-12345 → RG-2026-01-12345
  const lastPart = orderNumberSuffix.split("-").pop() ?? "00000";
  return `RG-${year}-${month}-${lastPart}`;
}
