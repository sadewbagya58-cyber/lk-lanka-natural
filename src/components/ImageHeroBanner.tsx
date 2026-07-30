import Image from 'next/image';
import Link from 'next/link';

/**
 * ImageHeroBanner — Full-width responsive shopping hero banner image component.
 * Displays the official KL Lanka Natural hero banner at the top of the homepage.
 * 
 * Mobile: Preserves exact 1862x845 (~2.2:1) aspect ratio so logo, text, products, and phone numbers remain 100% visible without cropping or zooming.
 * Desktop: Uses controlled heights (340px-480px) matching Kapruka-style e-commerce marketplace layouts, keeping the banner full-width while allowing categories below to be visible.
 */
export default function ImageHeroBanner() {
  return (
    <section
      className="w-full relative overflow-hidden bg-[#f4f0e9]"
      aria-label="KL Lanka Natural — Multi-Category Online Marketplace"
    >
      {/* 
        Responsive container:
        - Mobile: uses aspect-[1862/845] to preserve the exact natural image composition and prevent any distortion or cropping of branding elements.
        - Tablet/Desktop: uses controlled fixed heights matching Kapruka-style e-commerce marketplace layouts.
      */}
      <div
        className="relative w-full aspect-[1862/845] sm:aspect-auto sm:h-[340px] md:h-[400px] lg:h-[440px] xl:h-[480px]"
      >
        <Image
          src="/hero-banner.png"
          alt="KL Lanka Natural — Multi-Category Online Marketplace. Shop supplements, hardware, electronics, food, jewellery, fancy items, stationery, and other general products. Fast delivery to Sri Lanka, Europe, and worldwide."
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* 
          Bottom gradient on mobile to soften transition to content below.
        */}
        <div
          className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-50/50 to-transparent pointer-events-none sm:hidden"
          aria-hidden="true"
        />
      </div>

      {/* 
        Transparent clickable overlay for accessibility + quick navigation.
      */}
      <Link
        href="/products"
        className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 focus-visible:ring-inset"
        aria-label="Browse all products at KL Lanka Natural"
        tabIndex={-1}
      />
    </section>
  );
}
