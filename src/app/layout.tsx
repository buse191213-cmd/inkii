import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { organizationSchema, localBusinessSchema } from "@/lib/schema";
import JsonLd from "@/components/JsonLd";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import { COMPANY } from "@/lib/company";
import "./globals.css";

const display = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
});
const body = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "INKII Works — Textilveredelung & Werbemittel aus Essen",
    template: "%s | INKII Works",
  },
  description:
    "Textildruck, Stickerei, Teamwear und Werbemittel aus einer Hand. Von der Gestaltung bis zur Lieferung – professionell und individuell.",
  keywords: [
    "Textilveredelung",
    "Textildruck",
    "Werbemittel",
    "Werbeartikel",
    "Stickerei",
    "Teamwear",
    "Arbeitskleidung",
    "Siebdruck",
    "Essen",
    "INKII Works",
  ],
  applicationName: "INKII Works",
  authors: [{ name: "INKII Works", url: SITE_URL }],
  creator: "INKII Works",
  publisher: "INKII Works",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "INKII Works",
    title: "INKII Works — Textilveredelung & Werbemittel",
    description:
      "Textildruck, Stickerei, Teamwear und Werbemittel aus einer Hand. Professionelle Veredelung mit Liebe zum Detail.",
    url: SITE_URL,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "INKII Works — Textilveredelung & Werbemittel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "INKII Works — Textilveredelung & Werbemittel",
    description: "Textildruck, Teamwear und Werbemittel aus einer Hand.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1c2722",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const waLabel =
    locale === "tr" ? "WhatsApp ile yazın"
      : locale === "en" ? "Chat on WhatsApp"
      : "Per WhatsApp schreiben";
  const waMsg =
    locale === "tr" ? "Merhaba INKII Works, bir teklif almak istiyorum."
      : locale === "en" ? "Hello INKII Works, I would like to request an offer."
      : "Hallo INKII Works, ich möchte ein Angebot anfragen.";
  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <CookieBanner dict={d.cookie} />
        <WhatsAppButton phone={COMPANY.phone} message={waMsg} label={waLabel} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
      </body>
    </html>
  );
}
