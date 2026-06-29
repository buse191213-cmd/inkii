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
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "50px 32px 80px" }}>

        {/* Editorial Header */}
        <div style={{ marginBottom: 50, paddingBottom: 28, borderBottom: "1px solid #e5e5e5" }}>
          <p style={{
            fontSize: 11,
            color: "#999",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: 600,
            margin: 0,
            marginBottom: 12,
          }}>
            Mein Konto
          </p>
          <h1 style={{
            fontSize: "2.4rem",
            fontWeight: 300,
            margin: 0,
            color: "#000",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            letterSpacing: "-0.02em",
          }}>
            Hallo, {customer.firstName}.
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 56 }} className="konto-grid">
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
              gap: 32px !important;
            }
          }
        `}</style>
      </section>
    </SiteShell>
  );
}
