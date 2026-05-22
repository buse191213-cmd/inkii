import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  return { title: product ? `${product.name} | INKII` : "Artikel | INKII" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <SiteShell>
      <section style={{ padding: "60px 0" }}>
        <div className="wrap">
          <div style={{ marginBottom: 16, fontSize: ".85rem", color: "#7a8580" }}>
            <Link href="/werbemittel" style={{ color: "inherit" }}>← Zurück zum Katalog</Link>
          </div>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, margin: "0 0 8px" }}>
            {product.name}
          </h1>
          <p style={{ color: "#7a8580", margin: 0 }}>Artikelnummer: {product.code}</p>
          <p style={{ marginTop: 24, lineHeight: 1.6 }}>
            {product.subtitle || product.description || "Auf Anfrage."}
          </p>
          <div style={{ marginTop: 32 }}>
            <Link
              href="/kontakt"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                background: "#1c2722",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Anfrage senden
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
