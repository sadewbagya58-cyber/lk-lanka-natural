import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | KL Lanka Natural',
  description: 'Complete your checkout and order placement securely at KL Lanka Natural.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
