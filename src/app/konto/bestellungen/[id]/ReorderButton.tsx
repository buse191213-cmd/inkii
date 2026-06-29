"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

type ReorderItem = {
  productId: string;
  productCode: string;
  productName: string;
  productImage: string;
  color: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  hasDtf: boolean;
  dtfSize: string;
  dtfPriceCents: number;
  dtfDesignUrl: string;
};

export default function ReorderButton({ items, mode = "all" }: { items: ReorderItem[]; mode?: "all" | "single" }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [done, setDone] = useState(false);

  function handleReorder() {
    items.forEach((it) => {
      addItem({
        productId: it.productId,
        productCode: it.productCode,
        productName: it.productName,
        productImage: it.productImage,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
        unitPriceCents: it.unitPriceCents,
        hasDtf: it.hasDtf,
        dtfSize: it.dtfSize,
        dtfPriceCents: it.dtfPriceCents,
        dtfDesignUrl: it.dtfDesignUrl,
      });
    });
    setDone(true);
    setTimeout(() => {
      router.push("/warenkorb");
    }, 600);
  }

  if (mode === "single") {
    return (
      <button
        type="button"
        onClick={handleReorder}
        disabled={done}
        style={{
          background: done ? "#d1fae5" : "transparent",
          color: done ? "#065f46" : "#0f1a16",
          border: "1px solid #0f1a16",
          padding: "6px 12px",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          cursor: done ? "default" : "pointer",
          whiteSpace: "nowrap",
          borderRadius: 4,
          transition: "all 0.15s",
        }}
      >
        {done ? "✓ Hinzugefügt" : "🔄 Wieder bestellen"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleReorder}
      disabled={done}
      style={{
        background: done ? "#d1fae5" : "#0f1a16",
        color: done ? "#065f46" : "#fff",
        padding: "12px 24px",
        fontWeight: 700,
        border: "none",
        cursor: done ? "default" : "pointer",
        fontSize: 12,
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        borderRadius: 4,
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {done ? "✓ Zum Warenkorb hinzugefügt" : "🔄 Komplette Bestellung wiederholen"}
    </button>
  );
}
