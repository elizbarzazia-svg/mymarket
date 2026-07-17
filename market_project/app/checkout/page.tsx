'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCart } from '@/lib/CartContext';

function CheckoutContent() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    revealedPhoneIds,
    revealPhone,
    totalPrice,
    totalCount,
  } = useCart();

  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
          გადახდის გვერდი
        </h1>
        <p className="text-text-muted mb-8">
          {totalCount > 0
            ? `${totalCount} ნივთი კალათაში`
            : 'კალათა ცარიელია'}
        </p>

        {items.length === 0 ? (
          <div className="bg-card-bg border border-border-subtle rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🛒</div>
            <p className="text-text-muted mb-6">
              ჯერ არაფერი დაგიმატებია კალათაში.
            </p>
            <Link
              href="/buyer"
              className="inline-block rounded-full px-6 py-3 bg-vip-border text-[#1c1c1c] font-medium hover:brightness-95 transition-all"
            >
              ნივთების დათვალიერება
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-8">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 bg-card-bg border border-border-subtle rounded-2xl p-4"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-card-hover shrink-0">
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
                      <p className="font-medium text-text-primary truncate">{product.name}</p>
                      <p className="text-emerald-600 font-semibold mt-0.5">
                        {product.price.toFixed(2)} ₾
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-border-subtle rounded-full px-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="შემცირება"
                          className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary"
                        >
                          –
                        </button>
                        <span className="text-sm w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label="გაზრდა"
                          className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary"
                        >
                          +
                        </button>
                      </div>

                      {product.phone && (
                        revealedPhoneIds.has(product.id) ? (
                          <a
                            href={`tel:${product.phone}`}
                            className="text-xs font-medium text-vip-text hover:underline"
                          >
                            📞 {product.phone}
                          </a>
                        ) : (
                          <button
                            onClick={() => revealPhone(product.id)}
                            className="text-xs font-medium text-vip-text hover:underline"
                          >
                            გამყიდველთან დაკავშირება
                          </button>
                        )
                      )}

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-xs text-text-muted hover:text-[#b3444c] transition-colors"
                      >
                        წაშლა
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card-bg border border-border-subtle rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-text-muted">ჯამი</span>
                <span className="text-2xl font-bold text-text-primary">
                  {totalPrice.toFixed(2)} ₾
                </span>
              </div>

              <button
                onClick={() => setShowPaymentNotice(true)}
                className="w-full rounded-xl py-3.5 bg-vip-border text-[#1c1c1c] font-semibold hover:brightness-95 transition-all"
              >
                გადახდის გაგრძელება
              </button>

              <p className="text-xs text-text-muted text-center mt-3">
                ონლაინ გადახდა ჯერ არ არის ჩართული — გამოიყენე „გამყიდველთან
                დაკავშირება" თითოეულ ნივთზე.
              </p>
            </div>
          </>
        )}
      </div>

      {showPaymentNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPaymentNotice(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-card-bg border border-border-subtle rounded-2xl p-8 text-center"
          >
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              გადახდა მალე ჩაირთვება
            </h3>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              ონლაინ ბარათით გადახდა ამჟამად ტესტ რეჟიმშია და ჯერ არ არის
              ხელმისაწვდომი. სანამ ეს ჩაირთვება, დაუკავშირდი გამყიდველს
              პირდაპირ — თითოეულ ნივთზე ნახავ „გამყიდველთან დაკავშირება"
              ღილაკს.
            </p>
            <button
              onClick={() => setShowPaymentNotice(false)}
              className="w-full rounded-xl py-3 bg-vip-border text-[#1c1c1c] font-medium hover:brightness-95 transition-all"
            >
              გასაგებია
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}