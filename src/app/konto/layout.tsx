import { getCurrentCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import KontoSidebar from "./KontoSidebar";

export default async function KontoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login?next=/konto");
  if (!customer.isActive) redirect("/konto/deaktiviert");

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const meinKonto = locale === "tr" ? "Hesabım" : locale === "en" ? "My Account" : "Mein Konto";
  const hallo = locale === "tr" ? "Merhaba" : locale === "en" ? "Hello" : "Hallo";

  return (
    <div className="konto-shell">
      {/* SOL: Sidebar — Desktop'ta sticky, mobilde üstte */}
      <aside className="konto-side">
        <KontoSidebar
          customerName={`${customer.firstName} ${customer.lastName}`}
          customerEmail={customer.email}
          t={dict.konto.nav}
        />
      </aside>

      {/* SAĞ: Main Content */}
      <main className="konto-main">
        <div className="konto-content">
          {/* Editorial Header */}
          <div style={{ marginBottom: 36, paddingBottom: 20, borderBottom: "1px solid #e5e5e5" }}>
            <p style={{
              fontSize: 11,
              color: "#999",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 600,
              margin: 0,
              marginBottom: 10,
            }}>
              {meinKonto}
            </p>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: 600,
              margin: 0,
              color: "#0f1a16",
              letterSpacing: "-0.02em",
            }}>
              {hallo}, {customer.firstName}
            </h1>
          </div>

          {children}
        </div>
      </main>

      <style>{`
        .konto-shell {
          position: fixed;
          inset: 0;
          display: grid;
          grid-template-columns: 260px 1fr;
          background: #fff;
          z-index: 50;
        }
        .konto-side {
          background: #fff;
          border-right: 1px solid #e5e5e5;
          overflow-y: auto;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .konto-main {
          overflow-y: auto;
          height: 100vh;
        }
        .konto-content {
          max-width: 980px;
          margin: 0 auto;
          padding: 48px 40px 80px;
        }

        /* Mobile */
        @media (max-width: 800px) {
          .konto-shell {
            position: static;
            inset: auto;
            display: block;
            min-height: 100vh;
          }
          .konto-side {
            position: relative;
            border-right: none;
            border-bottom: 1px solid #e5e5e5;
            height: auto;
            padding: 20px 20px 12px;
            overflow-y: visible;
          }
          .konto-main {
            overflow-y: visible;
            height: auto;
          }
          .konto-content {
            padding: 28px 20px 60px;
          }
        }
      `}</style>
    </div>
  );
}
