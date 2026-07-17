'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useFavorites } from '@/lib/FavoritesContext';
import { useLanguage } from '@/lib/LanguageContext';
import { cartFavoritesText } from '@/lib/cartFavoritesTranslations';

type Props = {
  productId: string;
  /** 'card' = small overlay on a product card, 'detail' = larger with label in a modal/page */
  variant?: 'card' | 'detail';
  className?: string;
};

export default function FavoriteButton({
  productId,
  variant = 'card',
  className = '',
}: Props) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const [pulsing, setPulsing] = useState(false);

  const { lang } = useLanguage();
  const txt = cartFavoritesText(lang).favorites;

  const active = isFavorite(productId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setPulsing(true);
    await toggleFavorite(productId);
    window.setTimeout(() => setPulsing(false), 260);
  }

  const sizeClasses = variant === 'card' ? 'w-9 h-9' : 'w-11 h-11';
  const iconSize = variant === 'card' ? 18 : 22;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? txt.ariaRemove : txt.ariaAdd}
      className={`
        group relative flex items-center justify-center rounded-full
        ${sizeClasses}
        bg-white/90 backdrop-blur-sm shadow-[0_1px_4px_rgba(28,28,28,0.12)]
        border border-border-subtle
        transition-transform duration-150 ease-out
        hover:scale-110 hover:shadow-[0_2px_8px_rgba(28,28,28,0.18)]
        active:scale-95
        ${className}
      `}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? '#b3444c' : 'none'}
        stroke={active ? '#b3444c' : '#6b6b6b'}
        strokeWidth={1.8}
        className={`
          transition-transform duration-200 ease-out
          ${pulsing ? 'scale-125' : 'scale-100'}
          group-hover:stroke-[#b3444c]
        `}
      >
        <path
          d="M12 20.25c-.3 0-.6-.1-.83-.28C7.9 17.6 3 13.66 3 9.36 3 6.4 5.24 4 8 4c1.6 0 3.09.82 4 2.1C12.91 4.82 14.4 4 16 4c2.76 0 5 2.4 5 5.36 0 4.3-4.9 8.24-8.17 10.6-.23.19-.53.29-.83.29Z"
        />
      </svg>
    </button>
  );
}