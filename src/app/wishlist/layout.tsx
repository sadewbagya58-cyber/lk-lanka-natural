import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist | KL Lanka Natural',
  description: 'View and manage your saved products in your wishlist at KL Lanka Natural.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
