import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import QuickCategories from "@/components/QuickCategories";
import FlashDeals from "@/components/FlashDeals";
import ProductGrid from "@/components/ProductGrid";
import BrandShowcase from "@/components/BrandShowcase";
import PromotionalBanner from "@/components/PromotionalBanner";
import CustomerReviews from "@/components/CustomerReviews";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function Home() {
  // JSON-LD structured data for Google Search SEO ranking
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "KL Lanka Natural (PVT) LTD",
    "description": "Premium Sri Lankan online marketplace selling organic foods, groceries, cosmetics, perfumes, baby care, and natural health products.",
    "url": "https://kllankanatural.lk",
    "telephone": "+94112345678",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "No. 124, Galle Road",
      "addressLocality": "Colombo 03",
      "addressCountry": "LK"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://facebook.com/kllankanatural",
      "https://instagram.com/kllankanatural",
      "https://linkedin.com/company/kllankanatural"
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      {/* JSON-LD Schema Inject */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Header (Double-Decker Layout + Integrated 2. Search) */}
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* 3. Quick Categories */}
        <QuickCategories />

        {/* 4. Hero Section (Categories Left, Banner Center, Side Offers Right) */}
        <HeroBanner />

        {/* 5. Flash Deals (Dynamic Countdown + Progress Bar + Slider) */}
        <FlashDeals />

        {/* 6. Featured Products / 7. Best Sellers / 8. New Arrivals (Integrated Filter Grid) */}
        <ProductGrid />

        {/* 9. Brand Showcase (Authorized Brands scrolling panel) */}
        <BrandShowcase />

        {/* 10. Promotional Banner Campaign Billboard */}
        <PromotionalBanner />

        {/* 11. Customer Reviews Star-Ratings */}
        <CustomerReviews />

        {/* 12. Newsletter Value Badges */}
        <Newsletter />
      </main>

      {/* 13. Footer payment security block */}
      <Footer />

      {/* Floating Global WhatsApp Widget */}
      <WhatsAppWidget />
    </div>
  );
}
