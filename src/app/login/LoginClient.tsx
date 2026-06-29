"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginCustomer } from "./auth-actions";

export default function LoginClient({ next }: { next: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginCustomer(email, password);
      if (result.ok) {
        router.push(next);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <section style={{ maxWidth: 480, margin: "0 auto", padding: "60px 28px" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Anmelden</h1>
      <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>
        Melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={field}>
          <label>E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            placeholder="name@beispiel.de"
            required
            autoFocus
          />
        </div>

        <div style={field}>
          <label>Passwort</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            required
          />
        </div>

        {error && (
          <div style={{ padding: 10, background: "#fee2e2", color: "#991b1b", fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            background: isPending ? "#94a3b8" : "#004537",
            color: "#fff",
            padding: "13px 16px",
            fontWeight: 600,
            border: "none",
            cursor: isPending ? "default" : "pointer",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          {isPending ? "Wird angemeldet…" : "Anmelden"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
          <Link href="/registrieren" style={{ color: "#004537", textDecoration: "underline" }}>
            Neuen Account erstellen
          </Link>
          <Link href="/warenkorb" style={{ color: "#64748b" }}>
            Als Gast bestellen →
          </Link>
        </div>
      </form>
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
  fontFamily: "inherit",
};
