import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL('https://kllankanatural.com'),
  alternates: {
    canonical: '/',
  },
  title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
  description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast island-wide delivery in Sri Lanka.",
  keywords: [
    'natural products Sri Lanka',
    'Ayurvedic products Sri Lanka',
    'herbal products Sri Lanka',
    'organic products Sri Lanka',
    'vitamins supplements Sri Lanka',
    'health products Sri Lanka',
    'gemstones Sri Lanka',
    'fashion jewellery Sri Lanka',
    'custom portrait art',
    'online shopping Sri Lanka',
    'KL Lanka Natural',
    'natural cosmetics',
    'herbal supplements',
    'Ceylon products',
    'Sri Lankan marketplace',
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
    title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
    description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast island-wide delivery in Sri Lanka.",
    url: "https://kllankanatural.com",
    siteName: "KL Lanka Natural",
    images: [
      {
        url: "https://kllankanatural.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KL Lanka Natural (PVT) LTD — Premium Online Marketplace Sri Lanka",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
    description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast delivery in Sri Lanka.",
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
