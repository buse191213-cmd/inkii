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
  unitPriceCents: number; // 0 = "Preis auf Anfrage"
  minOrderQty?: number; // Mindestbestellmenge
  // DTF eklemeleri
  hasDtf: boolean;
  dtfSize: string;
  dtfPriceCents: number;
  dtfDesignUrl: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
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

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, i) => sum + (i.unitPriceCents + i.dtfPriceCents) * i.quantity,
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
      clearCart: () => {},
      isLoaded: false,
    };
  }
  return ctx;
}
