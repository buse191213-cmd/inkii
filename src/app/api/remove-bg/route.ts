import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Proxy für remove.bg.
 * Hält den API-Key geheim (nur serverseitig). Der Client schickt das Bild
 * als Data-URL, wir leiten es an remove.bg weiter und geben das transparente
 * PNG zurück. Fehlt der Key oder ist das Kontingent erschöpft, antworten wir
 * mit einem Fehlercode — der Client fällt dann auf das lokale ISNet-Modell zurück.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.REMOVEBG_API_KEY;
  // Kein Key konfiguriert → Client soll lokales Modell nutzen
  if (!apiKey) {
    return NextResponse.json({ error: "no-api-key" }, { status: 503 });
  }

  try {
    const { imageB64 } = await req.json();
    if (!imageB64 || typeof imageB64 !== "string") {
      return NextResponse.json({ error: "no-image" }, { status: 400 });
    }

    // Data-URL → Binary Buffer → Blob
    const b64 = imageB64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(b64, "base64");
    const blob = new Blob([buffer], { type: "image/png" });

    // Minimale Parameter — nur image_file + size (am zuverlässigsten)
    const form = new FormData();
    form.append("image_file", blob, "logo.png");
    form.append("size", "auto");

    const resp = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
    });

    if (!resp.ok) {
      let detail = "";
      try {
        detail = await resp.text();
      } catch {
        /* ignore */
      }
      console.error(`[remove-bg] remove.bg Fehler ${resp.status}: ${detail}`);
      return NextResponse.json(
        { error: "removebg-failed", status: resp.status, detail },
        { status: resp.status === 402 ? 402 : resp.status === 403 ? 403 : 502 }
      );
    }

    const arrayBuf = await resp.arrayBuffer();
    const resultB64 = Buffer.from(arrayBuf).toString("base64");
    return NextResponse.json({ image: `data:image/png;base64,${resultB64}` });
  } catch (e) {
    return NextResponse.json(
      { error: "server-error", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
