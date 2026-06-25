import { db } from "@/lib/db";
import ProductManager, {
  AdminProduct,
  AdminCategory,
} from "./ProductManager";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [dbProducts, dbCategories] = await Promise.all([
    db.product.findMany({
      include: { category: true },
      orderBy: [{ displayOrder: "desc" }, { createdAt: "desc" }],
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products: AdminProduct[] = dbProducts.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    subtitle: p.subtitle,
    description: p.description,
    icon: p.icon,
    priceCents: p.priceCents,
    priceTiers: p.priceTiers ?? "[]",
    sizes: p.sizes ?? "[]",
    stock: p.stock,
    status: p.status,
    isNew: p.isNew,
    isEco: p.isEco,
    colors: p.colors,
    material: p.material,
    images: p.images,
    colorImages: (p as { colorImages?: string }).colorImages || "{}",
    careSymbols: (p as { careSymbols?: string }).careSymbols || "",
    displayOrder: (p as { displayOrder?: number }).displayOrder ?? 0,
    visiblePages: (() => {
      try {
        const arr = JSON.parse(p.visiblePages ?? "[]");
        return Array.isArray(arr) ? arr.filter((x: unknown) => typeof x === "string") : [];
      } catch {
        return [];
      }
    })(),
    categoryId: p.categoryId,
    categoryName: p.category.name,
  }));

  const categories: AdminCategory[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return <ProductManager products={products} categories={categories} />;
}
