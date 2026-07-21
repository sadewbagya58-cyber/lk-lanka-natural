import Navbar from "@/components/Navbar";
import QuickCategories from "@/components/QuickCategories";
import ProductGrid from "@/components/ProductGrid";
import FlashDeals from "@/components/FlashDeals";
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

      {/* Header */}
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Quick Category Bar */}
        <QuickCategories />

        {/* Primary Product Collection Section (All Products Default View) */}
        <ProductGrid />

        {/* Flash Deals Section */}
        <FlashDeals />

        {/* Authorized Brand Showcase */}
        <BrandShowcase />

        {/* Promotional Campaign Banner */}
        <PromotionalBanner />

        {/* Customer Reviews & Star Ratings */}
        <CustomerReviews />

        {/* Newsletter & Value Badges */}
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Global WhatsApp Widget */}
      <WhatsAppWidget />
    </div>
  );
}
