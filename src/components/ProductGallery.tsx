'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import ProductIllustration from './ProductIllustration';

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
  gradient: string;
  visualSeed: string;
}

export default function ProductGallery({
  images = [],
  name,
  gradient,
  visualSeed,
}: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Find index of the primary image, default to 0
  const primaryIdx = sortedImages.findIndex((img) => img.isPrimary);
  const initialIndex = primaryIdx !== -1 ? primaryIdx : 0;
  
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  if (sortedImages.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
        <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-20`} />
        <div className="w-2/3 h-2/3 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
          <ProductIllustration type={visualSeed} className="w-full h-full text-slate-700/70" />
        </div>
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
      </div>
    );
  }

  const activeImage = sortedImages[activeIndex] || sortedImages[0];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Large Main Image Display Box */}
      <div className="relative aspect-square w-full rounded-3xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shadow-sm group">
        <Image
          src={activeImage.url}
          alt={`${name} - Image ${activeIndex + 1}`}
          fill
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
          onClick={() => setLightboxOpen(true)}
          unoptimized
        />

        {/* Floating Actions overlay */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-700 hover:text-emerald-600 rounded-xl border border-slate-100/50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          title="Fullscreen view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Gallery Navigation Overlay Arrows (only if more than 1 image) */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/5 hover:bg-black/20 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-slate-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/5 hover:bg-black/20 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-slate-800" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row (only if more than 1 image) */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {sortedImages.map((img, idx) => (
            <button
              key={img.id || img.url || idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border-2 transition-all shrink-0 snap-start ${
                activeIndex === idx
                  ? 'border-emerald-600 ring-2 ring-emerald-500/10 shadow-sm'
                  : 'border-slate-100 hover:border-slate-350'
              }`}
            >
              <Image
                src={img.url}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Overlay Viewer */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-slate-950/95 z-55 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white hover:text-rose-450 rounded-2xl transition-all focus:outline-none border border-white/15"
            title="Close view"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Image Container */}
          <div className="relative w-full max-w-4xl aspect-square md:aspect-[4/3] flex items-center justify-center select-none">
            <Image
              src={activeImage.url}
              alt={`${name} full`}
              fill
              className="object-contain"
              unoptimized
            />

            {/* Left arrow */}
            {sortedImages.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none border border-white/15"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right arrow */}
            {sortedImages.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none border border-white/15"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Image index badge */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 border border-white/15 px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest">
            {activeIndex + 1} / {sortedImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
