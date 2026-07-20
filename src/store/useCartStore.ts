'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProductById } from '@/data';

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariantId: string | null;
}

interface CartState {
  cartItems: CartItem[]; // Store product IDs, quantities, and optional variant IDs
  addToCart: (productId: string, quantity?: number, selectedVariantId?: string | null) => void;
  removeFromCart: (productId: string, selectedVariantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariantId?: string | null) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  
  // Dynamic totals
  getCartTotalItems: () => number;
  getCartSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (productId: string, quantity = 1, selectedVariantId = null) => {
        const items = get().cartItems;
        const normalizedVariantId = selectedVariantId ?? null;

        const existingIndex = items.findIndex(
          (item) => item.productId === productId && (item.selectedVariantId ?? null) === normalizedVariantId
        );
        
        // Fetch product to respect max inventory limits if available
        const product = getProductById(productId);
        const maxStock = product?.inventory?.stockQuantity ?? 99;
        
        if (existingIndex > -1) {
          const updatedItems = [...items];
          const currentQty = updatedItems[existingIndex].quantity;
          const newQty = Math.min(currentQty + quantity, maxStock);
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: newQty,
          };
          set({ cartItems: updatedItems });
        } else {
          set({
            cartItems: [
              ...items,
              { productId, quantity: Math.min(quantity, maxStock), selectedVariantId: normalizedVariantId },
            ],
          });
        }
      },
      
      removeFromCart: (productId: string, selectedVariantId = null) => {
        const normalizedVariantId = selectedVariantId ?? null;
        set({
          cartItems: get().cartItems.filter(
            (item) => !(item.productId === productId && (item.selectedVariantId ?? null) === normalizedVariantId)
          ),
        });
      },
      
      updateQuantity: (productId: string, quantity: number, selectedVariantId = null) => {
        const normalizedVariantId = selectedVariantId ?? null;
        if (quantity <= 0) {
          get().removeFromCart(productId, normalizedVariantId);
          return;
        }
        
        const product = getProductById(productId);
        const maxStock = product?.inventory?.stockQuantity ?? 99;
        const finalQuantity = Math.min(quantity, maxStock);
        
        set({
          cartItems: get().cartItems.map((item) =>
            item.productId === productId && (item.selectedVariantId ?? null) === normalizedVariantId
              ? { ...item, quantity: finalQuantity }
              : item
          ),
        });
      },
      
      clearCart: () => {
        set({ cartItems: [] });
      },

      setCartItems: (items: CartItem[]) => {
        set({ cartItems: items });
      },
      
      getCartTotalItems: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },
      
      getCartSubtotal: () => {
        return get().cartItems.reduce((sum, item) => {
          const product = getProductById(item.productId);
          if (!product) return sum;
          
          let itemPrice = product.price;
          if (item.selectedVariantId && product.variants) {
            const variant = product.variants.find((v) => v.id === item.selectedVariantId);
            if (variant) itemPrice = variant.price;
          }
          
          return sum + itemPrice * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'kl-lanka-cart-store',
    }
  )
);
