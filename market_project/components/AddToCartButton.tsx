'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useCart, CartProduct } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { cartFavoritesText } from '@/lib/cartFavoritesTranslations';

type Props = {
  product: CartProduct;
  /** 'card' = compact icon+label pill for grid cards, 'detail' = full-width buttons for the modal/page */
  variant?: 'card' | 'detail';
  className?: string;
};

const cartIcon = (size: number) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
  </svg>
);

const checkIcon = (size: number) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const boltIcon = (size: number) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M13 2 3 14h7l-1 8 11-13h-7l1-7Z" />
  </svg>
);

export default function AddToCartButton({ product, variant = 'card', className = '' }: Props) {
  const { user } = useAuth();
  const { addToCart, buyNow, isInCart } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  const { lang } = useLanguage();
  const txt = cartFavoritesText(lang).addToCart;

  const inCart = isInCart(product.id);

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    await addToCart(product, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  async function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setBuying(true);
    await buyNow(product);
    setBuying(false);
  }

  if (variant === 'detail') {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <button
          type="button"
          onClick={handleAdd}
          className={`
            flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3
            font-medium text-sm tracking-wide border
            transition-all duration-200
            ${justAdded
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-white border-border-subtle text-text-primary hover:border-vip-border hover:text-vip-text'}
          `}
        >
          {justAdded ? checkIcon(18) : cartIcon(18)}
          {justAdded ? txt.added : inCart ? txt.addAgain : txt.add}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={buying}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3
                     font-medium text-sm tracking-wide text-[#1c1c1c]
                     bg-vip-border hover:brightness-95
                     transition-all duration-200 disabled:opacity-60"
        >
          {boltIcon(18)}
          {txt.buyNow}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={txt.ariaAdd}
      className={`
        flex items-center justify-center gap-1.5 rounded-full px-3 py-2
        text-xs font-medium tracking-wide
        border transition-all duration-200
        ${justAdded
          ? 'bg-emerald-600 border-emerald-600 text-white'
          : 'bg-white border-border-subtle text-text-primary hover:border-vip-border hover:text-vip-text'}
        ${className}
      `}
    >
      {justAdded ? checkIcon(15) : cartIcon(15)}
      <span>{justAdded ? txt.addedShort : txt.addShort}</span>
    </button>
  );
}