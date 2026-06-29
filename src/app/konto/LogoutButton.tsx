"use client";

import { useTransition } from "react";
import { logoutCustomer } from "../login/auth-actions";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutCustomer())}
      disabled={isPending}
      style={{
        background: "transparent",
        border: "1px solid #004537",
        color: "#004537",
        padding: "8px 18px",
        fontWeight: 600,
        cursor: isPending ? "default" : "pointer",
        fontSize: 13,
      }}
    >
      {isPending ? "…" : "Abmelden"}
    </button>
  );
}
