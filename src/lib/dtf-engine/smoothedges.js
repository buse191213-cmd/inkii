/**
 * Anti-aliasing kenar yumuşatma.
 * BG removal + cleanup sonrası kalan keskin (tırtıklı) kenarları
 * Gaussian blur ile alpha kanalında yumuşatır. RGB kanallarına dokunmaz.
 */
import sharp from "sharp";

export async function smoothEdges(buffer, { sigma = 0.7 } = {}) {
  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.hasAlpha) return { buffer, applied: false };

    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height;

    // Alpha kanalını ayır
    const alpha = Buffer.alloc(W * H);
    for (let i = 0; i < W * H; i++) alpha[i] = data[i * 4 + 3];

    // Sharp ile alpha tek kanal blur
    const blurred = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
      .blur(sigma)
      .raw()
      .toBuffer();

    // Yumuşatılmış alpha'yı geri yaz (kenar feather effect)
    // Ama tam opak (255) ve tam şeffaf (0) bölgeleri koru - sadece kenarı yumuşat
    for (let i = 0; i < W * H; i++) {
      const orig = data[i * 4 + 3];
      const smooth = blurred[i];
      // Sadece kenar piksellerini blend et (orig 30-225 arası)
      if (orig > 5 && orig < 250) {
        // Yumuşak geçiş: %60 blurred + %40 original
        data[i * 4 + 3] = Math.round(smooth * 0.6 + orig * 0.4);
      }
    }

    const out = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
      .png()
      .toBuffer();
    return { buffer: out, applied: true };
  } catch (err) {
    console.error("Kenar yumuşatma hatası:", err.message);
    return { buffer, applied: false };
  }
}
