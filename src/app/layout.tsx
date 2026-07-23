import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
  description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast island-wide delivery in Sri Lanka.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
    description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast island-wide delivery in Sri Lanka.",
    url: "https://kllankanatural.com",
    siteName: "KL Lanka Natural",
    images: [
      {
        url: "https://kllankanatural.com/logo.png",
        width: 1000,
        height: 1000,
        alt: "KL Lanka Natural (PVT) LTD Logo",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KL Lanka Natural | Premium Online Marketplace Sri Lanka",
    description: "Shop premium natural products, groceries, cosmetics, health supplements, and exquisite perfumes at KL Lanka Natural (PVT) LTD. Fast delivery in Sri Lanka.",
    images: ["https://kllankanatural.com/logo.png"],
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
