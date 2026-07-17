'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-border-subtle border-t-vip-border rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}