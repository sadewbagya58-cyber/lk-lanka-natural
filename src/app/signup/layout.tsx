import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register Account | KL Lanka Natural',
  description: 'Create a new account at KL Lanka Natural to manage purchases, addresses, and wishlist.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
