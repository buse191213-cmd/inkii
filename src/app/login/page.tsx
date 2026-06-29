import { getCurrentCustomerId } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Anmelden | INKII Works",
};
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const id = await getCurrentCustomerId();
  if (id) {
    const params = await searchParams;
    redirect(params.next || "/konto");
  }
  const params = await searchParams;

  // Slideshow için 5 ürün görseli çek
  const products = await db.product.findMany({
    where: { images: { some: {} } },
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: { images: { take: 1 } },
  });
  const slideImages = products
    .map((p) => p.images[0]?.url)
    .filter((url): url is string => Boolean(url));

  // Fallback: DTF mockups
  if (slideImages.length === 0) {
    slideImages.push(
      "/dtf-engine/mockups/tshirt.png",
      "/dtf-engine/mockups/hoodie.png",
      "/dtf-engine/mockups/polo.png",
      "/dtf-engine/mockups/cap.png",
      "/dtf-engine/mockups/bag.png"
    );
  }

  return <LoginClient next={params.next ?? "/konto"} slideImages={slideImages} />;
}
