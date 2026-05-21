import { getAllNavItems } from "@/lib/nav";
import { getDictionary } from "@/dictionaries";
import NavigationManager from "./NavigationManager";

export const dynamic = "force-dynamic";

export default async function NavigationPage() {
  const items = await getAllNavItems();
  const dict = getDictionary("de"); // Admin-Oberfläche ist Deutsch
  const labelled = items.map((i) => ({
    key: i.key,
    href: i.href,
    label: dict.nav[i.key],
    active: i.active,
    sortOrder: i.sortOrder,
  }));
  return <NavigationManager items={labelled} />;
}
