"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCompanyInfo, type CompanyInfoInput } from "./company-info-actions";

export default function CompanyInfoManager({ initial }: { initial: CompanyInfoInput }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CompanyInfoInput>(initial);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set<K extends keyof CompanyInfoInput>(key: K, val: CompanyInfoInput[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  function handleSave() {
    setMsg(null);
    startTransition(async () => {
      const result = await saveCompanyInfo(form);
      if (result.ok) {
        setMsg({ type: "ok", text: "Firmendaten gespeichert. PDF Rechnungen verwenden ab jetzt diese Daten." });
        router.refresh();
        setTimeout(() => setMsg(null), 4000);
      } else {
        setMsg({ type: "err", text: result.error ?? "Fehler" });
      }
    });
  }

  return (
    <div className="panel" style={{ marginBottom: 20 }}>
      <div className="panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>🏢 Firmendaten & Rechnung</h3>
        <small style={{ color: "#64748b", fontSize: 12 }}>Diese Daten werden auf jeder Rechnung verwendet.</small>
      </div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Firma */}
        <h4 style={section}>Firma</h4>
        <div style={row}>
          <div style={field}>
            <label>Firmenname</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} style={input} />
          </div>
          <div style={field}>
            <label>Inhaber</label>
            <input value={form.owner} onChange={(e) => set("owner", e.target.value)} style={input} />
          </div>
        </div>

        <h4 style={section}>Adresse</h4>
        <div style={field}>
          <label>Straße & Hausnummer</label>
          <input value={form.street} onChange={(e) => set("street", e.target.value)} style={input} />
        </div>
        <div style={row}>
          <div style={{ ...field, maxWidth: 120 }}>
            <label>PLZ</label>
            <input value={form.zip} onChange={(e) => set("zip", e.target.value)} style={input} />
          </div>
          <div style={field}>
            <label>Stadt</label>
            <input value={form.city} onChange={(e) => set("city", e.target.value)} style={input} />
          </div>
          <div style={field}>
            <label>Land</label>
            <input value={form.country} onChange={(e) => set("country", e.target.value)} style={input} />
          </div>
        </div>

        <h4 style={section}>Kontakt</h4>
        <div style={row}>
          <div style={field}>
            <label>Telefon</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} style={input} />
          </div>
          <div style={field}>
            <label>E-Mail</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={input} />
          </div>
          <div style={field}>
            <label>Web</label>
            <input value={form.web} onChange={(e) => set("web", e.target.value)} style={input} />
          </div>
        </div>

        <h4 style={section}>Steuer</h4>
        <div style={row}>
          <div style={field}>
            <label>USt-IdNr</label>
            <input value={form.ustId} onChange={(e) => set("ustId", e.target.value)} style={input} placeholder="DE123456789" />
          </div>
          <div style={field}>
            <label>Steuernummer (optional)</label>
            <input value={form.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} style={input} />
          </div>
          <div style={{ ...field, maxWidth: 140 }}>
            <label>MwSt-Satz (%)</label>
            <input type="number" value={form.taxRate} onChange={(e) => set("taxRate", Number(e.target.value))} style={input} min={0} max={30} />
          </div>
        </div>

        <h4 style={section}>💳 Bankverbindung (für „Auf Rechnung")</h4>
        <div style={row}>
          <div style={field}>
            <label>Bank</label>
            <input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} style={input} placeholder="Sparkasse Essen" />
          </div>
          <div style={{ ...field, maxWidth: 200 }}>
            <label>BIC</label>
            <input value={form.bic} onChange={(e) => set("bic", e.target.value)} style={input} placeholder="SPESDE3EXXX" />
          </div>
        </div>
        <div style={field}>
          <label>IBAN</label>
          <input value={form.iban} onChange={(e) => set("iban", e.target.value)} style={input} placeholder="DE89 3704 0044 0532 0130 00" />
        </div>
        <div style={{ ...field, maxWidth: 200 }}>
          <label>Zahlungsziel (Tage)</label>
          <input type="number" value={form.paymentTermDays} onChange={(e) => set("paymentTermDays", Number(e.target.value))} style={input} min={0} max={90} />
        </div>

        {msg && (
          <div style={{ padding: 12, background: msg.type === "ok" ? "#d1fae5" : "#fee2e2", color: msg.type === "ok" ? "#065f46" : "#991b1b", fontSize: 13 }}>
            {msg.text}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          style={{
            background: isPending ? "#94a3b8" : "#004537",
            color: "#fff",
            padding: "12px 24px",
            fontWeight: 600,
            border: "none",
            cursor: isPending ? "default" : "pointer",
            alignSelf: "flex-start",
          }}
        >
          {isPending ? "Wird gespeichert…" : "Firmendaten speichern"}
        </button>
      </div>
    </div>
  );
}

const section: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#475569", marginTop: 8, marginBottom: -4, textTransform: "uppercase", letterSpacing: 0.5 };
const row: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 };
const input: React.CSSProperties = {
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  fontSize: 13,
  background: "#fff",
  fontFamily: "inherit",
};
