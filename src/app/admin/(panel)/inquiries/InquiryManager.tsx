"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatus } from "@/app/admin/actions";

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

const TAG: Record<string, [string, string]> = {
  new: ["orange", "Neu"],
  progress: ["blue", "In Bearbeitung"],
  done: ["green", "Erledigt"],
};

export default function InquiryManager({ inquiries }: { inquiries: AdminInquiry[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () => inquiries.filter((i) => filter === "all" || i.status === filter),
    [inquiries, filter]
  );

  async function changeStatus(id: string, status: string) {
    const res = await updateInquiryStatus(id, status);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Fehler.");
  }

  return (
    <>
      <p className="crumb">
        Admin <b>/ Anfragen</b>
      </p>

      <div className="toolbar">
        <div className="filter-tabs">
          {[
            ["all", "Alle"],
            ["new", "Neu"],
            ["progress", "In Bearbeitung"],
            ["done", "Erledigt"],
          ].map(([k, label]) => (
            <button
              key={k}
              className={filter === k ? "active" : ""}
              onClick={() => setFilter(k)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kunde</th>
                <th>Anliegen</th>
                <th>Datum</th>
                <th>Status</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty">Keine Anfragen.</div>
                  </td>
                </tr>
              )}
              {list.map((i) => (
                <Row
                  key={i.id}
                  inq={i}
                  open={openId === i.id}
                  onToggle={() => setOpenId(openId === i.id ? null : i.id)}
                  onStatus={(s) => changeStatus(i.id, s)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Row({
  inq,
  open,
  onToggle,
  onStatus,
}: {
  inq: AdminInquiry;
  open: boolean;
  onToggle: () => void;
  onStatus: (s: string) => void;
}) {
  return (
    <>
      <tr>
        <td>
          <div className="t-name">{inq.name}</div>
          <div className="t-code">{inq.company || inq.email}</div>
        </td>
        <td>{inq.subject}</td>
        <td className="t-code">{inq.date}</td>
        <td>
          <span className={`tag ${TAG[inq.status]?.[0] ?? "gray"}`}>
            {TAG[inq.status]?.[1] ?? inq.status}
          </span>
        </td>
        <td>
          <div className="row-act">
            <select
              className="status-select"
              value={inq.status}
              onChange={(e) => onStatus(e.target.value)}
            >
              <option value="new">Neu</option>
              <option value="progress">In Bearbeitung</option>
              <option value="done">Erledigt</option>
            </select>
            <button className="icon-act" title="Details" onClick={onToggle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
              </svg>
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ background: "var(--paper)" }}>
            <div style={{ padding: "4px 4px 8px", display: "grid", gap: 6 }}>
              <div>
                <b>E-Mail:</b> {inq.email}
                {inq.phone && (
                  <>
                    {"  ·  "}
                    <b>Telefon:</b> {inq.phone}
                  </>
                )}
              </div>
              {inq.company && (
                <div>
                  <b>Firma/Verein:</b> {inq.company}
                </div>
              )}
              <div>
                <b>Nachricht:</b> {inq.message || "—"}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
