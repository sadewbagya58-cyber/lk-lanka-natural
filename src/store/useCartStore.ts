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
  cartItems: CartItem[]; // Store only product IDs and variants
  addToCart: (productId: string, quantity?: number, selectedVariantId?: string | null) => void;
  removeFromCart: (productId: string, selectedVariantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariantId?: string | null) => void;
  clearCart: () => void;
  
  // Dynamic totals fetched from database-ready products layer
  getCartTotalItems: () => number;
  getCartSubtotal: () => number; // Returns sum of product * quantity in USD base
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (productId: string, quantity = 1, selectedVariantId = null) => {
        const items = get().cartItems;
        const existingIndex = items.findIndex(
          (item) => item.productId === productId && item.selectedVariantId === selectedVariantId
        );
        
        // Fetch product to respect max inventory limits
        const product = getProductById(productId);
        if (!product) return;
        const maxStock = product.inventory.stockQuantity;
        
        if (existingIndex > -1) {
          const updatedItems = [...items];
          const newQty = updatedItems[existingIndex].quantity + quantity;
          updatedItems[existingIndex].quantity = Math.min(newQty, maxStock);
          set({ cartItems: updatedItems });
        } else {
          set({
            cartItems: [...items, { productId, quantity: Math.min(quantity, maxStock), selectedVariantId }],
          });
        }
      },
      
      removeFromCart: (productId: string, selectedVariantId = null) => {
        set({
          cartItems: get().cartItems.filter(
            (item) => !(item.productId === productId && item.selectedVariantId === selectedVariantId)
          ),
        });
      },
      
      updateQuantity: (productId: string, quantity: number, selectedVariantId = null) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, selectedVariantId);
          return;
        }
        
        const product = getProductById(productId);
        if (!product) return;
        const maxStock = product.inventory.stockQuantity;
        const finalQuantity = Math.min(quantity, maxStock);
        
        set({
          cartItems: get().cartItems.map((item) =>
            item.productId === productId && item.selectedVariantId === selectedVariantId
              ? { ...item, quantity: finalQuantity }
              : item
          ),
        });
      },
      
      clearCart: () => {
        set({ cartItems: [] });
      },
      
      getCartTotalItems: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },
      
      getCartSubtotal: () => {
        return get().cartItems.reduce((sum, item) => {
          const product = getProductById(item.productId);
          if (!product) return sum;
          
          // Check if variant has custom price override
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
      name: 'kl-lanka-cart-store', // LocalStorage persistence key
    }
  )
);
