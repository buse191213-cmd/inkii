import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import DesignerClient from "./DesignerClient";
import { getHomeImage } from "@/lib/home-images";

export const metadata: Metadata = {
  title: "3D-Designer · Ihr Design auf dem Produkt",
  description: "Laden Sie Ihr Logo hoch und sehen Sie Ihr Design realistisch auf T-Shirt, Hoodie, Cap und Tasche. Vorschau vor dem Bestellen.",
  alternates: { canonical: "/designer" },
};

export default async function DesignerPage() {
  // Admin'den yüklenen ürün fotoğrafları (varsa foto-mockup, yoksa 3D)
  const productPhotos = {
    tshirt: await getHomeImage("designer-tshirt"),
    hoodie: await getHomeImage("designer-hoodie"),
    cap: await getHomeImage("designer-cap"),
    tote: await getHomeImage("designer-tote"),
  };

  return (
    <SiteShell>
      <DesignerClient productPhotos={productPhotos} />
    </SiteShell>
  );
}
