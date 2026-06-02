"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HOME_SLOTS, type HomeSlot } from "@/lib/home-slots";
import { uploadHomeImage, removeHomeImage } from "@/app/admin/actions";

export default function HomeImagesManager({
  images,
}: {
  images: Record<string, string | null>;
}) {
  const tiles = HOME_SLOTS.filter((s) => s.group === "home-tiles");
  const cats = HOME_SLOTS.filter((s) => s.group === "category");
  const nh = HOME_SLOTS.filter((s) => s.group === "nachhaltigkeit");
  const bz = HOME_SLOTS.filter((s) => s.group === "bereiche");
  const pg = HOME_SLOTS.filter((s) => s.group === "page");
  const tv = HOME_SLOTS.filter((s) => s.group === "textil-method");
  const fk = HOME_SLOTS.filter((s) => s.group === "firmen-method");
  const pw = HOME_SLOTS.filter((s) => s.group === "premium-method");
  const os = HOME_SLOTS.filter((s) => s.group === "onlineshops-method");
  const fb = HOME_SLOTS.filter((s) => s.group === "fahrzeug-method");
  const wa = HOME_SLOTS.filter((s) => s.group === "werbeartikel-img");

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
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
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
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
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
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
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
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      {/* Über Uns Bilder */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Über Uns — Bilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Titelbild (Hero) und drei Werte-Bilder auf der Seite <b>/ueber-uns</b>.
            Hero: 1920×900 (Querformat). Werte: 800×1000 (Hochformat).
          </p>
          <div className="home-img-grid">
            {pg.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      {/* Textilveredelung Yöntem Fotoları */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Textilveredelung — Methodenbilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Die fünf Bilder auf der Seite <b>/bereiche/textilveredelung</b> —
            Siebdruck, Stickerei, DTF-Druck, Flockdruck und Patches.
            Empfohlen: quadratisches Format (800×800 px).
          </p>
          <div className="home-img-grid">
            {tv.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      {/* Firmenkleidung */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Firmen- & Berufsbekleidung — Bilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Die fünf Bilder auf der Seite <b>/bereiche/firmenkleidung</b>.
            Empfohlen: quadratisches Format (800×800 px).
          </p>
          <div className="home-img-grid">
            {fk.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      {/* Premium Werbemittel */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Hochwertige Werbemittel — Bilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Die fünf Bilder auf der Seite <b>/bereiche/premium-werbemittel</b>.
            Empfohlen: quadratisches Format (800×800 px).
          </p>
          <div className="home-img-grid">
            {pw.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      {/* Onlineshops */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Onlineshops für Unternehmen — Bilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Die fünf Bilder auf der Seite <b>/bereiche/onlineshops</b>.
            Empfohlen: quadratisches Format (800×800 px).
          </p>
          <div className="home-img-grid">
            {os.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      {/* Werbeartikel — Kategori bölümleri */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Werbeartikel (Übersichtsseite) — Bilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            Die zwei großen Bilder auf der Seite <b>/bereiche/werbeartikel</b>
            (Trinkflaschen/Taschen und Werbeartikel-Kategorie).
            Empfohlen: Hochformat 800×1000 px.
          </p>
          <div className="home-img-grid">
            {wa.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
            ))}
          </div>
        </div>
      </div>

      {/* Fahrzeugbeschriftung */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Fahrzeugbeschriftung — Bilder</h3>
        </div>
        <div className="panel-body">
          <p className="hero-vid-state">
            <b>Banner</b> (1800×600) erscheint auf der Startseite. <b>Hero</b> und
            die 5 Methodenbilder erscheinen auf der Seite <b>/fahrzeugbeschriftung</b>.
          </p>
          <div className="home-img-grid">
            {fb.map((s) => (
              <Slot key={s.slot} slot={s.slot} label={s.label} meta={s} current={images[s.slot] ?? null} />
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
  meta,
}: {
  slot: string;
  label: string;
  current: string | null;
  meta?: HomeSlot;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [pickedPreview, setPickedPreview] = useState<string | null>(null);
  const ratio = meta?.ratio || "4/3";
  const recommendedSize = meta?.size || "";

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
        setPickedPreview(null);
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

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileName(f?.name ?? "");
    setError("");
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPickedPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPickedPreview(null);
    }
  }

  // Önizleme: yüklenmiş varsa onu göster, yüklenecek seçilmişse onu, yoksa boş
  const previewSrc = pickedPreview || current;

  return (
    <div className="home-slot">
      <div className="home-slot-preview" style={{ aspectRatio: ratio.replace("/", " / ") }}>
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" />
        ) : (
          <div className="home-slot-empty">
            <span>Kein Bild</span>
            {recommendedSize && (
              <small>Empfohlen: {recommendedSize}</small>
            )}
          </div>
        )}
      </div>
      <div className="home-slot-body">
        <div className="home-slot-label">{label}</div>
        {recommendedSize && (
          <div className="home-slot-meta">
            <span className="home-slot-ratio">📐 Format <b>{ratio.replace("/", ":")}</b></span>
            <span className="home-slot-size">↔ {recommendedSize}px</span>
          </div>
        )}
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
            onChange={onPick}
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
