'use client';

import { useState } from 'react';
import ProductGallery from './ProductGallery';
import ProductDetail, { ProductDetailData } from './ProductDetail';
import { Star } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  originalPrice: number | null;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold?: number | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

interface ProductStorefrontContainerProps {
  product: ProductDetailData;
  initialImages: Array<{ id: string; url: string; isPrimary: boolean; sortOrder: number }>;
  brand?: { name: string } | null;
  rating: number;
  reviewsCount: number;
}

export default function ProductStorefrontContainer({
  product,
  initialImages,
  brand,
  rating,
  reviewsCount,
}: ProductStorefrontContainerProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const activeImageOverride = selectedVariant?.imageUrl || null;

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-16">
      {/* Product Visual */}
      <div className="w-full lg:w-1/2">
        <div className="sticky top-24">
          <ProductGallery
            images={initialImages}
            name={product.name}
            gradient={product.gradient}
            visualSeed={product.visualSeed}
            activeImageOverride={activeImageOverride}
          />
        </div>
      </div>

      {/* Details */}
      <div className="w-full lg:w-1/2 flex flex-col pt-4">
        <div className="flex items-center gap-3 mb-4">
          {product.badge && (
            <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-600 text-white px-2.5 py-1 rounded-md shadow-sm">
              {product.badge}
            </span>
          )}
          {brand && (
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">{brand.name}</span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">{product.name}</h1>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(rating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-200 fill-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-slate-700">{rating}</span>
          <span className="text-sm text-slate-500 font-medium">({reviewsCount} reviews)</span>
        </div>

        <ProductDetail
          product={product}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
        />
      </div>
    </div>
  );
}
