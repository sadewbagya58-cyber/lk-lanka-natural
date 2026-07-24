'use client';

import { useState } from 'react';
import Image from 'next/image';
import ProductIllustration from './ProductIllustration';

interface ItemImageProps {
  src?: string | null;
  alt: string;
  gradient?: string | null;
  visualSeed?: string | null;
  className?: string;
  iconClassName?: string;
}

export default function ItemImage({
  src,
  alt,
  gradient = 'from-slate-100 to-slate-200',
  visualSeed = 'leaf',
  className = 'w-16 h-16',
  iconClassName = 'w-9 h-9',
}: ItemImageProps) {
  const [imageError, setImageError] = useState(false);

  const showImg = Boolean(src && !imageError);

  return (
    <div className={`relative rounded-xl bg-white border border-slate-150 overflow-hidden flex items-center justify-center shrink-0 ${className}`}>
      {showImg ? (
        <Image
          src={src!}
          alt={alt}
          fill
          className="object-cover p-0.5"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <>
          <div className={`absolute inset-0 bg-gradient-to-tr ${gradient || 'from-slate-100 to-slate-200'} opacity-15`} />
          <ProductIllustration type={visualSeed || 'leaf'} className={`${iconClassName} text-slate-700/60`} />
        </>
      )}
    </div>
  );
}
