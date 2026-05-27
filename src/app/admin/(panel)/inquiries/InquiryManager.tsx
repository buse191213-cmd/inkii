"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatus, deleteInquiry } from "@/app/admin/actions";

export type AdminInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  status: string;
  date: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "Neu",
  progress: "In Bearbeitung",
  done: "Erledigt",
};

const STATUS_DOT: Record<string, string> = {
  new: "#d9a878",
  progress: "#6b8aaa",
  done: "#5e8470",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

/** Parst Merkzettel-Nachrichten in einzelne Artikel-Zeilen. */
function parseItems(message: string): { code?: string; name: string; qty?: number }[] {
  const lines = message.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("•") || l.startsWith("-"));
  return lines
    .map((raw) => {
      const clean = raw.replace(/^[•\-]\s*/, "");
      const qtyMatch = clean.match(/\(Menge:\s*(\d+)\)\s*$/i);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : undefined;
      const noQty = clean.replace(/\s*\(Menge:\s*\d+\)\s*$/i, "");
      const codeMatch = noQty.match(/^([A-Z0-9\-]+)\s*[–\-]\s*(.+)$/);
      if (codeMatch) {
        return { code: codeMatch[1], name: codeMatch[2].trim(), qty };
      }
      return { name: noQty, qty };
    })
    .filter((i) => i.name);
}

export default function InquiryManager({
  inquiries,
  productMap = {},
}: {
  inquiries: AdminInquiry[];
  productMap?: Record<string, { name: string; image: string }>;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);

  const list = useMemo(
    () => inquiries.filter((i) => filter === "all" || i.status === filter),
    [inquiries, filter]
  );

  const counts = useMemo(
    () => ({
      all: inquiries.length,
      new: inquiries.filter((i) => i.status === "new").length,
      progress: inquiries.filter((i) => i.status === "progress").length,
      done: inquiries.filter((i) => i.status === "done").length,
    }),
    [inquiries]
  );

  async function changeStatus(id: string, status: string) {
    setBusy(id);
    const res = await updateInquiryStatus(id, status);
    setBusy(null);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Fehler.");
  }

  async function handleDelete(inq: AdminInquiry) {
    if (!confirm(`Anfrage von „${inq.name}“ wirklich löschen?`)) return;
    setBusy(inq.id);
    const res = await deleteInquiry(inq.id);
    setBusy(null);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Löschen fehlgeschlagen.");
  }

  return (
    <>
      <p className="crumb">
        Admin <b>/ Anfragen</b>
      </p>

      <div className="inq-tabs">
        {([
          ["all", "Alle"],
          ["new", "Neu"],
          ["progress", "In Bearbeitung"],
          ["done", "Erledigt"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            className={`inq-tab ${filter === k ? "active" : ""}`}
            onClick={() => setFilter(k)}
          >
            {label}
            <span className="inq-tab-count">{counts[k]}</span>
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <div className="inq-empty">
          <div className="inq-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-2h14l2 2" />
            </svg>
          </div>
          <p>Keine Anfragen in dieser Kategorie.</p>
        </div>
      )}

      <div className="inq-list">
        {list.map((inq) => {
          const items = parseItems(inq.message);
          const isMerk = inq.subject.toLowerCase().includes("merkzettel");
          // Restmessage ohne Artikel-Liste
          const headerLine = inq.message.split("\n").find((l) => l && !l.startsWith("•") && !l.startsWith("-") && !l.startsWith("Angefragte"));
          return (
            <article key={inq.id} className={`inq-card status-${inq.status}`}>
              <header className="inq-head">
                <div className="inq-id">
                  <div className="inq-avatar">{initials(inq.name)}</div>
                  <div className="inq-id-text">
                    <h3>{inq.name || "—"}</h3>
                    <div className="inq-meta">
                      {inq.company && <span>{inq.company}</span>}
                      <span className="dot">·</span>
                      <span>{inq.date}</span>
                    </div>
                  </div>
                </div>
                <div className="inq-status-pill" style={{ "--dot": STATUS_DOT[inq.status] } as React.CSSProperties}>
                  <span className="inq-pill-dot" />
                  {STATUS_LABEL[inq.status] ?? inq.status}
                </div>
              </header>

              <div className="inq-subject">
                <span className="inq-subject-icon">
                  {isMerk ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="inq-subject-text">{inq.subject}</span>
              </div>

              <div className="inq-body">
                <div className="inq-contact">
                  <div className="inq-contact-row">
                    <span className="inq-lbl">E-Mail</span>
                    <a href={`mailto:${inq.email}`} className="inq-link">{inq.email}</a>
                  </div>
                  {inq.phone && (
                    <div className="inq-contact-row">
                      <span className="inq-lbl">Telefon</span>
                      <a href={`tel:${inq.phone}`} className="inq-link">{inq.phone}</a>
                    </div>
                  )}
                </div>

                {items.length > 0 ? (
                  <div className="inq-items">
                    <div className="inq-items-head">
                      <span>Artikel</span>
                      <span>{items.length} {items.length === 1 ? "Artikel" : "Artikel"}</span>
                    </div>
                    <ul className="inq-items-list">
                      {items.map((it, idx) => {
                        const prod = it.code ? productMap[it.code] : null;
                        return (
                          <li key={idx}>
                            <div className="inq-item-main">
                              {prod?.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img className="inq-item-thumb" src={prod.image} alt={it.name} />
                              ) : (
                                <div className="inq-item-thumb inq-item-thumb-empty" aria-hidden>
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <circle cx="9" cy="11" r="1.5" />
                                    <path d="M3 17l5-5 4 4 3-3 6 5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              )}
                              <div className="inq-item-text">
                                {it.code && <span className="inq-item-code">{it.code}</span>}
                                <span className="inq-item-name">{it.name}</span>
                              </div>
                            </div>
                            {it.qty && <span className="inq-item-qty">{it.qty}×</span>}
                          </li>
                        );
                      })}
                    </ul>
                    {headerLine && headerLine.length > 4 && (
                      <p className="inq-note">{headerLine}</p>
                    )}
                  </div>
                ) : (
                  <div className="inq-message">
                    {inq.message.split("\n").map((line, idx) => (
                      <p key={idx}>{line || <>&nbsp;</>}</p>
                    ))}
                  </div>
                )}
              </div>

              <footer className="inq-foot">
                <select
                  className="inq-status-select"
                  value={inq.status}
                  onChange={(e) => changeStatus(inq.id, e.target.value)}
                  disabled={busy === inq.id}
                >
                  <option value="new">Neu</option>
                  <option value="progress">In Bearbeitung</option>
                  <option value="done">Erledigt</option>
                </select>
                <a className="inq-action" href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Antworten
                </a>
                <button
                  className="inq-delete"
                  onClick={() => handleDelete(inq)}
                  disabled={busy === inq.id}
                  title="Anfrage löschen"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Löschen
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </>
  );
}
