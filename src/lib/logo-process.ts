/**
 * Logo-Optimierung via Browser-KI.
 *
 * Schritte:
 *  1) Hintergrund automatisch entfernen (transparenter PNG)
 *  2) Auflösung 2× hochskalieren (Canvas + leichte Schärfung)
 *
 * Hinweise:
 *  - `@imgly/background-removal` lädt beim 1. Einsatz ein ~25 MB ONNX-Modell
 *    aus dem CDN und cached es im IndexedDB des Browsers.
 *  - Funktioniert komplett lokal — keine Daten verlassen den Browser.
 */

export type ProcessProgress = (step: "load" | "remove-bg" | "upscale", current: number, total: number) => void;

/** Wandelt eine Blob/File in eine Data-URL um. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Konnte Bild nicht lesen."));
    r.readAsDataURL(blob);
  });
}

/** Lädt eine Image-Source in ein HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Konnte Bild nicht laden."));
    img.src = src;
  });
}

/**
 * Verkleinert große Eingabebilder vor der Pipeline.
 * Auf Mobilgeräten verursachen Handy-Fotos (4K, 8MP+) sonst OOM-Crashes
 * im Browser, da @imgly + Canvas + WebGL den RAM überlasten.
 */
async function resizeIfTooBig(file: File, maxDim = 1500): Promise<File> {
  // Kleine Dateien direkt durchlassen
  if (file.size < 500_000) return file;
  let url: string | null = null;
  try {
    url = URL.createObjectURL(file);
    const img = await loadImage(url);
    if (img.naturalWidth <= maxDim && img.naturalHeight <= maxDim) return file;
    const scale = maxDim / Math.max(img.naturalWidth, img.naturalHeight);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise<File>((res) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return res(file);
          res(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92
      );
    });
  } catch {
    return file;
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

/** Ein einzelner hochwertiger Resize-Schritt (createImageBitmap, Lanczos-ähnlich). */
async function resizeStep(dataUrl: string, w: number, h: number): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");
  let drawn = false;
  try {
    const resp = await fetch(dataUrl);
    const blob = await resp.blob();
    const bitmap = await createImageBitmap(blob, {
      resizeWidth: w,
      resizeHeight: h,
      resizeQuality: "high",
    });
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    drawn = true;
  } catch {
    /* fallback unten */
  }
  if (!drawn) {
    const img = await loadImage(dataUrl);
    ctx.imageSmoothingQuality = "high";
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, w, h);
  }
  return canvas.toDataURL("image/png");
}

/**
 * Progressive Hochskalierung auf eine Zielauflösung.
 * Statt in einem Schritt zu vergrößern, gehen wir in ~1.6×-Stufen vor —
 * das hält die Kanten deutlich schärfer (Lanczos-Kette). Zielbreite mind.
 * 1200px, damit kleine remove.bg-Vorschauen druckfähig werden.
 */
async function upscaleAndSharpen(dataUrl: string, _scale = 2): Promise<string> {
  const img = await loadImage(dataUrl);
  let curW = img.naturalWidth;
  let curH = img.naturalHeight;
  let current = dataUrl;

  // Ziel: längere Kante auf mind. 1400px (aber Tavan 2000 für mobile RAM)
  const longSide = Math.max(curW, curH);
  const targetLong = Math.min(
    Math.max(1400, longSide * 2),
    longSide * 4,
    2000
  );

  // Schrittweise vergrößern (~1.6× pro Schritt)
  while (Math.max(curW, curH) < targetLong) {
    const factor = Math.min(1.6, targetLong / Math.max(curW, curH));
    curW = Math.round(curW * factor);
    curH = Math.round(curH * factor);
    current = await resizeStep(current, curW, curH);
  }

  // Abschließende adaptive Schärfung
  try {
    const finalImg = await loadImage(current);
    const canvas = document.createElement("canvas");
    canvas.width = finalImg.naturalWidth;
    canvas.height = finalImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(finalImg, 0, 0);
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const out = sharpen(id, 0.6);
      ctx.putImageData(out, 0, 0);
      return canvas.toDataURL("image/png");
    }
  } catch {
    /* Schärfung optional */
  }
  return current;
}

/**
 * Unsharp-Mask mit 3×3-Gauß-Vorglättung — schärft Kanten, ohne die
 * Transparenz (Alpha) zu zerstören. amount: Stärke (0.3–0.7 ist gut).
 */
function sharpen(imgData: ImageData, amount: number): ImageData {
  const { width, height, data } = imgData;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const w4 = width * 4;
  const k = amount;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      // Sadece yeterince opak pikselleri keskinleştir (kenar halo'sunu önler)
      if (data[i + 3] < 8) {
        out.data[i + 3] = data[i + 3];
        continue;
      }
      for (let c = 0; c < 3; c++) {
        const p = data[i + c];
        // 8-komşu gauss benzeri ortalama (köşeler dahil, ağırlıklı)
        const top = data[i - w4 + c];
        const bot = data[i + w4 + c];
        const lef = data[i - 4 + c];
        const rig = data[i + 4 + c];
        const tl = data[i - w4 - 4 + c];
        const tr = data[i - w4 + 4 + c];
        const bl = data[i + w4 - 4 + c];
        const br = data[i + w4 + 4 + c];
        const avg = (top + bot + lef + rig) * 0.15 + (tl + tr + bl + br) * 0.1;
        const val = p + (p - avg) * k;
        out.data[i + c] = val < 0 ? 0 : val > 255 ? 255 : val;
      }
      out.data[i + 3] = data[i + 3];
    }
  }
  return out;
}

/**
 * Versucht den Hintergrund über den Server-Proxy (remove.bg) zu entfernen.
 * Gibt die transparente Data-URL zurück oder null, wenn nicht verfügbar.
 */
async function removeBgViaApi(dataUrl: string): Promise<string | null> {
  try {
    const resp = await fetch("/api/remove-bg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageB64: dataUrl }),
    });
    if (!resp.ok) {
      let detail = "";
      try {
        const j = await resp.json();
        detail = JSON.stringify(j);
      } catch {
        /* ignore */
      }
      console.log(`[logo-process] API nicht verfügbar (Status ${resp.status}) → lokales Modell. Detail: ${detail}`);
      return null;
    }
    const data = await resp.json();
    return typeof data.image === "string" ? data.image : null;
  } catch (e) {
    console.log("[logo-process] API nicht erreichbar → lokales Modell:", e);
    return null;
  }
}

/** Vollständige Optimierungspipeline für ein hochgeladenes Logo. */
export async function processLogo(
  file: File,
  onProgress: ProcessProgress
): Promise<{ original: string; processed: string }> {
  onProgress("load", 1, 3);
  console.log("%c[logo-process] PIPELINE v2 — Hybrid (API + ISNet)", "color:#0a0;font-weight:bold");
  console.log(`[logo-process] Datei laden: ${file.name} (${(file.size / 1024).toFixed(1)} KB, ${file.type})`);

  // Mobilgeräte schützen: zu große Bilder vorab verkleinern (max 1500px Kante)
  let workFile: File = file;
  const safeFile = await resizeIfTooBig(file, 1500);
  if (safeFile !== file) {
    console.log(`[logo-process] Eingabe verkleinert: ${(safeFile.size / 1024).toFixed(1)} KB`);
    workFile = safeFile;
  }

  const original = await blobToDataUrl(workFile);

  // 1) Hintergrund entfernen — Hybrid: erst Premium-API, dann lokales ISNet
  onProgress("remove-bg", 2, 3);
  let toUpscale = original;
  let bgDone = false;

  // 1a) Premium-API (remove.bg über Server-Proxy) — beste Qualität
  console.log("[logo-process] Versuche Premium-Hintergrundentfernung (API) …");
  const apiResult = await removeBgViaApi(original);
  if (apiResult) {
    toUpscale = apiResult;
    bgDone = true;
    console.log("[logo-process] ✓ Hintergrund entfernt (Premium-API)");
  }

  // 1b) Fallback: lokales ISNet (kostenlos, im Browser)
  if (!bgDone) {
    try {
      console.log("[logo-process] Lokales Modell @imgly/background-removal …");
      const mod = await import("@imgly/background-removal");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const removeBackground = (mod as any).removeBackground || (mod as any).default;
      if (typeof removeBackground !== "function") {
        throw new Error("removeBackground export nicht gefunden");
      }
      const transparentBlob = await removeBackground(workFile, {
        output: { format: "image/png", quality: 1.0 },
      });
      toUpscale = await blobToDataUrl(transparentBlob);
      bgDone = true;
      console.log("[logo-process] ✓ Hintergrund entfernt (lokales Modell)");
    } catch (err) {
      console.warn("[logo-process] ⚠ Hintergrund-Entfernung übersprungen:", err);
    }
  }

  // 2) Auflösung hochskalieren (immer ausgeführt)
  onProgress("upscale", 3, 3);
  try {
    console.log("[logo-process] Auflösung verbessern …");
    const processed = await upscaleAndSharpen(toUpscale, 2);
    console.log("[logo-process] ✓ Auflösung verbessert");
    return { original, processed };
  } catch (err) {
    console.warn("[logo-process] ⚠ Upscale fehlgeschlagen, verwende Original:", err);
    return { original, processed: toUpscale };
  }
}
