"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useMerkliste } from "@/components/MerklisteProvider";
import { submitMerklisteInquiry, MerklisteState } from "./actions";
import type { Dictionary } from "@/dictionaries/types";

const initial: MerklisteState = { ok: false };

export default function MerklisteView({
  t,
  common,
}: {
  t: Dictionary["merkzettel"];
  common: Dictionary["common"];
}) {
  const { items, mounted, setQty, remove, clear } = useMerkliste();
  const [state, formAction, pending] = useActionState(
    submitMerklisteInquiry,
    initial
  );

  useEffect(() => {
    if (state.ok) clear();
  }, [state.ok, clear]);

  if (!mounted) {
    return (
      <div className="wrap" style={{ padding: "70px 0" }}>
        <p style={{ color: "var(--muted)" }}>{t.loading}</p>
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="wrap" style={{ padding: "50px 0 70px" }}>
        <div className="form-card" style={{ maxWidth: 640 }}>
          <div className="form-ok">{t.formOk}</div>
          <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>
            {t.formOkNote}
          </p>
          <Link className="btn btn-ghost" href="/werbemittel">
            {t.okBack}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: "36px 0 70px" }}>
      <div className="merk-head">
        <span className="kicker">{t.headKicker}</span>
        <h1>{t.h1}</h1>
        <p>{t.intro}</p>
      </div>

      {items.length === 0 ? (
        <div className="merk-empty">
          <p>{t.emptyTitle}</p>
          <span>{t.emptyText}</span>
          <Link className="btn btn-primary" href="/werbemittel">
            {t.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="merk-layout">
          <div className="merk-list">
            {items.map((it) => (
              <div key={it.id} className="merk-row">
                <div className="merk-thumb">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt="" />
                  ) : (
                    <span>INKII</span>
                  )}
                </div>
                <div className="merk-info">
                  {it.code && (
                    <div className="merk-code">
                      {t.artNr} {it.code}
                    </div>
                  )}
                  <Link href={`/werbemittel/${it.id}`} className="merk-name">
                    {it.name}
                  </Link>
                  {it.sizes && it.sizes.length > 0 && (
                    <div className="merk-sizes">
                      {it.sizes.map((s, idx) => (
                        <span key={idx} className="merk-size-pill">
                          <b>{s.name}</b> × {s.qty}
                        </span>
                      ))}
                    </div>
                  )}
                  {it.note && (
                    <div className="merk-note">
                      <span className="merk-note-lbl">Anmerkung:</span> {it.note}
                    </div>
                  )}
                </div>
                <div className="merk-qty">
                  <button
                    type="button"
                    onClick={() => setQty(it.id, it.qty - 1)}
                    aria-label={t.qtyMinus}
                    disabled={!!(it.sizes && it.sizes.length > 0)}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={it.qty}
                    onChange={(e) =>
                      setQty(it.id, parseInt(e.target.value, 10) || 1)
                    }
                    disabled={!!(it.sizes && it.sizes.length > 0)}
                  />
                  <button
                    type="button"
                    onClick={() => setQty(it.id, it.qty + 1)}
                    aria-label={t.qtyPlus}
                    disabled={!!(it.sizes && it.sizes.length > 0)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="merk-remove"
                  onClick={() => remove(it.id)}
                  aria-label={t.removeItem}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm merk-clear"
              onClick={clear}
            >
              {t.clear}
            </button>
          </div>

          <form className="form-card merk-form" action={formAction}>
            <h3>{t.formTitle}</h3>
            <input
              type="hidden"
              name="items"
              value={JSON.stringify(
                items.map((i) => ({
                  code: i.code,
                  name: i.name,
                  qty: i.qty,
                  sizes: i.sizes ?? null,
                  note: i.note ?? null,
                }))
              )}
            />
            {state.error && <div className="form-err">{state.error}</div>}
            <div className="field">
              <label htmlFor="m-name">{t.fName}</label>
              <input id="m-name" name="name" type="text" required placeholder={t.phName} />
            </div>
            <div className="field">
              <label htmlFor="m-email">{t.fEmail}</label>
              <input
                id="m-email"
                name="email"
                type="email"
                required
                placeholder={t.phEmail}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="m-phone">{t.fPhone}</label>
                <input id="m-phone" name="phone" type="tel" placeholder={common.optional} />
              </div>
              <div className="field">
                <label htmlFor="m-company">{t.fCompany}</label>
                <input
                  id="m-company"
                  name="company"
                  type="text"
                  placeholder={common.optional}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="m-note">{t.fNote}</label>
              <textarea id="m-note" name="note" placeholder={t.phNote} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending
                ? common.sending
                : `${t.submitA}${items.length}${t.submitB}`}
            </button>
            <p className="form-note">{common.formNote}</p>
          </form>
        </div>
      )}
    </div>
  );
}
