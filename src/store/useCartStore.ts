'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariantId: string | null;
  /** Price captured at the time the item was added */
  unitPrice: number;
  /** Primary product or variant image URL */
  image?: string | null;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (
    productId: string,
    quantity: number,
    selectedVariantId: string | null,
    unitPrice: number,
    image?: string | null,
    maxStock?: number
  ) => void;
  removeFromCart: (productId: string, selectedVariantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariantId?: string | null, maxStock?: number) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  getCartTotalItems: () => number;
  getCartSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (productId, quantity = 1, selectedVariantId = null, unitPrice, image = null, maxStock) => {
        if (maxStock !== undefined && maxStock <= 0) return;

        const items = get().cartItems;
        const normalizedVariantId = selectedVariantId ?? null;

        const existingIndex = items.findIndex(
          (item) =>
            item.productId === productId &&
            (item.selectedVariantId ?? null) === normalizedVariantId
        );

        if (existingIndex > -1) {
          const currentQty = items[existingIndex].quantity;
          let newQty = currentQty + quantity;
          if (maxStock !== undefined) {
            newQty = Math.min(newQty, maxStock);
          }

          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: newQty,
            image: image || updatedItems[existingIndex].image || null,
          };
          set({ cartItems: updatedItems });
        } else {
          let initialQty = quantity;
          if (maxStock !== undefined) {
            initialQty = Math.min(initialQty, maxStock);
          }
          if (initialQty <= 0) return;

          set({
            cartItems: [
              ...items,
              { productId, quantity: initialQty, selectedVariantId: normalizedVariantId, unitPrice, image: image ?? null },
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

      updateQuantity: (productId, quantity, selectedVariantId = null, maxStock) => {
        const normalizedVariantId = selectedVariantId ?? null;
        if (quantity <= 0) {
          get().removeFromCart(productId, normalizedVariantId);
          return;
        }

        let targetQty = quantity;
        if (maxStock !== undefined) {
          targetQty = Math.min(targetQty, maxStock);
        }

        set({
          cartItems: get().cartItems.map((item) =>
            item.productId === productId &&
            (item.selectedVariantId ?? null) === normalizedVariantId
              ? { ...item, quantity: targetQty }
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
        return get().cartItems.reduce((sum, item) => {
          const price = typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) ? item.unitPrice : 0;
          const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1;
          return sum + price * qty;
        }, 0);
      },
    }),
    { name: 'kl-lanka-cart-store' }
  )
);
