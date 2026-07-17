'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { supabase } from '../../lib/supabaseClient';
import { isVipActive } from '../../lib/vip';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [listingCount, setListingCount] = useState<number | null>(null);
  const [vipCount, setVipCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('is_vip, vip_expires_at')
        .eq('user_id', user.id);

      if (!error && data) {
        setListingCount(data.length);
        setVipCount(data.filter((p) => isVipActive(p as any)).length);
      }
    };
    fetchStats();
  }, [user]);

  if (!user) return null;

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initials = name
    .split(' ')
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
        year: 'numeric',
        month: 'long',
      })
    : '';

  return (
    <div className="bg-brand-bg min-h-screen text-text-primary">
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <div className="bg-card-bg border border-border-subtle rounded-2xl p-8 text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-vip-border/15 border-2 border-vip-border/50 flex items-center justify-center text-vip-text text-2xl font-bold">
            {initials}
          </div>
          <h1 className="text-2xl font-bold mb-1">{name}</h1>
          <p className="text-text-muted text-sm mb-1">{user.email}</p>
          {memberSince && (
            <p className="text-text-muted text-xs">
              {t('profile.memberSince')} {memberSince}
            </p>
          )}

          <Link
            href="/settings"
            className="inline-block mt-6 bg-vip-border text-black font-semibold rounded-lg px-6 py-2.5 text-sm hover:opacity-90 transition-opacity"
          >
            {t('profile.editProfile')}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-text-primary mb-1">
              {listingCount === null ? '—' : listingCount}
            </p>
            <p className="text-text-muted text-sm">{t('profile.listings')}</p>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-vip-text mb-1">
              {vipCount === null ? '—' : vipCount}
            </p>
            <p className="text-text-muted text-sm">{t('profile.activeVip')}</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="block w-full text-center border border-border-subtle hover:border-vip-border/50 rounded-lg py-3 text-sm font-medium transition-colors"
        >
          {t('profile.viewDashboard')}
        </Link>
      </div>
    </div>
  );
}