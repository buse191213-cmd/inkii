import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

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
const LIGHT = "#94a3b8";

// Logo Buffer (cached)
let logoBuffer: Buffer | null = null;
function getLogoBuffer(): Buffer | null {
  if (logoBuffer) return logoBuffer;
  try {
    const logoPath = path.join(process.cwd(), "public", "inkii-logo.png");
    if (fs.existsSync(logoPath)) {
      logoBuffer = fs.readFileSync(logoPath);
      return logoBuffer;
    }
  } catch (e) {
    console.warn("Logo konnte nicht geladen werden:", e);
  }
  return null;
}

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

      // ═══════════════════════════════════════════════
      // HEADER: Logo (sol) + RECHNUNG (sağ)
      // ═══════════════════════════════════════════════
      const logo = getLogoBuffer();
      if (logo) {
        try {
          // Logo: 50,40 konumunda, height 50px (oran korur)
          doc.image(logo, 50, 45, { height: 50 });
        } catch (e) {
          // Logo render edilemezse text fallback
          doc.fontSize(22).fillColor(PRIMARY).text(COMPANY.name, 50, 50);
        }
      } else {
        doc.fontSize(22).fillColor(PRIMARY).text(COMPANY.name, 50, 50);
      }

      // Sağ üst: RECHNUNG başlığı
      doc
        .fontSize(24)
        .fillColor(TEXT)
        .text("RECHNUNG", 400, 48, { width: 145, align: "right" });
      doc
        .fontSize(9)
        .fillColor(MUTED)
        .text(`Nr. ${data.invoiceNumber}`, 400, 78, { width: 145, align: "right" })
        .text(`Datum: ${germanDate(data.invoiceDate)}`, 400, 91, { width: 145, align: "right" })
        .text(`Bestellung: ${data.orderNumber}`, 400, 104, { width: 145, align: "right" });

      // Trennlinie
      doc
        .moveTo(50, 125)
        .lineTo(545, 125)
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .stroke();

      // ═══════════════════════════════════════════════
      // ABSENDER (klein) + EMPFÄNGER + LIEFERADRESSE
      // ═══════════════════════════════════════════════
      doc
        .fontSize(7)
        .fillColor(LIGHT)
        .text(`${COMPANY.name} · ${COMPANY.street} · ${COMPANY.zip} ${COMPANY.city}`, 50, 140);

      // Empfänger (Rechnungsadresse)
      const c = data.customer;
      doc.fontSize(9).fillColor(MUTED).text("Rechnungsadresse", 50, 160);
      doc.fontSize(10).fillColor(TEXT);
      let y = 175;
      if (c.firmname) {
        doc.text(c.firmname, 50, y, { width: 240 });
        y += 14;
      }
      doc.text(`${c.salutation || ""} ${c.firstName} ${c.lastName}`.trim(), 50, y, { width: 240 });
      y += 14;
      doc.text(c.billingStreet, 50, y, { width: 240 });
      y += 14;
      doc.text(`${c.billingZip} ${c.billingCity}`, 50, y, { width: 240 });
      y += 14;
      if (c.billingCountry && c.billingCountry !== "DE") {
        doc.text(c.billingCountry, 50, y, { width: 240 });
      }

      // Lieferadresse (varsa)
      if (c.shippingDiffers && c.shippingStreet) {
        doc.fontSize(9).fillColor(MUTED).text("Lieferadresse", 320, 160);
        doc.fontSize(10).fillColor(TEXT);
        let yShip = 175;
        if (c.firmname) {
          doc.text(c.firmname, 320, yShip, { width: 225 });
          yShip += 14;
        }
        doc.text(`${c.salutation || ""} ${c.firstName} ${c.lastName}`.trim(), 320, yShip, { width: 225 });
        yShip += 14;
        doc.text(c.shippingStreet, 320, yShip, { width: 225 });
        yShip += 14;
        doc.text(`${c.shippingZip} ${c.shippingCity}`, 320, yShip, { width: 225 });
      }

      // ═══════════════════════════════════════════════
      // ARTIKEL TABELLE
      // ═══════════════════════════════════════════════
      const tableTop = 285;
      doc.rect(50, tableTop, 495, 24).fill(PRIMARY);
      doc
        .fillColor("#fff")
        .fontSize(9)
        .text("Pos", 55, tableTop + 8, { width: 25 })
        .text("Beschreibung", 85, tableTop + 8, { width: 240 })
        .text("Menge", 330, tableTop + 8, { width: 50, align: "right" })
        .text("EP", 385, tableTop + 8, { width: 70, align: "right" })
        .text("Summe", 465, tableTop + 8, { width: 75, align: "right" });

      // Tabelle Zeilen
      let rowY = tableTop + 32;
      doc.fillColor(TEXT).fontSize(9);
      data.items.forEach((item, idx) => {
        if (idx % 2 === 1) {
          doc.rect(50, rowY - 4, 495, 26).fill("#f8fafc");
        }

        const unitPrice = item.unitPriceCents + item.dtfPriceCents;
        const description = `${item.productName} (${item.productCode})${item.color ? ` · ${item.color}` : ""}${item.size ? ` · ${item.size}` : ""}${item.hasDtf ? ` · DTF ${item.dtfSize}` : ""}`;

        doc
          .fillColor(TEXT)
          .text(String(idx + 1), 55, rowY, { width: 25 })
          .text(description, 85, rowY, { width: 240 })
          .text(String(item.quantity), 330, rowY, { width: 50, align: "right" })
          .text(unitPrice > 0 ? `${euro(unitPrice)} €` : "—", 385, rowY, { width: 70, align: "right" })
          .text(item.lineTotalCents > 0 ? `${euro(item.lineTotalCents)} €` : "—", 465, rowY, { width: 75, align: "right" });

        rowY += 26;
        if (rowY > 680) {
          doc.addPage();
          rowY = 60;
        }
      });

      // Trennlinie
      doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor("#e5e7eb").lineWidth(1).stroke();
      rowY += 14;

      // ═══════════════════════════════════════════════
      // SUMMEN
      // ═══════════════════════════════════════════════
      const sumLabelX = 370;
      const sumValueX = 480;
      doc.fontSize(10).fillColor(TEXT);
      doc.text("Zwischensumme:", sumLabelX, rowY, { width: 110, align: "right" });
      doc.text(`${euro(data.subtotalCents)} €`, sumValueX, rowY, { width: 65, align: "right" });
      rowY += 18;

      doc.text("Versand:", sumLabelX, rowY, { width: 110, align: "right" });
      doc.text(`${euro(data.shippingCents)} €`, sumValueX, rowY, { width: 65, align: "right" });
      rowY += 18;

      doc.fillColor(MUTED).text(`zzgl. MwSt. ${data.taxRate}%:`, sumLabelX, rowY, { width: 110, align: "right" });
      doc.text(`${euro(data.taxCents)} €`, sumValueX, rowY, { width: 65, align: "right" });
      rowY += 22;

      // Gesamt — büyük + yeşil
      doc.rect(sumLabelX - 10, rowY - 5, 185, 28).fill(PRIMARY);
      doc.fontSize(13).fillColor("#fff");
      doc.text("Gesamtbetrag:", sumLabelX, rowY + 4, { width: 110, align: "right" });
      doc.text(`${euro(data.totalCents)} €`, sumValueX, rowY + 4, { width: 65, align: "right" });
      rowY += 44;

      // ═══════════════════════════════════════════════
      // ZAHLUNGS-INFO (sadece Rechnung yöntemi için)
      // ═══════════════════════════════════════════════
      const paymentLabel = data.paymentMethod === "paypal" ? "PayPal" :
                          data.paymentMethod === "klarna" ? "Klarna" :
                          data.paymentMethod === "rechnung" ? "Auf Rechnung" :
                          data.paymentMethod;

      doc.fontSize(10).fillColor(TEXT);
      doc.text(`Zahlungsmethode: ${paymentLabel}`, 50, rowY);
      rowY += 14;
      doc.fontSize(9).fillColor(MUTED);
      doc.text(`Status: ${data.paymentStatus === "PAID" ? "✓ Bezahlt" : "Ausstehend"}`, 50, rowY);
      rowY += 12;
      if (data.paidAt) {
        doc.text(`Zahldatum: ${germanDate(data.paidAt)}`, 50, rowY);
        rowY += 12;
      }

      if (data.paymentMethod === "rechnung" && data.paymentStatus !== "PAID" && COMPANY.iban) {
        rowY += 12;
        // Banka bilgisi box
        const boxTop = rowY;
        const boxHeight = 92;
        doc.rect(50, boxTop, 495, boxHeight).fillAndStroke("#f0fdf4", PRIMARY).lineWidth(1.5);

        doc.fontSize(11).fillColor(PRIMARY);
        doc.text("Bitte überweisen Sie den Betrag auf folgendes Konto:", 60, boxTop + 8, { width: 475 });

        doc.fontSize(10).fillColor(TEXT);
        let bRow = boxTop + 26;
        if (COMPANY.bankName) {
          doc.text(`Bank: ${COMPANY.bankName}`, 60, bRow);
          bRow += 13;
        }
        doc.text(`IBAN: ${COMPANY.iban}`, 60, bRow); bRow += 13;
        if (COMPANY.bic) {
          doc.text(`BIC: ${COMPANY.bic}`, 60, bRow); bRow += 13;
        }
        doc.text(`Verwendungszweck: ${data.invoiceNumber}`, 60, bRow);

        doc.fontSize(8).fillColor(MUTED);
        doc.text(`Zahlbar innerhalb von ${COMPANY.paymentTermDays} Tagen ohne Abzug.`, 60, boxTop + boxHeight - 14);
        rowY = boxTop + boxHeight + 10;
      }

      // Dank-Notiz
      rowY = Math.max(rowY, 660);
      doc.fontSize(9).fillColor(MUTED).text("Vielen Dank für Ihren Auftrag!", 50, rowY, { width: 495, align: "center" });

      // ═══════════════════════════════════════════════
      // FOOTER — TOPLU & ORTALI
      // ═══════════════════════════════════════════════
      const footerY = 720;

      // Üst çizgi
      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(PRIMARY).lineWidth(1).stroke();

      // Line 1: Firma + Adres
      doc.fontSize(8).fillColor(TEXT);
      doc.text(
        `${COMPANY.name}${COMPANY.owner ? ` · ${COMPANY.owner}` : ""} · ${COMPANY.street} · ${COMPANY.zip} ${COMPANY.city}`,
        50, footerY + 8,
        { width: 495, align: "center" }
      );

      // Line 2: Kontakt
      doc.fillColor(MUTED);
      const contactParts: string[] = [];
      if (COMPANY.phone) contactParts.push(`Tel: ${COMPANY.phone}`);
      if (COMPANY.email) contactParts.push(COMPANY.email);
      if (COMPANY.web) contactParts.push(COMPANY.web);
      doc.text(contactParts.join("  ·  "), 50, footerY + 22, { width: 495, align: "center" });

      // Line 3: Steuer
      const taxParts: string[] = [];
      if (COMPANY.ustId) taxParts.push(`USt-IdNr: ${COMPANY.ustId}`);
      if (COMPANY.taxNumber) taxParts.push(`Steuernr: ${COMPANY.taxNumber}`);
      if (taxParts.length > 0) {
        doc.text(taxParts.join("  ·  "), 50, footerY + 36, { width: 495, align: "center" });
      }

      // Line 4: Bank
      const bankParts: string[] = [];
      if (COMPANY.bankName) bankParts.push(COMPANY.bankName);
      if (COMPANY.iban) bankParts.push(`IBAN: ${COMPANY.iban}`);
      if (COMPANY.bic) bankParts.push(`BIC: ${COMPANY.bic}`);
      if (bankParts.length > 0) {
        doc.text(bankParts.join("  ·  "), 50, footerY + 50, { width: 495, align: "center" });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generateInvoiceNumber(orderCreatedAt: Date, orderNumberSuffix: string): string {
  const year = orderCreatedAt.getFullYear();
  const month = String(orderCreatedAt.getMonth() + 1).padStart(2, "0");
  const lastPart = orderNumberSuffix.split("-").pop() ?? "00000";
  return `RG-${year}-${month}-${lastPart}`;
}
