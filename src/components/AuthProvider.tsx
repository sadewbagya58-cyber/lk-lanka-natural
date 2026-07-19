'use client';

import { ReactNode } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useHostingerSync } from '@/hooks/useHostingerSync';

/**
 * Custom hook to mimic the signature of the previous useAuth hook,
 * preventing any breakage on existing pages.
 */
export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user ?? null,
    session,
    isLoading: status === 'loading',
  };
}

function SyncActivator() {
  // Syncs Zustand state with Hostinger MySQL DB upon login/logout
  useHostingerSync();
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SyncActivator />
      {children}
    </SessionProvider>
  );
}
