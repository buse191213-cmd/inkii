/**
 * DTF-Engine Pipeline - Vercel/Next.js uyumlu
 * Orijinal Express server.js'ten port edildi.
 */
import sharp from "sharp";
import { removeBackground } from "./background.js";
import { upscaleImage } from "./upscale.js";
import { sharpenEdges } from "./sharpen.js";
import { checkVectorizable, makeVector } from "./vectorize.js";
import { analyzeQuality, analyzeWhiteInk, buildReport, buildReportPDF } from "./quality.js";
import { optimizeColor } from "./coloroptimize.js";
import { cleanEdges } from "./edgecleanup.js";

/**
 * Pipeline'ı çalıştır. onStep ile her adım bildirilir.
 * Sonuçlar Buffer olarak döner (Vercel'de /tmp ephemeral, blob storage gerekmez).
 * @param {Buffer} buffer
 * @param {(step: any) => void} [onStep]
 */
export async function runPipeline(buffer, onStep = () => {}) {
  const id = Date.now().toString(36);

  // Adım 1: Analiz
  onStep({ key: "analyze", label: "Datei analysieren", status: "running" });
  const meta = await sharp(buffer).metadata();
  const dpiAtWidth = (cmWidth) => Math.round((meta.width / (cmWidth / 2.54)));
  onStep({
    key: "analyze",
    label: "Datei analysieren",
    status: "done",
    info: {
      format: meta.format,
      width: meta.width,
      height: meta.height,
      hasAlpha: meta.hasAlpha,
      estimatedDpi: dpiAtWidth(25),
    },
  });

  // Adım 2: Arka plan kaldırma
  onStep({ key: "background", label: "Hintergrund entfernen", status: "running" });
  const bgResult = await removeBackground(buffer);
  let working = bgResult.buffer;
  let bgRemoved = bgResult.ok;
  onStep({
    key: "background",
    label: bgResult.ok ? "Hintergrund entfernt" : `Hintergrund: ${bgResult.message}`,
    status: bgResult.ok ? "done" : "error",
  });

  // Adım 2.2: Kenar temizleme
  if (bgRemoved) {
    onStep({ key: "edge", label: "Kanten reinigen", status: "running" });
    const edgeRes = await cleanEdges(working);
    working = edgeRes.buffer;
    onStep({
      key: "edge",
      label: edgeRes.applied ? "Kanten gereinigt" : "Kanten sauber",
      status: edgeRes.applied ? "done" : "skipped",
    });
  }

  // Adım 2.5: AUTO-CROP
  try {
    const cropped = await sharp(working).trim({ threshold: 10 }).toBuffer();
    const cm = await sharp(cropped).metadata();
    if (cm.width > 10 && cm.height > 10) working = cropped;
  } catch {}

  // Adım 3: Upscale
  onStep({ key: "upscale", label: "Auflösung erhöhen", status: "running" });
  const beforeW = (await sharp(working).metadata()).width;
  working = await upscaleImage(working);
  const afterW = (await sharp(working).metadata()).width;
  const factor = (afterW / beforeW).toFixed(1);
  onStep({
    key: "upscale",
    label: afterW > beforeW ? `Auflösung erhöht (${factor}×)` : "Auflösung ausreichend",
    status: afterW > beforeW ? "done" : "skipped",
  });

  // Adım 3.5: Renk optimizasyonu
  onStep({ key: "color", label: "Farben optimieren", status: "running" });
  const colorRes = await optimizeColor(working, { force: false });
  working = colorRes.buffer;
  onStep({
    key: "color",
    label: colorRes.applied ? "Farben optimiert" : "Farben bereits optimal",
    status: colorRes.applied ? "done" : "skipped",
  });

  // Adım 4: Keskinleştirme
  onStep({ key: "sharpen", label: "Kanten schärfen", status: "running" });
  working = await sharpenEdges(working);
  onStep({ key: "sharpen", label: "Kanten geschärft", status: "done" });

  // Adım 5: Vektör
  onStep({ key: "vector", label: "Vektorisierbarkeit prüfen", status: "running" });
  const vector = await checkVectorizable(working);
  let vectorSvg = null;
  if (vector.vectorizable) {
    const vec = await makeVector(working);
    if (vec && vec.svg) vectorSvg = vec.svg;
  }
  onStep({
    key: "vector",
    label: vector.vectorizable ? "Vektor-Version bereit" : "Pixel-Version",
    status: "done",
    info: vector,
  });

  // Adım 6: Kalite
  onStep({ key: "quality", label: "Druckqualität prüfen", status: "running" });
  const quality = await analyzeQuality(working);
  const whiteInk = await analyzeWhiteInk(working);
  const report = buildReport(quality, whiteInk, vector);
  let reportPdfBase64 = null;
  try {
    const pdfBuffer = await buildReportPDF(report, quality, whiteInk, working);
    reportPdfBase64 = pdfBuffer.toString("base64");
  } catch (e) {
    console.error("PDF rapor hatası:", e.message);
  }
  onStep({
    key: "quality",
    label: `Qualität: ${quality.score}/100 ${quality.statusIcon}`,
    status: "done",
    info: { score: quality.score, status: quality.status },
  });

  const finalMeta = await sharp(working).metadata();
  return {
    id,
    resultBase64: working.toString("base64"),
    vectorSvg,
    reportPdfBase64,
    width: finalMeta.width,
    height: finalMeta.height,
    printSizeCm: {
      width: +(finalMeta.width / 300 * 2.54).toFixed(2),
      height: +(finalMeta.height / 300 * 2.54).toFixed(2),
    },
    vectorizable: vector.vectorizable,
    bgRemoved,
    bgMessage: bgResult.message,
    quality,
    whiteInk,
    report,
  };
}
