"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string; // uniq cart line id (productId + variant + dtf)
  productId: string;
  productCode: string;
  productName: string;
  productImage: string;
  color: string;
  size: string;
  quantity: number;
  unitPriceCents: number; // Basispreis (priceCents) — ratio uygulanmadan HAM base
  minOrderQty?: number; // Mindestbestellmenge
  availableSizes?: string[]; // Ürünün mevcut bedenleri: ["XS","S","M",...]
  sizePrices?: Record<string, number>; // Beden HAM özel fiyat (ratio uygulanmadan): {"2XL": 2500}
  sizeBreakdown?: Record<string, number>; // Beden dağılımı: {S:5, M:10, L:10}
  priceTiers?: Array<{ qty: number; cents: number }>; // Mengenstaffel — dinamik indirim için
  // DTF eklemeleri
  hasDtf: boolean;
  dtfSize: string;
  dtfPriceCents: number;
  dtfDesignUrl: string;
};

/**
 * Bir cart kaleminin toplam fiyatını hesaplar — DOĞRU tier + beden mantığı.
 *
 * Mantık:
 * 1. Toplam adete göre aktif Staffel tier bulunur → indirim oranı (ratio) hesaplanır
 *    ratio = tierFiyat / baseFiyat  (örn 100 adet → %11 indirim → ratio 0.89)
 * 2. Her beden için:
 *    - Beden özel fiyatı varsa (2XL=25€) → o HAM fiyata ratio uygulanır: 25 × 0.89
 *    - Yoksa base fiyata ratio uygulanır (zaten tierFiyat)
 * 3. Transfer her adet için ayrıca eklenir
 */
export function cartItemTotalCents(item: CartItem): number {
  const transferPerUnit = item.dtfPriceCents || 0;
  const baseCents = item.unitPriceCents; // ham base (priceCents)

  // Toplam adet
  const totalQty = item.sizeBreakdown && Object.keys(item.sizeBreakdown).length > 0
    ? Object.values(item.sizeBreakdown).reduce((s, n) => s + (n || 0), 0)
    : item.quantity;

  // Aktif tier fiyatını bul (toplam adete göre)
  let activeTierCents = baseCents;
  if (item.priceTiers && item.priceTiers.length > 0 && totalQty > 0) {
    const sorted = [...item.priceTiers].sort((a, b) => a.qty - b.qty);
    for (const t of sorted) {
      if (totalQty >= t.qty) activeTierCents = t.cents;
    }
  }

  // İndirim oranı: aktif tier / base
  const ratio = baseCents > 0 ? activeTierCents / baseCents : 1;

  // Beden dağılımı varsa: her beden kendi fiyatından × ratio
  if (item.sizeBreakdown && Object.keys(item.sizeBreakdown).length > 0) {
    let total = 0;
    for (const [size, qty] of Object.entries(item.sizeBreakdown)) {
      const n = qty || 0;
      if (n <= 0) continue;
      // Beden HAM fiyatı (özel varsa o, yoksa base)
      const rawSizePrice = (item.sizePrices?.[size] && item.sizePrices[size] > 0)
        ? item.sizePrices[size]
        : baseCents;
      // ratio uygula (Staffel indirimi bu bedene de yansır)
      const effectivePrice = Math.round(rawSizePrice * ratio);
      total += (effectivePrice + transferPerUnit) * n;
    }
    return total;
  }

  // Beden yoksa: aktif tier fiyatı × adet
  return (activeTierCents + transferPerUnit) * item.quantity;
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateSizeBreakdown: (id: string, breakdown: Record<string, number>) => void;
  clearCart: () => void;
  isLoaded: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "inkii_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
    setIsLoaded(true);
  }, []);

  // Persist on changes
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      // Broadcast event so badge updates across components
      window.dispatchEvent(new CustomEvent("inkii-cart-update"));
    } catch {
      /* ignore */
    }
  }, [items, isLoaded]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${item.productId}::${item.color}::${item.size}::${item.hasDtf ? item.dtfSize : "no"}`;
    setItems((cur) => {
      const existing = cur.find((i) => i.id === id);
      if (existing) {
        return cur.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...cur, { ...item, id }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((cur) => cur.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((cur) => cur.filter((i) => i.id !== id));
      return;
    }
    setItems((cur) =>
      cur.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  }, []);

  // Beden dağılımını güncelle — quantity otomatik toplamla senkronize olur
  const updateSizeBreakdown = useCallback((id: string, breakdown: Record<string, number>) => {
    setItems((cur) =>
      cur.map((i) => {
        if (i.id !== id) return i;
        const total = Object.values(breakdown).reduce((s, n) => s + (n || 0), 0);
        return { ...i, sizeBreakdown: breakdown, quantity: total };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, i) => sum + cartItemTotalCents(i),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalCents,
        addItem,
        removeItem,
        updateQuantity,
        updateSizeBreakdown,
        clearCart,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  // Provider olmadan da default değer dön (SSR/Suspense güvenli)
  if (!ctx) {
    return {
      items: [],
      itemCount: 0,
      subtotalCents: 0,
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      updateSizeBreakdown: () => {},
      clearCart: () => {},
      isLoaded: false,
    };
  }
  return ctx;
}
