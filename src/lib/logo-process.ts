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

/** 2× Canvas-Upscale mit einem leichten Unsharp-Mask für mehr Detail. */
async function upscaleAndSharpen(dataUrl: string, scale = 2): Promise<string> {
  const img = await loadImage(dataUrl);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");
  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, w, h);

  // Schärfung: simpler Unsharp-Mask Kernel
  try {
    const id = ctx.getImageData(0, 0, w, h);
    const out = sharpen(id, 0.35);
    ctx.putImageData(out, 0, 0);
  } catch {
    // ImageData kann bei sehr großen Bildern fehlschlagen — dann nur Upscale
  }
  return canvas.toDataURL("image/png");
}

/** Unsharp-Mask in reinem JS. amount: Stärke (0.2–0.6 ist gut). */
function sharpen(imgData: ImageData, amount: number): ImageData {
  const { width, height, data } = imgData;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const w4 = width * 4;
  const k = amount;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const p = data[i + c];
        const top = data[i - w4 + c];
        const bot = data[i + w4 + c];
        const lef = data[i - 4 + c];
        const rig = data[i + 4 + c];
        const avg = (top + bot + lef + rig) / 4;
        const val = p + (p - avg) * k;
        out.data[i + c] = val < 0 ? 0 : val > 255 ? 255 : val;
      }
      out.data[i + 3] = data[i + 3];
    }
  }
  return out;
}

/** Vollständige Optimierungspipeline für ein hochgeladenes Logo. */
export async function processLogo(
  file: File,
  onProgress: ProcessProgress
): Promise<{ original: string; processed: string }> {
  onProgress("load", 1, 3);
  console.log(`[logo-process] Datei laden: ${file.name} (${(file.size / 1024).toFixed(1)} KB, ${file.type})`);
  const original = await blobToDataUrl(file);

  // 1) Hintergrund entfernen — kann fehlschlagen (WebAssembly, CORS, Model-Download)
  onProgress("remove-bg", 2, 3);
  let toUpscale = original;
  try {
    console.log("[logo-process] Lade @imgly/background-removal …");
    const mod = await import("@imgly/background-removal");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeBackground = (mod as any).removeBackground || (mod as any).default;
    if (typeof removeBackground !== "function") {
      throw new Error("removeBackground export nicht gefunden");
    }
    console.log("[logo-process] Starte Hintergrund-Entfernung (kann 5-30s dauern, lädt Modell beim 1. Mal) …");
    const transparentBlob = await removeBackground(file, {
      output: { format: "image/png" },
    });
    toUpscale = await blobToDataUrl(transparentBlob);
    console.log("[logo-process] ✓ Hintergrund entfernt");
  } catch (err) {
    console.warn("[logo-process] ⚠ Hintergrund-Entfernung übersprungen:", err);
    // Bei Fehler: Original verwenden, weiter mit Upscale
  }

  // 2) Auflösung 2× (immer ausgeführt, auch wenn bg-removal fehlschlägt)
  onProgress("upscale", 3, 3);
  try {
    console.log("[logo-process] Auflösung 2× hochskalieren …");
    const processed = await upscaleAndSharpen(toUpscale, 2);
    console.log("[logo-process] ✓ Auflösung verbessert");
    return { original, processed };
  } catch (err) {
    console.warn("[logo-process] ⚠ Upscale fehlgeschlagen, verwende Original:", err);
    return { original, processed: toUpscale };
  }
}
