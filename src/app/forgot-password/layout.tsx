import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | KL Lanka Natural',
  description: 'Recover your forgotten customer account password at KL Lanka Natural.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
