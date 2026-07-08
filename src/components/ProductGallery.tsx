"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { ProductIcon } from "@/lib/icons";

function resolveUrl(rel: string, allImages: string[]): string {
  if (!rel) return rel;
  if (rel.startsWith("http://") || rel.startsWith("https://") || rel.startsWith("/")) return rel;
  const match = allImages.find((url) => url.toLowerCase().includes(rel.toLowerCase()));
  return match || rel;
}

type Placement = {
  imageDataUrl: string;      // Aktif olarak gösterilen (orijinal veya bg-removed)
  originalImageDataUrl: string; // Kullanıcının yüklediği orijinal
  processedImageDataUrl?: string; // Bg-removed version (cached)
  bgRemoved: boolean;
  imageAspect: number;
  x: number;    // %
  y: number;    // %
  width: number; // %
  rotation: number;
};

const EMPTY: Omit<Placement, "imageDataUrl" | "originalImageDataUrl" | "imageAspect" | "bgRemoved"> = {
  x: 50, y: 47, width: 30, rotation: 0,
};

// Print area — logo bu alanın dışına çıkamaz (% cinsinden) - dar ve kare
const PRINT_AREA = {
  left: 29,
  top: 20,
  right: 71,
  bottom: 71,
};

// Print area'nın gerçek dünya boyutları (cm) — T-shirt için standart
// Vorderseite / Rückseite genelde 30x40 cm (A3 boyutu civarı)
const PRINT_AREA_REAL_CM = {
  width: 30,   // cm
  height: 40,  // cm
};

/**
 * Design'ın gerçek dünya boyutunu hesapla (cm).
 * currentDesign.width canvas'a göre %, biz print_area'ya oranlayıp cm'e çeviriyoruz.
 */
function getRealSize(widthPercent: number, aspect: number) {
  const paW = PRINT_AREA.right - PRINT_AREA.left; // print area width %
  const paH = PRINT_AREA.bottom - PRINT_AREA.top; // print area height %

  // Logo canvas'a göre widthPercent → print_area'ya göre kaç %
  const widthOfPrintArea = (widthPercent / paW) * 100; // 0-100 arasında

  // Logo cm'i
  const widthCm = (widthOfPrintArea / 100) * PRINT_AREA_REAL_CM.width;

  // Logo yükseklik (canvas'a göre)
  const heightPercent = widthPercent / aspect;
  const heightOfPrintArea = (heightPercent / paH) * 100;
  const heightCm = (heightOfPrintArea / 100) * PRINT_AREA_REAL_CM.height;

  return {
    widthCm: Math.round(widthCm * 10) / 10,
    heightCm: Math.round(heightCm * 10) / 10,
  };
}

/**
 * Görselin arka planını kaldırır — SADECE gerçek arka planı,
 * logo içindeki beyaz alanları korur.
 *
 * Algoritma: 4 kenardan flood-fill. Kenardan başlayarak bağlı olan
 * açık renkli pikseller = arka plan → şeffaflaştır.
 * Logo'nun içindeki izole beyazlar (bağlı olmadığı için) korunur.
 */
async function removeWhiteBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas context error")); return; }
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width;
        const h = canvas.height;
        const total = w * h;

        // 4 KENARDAN örnekleyerek arka plan rengini/parlaklığını tespit et
        // Bu adaptive threshold — kullanıcının logosuna göre otomatik ayarlanır
        let edgeBrightSum = 0;
        let edgeSampleCount = 0;
        let edgeMinBrightness = 255;

        const sampleEdge = (idx: number) => {
          const i = idx * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const brightness = (r + g + b) / 3;
          edgeBrightSum += brightness;
          edgeSampleCount++;
          if (brightness < edgeMinBrightness) edgeMinBrightness = brightness;
        };

        // Üst ve alt kenar
        for (let x = 0; x < w; x++) {
          sampleEdge(x);              // top
          sampleEdge((h - 1) * w + x); // bottom
        }
        // Sol ve sağ kenar
        for (let y = 0; y < h; y++) {
          sampleEdge(y * w);          // left
          sampleEdge(y * w + (w - 1)); // right
        }

        const edgeAvg = edgeBrightSum / edgeSampleCount;

        // Threshold: kenarların ortalamasından 30 aşağı, ama minimum 180
        // Eğer kenarlar zaten çok açıksa (255 gibi) → threshold 225 civarı
        // Eğer kenarlar orta parlaklıksa → daha agresif
        const threshold = Math.max(180, Math.min(240, edgeAvg - 25));

        console.log(`[BG Remove] Edge avg: ${edgeAvg.toFixed(1)}, min: ${edgeMinBrightness}, threshold: ${threshold.toFixed(1)}`);

        // Eğer kenarlar zaten koyu ise (< 150), muhtemelen transparant PNG,
        // arka plan yok — hiçbir şey yapma
        if (edgeAvg < 150) {
          console.log("[BG Remove] Edge avg too low, no bg to remove");
          resolve(dataUrl);
          return;
        }

        // Bir pikselin "arka plan" olarak sayılıp sayılmayacağı
        const isBg = (idx: number): boolean => {
          const i = idx * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const brightness = (r + g + b) / 3;
          // Renk saturasyonu düşük (gri/beyaz) VE parlak
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;
          return brightness > threshold && saturation < 0.15;
        };

        // Ziyaret edilen pikseller
        const visited = new Uint8Array(total);
        const queue = new Int32Array(total);
        let queueEnd = 0;
        let queueStart = 0;

        // 4 kenardaki tüm arka plan pikselleri seed
        for (let x = 0; x < w; x++) {
          if (isBg(x) && !visited[x]) {
            visited[x] = 1;
            queue[queueEnd++] = x;
          }
          const bottomIdx = (h - 1) * w + x;
          if (isBg(bottomIdx) && !visited[bottomIdx]) {
            visited[bottomIdx] = 1;
            queue[queueEnd++] = bottomIdx;
          }
        }
        for (let y = 0; y < h; y++) {
          const leftIdx = y * w;
          if (isBg(leftIdx) && !visited[leftIdx]) {
            visited[leftIdx] = 1;
            queue[queueEnd++] = leftIdx;
          }
          const rightIdx = y * w + (w - 1);
          if (isBg(rightIdx) && !visited[rightIdx]) {
            visited[rightIdx] = 1;
            queue[queueEnd++] = rightIdx;
          }
        }

        console.log(`[BG Remove] Initial seeds: ${queueEnd}`);

        // BFS flood-fill
        while (queueStart < queueEnd) {
          const p = queue[queueStart++];
          const x = p % w;
          const y = (p / w) | 0;

          if (x > 0) {
            const n = p - 1;
            if (!visited[n] && isBg(n)) {
              visited[n] = 1;
              queue[queueEnd++] = n;
            }
          }
          if (x < w - 1) {
            const n = p + 1;
            if (!visited[n] && isBg(n)) {
              visited[n] = 1;
              queue[queueEnd++] = n;
            }
          }
          if (y > 0) {
            const n = p - w;
            if (!visited[n] && isBg(n)) {
              visited[n] = 1;
              queue[queueEnd++] = n;
            }
          }
          if (y < h - 1) {
            const n = p + w;
            if (!visited[n] && isBg(n)) {
              visited[n] = 1;
              queue[queueEnd++] = n;
            }
          }
        }

        console.log(`[BG Remove] Total pixels marked as bg: ${queueEnd} / ${total} (${((queueEnd / total) * 100).toFixed(1)}%)`);

        // Ziyaret edilenleri transparan yap
        for (let i = 0; i < total; i++) {
          if (visited[i]) {
            data[i * 4 + 3] = 0;
          }
        }

        // Edge softening: sınırdaki logo pikselleri için yumuşak alfa
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const p = y * w + x;
            if (visited[p]) continue;
            const i = p * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const brightness = (r + g + b) / 3;
            if (brightness < threshold - 30) continue;

            const anyNeighborBg =
              visited[p - 1] || visited[p + 1] ||
              visited[p - w] || visited[p + w];
            if (anyNeighborBg) {
              const range = threshold - (threshold - 30);
              const above = brightness - (threshold - 30);
              const softAlpha = Math.round(255 * (1 - Math.min(above / range, 1)));
              data[i + 3] = Math.min(data[i + 3], softAlpha);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("BG removal error:", err);
        reject(err);
      }
    };
    img.onerror = (e) => {
      console.error("Image load error:", e);
      reject(new Error("Image konnte nicht geladen werden"));
    };
    img.src = dataUrl;
  });
}

/**
 * Design'ın boyutunu ve konumunu print area içinde kısıtla.
 */
function clampToPrintArea(x: number, y: number, width: number, aspect: number) {
  const height = width / aspect;
  const halfW = width / 2;
  const halfH = height / 2;

  // Boyut zaten print area'yı aşıyorsa küçült
  const maxWidth = PRINT_AREA.right - PRINT_AREA.left;
  const maxHeight = PRINT_AREA.bottom - PRINT_AREA.top;
  let clampedWidth = width;
  if (width > maxWidth) clampedWidth = maxWidth;
  const clampedHeight = clampedWidth / aspect;
  if (clampedHeight > maxHeight) clampedWidth = maxHeight * aspect;

  const finalHalfW = clampedWidth / 2;
  const finalHalfH = (clampedWidth / aspect) / 2;

  const xMin = PRINT_AREA.left + finalHalfW;
  const xMax = PRINT_AREA.right - finalHalfW;
  const yMin = PRINT_AREA.top + finalHalfH;
  const yMax = PRINT_AREA.bottom - finalHalfH;

  return {
    x: Math.max(xMin, Math.min(xMax, x)),
    y: Math.max(yMin, Math.min(yMax, y)),
    width: clampedWidth,
  };
}

type Side = "front" | "back";

export default function ProductGallery({
  images,
  colorImages,
  colors,
  name,
  iconName,
}: {
  images: string[];
  colorImages?: Record<string, string[]>;
  colors?: string[];
  name: string;
  iconName: string;
  cardCrop?: string;
}) {
  const [activeColor, setActiveColor] = useState<string | null>(colors?.[0] ?? null);
  const [side, setSide] = useState<Side>("front");
  const [designs, setDesigns] = useState<{ front: Placement | null; back: Placement | null }>({
    front: null,
    back: null,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; startVal: number; startVal2: number; mode: "move" | "resize" | null }>({ x: 0, y: 0, startVal: 0, startVal2: 0, mode: null });
  const [atBoundary, setAtBoundary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const currentImages = useMemo(() => {
    if (activeColor && colorImages) {
      const norm = (s: string) => s.toLowerCase().trim()
        .replace(/ß/g, "ss").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ä/g, "a")
        .replace(/[^a-z0-9]/g, "");
      const target = norm(activeColor);
      const matchedKey = Object.keys(colorImages).find((k) => norm(k) === target);
      const rels = matchedKey ? colorImages[matchedKey] : null;
      if (rels && rels.length > 0) {
        const resolved = rels.map((r) => resolveUrl(r, images));
        const usable = resolved.filter((u) =>
          u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/")
        );
        if (usable.length > 0) return usable;
      }
    }
    return images;
  }, [activeColor, colorImages, images]);

  // SADECE ilk 2 görseli kullan (ön + arka)
  const frontImage = currentImages[0] || "";
  const backImage = currentImages[1] || null;
  const hasBack = Boolean(backImage);

  const activeImage = side === "front" ? frontImage : backImage;
  const currentDesign = designs[side];
  const totalDesigns = (designs.front ? 1 : 0) + (designs.back ? 1 : 0);

  useEffect(() => {
    function onColor(e: Event) {
      const ce = e as CustomEvent<{ color: string | null }>;
      setActiveColor(ce.detail?.color || null);
      setSide("front");
    }
    window.addEventListener("product-color-change", onColor as EventListener);
    return () => window.removeEventListener("product-color-change", onColor as EventListener);
  }, []);

  // Dış component'ler için design'ları broadcast et
  useEffect(() => {
    const detail = {
      front: designs.front ? { imageDataUrl: designs.front.imageDataUrl } : null,
      back: designs.back ? { imageDataUrl: designs.back.imageDataUrl } : null,
      hasBack,
    };
    window.dispatchEvent(new CustomEvent("designs-updated", { detail }));
  }, [designs, hasBack]);

  // Dış component'ten upload açma isteği
  useEffect(() => {
    function onUploadRequest(e: Event) {
      const ce = e as CustomEvent<{ side: Side }>;
      const requestedSide = ce.detail?.side || "front";
      if (requestedSide === "back" && !hasBack) return;
      setSide(requestedSide);
      setTimeout(() => fileInputRef.current?.click(), 60);
    }
    window.addEventListener("design-upload-request", onUploadRequest as EventListener);
    return () => window.removeEventListener("design-upload-request", onUploadRequest as EventListener);
  }, [hasBack]);

  // Auto-switch to front if back is not available
  useEffect(() => {
    if (side === "back" && !hasBack) setSide("front");
  }, [side, hasBack]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Bitte laden Sie ein Bild hoch (PNG, JPG, SVG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Datei ist zu groß. Maximal 10 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const centerX = (PRINT_AREA.left + PRINT_AREA.right) / 2;
        const centerY = (PRINT_AREA.top + PRINT_AREA.bottom) / 2;
        const clamped = clampToPrintArea(centerX, centerY, EMPTY.width, aspect);
        setDesigns((prev) => ({
          ...prev,
          [side]: {
            imageDataUrl: dataUrl,
            originalImageDataUrl: dataUrl,
            bgRemoved: false,
            imageAspect: aspect,
            x: clamped.x,
            y: clamped.y,
            width: clamped.width,
            rotation: 0,
          },
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [side]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, mode: "move" | "resize") => {
      if (!currentDesign) return;
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        startVal: currentDesign.x,
        startVal2: mode === "move" ? currentDesign.y : currentDesign.width,
        mode,
      };
      setIsDragging(true);
    },
    [currentDesign]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const start = dragRef.current;
      if (!start.mode || !currentDesign || !canvasRef.current) return;

      const canvas = canvasRef.current.getBoundingClientRect();
      const dx = ((e.clientX - start.x) / canvas.width) * 100;
      const dy = ((e.clientY - start.y) / canvas.height) * 100;

      if (start.mode === "move") {
        const rawX = start.startVal + dx;
        const rawY = start.startVal2 + dy;
        const clamped = clampToPrintArea(rawX, rawY, currentDesign.width, currentDesign.imageAspect);
        // Sınıra dayandığı zaman feedback
        const isAtBound = Math.abs(clamped.x - rawX) > 0.5 || Math.abs(clamped.y - rawY) > 0.5;
        if (isAtBound !== atBoundary) setAtBoundary(isAtBound);
        setDesigns((prev) => ({
          ...prev,
          [side]: prev[side] ? { ...prev[side]!, x: clamped.x, y: clamped.y } : null,
        }));
      } else if (start.mode === "resize") {
        const rawWidth = Math.max(8, start.startVal2 + (dx + dy) / 2);
        const clamped = clampToPrintArea(
          currentDesign.x,
          currentDesign.y,
          rawWidth,
          currentDesign.imageAspect
        );
        // Size sınırlandıysa boundary vurgusu
        const isAtBound = Math.abs(clamped.width - rawWidth) > 0.5;
        if (isAtBound !== atBoundary) setAtBoundary(isAtBound);
        setDesigns((prev) => ({
          ...prev,
          [side]: prev[side] ? { ...prev[side]!, x: clamped.x, y: clamped.y, width: clamped.width } : null,
        }));
      }
    },
    [currentDesign, side]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current.mode = null;
    setAtBoundary(false);
    setIsDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  const handleRotate = (delta: number) => {
    if (!currentDesign) return;
    setDesigns((prev) => ({
      ...prev,
      [side]: prev[side] ? { ...prev[side]!, rotation: prev[side]!.rotation + delta } : null,
    }));
  };

  const handleRemove = () => {
    setDesigns((prev) => ({ ...prev, [side]: null }));
  };

  const [bgProcessing, setBgProcessing] = useState(false);
  const handleToggleBg = async () => {
    if (!currentDesign || bgProcessing) return;

    if (currentDesign.bgRemoved) {
      // Geri: orijinale dön
      setDesigns((prev) => ({
        ...prev,
        [side]: prev[side]
          ? { ...prev[side]!, imageDataUrl: prev[side]!.originalImageDataUrl, bgRemoved: false }
          : null,
      }));
    } else {
      // Cache varsa direkt kullan
      if (currentDesign.processedImageDataUrl) {
        setDesigns((prev) => ({
          ...prev,
          [side]: prev[side]
            ? { ...prev[side]!, imageDataUrl: prev[side]!.processedImageDataUrl!, bgRemoved: true }
            : null,
        }));
        return;
      }
      // İşle
      setBgProcessing(true);
      try {
        const processed = await removeWhiteBackground(currentDesign.originalImageDataUrl);
        setDesigns((prev) => ({
          ...prev,
          [side]: prev[side]
            ? { ...prev[side]!, imageDataUrl: processed, processedImageDataUrl: processed, bgRemoved: true }
            : null,
        }));
      } catch (err) {
        console.error("Bg removal failed:", err);
        alert("Hintergrund konnte nicht entfernt werden. Bitte versuchen Sie ein anderes Bild.");
      } finally {
        setBgProcessing(false);
      }
    }
  };

  if (currentImages.length === 0 && (!colors || colors.length === 0)) {
    return (
      <div className="gallery">
        <div className="gallery-main gallery-empty">
          <ProductIcon name={iconName} />
        </div>
      </div>
    );
  }

  return (
    <div className="gallery">
      {totalDesigns > 0 && (
        <div className="gal-status">
          <span className="gal-status-icon">✓</span>
          <span>{totalDesigns} Design{totalDesigns > 1 ? "s" : ""} platziert</span>
          <span className="gal-status-detail">
            {designs.front && <span>Vorderseite ✓</span>}
            {designs.back && <span>Rückseite ✓</span>}
          </span>
        </div>
      )}

      <div
        className="gallery-main"
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {activeImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={activeImage} alt={`${name} — ${side === "front" ? "Vorderseite" : "Rückseite"}`} draggable={false} />
        ) : (
          <div className="gallery-empty"><ProductIcon name={iconName} /></div>
        )}

        {/* Print area — logo bu alan içinde kalmalı */}
        {activeImage && (
          <div
            className={`gal-print-area${currentDesign ? " has-design" : ""}${atBoundary ? " at-boundary" : ""}${isDragging ? " is-dragging" : ""}`}
            style={{
              left: `${PRINT_AREA.left}%`,
              top: `${PRINT_AREA.top}%`,
              width: `${PRINT_AREA.right - PRINT_AREA.left}%`,
              height: `${PRINT_AREA.bottom - PRINT_AREA.top}%`,
            }}
            aria-hidden
          >
            <span className="gal-print-label">Druckbereich</span>
            <div className="gal-print-grid" aria-hidden />
          </div>
        )}

        {/* Design overlay */}
        {currentDesign && (
          <div
            className={`gal-design-layer${isDragging ? " is-dragging" : ""}`}
            style={{
              left: `${currentDesign.x}%`,
              top: `${currentDesign.y}%`,
              width: `${currentDesign.width}%`,
              transform: `translate(-50%, -50%) rotate(${currentDesign.rotation}deg)`,
            }}
            onPointerDown={(e) => handlePointerDown(e, "move")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentDesign.imageDataUrl}
              alt="Ihr Design"
              className="gal-design-img"
              style={{ aspectRatio: currentDesign.imageAspect }}
              draggable={false}
            />
            <div
              className="gal-handle gal-handle-br"
              onPointerDown={(e) => handlePointerDown(e, "resize")}
              aria-label="Größe ändern"
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 8 L8 2 M5 8 L8 5"/>
              </svg>
            </div>
            <button
              type="button"
              className="gal-handle gal-handle-remove"
              onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onTouchStart={(e) => { e.stopPropagation(); }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleRemove();
              }}
              aria-label="Design entfernen"
            >
              ✕
            </button>
          </div>
        )}

        {/* Controls when design exists */}
        {currentDesign && (
          <div className="gal-controls">
            <button type="button" className="gal-ctrl-btn" onClick={() => handleRotate(-15)} title="Nach links drehen">↺</button>
            <button type="button" className="gal-ctrl-btn" onClick={() => handleRotate(15)} title="Nach rechts drehen">↻</button>
            <div className="gal-ctrl-sep" />
            {(() => {
              const size = getRealSize(currentDesign.width, currentDesign.imageAspect);
              return (
                <div className="gal-ctrl-size" title="Größe im echten Druck">
                  <span className="gal-ctrl-size-item">
                    <span className="gal-ctrl-size-label">B</span>
                    <span className="gal-ctrl-size-val">{size.widthCm.toLocaleString("de-DE")}</span>
                    <span className="gal-ctrl-size-unit">cm</span>
                  </span>
                  <span className="gal-ctrl-size-sep">×</span>
                  <span className="gal-ctrl-size-item">
                    <span className="gal-ctrl-size-label">H</span>
                    <span className="gal-ctrl-size-val">{size.heightCm.toLocaleString("de-DE")}</span>
                    <span className="gal-ctrl-size-unit">cm</span>
                  </span>
                </div>
              );
            })()}
            <div className="gal-ctrl-sep" />
            <button
              type="button"
              className={`gal-ctrl-btn gal-ctrl-bg${currentDesign.bgRemoved ? " active" : ""}${bgProcessing ? " loading" : ""}`}
              onClick={handleToggleBg}
              disabled={bgProcessing}
              title={currentDesign.bgRemoved ? "Original wiederherstellen" : "Hintergrund entfernen (KI)"}
            >
              {bgProcessing ? (
                <span className="gal-ctrl-spinner" />
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  <span className="gal-ctrl-bg-label">BG</span>
                </>
              )}
            </button>
            <div className="gal-ctrl-sep" />
            <button type="button" className="gal-ctrl-btn" onClick={() => fileInputRef.current?.click()} title="Anderes Design">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              </svg>
            </button>
          </div>
        )}

        {/* Upload CTA when no design on current side */}
        {!currentDesign && activeImage && (
          <button
            type="button"
            className="gal-upload-cta"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            </svg>
            Design für {side === "front" ? "Vorderseite" : "Rückseite"} hochladen
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </div>

      {/* Contact CTA if no back image */}
      {!hasBack && (
        <div className="gal-contact-cta">
          <div className="gal-contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="gal-contact-body">
            <div className="gal-contact-title">Rückseiten-Druck gewünscht?</div>
            <div className="gal-contact-text">
              Kein Problem — kontaktieren Sie uns für individuelle Anfragen und wir kümmern uns um die Rückseite Ihrer Bestellung.
            </div>
          </div>
          <div className="gal-contact-actions">
            <Link href="/kontakt" className="gal-contact-btn primary">
              Kontakt aufnehmen →
            </Link>
            <a
              href="https://wa.me/491606767001?text=Hallo%20INKII%20Works%2C%20ich%20m%C3%B6chte%20die%20R%C3%BCckseite%20eines%20Produkts%20bedrucken%20lassen."
              target="_blank"
              rel="noopener noreferrer"
              className="gal-contact-btn wa"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Print area — logo bu alan içinde kalmalı */
        .gal-print-area {
          position: absolute;
          border: 1.5px dashed rgba(94, 132, 112, 0.55);
          border-radius: 2px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.25s ease, border-color 0.2s, box-shadow 0.15s, background 0.15s;
          z-index: 3;
        }
        /* Görsel ekli iken görünür */
        .gal-print-area.has-design {
          opacity: 1;
        }
        /* Canvas üzerinde hover — her zaman görünür */
        .gallery-main:hover .gal-print-area {
          opacity: 1;
        }
        .gal-print-area.has-design {
          border-color: rgba(94, 132, 112, 0.75);
        }
        .gal-print-area.at-boundary {
          border-color: rgba(94, 132, 112, 0.95);
          border-style: solid;
          border-width: 2px;
          box-shadow: 0 0 0 3px rgba(94, 132, 112, 0.15), inset 0 0 20px rgba(94, 132, 112, 0.08);
          animation: pulse-boundary 0.4s ease-in-out;
        }
        @keyframes pulse-boundary {
          0% { transform: scale(1); }
          40% { transform: scale(1.005); }
          100% { transform: scale(1); }
        }
        /* Grid overlay — sürüklerken veya üstüne gelince görünür */
        .gal-print-grid {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(94, 132, 112, 0.28) 1px, transparent 1px),
            linear-gradient(90deg, rgba(94, 132, 112, 0.28) 1px, transparent 1px);
          background-size: 12% 12%;
          background-position: 0 0;
          transition: opacity 0.15s;
        }
        /* Design layer'in üzerine gelince grid görünür */
        .gal-design-layer:hover ~ .gal-print-area .gal-print-grid,
        .gal-print-area.is-dragging .gal-print-grid,
        .gal-print-area.has-design:hover .gal-print-grid {
          opacity: 1;
        }
        /* Merkez çizgileri — kılavuz (dragging'de) */
        .gal-print-area.is-dragging::before,
        .gal-print-area.is-dragging::after {
          content: "";
          position: absolute;
          background: rgba(94, 132, 112, 0.55);
          pointer-events: none;
        }
        .gal-print-area.is-dragging::before {
          left: 50%;
          top: 8%;
          bottom: 8%;
          width: 1px;
          transform: translateX(-0.5px);
        }
        .gal-print-area.is-dragging::after {
          top: 50%;
          left: 8%;
          right: 8%;
          height: 1px;
          transform: translateY(-0.5px);
        }
        .gal-print-area.is-dragging {
          border-color: rgba(94, 132, 112, 0.7);
          background: rgba(94, 132, 112, 0.04);
        }
        /* Hover — pointer-events kapalı olduğu için canvas hover ile göster */
        .gallery-main:hover .gal-print-area.has-design .gal-print-grid {
          opacity: 0.75;
        }
        .gal-print-label {
          position: absolute;
          top: -20px;
          left: 0;
          font-size: 0.6rem;
          font-weight: 700;
          color: rgba(94, 132, 112, 0.85);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          background: #fff;
          padding: 2px 6px;
          border-radius: 2px;
        }
        .gal-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          margin-bottom: 10px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          flex-wrap: wrap;
        }
        .gal-status-icon {
          background: #10b981;
          color: #fff;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .gal-status-detail {
          margin-left: auto;
          display: flex;
          gap: 10px;
          font-size: 0.72rem;
          opacity: 0.85;
        }
        .gallery-main {
          position: relative;
          user-select: none;
          touch-action: none;
        }
        .gal-design-layer {
          position: absolute;
          cursor: move;
          user-select: none;
          touch-action: none;
          z-index: 5;
          outline: 1.5px dashed transparent;
          outline-offset: 2px;
          transition: outline-color 0.15s;
        }
        .gal-design-layer:hover {
          outline-color: rgba(94, 132, 112, 0.85);
        }
        .gal-design-layer .gal-handle {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
        }
        /* Hover'da veya sürüklerken handles görünür */
        .gal-design-layer:hover .gal-handle,
        .gal-design-layer.is-dragging .gal-handle {
          opacity: 1;
          pointer-events: auto;
        }
        /* Sürüklerken outline da görünsün */
        .gal-design-layer.is-dragging {
          outline-color: rgba(94, 132, 112, 0.85);
        }
        .gal-design-img {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
        }
        .gal-handle {
          position: absolute;
          width: 26px;
          height: 26px;
          background: #0f1a16;
          color: #fff;
          border: 2px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 0.75rem;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          cursor: nwse-resize;
          z-index: 10;
        }
        .gal-handle-br {
          bottom: -13px;
          right: -13px;
        }
        .gal-handle-remove {
          top: -13px;
          right: -13px;
          background: #dc2626;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 700;
          transition: background 0.15s, transform 0.15s;
        }
        .gal-handle-remove:hover {
          background: #b91c1c;
          transform: scale(1.1);
        }
        .gal-controls {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          background: rgba(15,26,22,0.92);
          padding: 4px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
          z-index: 6;
        }
        .gal-ctrl-btn {
          background: transparent;
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          font-size: 1.05rem;
          cursor: pointer;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .gal-ctrl-btn:hover {
          background: rgba(255,255,255,0.15);
        }
        .gal-ctrl-sep {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.2);
          margin: 0 2px;
        }
        .gal-ctrl-bg {
          padding: 0 10px;
          gap: 4px;
          min-width: auto;
          width: auto !important;
          display: inline-flex;
        }
        .gal-ctrl-bg.active {
          background: #5e8470;
          color: #fff;
        }
        .gal-ctrl-bg.active:hover {
          background: #4a6a5a;
        }
        .gal-ctrl-bg.loading {
          opacity: 0.7;
          cursor: wait;
        }
        .gal-ctrl-bg-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .gal-ctrl-size {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #fff;
          font-size: 0.72rem;
          padding: 0 6px;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .gal-ctrl-size-item {
          display: inline-flex;
          align-items: baseline;
          gap: 3px;
        }
        .gal-ctrl-size-label {
          font-size: 0.6rem;
          opacity: 0.5;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .gal-ctrl-size-val {
          font-weight: 700;
          font-size: 0.78rem;
        }
        .gal-ctrl-size-unit {
          font-size: 0.58rem;
          opacity: 0.55;
          margin-left: 1px;
        }
        .gal-ctrl-size-sep {
          opacity: 0.35;
          font-weight: 300;
        }
        .gal-ctrl-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: gal-spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes gal-spin {
          to { transform: rotate(360deg); }
        }
        .gal-upload-cta {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f1a16;
          color: #fff;
          border: none;
          padding: 10px 18px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          transition: transform 0.15s, box-shadow 0.15s;
          z-index: 4;
        }
        .gal-upload-cta:hover {
          transform: translateX(-50%) translateY(-1px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.3);
        }
        .gal-contact-cta {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          margin-top: 12px;
          background: linear-gradient(135deg, #fff8e6 0%, #fef3c7 100%);
          border: 1px solid #fbbf24;
          border-radius: 6px;
          flex-wrap: wrap;
        }
        .gal-contact-icon {
          width: 42px;
          height: 42px;
          background: #fbbf24;
          color: #78350f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .gal-contact-body {
          flex: 1;
          min-width: 200px;
        }
        .gal-contact-title {
          font-weight: 700;
          font-size: 0.92rem;
          color: #78350f;
          margin-bottom: 4px;
        }
        .gal-contact-text {
          font-size: 0.78rem;
          color: #92400e;
          line-height: 1.4;
        }
        .gal-contact-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .gal-contact-btn {
          padding: 9px 16px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-decoration: none;
          border-radius: 4px;
          transition: transform 0.15s;
          display: inline-flex;
          align-items: center;
        }
        .gal-contact-btn:hover { transform: translateY(-1px); }
        .gal-contact-btn.primary {
          background: #0f1a16;
          color: #fff;
        }
        .gal-contact-btn.wa {
          background: #25d366;
          color: #fff;
        }
        @media (max-width: 640px) {
          .gal-status-detail { margin-left: 0; width: 100%; }
          .gal-contact-cta { flex-direction: column; align-items: stretch; text-align: left; }
          .gal-contact-actions { justify-content: stretch; }
          .gal-contact-btn { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
