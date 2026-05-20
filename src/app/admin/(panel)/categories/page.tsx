import { db } from "@/lib/db";
import CategoryForm, { AdminCat } from "./CategoryForm";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const dbCategories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const categories: AdminCat[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c._count.products,
  }));

  return <CategoryForm categories={categories} />;
}
