"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HOME_SLOTS } from "@/lib/home-slots";
import { uploadHomeImage, removeHomeImage } from "@/app/admin/actions";

export default function HomeImagesManager({
  images,
}: {
  images: Record<string, string | null>;
}) {
  const tiles = HOME_SLOTS.filter((s) => s.group === "home-tiles");
  const cats = HOME_SLOTS.filter((s) => s.group === "category");
  const feats = HOME_SLOTS.filter((s) => s.group === "feature");
  const nh = HOME_SLOTS.filter((s) => s.group === "nachhaltigkeit");
  const ls = HOME_SLOTS.filter((s) => s.group === "leistungen");
  const bz = HOME_SLOTS.filter((s) => s.group === "bereiche");
  const pg = HOME_SLOTS.filter((s) => s.group === "page");

  return (
    <>
      <p className="crumb">
        Admin <b>/ Startseite</b>
      </p>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Startseite — Große Bildkacheln</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Die zwei großen Hauptbilder direkt unter dem Hero-Video.
            Empfohlen: hochauflösende Fotos, querformat (z. B. 1600×1100 px).
          </p>
          <div className="home-img-grid">
            {tiles.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Kategorie-Kacheln</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Bilder für die vier großen Kategorie-Kacheln im oberen Bereich der
            Startseite. Ohne Bild wird die gezeichnete Grafik angezeigt.
          </p>
          <div className="home-img-grid">
            {cats.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Leistungs-Kacheln</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Hintergrundbilder für die sechs Leistungs-Karten. Der Text bleibt
            durch einen hellen Schleier gut lesbar.
          </p>
          <div className="home-img-grid">
            {feats.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Nachhaltigkeit — Naturbilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Bilder für die Nachhaltigkeitsseite: großes Titelbild, sechs
            Themen-Karten und ein breites Naturbild. Empfohlen sind Natur-,
            Umwelt- und Produktionsfotos im Querformat. Ohne Bild wird ein
            farbiger Verlauf mit Symbol angezeigt.
          </p>
          <div className="home-img-grid">
            {nh.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Leistungen-Seite — Titelbild</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Großes Titelbild für den Kopfbereich der Leistungen-Seite. Ohne
            Bild wird ein farbiger Verlauf angezeigt.
          </p>
          <div className="home-img-grid">
            {ls.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Bereiche — Druck · Werbetechnik · Webdesign · Marketing</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Titelbild der Bereiche-Seite und je ein Bild für die vier
            Geschäftsbereiche. Diese Bilder erscheinen auf der Bereiche-Seite
            sowie in den Bereich-Karten auf Startseite und Leistungen. Ohne Bild
            wird ein farbiger Verlauf mit Symbol angezeigt.
          </p>
          <div className="home-img-grid">
            {bz.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <h3>Weitere Seiten — Titelbilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Große Hero-Bilder oben auf den Seiten <b>Textilveredelung</b> und{" "}
            <b>Über Uns</b>. Empfohlen sind hochwertige Querformat-Fotos
            (Werkstatt, Maschinen, Team). Ohne Bild wird ein dezenter
            Verlauf-Hintergrund angezeigt.
          </p>
          <div className="home-img-grid">
            {pg.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Slot({
  slot,
  label,
  current,
}: {
  slot: string;
  label: string;
  current: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Bitte zuerst ein Bild wählen.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("slot", slot);
      fd.set("image", file);
      const res = await uploadHomeImage(fd);
      if (res.ok) {
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      } else {
        setError(res.error ?? "Upload fehlgeschlagen.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Bild für diesen Bereich entfernen?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await removeHomeImage(slot);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Entfernen fehlgeschlagen.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Entfernen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="home-slot">
      <div className="home-slot-preview">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" />
        ) : (
          <span>Kein Bild</span>
        )}
      </div>
      <div className="home-slot-body">
        <div className="home-slot-label">{label}</div>
        {error && (
          <div className="form-err" style={{ marginBottom: 8 }}>
            {error}
          </div>
        )}
        <label className="hero-vid-pick">
          <span>{fileName || "Bild wählen …"}</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              setFileName(e.target.files?.[0]?.name ?? "");
              setError("");
            }}
          />
        </label>
        <div className="home-slot-actions">
          <button type="button" className="btn-primary btn-sm" onClick={upload} disabled={busy}>
            {busy ? "…" : current ? "Ersetzen" : "Hochladen"}
          </button>
          {current && (
            <button type="button" className="btn-ghost btn-sm" onClick={remove} disabled={busy}>
              Entfernen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
