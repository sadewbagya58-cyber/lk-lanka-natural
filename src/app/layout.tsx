import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL('https://kllankanatural.com'),
  alternates: {
    canonical: '/',
  },
  title: "KL Lanka Natural | Multi-Category Online Marketplace",
  description: "KL Lanka Natural is a leading multi-category online marketplace offering supplements, hardware, electronics, food, jewellery, fancy items, stationery, and other general products. Shipping to Sri Lanka, Europe, and worldwide.",
  keywords: [
    'online marketplace Sri Lanka',
    'multi-category marketplace',
    'supplements Sri Lanka',
    'hardware online shop',
    'electronics store Sri Lanka',
    'organic food online',
    'fashion jewellery Sri Lanka',
    'fancy items shop',
    'stationery marketplace',
    'international delivery Sri Lanka',
    'Europe shipping Sri Lanka',
    'KL Lanka Natural',
    'custom portrait art',
    'online shopping Sri Lanka',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Next.js App Router auto-discovers favicon.ico, icon.png, and apple-icon.png from src/app/
  // No manual icons config needed — it would conflict with auto-discovery

  openGraph: {
    title: "KL Lanka Natural | Multi-Category Online Marketplace",
    description: "KL Lanka Natural is a leading multi-category online marketplace offering supplements, hardware, electronics, food, jewellery, fancy items, stationery, and other general products. Shipping to Sri Lanka, Europe, and worldwide.",
    url: "https://kllankanatural.com",
    siteName: "KL Lanka Natural",
    images: [
      {
        url: "https://kllankanatural.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KL Lanka Natural — Multi-Category Online Marketplace",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KL Lanka Natural | Multi-Category Online Marketplace",
    description: "KL Lanka Natural is a leading multi-category online marketplace offering supplements, hardware, electronics, food, jewellery, fancy items, stationery, and other general products. Shipping to Sri Lanka, Europe, and worldwide.",
    images: ["https://kllankanatural.com/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full w-full overflow-x-hidden flex flex-col bg-slate-50 text-slate-900">
        {/* AuthProvider bootstraps the NextAuth session and syncs cart/wishlist to Hostinger MySQL */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
