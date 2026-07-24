'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useHostingerSync } from '@/hooks/useHostingerSync';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
}

interface Session {
  user: User;
}

interface SessionContextType {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  refetch: (data?: unknown) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

let globalRefetchSession: (data?: unknown) => Promise<void> = async () => {};

function SyncActivator() {
  // Syncs Zustand state with Hostinger MySQL DB upon login/logout
  useHostingerSync();
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const refetch = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
          setStatus('authenticated');
        } else {
          setSession(null);
          setStatus('unauthenticated');
        }
      } else if (res.status === 401) {
        setSession(null);
        setStatus('unauthenticated');
      } else {
        // If server returns non-401 error (e.g. 500), retain current session state if logged in
        setStatus((prevStatus) => (prevStatus === 'loading' ? 'unauthenticated' : prevStatus));
      }
    } catch (err) {
      console.warn('Session check network warning:', err);
      // Retain current session on network failure unless on initial page load
      setStatus((prevStatus) => (prevStatus === 'loading' ? 'unauthenticated' : prevStatus));
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      await refetch();
    };
    loadSession();
  }, []);

  useEffect(() => {
    globalRefetchSession = async () => {
      await refetch();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, status, refetch }}>
      <SyncActivator />
      {children}
    </SessionContext.Provider>
  );
}

// Rename wrapper function to match AuthProvider name expected by root layout
export const AuthProvider = SessionProvider;

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return {
    data: context.session,
    status: context.status,
    update: context.refetch,
  };
}

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user ?? null,
    session,
    isLoading: status === 'loading',
  };
}

export async function signIn(
  provider: string,
  options?: {
    email?: string;
    password?: string;
    redirect?: boolean;
    callbackUrl?: string;
  }
) {
  if (provider === 'google') {
    window.location.href = '/api/auth/google';
    return { ok: true, error: null, status: 200 };
  }

  if (provider === 'credentials') {
    const { email, password } = options || {};
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Invalid credentials', ok: false, status: res.status };
      }
      await globalRefetchSession();
      return { ok: true, error: null, status: 200 };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred', ok: false, status: 500 };
    }
  }
  return { error: 'Unsupported provider', ok: false, status: 400 };
}

export async function signOut(options?: { callbackUrl?: string }) {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error:', err);
  }
  await globalRefetchSession();
  if (options?.callbackUrl) {
    window.location.href = options.callbackUrl;
  }
}
