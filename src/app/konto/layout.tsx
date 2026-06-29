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
    <div style={{
      position: "fixed",
      inset: 0,
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      background: "#fff",
      zIndex: 50,
    }} className="konto-shell">

      {/* SOL: Sabit Sidebar */}
      <aside style={{
        background: "#fff",
        borderRight: "1px solid #e5e5e5",
        overflowY: "auto",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }} className="konto-side">
        <KontoSidebar
          customerName={`${customer.firstName} ${customer.lastName}`}
          customerEmail={customer.email}
        />
      </aside>

      {/* SAĞ: Scroll içerik */}
      <main style={{
        overflowY: "auto",
        height: "100vh",
      }} className="konto-main">
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "50px 48px 80px" }}>

          {/* Editorial Header */}
          <div style={{ marginBottom: 50, paddingBottom: 24, borderBottom: "1px solid #e5e5e5" }}>
            <p style={{
              fontSize: 11,
              color: "#999",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 600,
              margin: 0,
              marginBottom: 10,
            }}>
              Mein Konto
            </p>
            <h1 style={{
              fontSize: "2.2rem",
              fontWeight: 600,
              margin: 0,
              color: "#0f1a16",
              letterSpacing: "-0.02em",
            }}>
              Hallo, {customer.firstName}
            </h1>
          </div>

          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 800px) {
          .konto-shell {
            grid-template-columns: 1fr !important;
          }
          .konto-side {
            display: none !important;
          }
          .konto-main {
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
}
