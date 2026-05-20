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
      orderBy: { createdAt: "desc" },
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
    stock: p.stock,
    status: p.status,
    isNew: p.isNew,
    isEco: p.isEco,
    colors: p.colors,
    material: p.material,
    images: p.images,
    categoryId: p.categoryId,
    categoryName: p.category.name,
  }));

  const categories: AdminCategory[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return <ProductManager products={products} categories={categories} />;
}
