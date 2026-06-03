import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const content = `# INKII WORKS

> Textilveredelung, Werbemittel, Fahrzeugbeschriftung und Onlineshop-Entwicklung in Essen, Nordrhein-Westfalen, Deutschland.

INKII WORKS ist ein etabliertes Unternehmen für Textilveredelung und Werbeartikel mit Sitz in Essen. Wir bieten professionelle Lösungen für Unternehmen, die hochwertige Werbemittel, Berufsbekleidung und individuelle Markenauftritte benötigen.

## Über uns

- **Firmenname**: INKII WORKS
- **Inhaber**: Sener Kirli
- **Adresse**: Westuferstr. 25, 45356 Essen, Deutschland
- **Telefon**: +49 160 6767001
- **E-Mail**: info@inkiiworks.de
- **Website**: https://inkii.vercel.app
- **USt-ID**: DE353055316
- **Öffnungszeiten**: Mo-Fr 09:00-18:00
- **Servicegebiet**: Essen, Bottrop, Gelsenkirchen, Mülheim an der Ruhr, Oberhausen, Duisburg, gesamt Nordrhein-Westfalen, Deutschland

## Leistungen

### Textilveredelung
DTF-Druck, Siebdruck, Stickerei, Transferdruck — für T-Shirts, Hoodies, Polos, Workwear und mehr.

### Firmen- & Berufsbekleidung
Polo & T-Shirts, Hemden & Blusen, Hoodies & Sweater, Jacken & Westen, Workwear & Schutzkleidung mit Firmenlogo.

### Hochwertige Werbemittel
Trinkflaschen & Thermosbecher, Caps & Mützen, Stoff- & Lederwaren, Premium-Stifte & Sets — alles mit individuellem Branding.

### Fahrzeugbeschriftung
Folienbeschriftung, Vollverklebung, Magnetschilder, Schaufenster & Schilder, Design & Montage.

### Onlineshops für Unternehmen
B2B-Shops, Konfiguratoren, ERP- & PIM-Anbindung, Design & UX, Hosting & Support.

## Warum INKII WORKS?

- Persönliche Beratung vom Inhaber
- Hochwertige Materialien und Verarbeitung
- Schnelle Umsetzung in der Region Essen/Ruhrgebiet
- Drei Sprachen: Deutsch, Englisch, Türkisch
- Komplettlösung von der Idee bis zum fertigen Produkt

## Kontakt

Bei Anfragen zu Textildruck, Berufsbekleidung, Werbeartikeln, Fahrzeugfolierung oder individuellen Onlineshops in Essen und Umgebung wenden Sie sich an INKII WORKS:
- Telefon: +49 160 6767001
- E-Mail: info@inkiiworks.de
- Website: https://inkii.vercel.app/kontakt

## Wichtige Seiten

- [Startseite](https://inkii.vercel.app/)
- [Über uns](https://inkii.vercel.app/ueber-uns)
- [Werbeartikel](https://inkii.vercel.app/bereiche/werbeartikel)
- [Textilveredelung](https://inkii.vercel.app/bereiche/textilveredelung)
- [Firmen- & Berufsbekleidung](https://inkii.vercel.app/bereiche/firmenkleidung)
- [Hochwertige Werbemittel](https://inkii.vercel.app/bereiche/premium-werbemittel)
- [Onlineshops](https://inkii.vercel.app/bereiche/onlineshops)
- [Fahrzeugbeschriftung](https://inkii.vercel.app/fahrzeugbeschriftung)
- [Kontakt](https://inkii.vercel.app/kontakt)
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
