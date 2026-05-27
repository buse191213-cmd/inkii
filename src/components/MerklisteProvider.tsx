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
  id: string;
  code: string;
  name: string;
  image: string | null;
  qty: number;
  sizes?: MerkSize[];
  note?: string;
};

type MerklisteContextValue = {
  items: MerkItem[];
  count: number;
  mounted: boolean;
  has: (id: string) => boolean;
  toggle: (item: Omit<MerkItem, "qty">) => void;
  /** Fügt einen Artikel hinzu oder aktualisiert ihn (Größen, Notiz, Gesamtmenge). */
  addOrUpdate: (item: Omit<MerkItem, "qty"> & { qty?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

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

  const has = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );
  const toggle = useCallback((item: Omit<MerkItem, "qty">) => {
    setItems((cur) =>
      cur.some((i) => i.id === item.id)
        ? cur.filter((i) => i.id !== item.id)
        : [...cur, { ...item, qty: 1 }]
    );
  }, []);
  const addOrUpdate = useCallback((item: Omit<MerkItem, "qty"> & { qty?: number }) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.id === item.id);
      // Berechne Gesamtmenge: wenn sizes gegeben sind, summieren; sonst qty oder 1.
      const totalQty = item.sizes && item.sizes.length > 0
        ? item.sizes.reduce((s, sz) => s + (sz.qty || 0), 0)
        : (item.qty ?? 1);
      const next: MerkItem = {
        id: item.id,
        code: item.code,
        name: item.name,
        image: item.image,
        qty: Math.max(1, totalQty),
        sizes: item.sizes && item.sizes.length > 0 ? item.sizes : undefined,
        note: item.note && item.note.trim() ? item.note.trim() : undefined,
      };
      if (idx === -1) return [...cur, next];
      const copy = [...cur];
      copy[idx] = next;
      return copy;
    });
  }, []);
  const remove = useCallback((id: string) => {
    setItems((cur) => cur.filter((i) => i.id !== id));
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((cur) =>
      cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
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
