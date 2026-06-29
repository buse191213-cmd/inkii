"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

const CART_STORAGE_KEY = "inkii_cart_v1";

export default function ReorderButton({ items, mode = "all" }: { items: ReorderItem[]; mode?: "all" | "single" }) {
  const router = useRouter();
  const [done, setDone] = useState(false);

  function handleReorder() {
    try {
      // localStorage direkt manipüle — CartProvider olsun olmasın çalışır
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      let cart: ReorderItem[] = [];
      if (stored) {
        try {
          cart = JSON.parse(stored);
          if (!Array.isArray(cart)) cart = [];
        } catch {
          cart = [];
        }
      }

      items.forEach((it) => {
        const id = `${it.productId}::${it.color}::${it.size}::${it.hasDtf ? it.dtfSize : "no"}`;
        const existingIdx = cart.findIndex((c: ReorderItem & { id?: string }) =>
          c.productId === it.productId &&
          c.color === it.color &&
          c.size === it.size &&
          (c.hasDtf ? c.dtfSize : "no") === (it.hasDtf ? it.dtfSize : "no")
        );
        if (existingIdx >= 0) {
          cart[existingIdx].quantity += it.quantity;
        } else {
          cart.push({ ...it, ...{ id } } as ReorderItem);
        }
      });

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      // Event yayınla, CartProvider başka sekme açıksa güncellesin
      window.dispatchEvent(new StorageEvent("storage", {
        key: CART_STORAGE_KEY,
        newValue: JSON.stringify(cart),
      }));

      setDone(true);
      setTimeout(() => {
        // Tam sayfa reload — CartProvider yeniden mount olur ve localStorage'ı okur
        window.location.href = "/warenkorb";
      }, 500);
    } catch (e) {
      console.error("Reorder failed:", e);
      alert("Bestellung konnte nicht in den Warenkorb gelegt werden.");
    }
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
