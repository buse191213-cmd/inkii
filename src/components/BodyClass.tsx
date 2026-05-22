"use client";

import { useEffect } from "react";

/** Fügt eine Klasse zum <body> hinzu, solange die aktuelle Seite gemountet ist.
 *  Wird bewusst client-seitig gelöst, damit kein hydration mismatch entsteht
 *  und das Layout sich beim Wechsel zwischen Seiten sauber zurücksetzt. */
export default function BodyClass({ name }: { name: string }) {
  useEffect(() => {
    document.body.classList.add(name);
    return () => {
      document.body.classList.remove(name);
    };
  }, [name]);
  return null;
}
