"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  menuItemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  variantId?: number;
  variantLabel?: string;
  modifiers: Record<string, string[]>;
};

type CartState = {
  locationId: string | null;
  items: CartItem[];
  discountCode: string;
  discountAmount: number;
  setLocation: (nextLocationId: string, force?: boolean) => boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string, amount: number) => void;
  getSubtotal: () => number;
  getTotal: () => number;
};

const confirmLocationSwitch = () => {
  if (typeof window === "undefined") {
    return true;
  }

  return window.confirm(
    "Bytte av avdeling tømmer handlekurven. Vil du fortsette?",
  );
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      locationId: null,
      items: [],
      discountCode: "",
      discountAmount: 0,
      setLocation: (nextLocationId, force = false) => {
        const { items, locationId } = get();
        if (!locationId || locationId === nextLocationId) {
          set({ locationId: nextLocationId });
          return true;
        }

        if (items.length > 0 && !force && !confirmLocationSwitch()) {
          return false;
        }

        set({
          locationId: nextLocationId,
          items: [],
          discountCode: "",
          discountAmount: 0,
        });
        return true;
      },
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((entry) => entry.id === item.id);
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.id === item.id
                  ? { ...entry, quantity: entry.quantity + item.quantity }
                  : entry,
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((entry) => entry.id !== id),
        }));
      },
      updateQty: (id, qty) => {
        set((state) => ({
          items: state.items
            .map((entry) =>
              entry.id === id
                ? { ...entry, quantity: Math.max(qty, 1) }
                : entry,
            )
            .filter((entry) => entry.quantity > 0),
        }));
      },
      clearCart: () => {
        set({ items: [], discountCode: "", discountAmount: 0 });
      },
      applyDiscount: (code, amount) => {
        set({ discountCode: code, discountAmount: Math.max(0, amount) });
      },
      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        ),
      getTotal: () => Math.max(0, get().getSubtotal() - get().discountAmount),
    }),
    {
      name: "babylon-cart-store",
      partialize: (state) => ({
        locationId: state.locationId,
        items: state.items,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
      }),
    },
  ),
);
