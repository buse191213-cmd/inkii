"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { submitProductInquiry } from "@/app/werbemittel/[id]/actions";
import type { ProductSize } from "@/lib/sizes";
import type { PriceTier } from "@/lib/price-tiers";

type Props = {
  productId: string;
  productCode: string;
  productName: string;
  sizes: ProductSize[];
  tiers: PriceTier[];
  basePriceCents: number | null;
};

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Findet die passende Staffel für eine Gesamtmenge (höchste qty ≤ totalQty). */
function findTier(tiers: PriceTier[], qty: number): PriceTier | null {
  if (qty <= 0 || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.qty - b.qty);
  let match: PriceTier | null = null;
  for (const t of sorted) {
    if (qty >= t.qty) match = t;
  }
  return match;
}

export default function DetailOrderForm({
  productId,
  productCode,
  productName,
  sizes,
  tiers,
  basePriceCents,
}: Props) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    sizes.forEach((s) => (init[s.name] = 0));
    if (sizes.length === 0) init["__default"] = 0;
    return init;
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const totalQty = useMemo(
    () => Object.values(qty).reduce((s, n) => s + (n || 0), 0),
    [qty]
  );

  const activeTier = useMemo(() => findTier(tiers, totalQty), [tiers, totalQty]);
  const unitCents = activeTier?.cents ?? basePriceCents ?? null;

  const subtotalCents = useMemo(() => {
    if (unitCents == null) return null;
    let sum = 0;
    for (const s of sizes) {
      const q = qty[s.name] || 0;
      sum += q * (unitCents + (s.extraCents || 0));
    }
    if (sizes.length === 0) sum = (qty["__default"] || 0) * unitCents;
    return sum;
  }, [qty, sizes, unitCents]);

  function setSizeQty(name: string, value: number) {
    setQty((cur) => ({ ...cur, [name]: Math.max(0, Math.floor(value || 0)) }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    if (totalQty === 0) {
      setErr("Bitte mindestens eine Menge eintragen.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setErr("Name und E-Mail sind erforderlich.");
      return;
    }
    setBusy(true);
    try {
      const itemsList = sizes.length > 0
        ? sizes.filter((s) => (qty[s.name] || 0) > 0).map((s) => ({ size: s.name, qty: qty[s.name] }))
        : [{ size: "—", qty: qty["__default"] || 0 }];
      const res = await submitProductInquiry({
        productId,
        productCode,
        productName,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        note: note.trim(),
        items: itemsList,
        totalQty,
      });
      if (res.ok) {
        setSent(true);
      } else {
        setErr(res.error ?? "Fehler beim Versenden.");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unerwarteter Fehler.");
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  if (sent) {
    return (
      <div className="det-order-success">
        <div className="det-order-success-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3>Anfrage gesendet!</h3>
        <p>Wir melden uns innerhalb von 24 Stunden mit einem Angebot.</p>
      </div>
    );
  }

  return (
    <form className="det-order" onSubmit={submit}>
      <div className="det-order-head">
        <h3>Anfrage mit Mengen senden</h3>
        <p>Geben Sie Ihre Wunschmengen ein — wir senden Ihnen ein passendes Angebot.</p>
      </div>

      {/* Größen + Mengen */}
      {sizes.length > 0 ? (
        <div className="det-order-sizes">
          {sizes.map((s) => (
            <label key={s.name} className="det-order-size">
              <span className="det-order-size-name">{s.name}</span>
              {s.extraCents > 0 && (
                <span className="det-order-size-extra">+€{euro(s.extraCents)}</span>
              )}
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={qty[s.name] || ""}
                onChange={(e) => setSizeQty(s.name, parseInt(e.target.value || "0", 10))}
                placeholder="0"
              />
            </label>
          ))}
        </div>
      ) : (
        <div className="det-order-sizes single">
          <label className="det-order-size">
            <span className="det-order-size-name">Menge</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={qty["__default"] || ""}
              onChange={(e) => setSizeQty("__default", parseInt(e.target.value || "0", 10))}
              placeholder="0"
            />
          </label>
        </div>
      )}

      {/* Mengenstaffel als Hinweis */}
      {tiers.length > 0 && (
        <div className="det-order-tier-hint">
          {tiers.map((t, i) => {
            const isActive = activeTier?.qty === t.qty;
            return (
              <div key={i} className={`det-tier-pill${isActive ? " active" : ""}`}>
                <span className="det-tier-qty">ab {t.qty} Stk</span>
                <span className="det-tier-price">€{euro(t.cents)}/Stk</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Totalanzeige */}
      <div className="det-order-total">
        <div>
          <span className="det-order-total-lbl">Gesamtmenge</span>
          <span className="det-order-total-val">{totalQty} Stück</span>
        </div>
        {subtotalCents != null && totalQty > 0 && (
          <div>
            <span className="det-order-total-lbl">Voraussichtl. Summe</span>
            <span className="det-order-total-val">
              €{euro(subtotalCents)}
            </span>
          </div>
        )}
      </div>

      {/* Kundendaten */}
      <div className="det-order-fields">
        <input
          className="det-order-input"
          placeholder="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="det-order-input"
          type="email"
          placeholder="E-Mail *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="det-order-input"
          type="tel"
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          className="det-order-input det-order-textarea"
          placeholder="Anmerkungen, Wunschveredelung, Logoplatzierung …"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>

      {err && <div className="det-order-err">{err}</div>}

      <button type="submit" className="det-order-submit" disabled={busy}>
        {busy ? "Wird gesendet …" : `Anfrage absenden${totalQty > 0 ? ` (${totalQty} Stück)` : ""}`}
      </button>

      <p className="det-order-foot">
        Sie erhalten ein verbindliches Angebot innerhalb von 24 Stunden auf Ihre E-Mail.
      </p>
    </form>
  );
}
