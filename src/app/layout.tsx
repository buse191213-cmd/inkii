import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { organizationSchema, localBusinessSchema } from "@/lib/schema";
import JsonLd from "@/components/JsonLd";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import GlobalBrandSwitcher from "@/components/GlobalBrandSwitcher";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    "Textildruck in Essen: DTF Druck, Stickerei, Firmenbekleidung und Werbemittel aus einer Hand. Express-Lieferung und Abholung in Essen. Professionell und individuell.",
  keywords: [
    "Textildruck Essen",
    "Textilveredelung Essen",
    "DTF Druck",
    "DTF Druck Essen",
    "Stickerei Essen",
    "Firmenbekleidung",
    "Werbemittel",
    "Werbeartikel",
    "Teamwear",
    "Arbeitskleidung",
    "Siebdruck",
    "Express Textildruck",
    "Abholung Essen",
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
  // PWA: manifest + Icons (Startbildschirm / App-Installation)
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "INKII Works",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#004537",
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
      <head>
        {/* Trustpilot JavaScript Integration.
            Laut Trustpilot-Doku MUSS das Snippet im <head> jeder Seite stehen —
            der Verifizierungs-Crawler sucht es dort im ausgelieferten HTML. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');tp('register','JhPuZDfA4Bn3sXtx');`,
          }}
        />
      </head>
      <body>
        {children}
        <CookieBanner dict={d.cookie} />
        <GlobalBrandSwitcher />
        <WhatsAppButton phone={COMPANY.phone} message={waMsg} label={waLabel} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
        <ServiceWorkerRegistration />

        {/* Vercel Analytics — cookiefrei, keine Einwilligung nötig */}
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics — lädt nur nach Cookie-Einwilligung (DSGVO) */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
