"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/app/admin/actions";

export default function DeleteCustomerButton({
  customerId,
  customerName,
  orderCount,
}: {
  customerId: string;
  customerName: string;
  orderCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteCustomer(customerId);
      if (res.ok) {
        // Liste sayfasını yeniden yükle (silinen kaydın detayına gitmeyi önler)
        router.refresh();
        setConfirming(false);
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
          title={orderCount > 0 ? `${orderCount} Bestellung(en) werden mitgelöscht` : undefined}
        >
          {isPending ? "…" : orderCount > 0 ? `Ja, mit ${orderCount} Best.` : "Ja, löschen"}
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
      title={`${customerName} löschen`}
      aria-label={`${customerName} löschen`}
      style={{
        background: "transparent", border: "none", cursor: "pointer",
        color: "#dc2626", padding: 4, display: "inline-flex",
        alignItems: "center", justifyContent: "center", borderRadius: 4,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6"/>
      </svg>
    </button>
  );
}
