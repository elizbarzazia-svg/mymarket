'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useFavorites } from '@/lib/FavoritesContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import FavoriteButton from '@/components/FavoriteButton';
import AddToCartButton from '@/components/AddToCartButton';
import { useLanguage } from '@/lib/LanguageContext';
import { cartFavoritesText } from '@/lib/cartFavoritesTranslations';

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_vip: boolean;
  phone: string | null;
  user_id: string;
};

function FavoritesContent() {
  const { user } = useAuth();
  const { favoriteIds, loading: favoritesLoading } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { lang } = useLanguage();
  const txt = cartFavoritesText(lang).favorites;

  useEffect(() => {
    async function loadProducts() {
      if (favoritesLoading) return;

      const ids = Array.from(favoriteIds);
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }

    loadProducts();
  }, [favoriteIds, favoritesLoading]);

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text-primary">
            {txt.pageTitle}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {txt.pageSubtitle}
          </p>
        </div>

        {loading || favoritesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-card-bg border border-border-subtle aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-4 py-24">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e8e3d8" strokeWidth={1.5}>
              <path d="M12 20.25c-.3 0-.6-.1-.83-.28C7.9 17.6 3 13.66 3 9.36 3 6.4 5.24 4 8 4c1.6 0 3.09.82 4 2.1C12.91 4.82 14.4 4 16 4c2.76 0 5 2.4 5 5.36 0 4.3-4.9 8.24-8.17 10.6-.23.19-.53.29-.83.29Z" />
            </svg>
            <p className="text-text-muted max-w-sm">
              {txt.emptyText}
            </p>
            <Link
              href="/buyer"
              className="mt-2 rounded-full px-5 py-2.5 bg-[#1c1c1c] text-white text-sm font-medium hover:bg-[#1c1c1c]/90 transition-colors"
            >
              {txt.browseCta}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-card-bg border border-border-subtle overflow-hidden hover:shadow-[0_4px_16px_rgba(28,28,28,0.08)] transition-shadow duration-200"
              >
                <Link href={`/buyer?product=${product.id}`} className="block">
                  <div className="relative aspect-square bg-card-hover">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                    )}
                    {product.is_vip && (
                      <span className="absolute top-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold bg-vip-border text-[#1c1c1c]">
                        VIP
                      </span>
                    )}
                  </div>
                </Link>

                <div className="absolute top-2 right-2">
                  <FavoriteButton productId={product.id} variant="card" />
                </div>

                <div className="p-3">
                  <Link href={`/buyer?product=${product.id}`}>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {product.name}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-emerald-600 font-semibold text-sm">
                      {product.price.toFixed(2)} ₾
                    </span>
                    <AddToCartButton
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image_url: product.image_url,
                        phone: product.phone,
                        user_id: product.user_id,
                      }}
                      variant="card"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}