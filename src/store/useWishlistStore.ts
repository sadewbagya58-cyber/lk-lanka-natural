'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  wishlistIds: string[]; // Stores only product IDs
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      
      addToWishlist: (productId: string) => {
        const current = get().wishlistIds;
        if (!current.includes(productId)) {
          set({ wishlistIds: [...current, productId] });
        }
      },
      
      removeFromWishlist: (productId: string) => {
        set({
          wishlistIds: get().wishlistIds.filter((id) => id !== productId),
        });
      },
      
      toggleWishlist: (productId: string) => {
        const current = get().wishlistIds;
        if (current.includes(productId)) {
          get().removeFromWishlist(productId);
        } else {
          get().addToWishlist(productId);
        }
      },
      
      isInWishlist: (productId: string) => {
        return get().wishlistIds.includes(productId);
      },
      
      clearWishlist: () => {
        set({ wishlistIds: [] });
      },
    }),
    {
      name: 'kl-lanka-wishlist-store', // LocalStorage persistence key
    }
  )
);
