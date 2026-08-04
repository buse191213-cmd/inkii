import SiteShell from "@/components/SiteShell";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import KollektionDetailClient, { type KollektionDetail } from "./KollektionDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let name = "Produkt";
  try {
    const p = await db.product.findUnique({ where: { id } });
    if (p) name = p.name;
  } catch { /* leer */ }
  return { title: name, alternates: { canonical: `/kollektionen/${id}` } };
}

export default async function KollektionProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let p: Awaited<ReturnType<typeof db.product.findUnique>> = null;
  try {
    p = await db.product.findUnique({ where: { id } });
  } catch { /* leer */ }

  if (!p || !(p as { isCollection?: boolean }).isCollection || p.status !== "active") {
    notFound();
  }

  let images: string[] = [];
  if (p.images) images = p.images.split(",").map((s) => s.trim()).filter(Boolean);
  let sizes: string[] = [];
  try {
    const parsed = JSON.parse(p.sizes || "[]");
    if (Array.isArray(parsed)) sizes = parsed.map((s: { name: string }) => s.name);
  } catch { /* leer */ }

  const detail: KollektionDetail = {
    id: p.id,
    code: p.code,
    name: p.name,
    subtitle: p.subtitle ?? "",
    description: p.description ?? "",
    priceCents: p.priceCents ?? 0,
    images,
    sizes,
    stock: p.stock ?? 0,
  };

  return (
    <SiteShell>
      <div className="wrap-wide" style={{ paddingTop: 24 }}>
        <Link href="/kollektionen" className="koll-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Zurück zu Kollektionen
        </Link>
        <div className="mm-page-crumb" style={{ marginTop: 12 }}>
          <Link href="/">Home</Link>
          <span className="mm-dot">•</span>
          <Link href="/kollektionen">Kollektionen</Link>
          <span className="mm-dot">•</span>
          <span className="active">{p.name}</span>
        </div>
      </div>
      <KollektionDetailClient product={detail} />
    </SiteShell>
  );
}
