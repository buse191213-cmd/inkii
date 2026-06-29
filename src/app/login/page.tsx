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

  // Slideshow için ürünleri çek (images = CSV string)
  let slideImages: string[] = [];
  try {
    const products = await db.product.findMany({
      where: {
        status: "active",
        NOT: { images: "" },
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
      select: { images: true },
    });

    slideImages = products
      .map((p) => p.images.split(",")[0]?.trim())
      .filter((url): url is string => Boolean(url))
      .slice(0, 5);
  } catch (e) {
    console.warn("Slide images query failed:", e);
  }

  // Fallback: DTF mockups
  if (slideImages.length === 0) {
    slideImages = [
      "/dtf-engine/mockups/tshirt.png",
      "/dtf-engine/mockups/hoodie.png",
      "/dtf-engine/mockups/polo.png",
      "/dtf-engine/mockups/cap.png",
      "/dtf-engine/mockups/bag.png",
    ];
  }

  return <LoginClient next={params.next ?? "/konto"} slideImages={slideImages} />;
}
