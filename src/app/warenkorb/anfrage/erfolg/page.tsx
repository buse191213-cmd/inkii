import Link from "next/link";
import SiteShell from "@/components/SiteShell";

export const metadata = {
  title: "Anfrage gesendet | INKII Works",
};

export default function AnfrageErfolgPage() {
  return (
    <SiteShell>
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>✓</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16, color: "#004537" }}>
          Anfrage erfolgreich gesendet!
        </h1>
        <p style={{ color: "#64748b", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden mit einem
          individuellen Angebot bei Ihnen.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/werbemittel"
            style={{
              background: "#004537",
              color: "#fff",
              padding: "12px 28px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Weiter einkaufen
          </Link>
          <Link
            href="/"
            style={{
              border: "1px solid #004537",
              color: "#004537",
              padding: "12px 28px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Zur Startseite
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
