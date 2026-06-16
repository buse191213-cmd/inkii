/**
 * DTF-Engine Pipeline - Vercel/Next.js uyumlu
 * Orijinal Express server.js'ten port edildi.
 */
import sharp from "sharp";
import { put } from "@vercel/blob";
import { removeBackground } from "./background.js";
import { upscaleImage } from "./upscale.js";
import { sharpenEdges } from "./sharpen.js";
import { checkVectorizable, makeVector } from "./vectorize.js";
import { analyzeQuality, analyzeWhiteInk, buildReport, buildReportPDF } from "./quality.js";
import { optimizeColor } from "./coloroptimize.js";
import { cleanEdges } from "./edgecleanup.js";
import { smoothEdges } from "./smoothedges.js";

/**
 * Pipeline'ı çalıştır. onStep ile her adım bildirilir.
 * Sonuçlar Buffer olarak döner (Vercel'de /tmp ephemeral, blob storage gerekmez).
 * @param {Buffer} buffer
 * @param {(step: any) => void} [onStep]
 */
export async function runPipeline(buffer, onStep = () => {}) {
  const id = Date.now().toString(36);
  const t0 = Date.now();
  const elapsed = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
  const log = (msg) => console.log(`[DTF ${elapsed()}] ${msg}`);
  log(`Pipeline başladı (${buffer.length} bytes)`);

  // Adım 1: Analiz
  onStep({ key: "analyze", label: "Datei analysieren", status: "running" });
  const meta = await sharp(buffer).metadata();
  log(`Analiz bitti: ${meta.format} ${meta.width}x${meta.height}`);
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
  log("BG removal başladı");
  const bgResult = await removeBackground(buffer);
  log(`BG removal bitti: ok=${bgResult.ok} msg=${bgResult.message || "-"}`);
  let working = bgResult.buffer;
  let bgRemoved = bgResult.ok;
  onStep({
    key: "background",
    label: bgResult.ok ? "Hintergrund entfernt" : `Hintergrund: ${bgResult.message}`,
    status: bgResult.ok ? "done" : "error",
  });

  // Adım 2.2: Kenar temizleme - Replicate BG zaten temiz, ATLANIR
  if (bgRemoved) {
    onStep({ key: "edge", label: "Kanten sauber (Replicate)", status: "skipped" });
  }

  // Adım 2.5: AUTO-CROP
  log("Auto-crop başladı");
  try {
    const cropped = await sharp(working).trim({ threshold: 10 }).toBuffer();
    const cm = await sharp(cropped).metadata();
    if (cm.width > 10 && cm.height > 10) working = cropped;
  } catch {}
  log("Auto-crop bitti");

  // Adım 3: Upscale
  onStep({ key: "upscale", label: "Auflösung erhöhen", status: "running" });
  const beforeW = (await sharp(working).metadata()).width;
  log(`Upscale başladı (width=${beforeW})`);
  working = await upscaleImage(working);
  const afterW = (await sharp(working).metadata()).width;
  log(`Upscale bitti (width=${afterW})`);
  const factor = (afterW / beforeW).toFixed(1);
  onStep({
    key: "upscale",
    label: afterW > beforeW ? `Auflösung erhöht (${factor}×)` : "Auflösung ausreichend",
    status: afterW > beforeW ? "done" : "skipped",
  });

  // Adım 3.5: Renk - Replicate çıktısının renklerine dokunmuyoruz
  onStep({ key: "color", label: "Farben original belassen", status: "skipped" });

  // Adım 3.7: Kenar yumuşatma - Replicate BG zaten anti-aliased, ATLANIR
  log("Smooth edges atlandı (Replicate çıktısı zaten temiz)");

  // Adım 4: Keskinleştirme - Replicate çıktısı zaten net, ATLANIR
  onStep({ key: "sharpen", label: "Original-Schärfe behalten", status: "skipped" });

  // Adım 5: Vektör
  onStep({ key: "vector", label: "Vektorisierbarkeit prüfen", status: "running" });
  log("Vector check başladı");
  const vector = await checkVectorizable(working);
  log(`Vector check bitti: vectorizable=${vector.vectorizable}`);
  let vectorSvg = null;
  if (vector.vectorizable) {
    log("Vector trace başladı");
    const vec = await makeVector(working);
    log(`Vector trace bitti: svg=${!!vec?.svg}`);
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
  log("Quality başladı");
  const quality = await analyzeQuality(working);
  log("Quality analiz bitti");
  const whiteInk = await analyzeWhiteInk(working);
  log("White ink bitti");
  const report = buildReport(quality, whiteInk, vector);
  let reportPdfBase64 = null;
  try {
    log("PDF rapor başladı");
    const pdfBuffer = await buildReportPDF(report, quality, whiteInk, working);
    reportPdfBase64 = pdfBuffer.toString("base64");
    log("PDF rapor bitti");
  } catch (e) {
    console.error("PDF rapor hatası:", e.message);
  }
  onStep({
    key: "quality",
    label: `Qualität: ${quality.score}/100 ${quality.statusIcon}`,
    status: "done",
    info: { score: quality.score, status: quality.status },
  });

  log("Pipeline TAMAMLANDI");

  // ── Blob upload (mail ile paylaşılabilir kalıcı URL'ler) ──
  let resultBlobUrl = null;
  let vectorBlobUrl = null;
  let reportBlobUrl = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      log("Blob upload başladı");
      const pngUp = await put(`dtf/${id}/transfer.png`, working, {
        access: "public",
        contentType: "image/png",
        addRandomSuffix: true,
      });
      resultBlobUrl = pngUp.url;
      if (vectorSvg) {
        const svgUp = await put(`dtf/${id}/vector.svg`, vectorSvg, {
          access: "public",
          contentType: "image/svg+xml",
          addRandomSuffix: true,
        });
        vectorBlobUrl = svgUp.url;
      }
      if (reportPdfBase64) {
        const pdfUp = await put(`dtf/${id}/report.pdf`, Buffer.from(reportPdfBase64, "base64"), {
          access: "public",
          contentType: "application/pdf",
          addRandomSuffix: true,
        });
        reportBlobUrl = pdfUp.url;
      }
      log(`Blob upload bitti: ${resultBlobUrl}`);
    } catch (e) {
      console.error("Blob upload hatası:", e.message);
    }
  }

  const finalMeta = await sharp(working).metadata();
  // Veriler data URL olarak dönsün — orijinal HTML URL'leri olduğu gibi kullanır
  const resultDataUrl = `data:image/png;base64,${working.toString("base64")}`;
  const vectorDataUrl = vectorSvg
    ? `data:image/svg+xml;base64,${Buffer.from(vectorSvg).toString("base64")}`
    : null;
  const reportDataUrl = reportPdfBase64
    ? `data:application/pdf;base64,${reportPdfBase64}`
    : null;

  return {
    id,
    // Hem base64 hem data URL — eski UI ve yeni UI ile uyumlu
    resultBase64: working.toString("base64"),
    resultUrl: resultDataUrl,
    vectorSvg,
    vectorUrl: vectorDataUrl,
    reportPdfBase64,
    reportUrl: reportDataUrl,
    // Kalıcı blob URL'leri (mail/sepet için)
    resultBlobUrl,
    vectorBlobUrl,
    reportBlobUrl,
    zipUrl: null,
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
