import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account | KL Lanka Natural',
  description: 'Manage your profile settings, view past orders, track deliveries, and edit shipping addresses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
