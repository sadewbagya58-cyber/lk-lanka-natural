import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import AdminClientLayout from './AdminClientLayout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminClientLayout>{children}</AdminClientLayout>;
}
