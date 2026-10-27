"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartOption = { nameAr: string; valueAr: string; priceDelta: number };

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  nameAr: string;
  imageUrl: string | null;
  /** Display only — the server re-prices every order. */
  unitPrice: number;
  quantity: number;
  options: CartOption[];
  customName: string | null;
  cardMessage: string | null;
  photoPath: string | null;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

/** Same product + same options + same customization = same cart line. */
export function lineKey(line: Omit<CartLine, "key" | "quantity" | "unitPrice">): string {
  return JSON.stringify([line.productId, line.options.map((o) => `${o.nameAr}=${o.valueAr}`), line.customName, line.cardMessage, line.photoPath]);
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line) =>
        set((state) => {
          const key = lineKey(line);
          const existing = state.lines.find((l) => l.key === key);
          const lines = existing
            ? state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(50, l.quantity + line.quantity) } : l))
            : [...state.lines, { ...line, key }];
          return { lines, isOpen: true };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(50, quantity)) } : l)),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "zomoruda-cart", partialize: (s) => ({ lines: s.lines }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + (l.unitPrice + l.options.reduce((d, o) => d + o.priceDelta, 0)) * l.quantity, 0);
