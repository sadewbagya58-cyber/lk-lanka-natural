import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | KL Lanka Natural',
  description: 'Log in to your customer account to track orders, manage addresses, and update details.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
