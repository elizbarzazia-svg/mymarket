'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { isVipActive } from '@/lib/vip';
import FavoriteButton from '@/components/FavoriteButton';
import AddToCartButton from '@/components/AddToCartButton';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_vip: boolean;
  image_url?: string | null;
  vip_expires_at?: string | null;
  phone?: string | null;
  user_id: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* ---------- HERO ---------- */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-text-primary">
          ყველაფერი, რასაც ეძებ,
          <br />
          <span className="text-vip-text">ერთ სივრცეში</span>.
        </h1>

        <p className="mt-6 text-text-muted text-base sm:text-lg max-w-xl mx-auto">
          იპოვე რაც გსურს ან გაყიდე რაც არ გჭირდება — მარტივად, სწრაფად და
          დაცულად.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/buyer"
            className="rounded-full px-7 py-3 bg-vip-border text-[#1c1c1c] font-medium hover:brightness-95 transition-all"
          >
            ყიდვის დაწყება
          </Link>
          <Link
            href="/seller"
            className="rounded-full px-7 py-3 border border-border-subtle bg-white text-text-primary font-medium hover:border-vip-border hover:text-vip-text transition-all"
          >
            გაყიდვის დაწყება
          </Link>
        </div>
      </section>

      {/* ---------- LATEST ITEMS ---------- */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-text-primary">
            უახლესი ნივთები
          </h2>
          <Link
            href="/buyer"
            className="text-sm font-medium text-vip-text hover:underline"
          >
            ყველას ნახვა →
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[220px] aspect-[3/4] rounded-2xl bg-card-bg border border-border-subtle animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-text-muted text-sm">
            ჯერ არცერთი ნივთი არ დამატებულა.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative shrink-0 w-[220px] snap-start rounded-2xl bg-card-bg border border-border-subtle overflow-hidden hover:shadow-[0_4px_16px_rgba(28,28,28,0.08)] transition-shadow duration-200"
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
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🛍️
                      </div>
                    )}
                    {product.is_vip && isVipActive(product) && (
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
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {product.description}
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
                        image_url: product.image_url ?? null,
                        phone: product.phone ?? null,
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
      </section>

      {/* ---------- VIP PROMO BANNER ---------- */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-vip-border bg-gradient-to-r from-[#fff9ec] to-brand-bg px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-vip-text mb-1">
              VIP სტატუსი
            </p>
            <h3 className="text-2xl font-semibold text-text-primary">
              გახდი VIP გამყიდველი
            </h3>
            <p className="text-text-muted mt-2 max-w-md">
              მოაქციე შენი განცხადება ყურადღების ცენტრში — VIP ნივთები ჩნდება
              პირველ ადგილას და უფრო მეტ მყიდველს იზიდავს.
            </p>
          </div>
          <Link
            href="/seller"
            className="shrink-0 rounded-full px-7 py-3 bg-vip-border text-[#1c1c1c] font-medium hover:brightness-95 transition-all whitespace-nowrap"
          >
            VIP-ის შეძენა
          </Link>
        </div>
      </section>

      {/* ---------- TRUST BADGES ---------- */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-card-bg border border-border-subtle p-6 text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="font-semibold text-text-primary mb-1">
              დაცული გარიგებები
            </h4>
            <p className="text-sm text-text-muted">
              ყოველი განცხადება ცხადად ჩანს, ისე რომ იცოდე ვისთან საქმე გაქვს.
            </p>
          </div>

          <div className="rounded-2xl bg-card-bg border border-border-subtle p-6 text-center">
            <div className="text-3xl mb-3">📞</div>
            <h4 className="font-semibold text-text-primary mb-1">
              პირდაპირი კონტაქტი
            </h4>
            <p className="text-sm text-text-muted">
              დაუკავშირდი გამყიდველს პირდაპირ, შუამავლების და ლოდინის გარეშე.
            </p>
          </div>

          <div className="rounded-2xl bg-card-bg border border-border-subtle p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-semibold text-text-primary mb-1">
              სწრაფი და მარტივი
            </h4>
            <p className="text-sm text-text-muted">
              იპოვე რაც გინდა წუთებში, ან გაყიდე შენი ნივთი რამდენიმე ნაბიჯში.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}