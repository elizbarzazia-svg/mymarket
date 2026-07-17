'use client';

import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { cartFavoritesText } from '@/lib/cartFavoritesTranslations';

export default function CartButton() {
  const { totalCount, openCart } = useCart();
  const { lang } = useLanguage();
  const txt = cartFavoritesText(lang).cart;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={txt.ariaLabel}
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-card-hover transition-colors duration-150"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" strokeWidth={1.8}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
      </svg>
      {totalCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center
                     min-w-[18px] h-[18px] px-1 rounded-full
                     bg-vip-border text-[10px] font-semibold text-[#1c1c1c]
                     shadow-[0_0_0_2px_white]"
        >
          {totalCount > 99 ? '99+' : totalCount}
        </span>
      )}
    </button>
  );
}