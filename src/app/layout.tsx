import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
  description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast island-wide delivery in Sri Lanka.",
  openGraph: {
    title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
    description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast island-wide delivery in Sri Lanka.",
    url: "https://kllankanatural.lk",
    siteName: "KL Lanka Natural",
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
    description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast delivery in Sri Lanka.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {/* AuthProvider bootstraps the NextAuth session and syncs cart/wishlist to Hostinger MySQL */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
