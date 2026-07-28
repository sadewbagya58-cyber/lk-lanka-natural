import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const redirectParam = typeof params.redirect === 'string' ? params.redirect : '';
  const query = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : '';
  redirect(`/signup${query}`);
}
