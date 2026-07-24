import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface BuyNowItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
}

interface BuyNowState {
  buyNowItem: BuyNowItem | null;
  setBuyNowItem: (item: BuyNowItem) => void;
  clearBuyNowItem: () => void;
}

export const useBuyNowStore = create<BuyNowState>()(
  persist(
    (set) => ({
      buyNowItem: null,
      setBuyNowItem: (item) => set({ buyNowItem: item }),
      clearBuyNowItem: () => set({ buyNowItem: null }),
    }),
    {
      name: 'kln-buynow-item',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
