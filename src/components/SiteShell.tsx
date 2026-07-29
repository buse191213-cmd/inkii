import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import RevealInit from "./RevealInit";
import MobileBrandSwitcher from "./MobileBrandSwitcher";
import { MerklisteProvider } from "./MerklisteProvider";
import { CartProvider } from "./CartProvider";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getActiveNavItems } from "@/lib/nav";
import { getHomeImage } from "@/lib/home-images";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";

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
  const customer = await getCurrentCustomer();

  // Kollektion-Kategorien fürs Hover-Menü (nur die mit aktiven Produkten)
  let kollektionCats: { slug: string; name: string; imageUrl: string }[] = [];
  try {
    const [cats, prods] = await Promise.all([
      db.kollektionKategorie.findMany({
        orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
        select: { slug: true, name: true, imageUrl: true },
      }),
      db.product.findMany({
        where: { status: "active", isCollection: true },
        select: { collectionCategory: true },
      }),
    ]);
    const usedSlugs = new Set(prods.map((p) => p.collectionCategory).filter(Boolean));
    kollektionCats = cats.filter((c) => usedSlugs.has(c.slug));
  } catch {
    kollektionCats = [];
  }

  return (
    <MerklisteProvider>
      <CartProvider>
      <SiteHeader
        locale={locale}
        nav={dict.nav}
        t={dict.header}
        utility={dict.utility}
        marketingLogo={marketingLogo}
        navItems={navItems.map((n) => ({ href: n.href, key: n.key }))}
        customer={customer ? { firstName: customer.firstName, lastName: customer.lastName } : null}
        kollektionCats={kollektionCats}
      />
      <main>{children}</main>
      <SiteFooter t={dict.footer} cookieLabel={locale === "tr" ? "Çerez ayarları" : locale === "en" ? "Cookie settings" : "Cookie-Einstellungen"} />
      <RevealInit />
      </CartProvider>
    </MerklisteProvider>
  );
}
