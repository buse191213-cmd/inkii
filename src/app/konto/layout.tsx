import SiteShell from "@/components/SiteShell";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import KontoSidebar from "./KontoSidebar";

export default async function KontoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login?next=/konto");
  if (!customer.isActive) redirect("/konto/deaktiviert");

  return (
    <SiteShell>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Mein Konto</h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
            Willkommen, {customer.firstName} {customer.lastName}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 28 }} className="konto-grid">
          <KontoSidebar
            customerName={`${customer.firstName} ${customer.lastName}`}
            customerEmail={customer.email}
          />
          <div>{children}</div>
        </div>

        <style>{`
          @media (max-width: 800px) {
            .konto-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </SiteShell>
  );
}
