import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import RevealInit from "./RevealInit";
import { MerklisteProvider } from "./MerklisteProvider";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

/** Rahmen für alle öffentlichen Seiten: Header, Inhalt, Footer. */
export default async function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <MerklisteProvider>
      <SiteHeader locale={locale} nav={dict.nav} t={dict.header} />
      <main>{children}</main>
      <SiteFooter t={dict.footer} />
      <RevealInit />
    </MerklisteProvider>
  );
}
