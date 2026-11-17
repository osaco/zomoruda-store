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
  nameFee: number;
  cardMessageFee: number;
  photoFee: number;
  giftBoxKey: string | null;
  giftBoxId: string | null;
  giftBoxName: string | null;
  isGiftBox: boolean;
  giftBoxCapacity: number | null;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "key">) => void;
  addGiftBox: (box: Omit<CartLine, "key" | "giftBoxKey" | "giftBoxId" | "giftBoxName" | "isGiftBox">, contents: Omit<CartLine, "key" | "giftBoxKey" | "giftBoxId" | "giftBoxName" | "isGiftBox">[]) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

/** Same product + same options + same customization = same cart line. */
export function lineKey(line: Omit<CartLine, "key" | "quantity" | "unitPrice">): string {
  return JSON.stringify([line.productId, line.giftBoxKey, line.options.map((o) => `${o.nameAr}=${o.valueAr}`), line.customName, line.cardMessage, line.photoPath]);
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
      addGiftBox: (box, contents) =>
        set((state) => {
          const giftBoxKey = crypto.randomUUID();
          const parent: CartLine = { ...box, key: `gift-box:${giftBoxKey}`, quantity: 1, giftBoxKey, giftBoxId: null, giftBoxName: null, isGiftBox: true };
          const children = contents.map((line, index): CartLine => ({
            ...line,
            key: `gift-box:${giftBoxKey}:item:${index}:${lineKey({ ...line, giftBoxKey, giftBoxId: box.productId, giftBoxName: box.nameAr, isGiftBox: false })}`,
            giftBoxKey,
            giftBoxId: box.productId,
            giftBoxName: box.nameAr,
            isGiftBox: false,
            giftBoxCapacity: null,
          }));
          return { lines: [...state.lines, parent, ...children], isOpen: true };
        }),
      setQuantity: (key, quantity) =>
        set((state) => {
          const target = state.lines.find((line) => line.key === key);
          if (!target || target.isGiftBox) return state;
          let nextQuantity = Math.max(1, Math.min(50, quantity));
          if (target.giftBoxKey) {
            const parent = state.lines.find((line) => line.giftBoxKey === target.giftBoxKey && line.isGiftBox);
            if (parent?.giftBoxCapacity) {
              const otherUnits = state.lines.filter((line) => line.giftBoxKey === target.giftBoxKey && line.key !== key && !line.isGiftBox).reduce((sum, line) => sum + line.quantity, 0);
              nextQuantity = Math.min(nextQuantity, Math.max(1, parent.giftBoxCapacity - otherUnits));
            }
          }
          return { lines: state.lines.map((line) => line.key === key ? { ...line, quantity: nextQuantity } : line) };
        }),
      remove: (key) => set((state) => {
        const line = state.lines.find((item) => item.key === key);
        return { lines: state.lines.filter((item) => item.key !== key && !(line?.isGiftBox && item.giftBoxKey === line.giftBoxKey)) };
      }),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "zomoruda-cart", partialize: (s) => ({ lines: s.lines }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + (l.unitPrice + l.options.reduce((d, o) => d + o.priceDelta, 0) + l.nameFee + l.cardMessageFee + l.photoFee) * l.quantity, 0);
