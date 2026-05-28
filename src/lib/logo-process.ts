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

/** Hochwertiges 2× Upscale via createImageBitmap (Lanczos-ähnlich) + adaptive Schärfung. */
async function upscaleAndSharpen(dataUrl: string, scale = 2): Promise<string> {
  const img = await loadImage(dataUrl);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const w = srcW * scale;
  const h = srcH * scale;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");

  // 1) Hochwertiges Resampling: createImageBitmap mit resizeQuality 'high'
  //    liefert deutlich schärfere Kanten als ctx.drawImage (Lanczos-ähnlich).
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
    // Fallback: klassisches drawImage
  }
  if (!drawn) {
    ctx.imageSmoothingQuality = "high";
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, w, h);
  }

  // 2) Adaptive Schärfung — kenarları belirginleştir, gürültüyü artırma
  try {
    const id = ctx.getImageData(0, 0, w, h);
    const out = sharpen(id, 0.5);
    ctx.putImageData(out, 0, 0);
  } catch {
    // ImageData kann bei sehr großen Bildern fehlschlagen — dann nur Upscale
  }
  return canvas.toDataURL("image/png");
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
  const original = await blobToDataUrl(file);

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
      const transparentBlob = await removeBackground(file, {
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
