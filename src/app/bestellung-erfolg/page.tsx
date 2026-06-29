import Link from "next/link";
import SiteShell from "@/components/SiteShell";

export const metadata = {
  title: "Bestellung erfolgreich | INKII Works",
};

type Props = {
  searchParams: Promise<{ nr?: string }>;
};

export default async function BestellungErfolgPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderNumber = params.nr ?? "";

  return (
    <SiteShell>
    <section
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: "80px 28px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 16 }}>✓</div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16, color: "#004537" }}>
        Vielen Dank für Ihre Bestellung!
      </h1>
      {orderNumber && (
        <p style={{ fontSize: 18, color: "#1f2937", marginBottom: 24 }}>
          Bestellnummer: <strong>{orderNumber}</strong>
        </p>
      )}
      <p style={{ color: "#64748b", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
        Wir haben Ihre Bestellung erhalten und eine Bestätigung an Ihre E-Mail-Adresse gesendet.
        Wir setzen uns in Kürze mit Ihnen in Verbindung, um die nächsten Schritte zu besprechen
        (Designprüfung, Produktion, Lieferung).
      </p>

      <div
        style={{
          background: "#f0fdf4",
          padding: 20,
          marginBottom: 32,
          border: "1px solid #86efac",
          textAlign: "left",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Nächste Schritte:</h3>
        <ol style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.8, color: "#1f2937" }}>
          <li>Wir prüfen Ihre Bestellung und ggf. Designs.</li>
          <li>Sie erhalten eine Bestätigung mit Produktions- und Lieferzeitraum.</li>
          <li>Nach Fertigstellung wird Ihre Bestellung versendet, mit Tracking-Information.</li>
        </ol>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/werbemittel"
          style={{
            display: "inline-block",
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
            display: "inline-block",
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
