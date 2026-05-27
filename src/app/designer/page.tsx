import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import DesignerClient from "./DesignerClient";

export const metadata: Metadata = {
  title: "3D-Designer · Ihr Design auf dem Produkt",
  description: "Laden Sie Ihr Logo hoch und sehen Sie Ihr Design in 360° auf einem T-Shirt. Echte 3D-Vorschau vor dem Bestellen.",
  alternates: { canonical: "/designer" },
};

export default function DesignerPage() {
  return (
    <SiteShell>
      <DesignerClient />
    </SiteShell>
  );
}
