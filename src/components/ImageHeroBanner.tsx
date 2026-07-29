import Image from 'next/image';
import Link from 'next/link';

/**
 * ImageHeroBanner — Full-width shopping banner image component.
 * Displays the KL Lanka Natural brand hero image at the top of the homepage.
 * Kapruka-style: edge-to-edge, responsive, priority-loaded.
 *
 * Mobile: aspect-ratio preserves the full image (center-focused on the phone + branding).
 * Desktop: capped at 560px height, image covers naturally.
 */
export default function ImageHeroBanner() {
  return (
    <section
      className="w-full relative overflow-hidden bg-[#f4f0e9]"
      aria-label="KL Lanka Natural — Natural Choices, Better Life"
    >
      {/* 
        Responsive container:
        - Mobile: uses aspect-[2/1] to preserve the full composition and prevent distortion.
        - Tablet/Desktop: overrides aspect ratio to use fixed heights matching premium e-commerce layouts.
      */}
      <div
        className="relative w-full aspect-[2/1] sm:aspect-auto sm:h-[360px] md:h-[420px] lg:h-[460px]"
      >
        <Image
          src="/hero-banner.png"
          alt="KL Lanka Natural — Natural Choices, Better Life. All-in-one shopping for Ayurvedic, vitamins, skincare, hair care, perfumes, fashion, and health products delivered across Sri Lanka."
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* 
          Bottom gradient on mobile to soften transition.
        */}
        <div
          className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-50/60 to-transparent pointer-events-none sm:hidden"
          aria-hidden="true"
        />
      </div>

      {/* 
        Transparent clickable overlay for accessibility + keyboard navigation.
        tabIndex=-1 so it is not in the tab order (the image's own CTA is already prominent).
        Screen readers get an explicit label for context.
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
