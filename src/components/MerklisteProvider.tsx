"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type MerkSize = { name: string; qty: number; extraCents?: number };
export type MerkItem = {
  id: string;          // wir verwenden weiterhin productId für Detail-Link
  uniqueKey: string;   // productId + "::" + color — eindeutig pro Variante
  code: string;
  name: string;
  image: string | null;
  qty: number;
  sizes?: MerkSize[];
  note?: string;
  color?: string | null;     // Hex-Code (z. B. #3F9C5C) oder Slug
  colorLabel?: string | null;
  linkHref?: string;         // Optional: eigener Link statt /werbemittel/{id} (z.B. Designer-Produkte)
};

type MerklisteContextValue = {
  items: MerkItem[];
  count: number;
  mounted: boolean;
  has: (id: string, color?: string | null) => boolean;
  toggle: (item: Omit<MerkItem, "qty" | "uniqueKey">) => void;
  /** Fügt einen Artikel hinzu oder aktualisiert ihn (Größen, Notiz, Gesamtmenge, Farbe). */
  addOrUpdate: (item: Omit<MerkItem, "qty" | "uniqueKey"> & { qty?: number }) => void;
  remove: (uniqueKey: string) => void;
  setQty: (uniqueKey: string, qty: number) => void;
  clear: () => void;
};

function makeKey(id: string, color?: string | null): string {
  return `${id}::${color ?? ""}`;
}

const MerklisteContext = createContext<MerklisteContextValue | null>(null);
const STORAGE_KEY = "inkii_merkliste";

/** Hält die Merkzettel-Artikel und speichert sie im Browser (localStorage). */
export function MerklisteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MerkItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ungültige Daten ignorieren */
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* Speicher voll / nicht verfügbar */
    }
  }, [items, mounted]);

  // Legacy-Items ohne uniqueKey ergänzen (für bereits gespeicherte Daten)
  useEffect(() => {
    setItems((cur) => {
      let changed = false;
      const next = cur.map((i) => {
        if (!i.uniqueKey) {
          changed = true;
          return { ...i, uniqueKey: makeKey(i.id, i.color) };
        }
        return i;
      });
      return changed ? next : cur;
    });
  }, [mounted]);

  const has = useCallback(
    (id: string, color?: string | null) =>
      items.some((i) => i.uniqueKey === makeKey(id, color)),
    [items]
  );
  const toggle = useCallback((item: Omit<MerkItem, "qty" | "uniqueKey">) => {
    const key = makeKey(item.id, item.color);
    setItems((cur) =>
      cur.some((i) => i.uniqueKey === key)
        ? cur.filter((i) => i.uniqueKey !== key)
        : [...cur, { ...item, qty: 1, uniqueKey: key }]
    );
  }, []);
  const addOrUpdate = useCallback((item: Omit<MerkItem, "qty" | "uniqueKey"> & { qty?: number }) => {
    setItems((cur) => {
      const key = makeKey(item.id, item.color);
      const idx = cur.findIndex((i) => i.uniqueKey === key);
      const totalQty = item.sizes && item.sizes.length > 0
        ? item.sizes.reduce((s, sz) => s + (sz.qty || 0), 0)
        : (item.qty ?? 1);
      const next: MerkItem = {
        id: item.id,
        uniqueKey: key,
        code: item.code,
        name: item.name,
        image: item.image,
        qty: Math.max(1, totalQty),
        sizes: item.sizes && item.sizes.length > 0 ? item.sizes : undefined,
        note: item.note && item.note.trim() ? item.note.trim() : undefined,
        color: item.color ?? null,
        colorLabel: item.colorLabel ?? null,
        linkHref: item.linkHref,
      };
      if (idx === -1) return [...cur, next];
      const copy = [...cur];
      copy[idx] = next;
      return copy;
    });
  }, []);
  const remove = useCallback((uniqueKey: string) => {
    setItems((cur) => cur.filter((i) => i.uniqueKey !== uniqueKey));
  }, []);
  const setQty = useCallback((uniqueKey: string, qty: number) => {
    setItems((cur) =>
      cur.map((i) => (i.uniqueKey === uniqueKey ? { ...i, qty: Math.max(1, qty) } : i))
    );
  }, []);
  const clear = useCallback(() => setItems([]), []);

  return (
    <MerklisteContext.Provider
      value={{ items, count: items.length, mounted, has, toggle, addOrUpdate, remove, setQty, clear }}
    >
      {children}
    </MerklisteContext.Provider>
  );
}

export function useMerkliste() {
  const ctx = useContext(MerklisteContext);
  if (!ctx) {
    throw new Error("useMerkliste muss innerhalb von MerklisteProvider verwendet werden.");
  }
  return ctx;
}
