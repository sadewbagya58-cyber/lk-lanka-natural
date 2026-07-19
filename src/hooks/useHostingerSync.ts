'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

/**
 * useHostingerSync
 * 
 * Synchronizes Zustand state (cart + wishlist) with Hostinger MySQL Database
 * via backend API routes.
 */
export function useHostingerSync() {
  const { status } = useSession();
  
  const cartItems = useCartStore((s) => s.cartItems);
  const clearCart = useCartStore((s) => s.clearCart);
  const addToCart = useCartStore((s) => s.addToCart);

  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);

  // Use refs to prevent infinite render dependency cycles
  const statusRef = useRef(status);
  
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const syncCart = useCallback(async () => {
    if (statusRef.current !== 'authenticated') return;
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.cartItems) {
          // Temporarily disable syncing back if they're identical to prevent loops
          const localKeys = cartItems.map(i => `${i.productId}-${i.selectedVariantId}-${i.quantity}`).sort().join(',');
          const dbKeys = (data.cartItems as { productId: string; selectedVariantId: string | null; quantity: number }[]).map((i) => `${i.productId}-${i.selectedVariantId}-${i.quantity}`).sort().join(',');
          if (localKeys !== dbKeys) {
            clearCart();
            for (const item of data.cartItems) {
              addToCart(item.productId, item.quantity, item.selectedVariantId);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync cart to Hostinger DB:', err);
    }
  }, [cartItems, clearCart, addToCart]);

  const syncWishlist = useCallback(async () => {
    if (statusRef.current !== 'authenticated') return;
    try {
      const response = await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlistIds }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.wishlistIds) {
          const localKeys = [...wishlistIds].sort().join(',');
          const dbKeys = [...data.wishlistIds].sort().join(',');
          if (localKeys !== dbKeys) {
            clearWishlist();
            for (const id of data.wishlistIds) {
              addToWishlist(id);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync wishlist to Hostinger DB:', err);
    }
  }, [wishlistIds, clearWishlist, addToWishlist]);

  // Sync state whenever cart or wishlist changes locally
  useEffect(() => {
    if (status === 'authenticated') {
      syncCart();
    }
  }, [cartItems, status, syncCart]);

  useEffect(() => {
    if (status === 'authenticated') {
      syncWishlist();
    }
  }, [wishlistIds, status, syncWishlist]);

  // Clear local stores on sign out
  useEffect(() => {
    if (status === 'unauthenticated') {
      clearCart();
      clearWishlist();
    }
  }, [status, clearCart, clearWishlist]);
}
