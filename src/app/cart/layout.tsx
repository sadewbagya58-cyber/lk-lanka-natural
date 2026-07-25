import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart | KL Lanka Natural',
  description: 'Manage your organic groceries, natural supplements, cosmetics, and perfumes in your shopping cart.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
