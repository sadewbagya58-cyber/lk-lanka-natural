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
  customUploadImage?: string | null;
  moq?: number;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (
    productId: string,
    quantity: number,
    selectedVariantId: string | null,
    unitPrice: number,
    image?: string | null,
    maxStock?: number,
    customUploadImage?: string | null,
    moq?: number
  ) => void;
  removeFromCart: (productId: string, selectedVariantId?: string | null, customUploadImage?: string | null) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    selectedVariantId?: string | null,
    maxStock?: number,
    customUploadImage?: string | null,
    minMoq?: number
  ) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  getCartTotalItems: () => number;
  getCartSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (productId, quantity = 1, selectedVariantId = null, unitPrice, image = null, maxStock, customUploadImage = null, moq) => {
        if (maxStock !== undefined && maxStock <= 0) return;

        const items = get().cartItems;
        const normalizedVariantId = selectedVariantId ?? null;
        const effectiveMoq = Math.max(1, moq ?? 1);

        const existingIndex = items.findIndex(
          (item) =>
            item.productId === productId &&
            (item.selectedVariantId ?? null) === normalizedVariantId &&
            (item.customUploadImage ?? null) === (customUploadImage ?? null)
        );

        if (existingIndex > -1) {
          const currentQty = items[existingIndex].quantity;
          let newQty = currentQty + quantity;
          if (maxStock !== undefined) {
            newQty = Math.min(newQty, maxStock);
          }
          newQty = Math.max(newQty, effectiveMoq);

          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: newQty,
            image: image || updatedItems[existingIndex].image || null,
            moq: effectiveMoq,
          };
          set({ cartItems: updatedItems });
        } else {
          let initialQty = Math.max(quantity, effectiveMoq);
          if (maxStock !== undefined) {
            initialQty = Math.min(initialQty, maxStock);
          }
          initialQty = Math.max(initialQty, effectiveMoq);

          set({
            cartItems: [
              ...items,
              {
                productId,
                quantity: initialQty,
                selectedVariantId: normalizedVariantId,
                unitPrice,
                image: image ?? null,
                customUploadImage: customUploadImage ?? null,
                moq: effectiveMoq,
              },
            ],
          });
        }
      },

      removeFromCart: (productId, selectedVariantId = null, customUploadImage = null) => {
        const normalizedVariantId = selectedVariantId ?? null;
        set({
          cartItems: get().cartItems.filter(
            (item) =>
              !(
                item.productId === productId &&
                (item.selectedVariantId ?? null) === normalizedVariantId &&
                (item.customUploadImage ?? null) === (customUploadImage ?? null)
              )
          ),
        });
      },

      updateQuantity: (productId, quantity, selectedVariantId = null, maxStock, customUploadImage = null, minMoq) => {
        const normalizedVariantId = selectedVariantId ?? null;
        const existingItem = get().cartItems.find(
          (item) =>
            item.productId === productId &&
            (item.selectedVariantId ?? null) === normalizedVariantId &&
            (item.customUploadImage ?? null) === (customUploadImage ?? null)
        );

        // Final client-side MOQ authority: read item's stored MOQ or minMoq parameter
        const effectiveMoq = Math.max(1, minMoq ?? existingItem?.moq ?? 1);

        // Clamping: Never allow a quantity below effectiveMoq.
        // If quantity requested is less than effectiveMoq (whether 9, 1, 0, or negative), clamp to effectiveMoq.
        // Do NOT call removeFromCart or delete the item inside updateQuantity.
        let targetQty = Math.max(quantity, effectiveMoq);
        if (maxStock !== undefined) {
          targetQty = Math.min(targetQty, maxStock);
        }
        targetQty = Math.max(targetQty, effectiveMoq);

        set({
          cartItems: get().cartItems.map((item) =>
            item.productId === productId &&
            (item.selectedVariantId ?? null) === normalizedVariantId &&
            (item.customUploadImage ?? null) === (customUploadImage ?? null)
              ? { ...item, quantity: targetQty, moq: item.moq ?? effectiveMoq }
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
