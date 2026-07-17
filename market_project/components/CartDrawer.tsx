'use client';

import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { cartFavoritesText } from '@/lib/cartFavoritesTranslations';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    revealedPhoneIds,
    revealPhone,
    totalPrice,
    totalCount,
  } = useCart();

  // `lang` comes from your LanguageContext (same one that drives the EN/KA
  // switcher in the header).
  const { lang } = useLanguage();
  const txt = cartFavoritesText(lang).cart;

  return (
    <>
      {/* backdrop */}
      <div
        onClick={closeCart}
        className={`
          fixed inset-0 z-40 bg-black/30 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* panel */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-full sm:w-[420px]
          bg-brand-bg shadow-[-8px_0_30px_rgba(28,28,28,0.12)]
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-hidden={!isOpen}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary">
            {txt.title} {totalCount > 0 && <span className="text-text-muted font-normal">({totalCount})</span>}
          </h2>
          <button
            onClick={closeCart}
            aria-label={txt.close}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-card-hover transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" strokeWidth={1.8}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8e3d8" strokeWidth={1.5}>
                <circle cx="9" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
              </svg>
              <p className="text-text-muted text-sm whitespace-pre-line">
                {txt.empty}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 bg-card-bg rounded-2xl border border-border-subtle p-3"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-card-hover shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary truncate">
                        {product.name}
                      </p>
                      <p className="text-emerald-600 font-semibold text-sm mt-0.5">
                        {product.price.toFixed(2)} ₾
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* quantity stepper */}
                      <div className="flex items-center gap-2 border border-border-subtle rounded-full px-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label={txt.decrease}
                          className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary"
                        >
                          –
                        </button>
                        <span className="text-xs w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label={txt.increase}
                          className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        aria-label={txt.remove}
                        className="text-xs text-text-muted hover:text-[#b3444c] transition-colors"
                      >
                        {txt.remove}
                      </button>
                    </div>

                    {/* contact seller — no real checkout exists yet, so this mirrors
                        the buyer-page "show number" pattern instead of a fake pay button.
                        Also auto-revealed by the "Buy now" button in the detail view. */}
                    {product.phone && (
                      revealedPhoneIds.has(product.id) ? (
                        <a
                          href={`tel:${product.phone}`}
                          className="mt-2 text-xs font-medium text-vip-text hover:underline"
                        >
                          📞 {product.phone}
                        </a>
                      ) : (
                        <button
                          onClick={() => revealPhone(product.id)}
                          className="mt-2 text-xs font-medium text-vip-text hover:underline text-left"
                        >
                          {txt.contactSeller}
                        </button>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-border-subtle bg-card-bg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted">{txt.total}</span>
              <span className="text-lg font-semibold text-text-primary">
                {totalPrice.toFixed(2)} ₾
              </span>
            </div>
            <p className="text-[11px] text-text-muted mb-3 leading-snug">
              {txt.noCheckoutNote}
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center rounded-xl py-3 bg-[#1c1c1c] text-white text-sm font-medium hover:bg-[#1c1c1c]/90 transition-colors"
            >
              გადახდის გაგრძელება
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}