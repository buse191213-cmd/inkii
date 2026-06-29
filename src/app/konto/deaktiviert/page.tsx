import SiteShell from "@/components/SiteShell";
import Link from "next/link";

export const metadata = { title: "Konto deaktiviert | INKII Works" };

export default function DeaktiviertPage() {
  return (
    <SiteShell>
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>👋</div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 16, color: "#004537" }}>
          Ihr Konto wurde deaktiviert
        </h1>
        <p style={{ color: "#64748b", marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
          Vielen Dank, dass Sie INKII Works genutzt haben. Ihr Konto ist nun deaktiviert
          und Sie sind abgemeldet.
        </p>
        <p style={{ color: "#475569", marginBottom: 32, fontSize: 14, lineHeight: 1.5 }}>
          Ihre Bestellungen und Rechnungen bleiben aus rechtlichen Gründen weiterhin gespeichert.
          Sollten Sie Ihr Konto wieder aktivieren möchten, kontaktieren Sie uns bitte:
          <br />
          <a href="mailto:info@inkiiworks.de" style={{ color: "#004537", fontWeight: 600 }}>info@inkiiworks.de</a>
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              background: "#004537",
              color: "#fff",
              padding: "12px 28px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Zur Startseite
          </Link>
          <Link
            href="/kontakt"
            style={{
              border: "1px solid #004537",
              color: "#004537",
              padding: "12px 28px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Kontakt
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
