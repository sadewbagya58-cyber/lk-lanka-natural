'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export function useHostingerSync() {
  const { status } = useSession();
  
  const cartItems = useCartStore((s) => s.cartItems);
  const setCartItems = useCartStore((s) => s.setCartItems);
  const clearCart = useCartStore((s) => s.clearCart);

  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const setWishlistIds = useWishlistStore((s) => s.setWishlistIds);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  // Synchronization status refs to prevent feedback loops and duplicate runs
  const mergedRef = useRef(false);
  const lastCartSyncRef = useRef<string>('');
  const lastWishlistSyncRef = useRef<string>('');
  const isSyncingCartRef = useRef(false);
  const isSyncingWishlistRef = useRef(false);

  // Clear local stores on sign out
  useEffect(() => {
    if (status === 'unauthenticated') {
      clearCart();
      clearWishlist();
      mergedRef.current = false;
      lastCartSyncRef.current = '';
      lastWishlistSyncRef.current = '';
    }
  }, [status, clearCart, clearWishlist]);

  // Synchronize cart
  useEffect(() => {
    if (status !== 'authenticated') return;

    const currentCartStr = cartItems
      .map((i) => `${i.productId}-${i.selectedVariantId || ''}-${i.quantity}`)
      .sort()
      .join(',');

    // Skip if state hasn't changed or if an active sync is in progress
    if (currentCartStr === lastCartSyncRef.current || isSyncingCartRef.current) {
      return;
    }

    const isFirstMerge = !mergedRef.current;
    isSyncingCartRef.current = true;

    async function doCartSync() {
      try {
        const response = await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItems, merge: isFirstMerge }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.cartItems) {
            const dbCartStr = (data.cartItems as typeof cartItems)
              .map((i) => `${i.productId}-${i.selectedVariantId || ''}-${i.quantity}`)
              .sort()
              .join(',');

            lastCartSyncRef.current = dbCartStr;

            // Only update Zustand store if the database state is different
            const currentZustandStr = useCartStore.getState().cartItems
              .map((i) => `${i.productId}-${i.selectedVariantId || ''}-${i.quantity}`)
              .sort()
              .join(',');

            if (dbCartStr !== currentZustandStr) {
              setCartItems(data.cartItems);
            }
          }
          if (isFirstMerge) {
            mergedRef.current = true;
          }
        }
      } catch (err) {
        console.error('Failed to sync cart to Hostinger DB:', err);
      } finally {
        isSyncingCartRef.current = false;
      }
    }

    // Debounce the sync to prevent spamming endpoints during consecutive rapid clicks
    const timer = setTimeout(() => {
      doCartSync();
    }, 300);

    return () => clearTimeout(timer);
  }, [cartItems, status, setCartItems]);

  // Synchronize wishlist
  useEffect(() => {
    if (status !== 'authenticated') return;

    const currentWishlistStr = [...wishlistIds].sort().join(',');

    // Skip if state hasn't changed or if an active sync is in progress
    if (currentWishlistStr === lastWishlistSyncRef.current || isSyncingWishlistRef.current) {
      return;
    }

    const isFirstMerge = !mergedRef.current;
    isSyncingWishlistRef.current = true;

    async function doWishlistSync() {
      try {
        const response = await fetch('/api/wishlist/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wishlistIds, merge: isFirstMerge }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.wishlistIds) {
            const dbWishlistStr = [...data.wishlistIds].sort().join(',');
            lastWishlistSyncRef.current = dbWishlistStr;

            // Only update Zustand store if the database state is different
            const currentZustandStr = [...useWishlistStore.getState().wishlistIds].sort().join(',');
            if (dbWishlistStr !== currentZustandStr) {
              setWishlistIds(data.wishlistIds);
            }
          }
          if (isFirstMerge) {
            mergedRef.current = true;
          }
        }
      } catch (err) {
        console.error('Failed to sync wishlist to Hostinger DB:', err);
      } finally {
        isSyncingWishlistRef.current = false;
      }
    }

    const timer = setTimeout(() => {
      doWishlistSync();
    }, 300);

    return () => clearTimeout(timer);
  }, [wishlistIds, status, setWishlistIds]);
}
