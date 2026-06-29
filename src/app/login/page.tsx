import { getCurrentCustomerId } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { getHomeImage } from "@/lib/home-images";
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

  // Textilveredelung görsellerini çek
  const slideImages: string[] = [];
  try {
    const keys = ["tv-hero", "tv-method-1", "tv-method-2", "tv-method-3", "tv-method-4", "tv-method-5"];
    for (const k of keys) {
      const img = await getHomeImage(k);
      if (img) slideImages.push(img);
    }
  } catch (e) {
    console.warn("Hero images query failed:", e);
  }

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
