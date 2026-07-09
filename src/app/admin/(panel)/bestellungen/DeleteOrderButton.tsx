"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder } from "@/app/admin/actions";

export default function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteOrder(orderId);
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.error || "Löschen fehlgeschlagen.");
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          style={{
            background: "#dc2626", color: "#fff", border: "none",
            padding: "4px 10px", borderRadius: 4, fontSize: 11,
            fontWeight: 600, cursor: isPending ? "default" : "pointer",
          }}
        >
          {isPending ? "…" : "Ja, löschen"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          style={{
            background: "#f1f5f9", color: "#475569", border: "none",
            padding: "4px 10px", borderRadius: 4, fontSize: 11,
            fontWeight: 600, cursor: "pointer",
          }}
        >
          Abbrechen
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title={`Bestellung ${orderNumber} löschen`}
      style={{
        background: "transparent", border: "none", cursor: "pointer",
        color: "#dc2626", padding: 4, display: "inline-flex", alignItems: "center",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  );
}
