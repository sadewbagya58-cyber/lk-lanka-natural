import Navbar from "@/components/Navbar";
import ImageHeroBanner from "@/components/ImageHeroBanner";
import QuickCategories from "@/components/QuickCategories";
import ProductGrid from "@/components/ProductGrid";
import FlashDeals from "@/components/FlashDeals";
import BrandShowcase from "@/components/BrandShowcase";
import PromotionalBanner from "@/components/PromotionalBanner";
import CustomerReviews from "@/components/CustomerReviews";
import Footer from "@/components/Footer";


export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KL Lanka Natural (PVT) LTD",
    "url": "https://kllankanatural.com",
    // logo should be the primary square brand logo (schema.org recommendation)
    "logo": "https://kllankanatural.com/logo.png",
    "image": "https://kllankanatural.com/og-image.jpg",
    "email": "kllankanatural@gmail.com",
    "sameAs": [
      "https://facebook.com/kllankanatural",
      "https://instagram.com/kllankanatural",
      "https://linkedin.com/company/kllankanatural"
    ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://kllankanatural.com",
    "name": "KL Lanka Natural",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://kllankanatural.com/products?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "KL Lanka Natural (PVT) LTD",
    "description": "Premium Sri Lankan online marketplace selling organic foods, groceries, cosmetics, perfumes, baby care, and natural health products.",
    "url": "https://kllankanatural.com",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />

      {/* Header */}
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* Hero Banner — Full-width brand image, Kapruka-style */}
        <ImageHeroBanner />

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
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
