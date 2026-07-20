'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariantId: string | null;
  /** Price captured at the time the item was added */
  unitPrice: number;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity: number, selectedVariantId: string | null, unitPrice: number) => void;
  removeFromCart: (productId: string, selectedVariantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariantId?: string | null) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  getCartTotalItems: () => number;
  getCartSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (productId, quantity = 1, selectedVariantId = null, unitPrice) => {
        const items = get().cartItems;
        const normalizedVariantId = selectedVariantId ?? null;

        const existingIndex = items.findIndex(
          (item) =>
            item.productId === productId &&
            (item.selectedVariantId ?? null) === normalizedVariantId
        );

        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + quantity,
          };
          set({ cartItems: updatedItems });
        } else {
          set({
            cartItems: [
              ...items,
              { productId, quantity, selectedVariantId: normalizedVariantId, unitPrice },
            ],
          });
        }
      },

      removeFromCart: (productId, selectedVariantId = null) => {
        const normalizedVariantId = selectedVariantId ?? null;
        set({
          cartItems: get().cartItems.filter(
            (item) =>
              !(
                item.productId === productId &&
                (item.selectedVariantId ?? null) === normalizedVariantId
              )
          ),
        });
      },

      updateQuantity: (productId, quantity, selectedVariantId = null) => {
        const normalizedVariantId = selectedVariantId ?? null;
        if (quantity <= 0) {
          get().removeFromCart(productId, normalizedVariantId);
          return;
        }
        set({
          cartItems: get().cartItems.map((item) =>
            item.productId === productId &&
            (item.selectedVariantId ?? null) === normalizedVariantId
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ cartItems: [] });
      },

      setCartItems: (items) => {
        set({ cartItems: items });
      },

      getCartTotalItems: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },

      getCartSubtotal: () => {
        return get().cartItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
      },
    }),
    { name: 'kl-lanka-cart-store' }
  )
);
