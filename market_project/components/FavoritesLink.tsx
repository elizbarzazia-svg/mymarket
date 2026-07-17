'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavorites } from '@/lib/FavoritesContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function FavoritesLink() {
  const pathname = usePathname();
  const { favoritesCount } = useFavorites();
  const { t } = useLanguage();
  const active = pathname === '/favorites';

  return (
    <Link
      href="/favorites"
      aria-label={t('auth.myFavorites')}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-150 ${
        active ? 'bg-card-hover' : 'hover:bg-card-hover'
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={active ? '#b3444c' : 'none'}
        stroke={active ? '#b3444c' : '#1c1c1c'}
        strokeWidth={1.8}
      >
        <path d="M12 20.25c-.3 0-.6-.1-.83-.28C7.9 17.6 3 13.66 3 9.36 3 6.4 5.24 4 8 4c1.6 0 3.09.82 4 2.1C12.91 4.82 14.4 4 16 4c2.76 0 5 2.4 5 5.36 0 4.3-4.9 8.24-8.17 10.6-.23.19-.53.29-.83.29Z" />
      </svg>
      {favoritesCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center
                     min-w-[18px] h-[18px] px-1 rounded-full
                     bg-vip-border text-[10px] font-semibold text-[#1c1c1c]
                     shadow-[0_0_0_2px_white]"
        >
          {favoritesCount > 99 ? '99+' : favoritesCount}
        </span>
      )}
    </Link>
  );
}