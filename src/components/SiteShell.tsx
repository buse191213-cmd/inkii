import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import RevealInit from "./RevealInit";
import { MerklisteProvider } from "./MerklisteProvider";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getActiveNavItems } from "@/lib/nav";

/** Rahmen für alle öffentlichen Seiten: Header, Inhalt, Footer. */
export default async function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const navItems = await getActiveNavItems();

  return (
    <MerklisteProvider>
      <SiteHeader
        locale={locale}
        nav={dict.nav}
        t={dict.header}
        navItems={navItems.map((n) => ({ href: n.href, key: n.key }))}
      />
      <main>{children}</main>
      <SiteFooter t={dict.footer} />
      <RevealInit />
    </MerklisteProvider>
  );
}
