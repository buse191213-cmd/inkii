import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { getLocale } from "@/lib/i18n-server";
import { organizationSchema } from "@/lib/schema";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "INKII — Textilveredelung & Werbemittel",
  description:
    "Textildruck, Teamwear und Werbemittel aus einer Hand. Von der Gestaltung bis zur Lieferung.",
  keywords: [
    "Textilveredelung",
    "Textildruck",
    "Werbemittel",
    "Werbeartikel",
    "Stickerei",
    "Teamwear",
    "Arbeitskleidung",
    "Siebdruck",
  ],
  applicationName: "INKII",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "INKII",
    title: "INKII — Textilveredelung & Werbemittel",
    description:
      "Textildruck, Teamwear und Werbemittel aus einer Hand. Von der Gestaltung bis zur Lieferung.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "INKII — Textilveredelung & Werbemittel",
    description: "Textildruck, Teamwear und Werbemittel aus einer Hand.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
