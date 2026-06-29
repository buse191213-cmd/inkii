"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { colorLabel } from "@/lib/catalog-options";
import { sendQuoteRequest } from "./quote-actions";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AnfrageClient() {
  const router = useRouter();
  const { items, subtotalCents, clearCart, isLoaded } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firmname, setFirmname] = useState("");
  const [message, setMessage] = useState("");
  const [accepts, setAccepts] = useState(false);

  if (!isLoaded) {
    return (
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 28px" }}>
        <p>Laden…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>Angebot anfragen</h1>
        <p style={{ color: "#64748b", marginBottom: 32 }}>
          Ihr Warenkorb ist leer. Bitte fügen Sie zuerst Artikel hinzu.
        </p>
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
          Zum Katalog →
        </Link>
      </section>
    );
  }

  function handleSubmit() {
    setError("");
    if (!firstName || !lastName || !email) {
      setError("Bitte Pflichtfelder ausfüllen.");
      return;
    }
    if (!accepts) {
      setError("Bitte AGB / Datenschutz akzeptieren.");
      return;
    }
    startTransition(async () => {
      const result = await sendQuoteRequest({
        customer: { firstName, lastName, email, phone, firmname },
        items: items.map((i) => ({
          productName: i.productName,
          productCode: i.productCode,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          hasDtf: i.hasDtf,
          dtfSize: i.dtfSize,
        })),
        message,
        subtotalCents,
      });
      if (result.ok) {
        clearCart();
        router.push("/warenkorb/anfrage/erfolg");
      } else {
        setError(result.error ?? "Anfrage konnte nicht gesendet werden.");
      }
    });
  }

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>Angebot anfragen</h1>
      <p style={{ color: "#64748b", marginBottom: 28, fontSize: 14 }}>
        Wir erstellen Ihnen ein individuelles Angebot für die Artikel in Ihrem Warenkorb.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }} className="anfrage-layout">
        {/* FORM */}
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Ihre Kontaktdaten</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={field}>
              <label>Vorname *</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={input} />
            </div>
            <div style={field}>
              <label>Nachname *</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={input} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={field}>
              <label>E-Mail *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
            </div>
            <div style={field}>
              <label>Telefon</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={input} />
            </div>
          </div>

          <div style={{ ...field, marginBottom: 12 }}>
            <label>Firma (optional)</label>
            <input value={firmname} onChange={(e) => setFirmname(e.target.value)} style={input} />
          </div>

          <div style={{ ...field, marginBottom: 16 }}>
            <label>Ihre Nachricht (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Z.B. Wunschmenge, Lieferzeitraum, Druckspezifikationen…"
              style={{ ...input, minHeight: 100, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          <label style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.5, cursor: "pointer", marginBottom: 16 }}>
            <input
              type="checkbox"
              checked={accepts}
              onChange={(e) => setAccepts(e.target.checked)}
              style={{ marginTop: 3, flexShrink: 0 }}
            />
            <span>
              Ich habe die{" "}
              <Link href="/datenschutz" style={{ color: "#004537", textDecoration: "underline" }}>
                Datenschutzerklärung
              </Link>{" "}
              gelesen und stimme der Verarbeitung meiner Daten zu.
            </span>
          </label>

          {error && (
            <div style={{ marginTop: 12, padding: 12, background: "#fee2e2", color: "#991b1b", fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside
          style={{
            background: "#f8fafc",
            padding: 24,
            border: "1px solid #e5e7eb",
            position: "sticky",
            top: 100,
            alignSelf: "start",
          }}
        >
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Ihre Anfrage</h3>

          <div style={{ marginBottom: 16, maxHeight: 280, overflowY: "auto" }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    background: "#f4f5f3",
                    flexShrink: 0,
                  }}
                >
                  {item.productImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>
                    {item.productCode}
                    {item.color && ` · ${colorLabel(item.color)}`}
                    {item.size && ` · ${item.size}`}
                    {" · "}{item.quantity} Stk
                  </div>
                  {item.hasDtf && (
                    <div style={{ color: "#0d9488", fontSize: 11, marginTop: 2 }}>+ DTF {item.dtfSize}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {subtotalCents > 0 && (
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12, padding: 8, background: "#fff" }}>
              Vorläufige Summe: <strong>{euro(subtotalCents)} €</strong>
              <br />
              <small>(Finale Preise im Angebot)</small>
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              display: "block",
              width: "100%",
              background: isPending ? "#94a3b8" : "#004537",
              color: "#fff",
              padding: "14px 20px",
              textAlign: "center",
              fontWeight: 600,
              border: "none",
              cursor: isPending ? "default" : "pointer",
              fontSize: 15,
            }}
          >
            {isPending ? "Wird gesendet…" : "Anfrage senden →"}
          </button>

          <Link
            href="/warenkorb"
            style={{
              display: "block",
              marginTop: 10,
              textAlign: "center",
              color: "#64748b",
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            ← Zurück zum Warenkorb
          </Link>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 800px) {
          :global(.anfrage-layout) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  width: "100%",
  fontFamily: "inherit",
};
