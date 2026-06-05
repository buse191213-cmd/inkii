import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import RevealInit from "./RevealInit";
import { MerklisteProvider } from "./MerklisteProvider";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getActiveNavItems } from "@/lib/nav";
import { getHomeImage } from "@/lib/home-images";

/** Rahmen für alle öffentlichen Seiten: Header, Inhalt, Footer. */
export default async function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const navItems = await getActiveNavItems();
  const marketingLogo = await getHomeImage("marketing-logo");

  return (
    <MerklisteProvider>
      <SiteHeader
        locale={locale}
        nav={dict.nav}
        t={dict.header}
        utility={dict.utility}
        marketingLogo={marketingLogo}
        navItems={navItems.map((n) => ({ href: n.href, key: n.key }))}
      />
      <main>{children}</main>
      <SiteFooter t={dict.footer} cookieLabel={locale === "tr" ? "Çerez ayarları" : locale === "en" ? "Cookie settings" : "Cookie-Einstellungen"} />
      <RevealInit />
    </MerklisteProvider>
  );
}
