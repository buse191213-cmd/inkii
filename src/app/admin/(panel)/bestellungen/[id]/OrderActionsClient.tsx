"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updateOrderTracking, updateOrderAdminNote } from "./order-update-actions";

const STATUS_OPTIONS = [
  { value: "NEU", label: "Neu" },
  { value: "WARTEND", label: "Wartend (Zahlung erwartet)" },
  { value: "BEZAHLT", label: "Bezahlt" },
  { value: "IN_PRODUKTION", label: "In Produktion" },
  { value: "VERSANDBEREIT", label: "Versandbereit" },
  { value: "VERSENDET", label: "Versendet" },
  { value: "ZUGESTELLT", label: "Zugestellt" },
  { value: "ABGESCHLOSSEN", label: "Abgeschlossen" },
  { value: "STORNIERT", label: "Storniert" },
  { value: "RUECKERSTATTET", label: "Rückerstattet" },
];

const CARRIERS = ["DHL", "DPD", "Hermes", "GLS", "UPS", "Deutsche Post"];

type Props = {
  orderId: string;
  currentStatus: string;
  trackingNumber: string;
  shippingCarrier: string;
  adminNote: string;
};

export default function OrderActionsClient({
  orderId,
  currentStatus,
  trackingNumber: initTracking,
  shippingCarrier: initCarrier,
  adminNote: initNote,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [carrier, setCarrier] = useState(initCarrier || "DHL");
  const [tracking, setTracking] = useState(initTracking);
  const [adminNote, setAdminNote] = useState(initNote);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Sync props → state, wenn vom Server neue Werte kommen (router.refresh)
  useEffect(() => { setStatus(currentStatus); }, [currentStatus]);
  useEffect(() => { setTracking(initTracking); }, [initTracking]);
  useEffect(() => { setCarrier(initCarrier || "DHL"); }, [initCarrier]);
  useEffect(() => { setAdminNote(initNote); }, [initNote]);

  function notify(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), type === "err" ? 8000 : 5000);
  }

  function handleStatusChange(newStatus: string) {
    if (newStatus === status) return; // değişiklik yok

    // Optimistic UI — hemen güncelle, gerekirse geri al
    const previousStatus = status;
    setStatus(newStatus);

    startTransition(async () => {
      try {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.ok) {
          notify("ok", `Status geändert auf: ${newStatus}${result.emailSent ? " · Kunde benachrichtigt 📧" : ""}`);
          router.refresh();
        } else {
          // Rollback
          setStatus(previousStatus);
          notify("err", `Fehler: ${result.error ?? "Status konnte nicht geändert werden"}`);
          console.error("Status update failed:", result);
        }
      } catch (e) {
        setStatus(previousStatus);
        notify("err", `Ausnahme: ${e instanceof Error ? e.message : "Unbekannt"}`);
        console.error("Status update exception:", e);
      }
    });
  }

  function handleTrackingSave() {
    startTransition(async () => {
      const result = await updateOrderTracking(orderId, carrier, tracking);
      if (result.ok) {
        if (result.statusChanged) {
          notify("ok", `Versanddaten gespeichert · Status → VERSENDET${result.emailSent ? " · Kunde benachrichtigt 📧" : ""}`);
          setStatus("VERSENDET");
        } else {
          notify("ok", "Versanddaten gespeichert");
        }
        router.refresh();
      } else {
        notify("err", result.error ?? "Fehler");
      }
    });
  }

  function handleNoteSave() {
    startTransition(async () => {
      const result = await updateOrderAdminNote(orderId, adminNote);
      if (result.ok) {
        notify("ok", "Notiz gespeichert");
      } else {
        notify("err", result.error ?? "Fehler");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Status değiştirici */}
      <div>
        <label style={lbl}>Status ändern:</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            style={{ ...input, flex: 1, maxWidth: 300 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {isPending && <span style={{ fontSize: 12, color: "#64748b" }}>Wird gespeichert…</span>}
        </div>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
          Statusänderung sendet automatisch eine E-Mail an den Kunden.
        </p>
      </div>

      {/* Kargo */}
      <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #e5e7eb" }}>
        <label style={lbl}>📦 Versanddaten:</label>
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr auto", gap: 8, marginTop: 6 }}>
          <select value={carrier} onChange={(e) => setCarrier(e.target.value)} style={input}>
            {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Tracking-Nummer"
            style={input}
          />
          <button
            type="button"
            onClick={handleTrackingSave}
            disabled={isPending}
            style={btn}
          >
            Speichern
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#0e7490", marginTop: 6 }}>
          ℹ️ Beim Speichern einer Tracking-Nummer wird der Status automatisch auf <strong>VERSENDET</strong> gesetzt und der Kunde per E-Mail benachrichtigt.
        </p>
      </div>

      {/* Admin Notu */}
      <div>
        <label style={lbl}>Admin-Notiz (intern):</label>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={2}
            style={{ ...input, flex: 1, fontFamily: "inherit", resize: "vertical" }}
          />
          <button type="button" onClick={handleNoteSave} disabled={isPending} style={btn}>
            Speichern
          </button>
        </div>
      </div>

      {msg && (
        <div
          style={{
            padding: "8px 12px",
            background: msg.type === "ok" ? "#d1fae5" : "#fee2e2",
            color: msg.type === "ok" ? "#065f46" : "#991b1b",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 };
const input: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  fontSize: 13,
  background: "#fff",
  fontFamily: "inherit",
};
const btn: React.CSSProperties = {
  padding: "8px 16px",
  background: "#004537",
  color: "#fff",
  border: "none",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};
