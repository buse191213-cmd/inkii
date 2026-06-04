"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  saveHeroVideoUrl,
  removeHeroVideo,
  saveMarketingVideoUrl,
  removeMarketingVideo,
} from "@/app/admin/actions";

type Props = {
  currentVideo: string | null;
  /** "hero" = Ana sayfa, "marketing" = INKII MARKETING sayfası */
  kind?: "hero" | "marketing";
};

export default function HeroVideoManager({ currentVideo, kind = "hero" }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [fileName, setFileName] = useState("");

  const saveAction = kind === "marketing" ? saveMarketingVideoUrl : saveHeroVideoUrl;
  const removeAction = kind === "marketing" ? removeMarketingVideo : removeHeroVideo;
  const folderName = kind === "marketing" ? "marketing" : "hero";
  const successText = kind === "marketing"
    ? "Video gespeichert – läuft jetzt im Hero der INKII MARKETING-Seite."
    : "Video gespeichert – es läuft jetzt im Hero-Bereich der Startseite.";

  async function doUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Bitte zuerst eine Videodatei auswählen.");
      return;
    }
    if (file.type !== "video/mp4" && file.type !== "video/webm") {
      setError("Nur MP4- oder WebM-Videos werden unterstützt.");
      return;
    }
    setBusy(true);
    setError("");
    setOk("");
    try {
      const ext = file.type === "video/webm" ? "webm" : "mp4";
      // Direkter Upload Browser → Vercel Blob (umgeht das Server-Größenlimit).
      const blob = await upload(`${folderName}/${folderName}-${Date.now()}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      const res = await saveAction(blob.url);
      if (res.ok) {
        setOk(successText);
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      } else {
        setError(res.error ?? "Speichern fehlgeschlagen.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Hero-Video wirklich entfernen? Danach läuft wieder die Animation.")) {
      return;
    }
    setBusy(true);
    setError("");
    setOk("");
    try {
      const res = await removeAction();
      if (res.ok) {
        setOk("Video entfernt – im Hero läuft wieder die Standard-Animation.");
        router.refresh();
      } else {
        setError(res.error ?? "Entfernen fehlgeschlagen.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Entfernen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      <div className="panel-head">
        <h3>{kind === "marketing" ? "INKII MARKETING — Hero-Video" : "Startseiten-Video (Hero-Hintergrund)"}</h3>
      </div>
      <div className="panel-body">
        {error && <div className="form-err">{error}</div>}
        {ok && <div className="form-ok">{ok}</div>}

        {currentVideo ? (
          <div className="hero-vid-current">
            <video src={currentVideo} controls muted playsInline />
            <div>
              <p className="hero-vid-state">
                ✓ Aktuell ist ein Video aktiv. Es läuft stummgeschaltet in
                Dauerschleife hinter dem Text auf der Startseite.
              </p>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={remove}
                disabled={busy}
              >
                Video entfernen
              </button>
            </div>
          </div>
        ) : (
          <p className="hero-vid-state">
            Noch kein Video hinterlegt — im Hero läuft die animierte
            Standard-Grafik.
          </p>
        )}

        <div className="hero-vid-upload">
          <label className="hero-vid-pick">
            <span>{fileName || "Videodatei wählen …"}</span>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm"
              onChange={(e) => {
                setFileName(e.target.files?.[0]?.name ?? "");
                setOk("");
                setError("");
              }}
            />
          </label>
          <button
            type="button"
            className="btn-primary"
            onClick={doUpload}
            disabled={busy}
          >
            {busy
              ? "Wird hochgeladen …"
              : currentVideo
              ? "Video ersetzen"
              : "Video hochladen"}
          </button>
        </div>
        <p className="form-note">
          MP4 oder WebM · max. 100 MB. Empfehlung: kurzer, komprimierter Clip
          (möglichst unter 20 MB) für schnelle Ladezeiten. Das Video wird
          automatisch stummgeschaltet abgespielt.
        </p>
      </div>
    </div>
  );
}
