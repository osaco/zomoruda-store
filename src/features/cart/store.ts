"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateLineTotal, calculateSubtotal, type PricedLine } from "@/lib/pricing";

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

const finiteOr = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

/** Older persisted carts don't contain customization or gift-box fields yet. */
function normalizePersistedLine(value: unknown): CartLine | null {
  if (!value || typeof value !== "object") return null;
  const line = value as Partial<CartLine>;
  if (typeof line.productId !== "string" || typeof line.slug !== "string" || typeof line.nameAr !== "string") return null;
  const options = Array.isArray(line.options)
    ? line.options.flatMap((option) => {
        if (!option || typeof option.nameAr !== "string" || typeof option.valueAr !== "string") return [];
        return [{ nameAr: option.nameAr, valueAr: option.valueAr, priceDelta: finiteOr(option.priceDelta) }];
      })
    : [];

  return {
    key: typeof line.key === "string" ? line.key : `${line.productId}:${line.slug}`,
    productId: line.productId,
    slug: line.slug,
    nameAr: line.nameAr,
    imageUrl: typeof line.imageUrl === "string" ? line.imageUrl : null,
    unitPrice: finiteOr(line.unitPrice),
    quantity: Math.max(1, Math.min(50, Math.trunc(finiteOr(line.quantity, 1)))),
    options,
    customName: typeof line.customName === "string" ? line.customName : null,
    cardMessage: typeof line.cardMessage === "string" ? line.cardMessage : null,
    photoPath: typeof line.photoPath === "string" ? line.photoPath : null,
    nameFee: finiteOr(line.nameFee),
    cardMessageFee: finiteOr(line.cardMessageFee),
    photoFee: finiteOr(line.photoFee),
    giftBoxKey: typeof line.giftBoxKey === "string" ? line.giftBoxKey : null,
    giftBoxId: typeof line.giftBoxId === "string" ? line.giftBoxId : null,
    giftBoxName: typeof line.giftBoxName === "string" ? line.giftBoxName : null,
    isGiftBox: line.isGiftBox === true,
    giftBoxCapacity: line.giftBoxCapacity == null ? null : finiteOr(line.giftBoxCapacity, 0),
  };
}

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
    {
      name: "zomoruda-cart",
      partialize: (s) => ({ lines: s.lines }),
      merge: (persistedState, currentState) => {
        const storedLines = (persistedState as { lines?: unknown } | null)?.lines;
        return {
          ...currentState,
          lines: Array.isArray(storedLines)
            ? storedLines.map(normalizePersistedLine).filter((line): line is CartLine => line !== null)
            : currentState.lines,
        };
      },
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export function pricedCartLine(line: CartLine): PricedLine {
  return {
    price: line.unitPrice,
    options: line.options,
    quantity: line.quantity,
    nameFee: line.nameFee,
    cardMessageFee: line.cardMessageFee,
    photoFee: line.photoFee,
  };
}

export const cartLineTotal = (line: CartLine) => calculateLineTotal(pricedCartLine(line));
export const cartSubtotal = (lines: CartLine[]) => calculateSubtotal(lines.map(pricedCartLine));
