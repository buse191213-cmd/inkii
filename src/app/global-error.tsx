"use client";

import { useEffect } from "react";

/**
 * Globale Fehlergrenze.
 *
 * Fängt u. a. den ChunkLoadError ab, der nach einem neuen Deployment
 * auftreten kann: Der Browser hält noch eine alte HTML-Seite, die auf
 * JS-Chunks mit alten Hashes verweist — diese existieren serverseitig
 * nicht mehr → „Loading chunk X failed".
 *
 * Lösung: einmalig automatisch neu laden, damit die aktuelle Seite mit
 * den neuen Chunk-Namen geladen wird. Ein sessionStorage-Flag verhindert
 * eine Endlosschleife, falls der Fehler nicht am Chunk liegt.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      /Loading chunk [\d]+ failed/i.test(error?.message || "") ||
      /ChunkLoadError/i.test(error?.message || "");

    if (isChunkError) {
      const KEY = "inkii-chunk-reload";
      const alreadyReloaded = sessionStorage.getItem(KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="de">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#fafbf9",
          color: "#0f1a16",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 12 }}>
            Ein Moment bitte …
          </h1>
          <p style={{ fontSize: ".95rem", color: "#5b6560", lineHeight: 1.6, marginBottom: 24 }}>
            Die Seite wird neu geladen. Falls das nicht automatisch geschieht,
            klicken Sie bitte auf „Neu laden".
          </p>
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem("inkii-chunk-reload");
              } catch {}
              reset();
              window.location.reload();
            }}
            style={{
              background: "#004537",
              color: "#fff",
              border: 0,
              borderRadius: 7,
              padding: "12px 24px",
              fontSize: ".9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Neu laden
          </button>
        </div>
      </body>
    </html>
  );
}
