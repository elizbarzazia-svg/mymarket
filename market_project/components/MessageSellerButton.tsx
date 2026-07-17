'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  productId: string;
  sellerId?: string | null;
  className?: string;
};

const messageIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
  </svg>
);

export default function MessageSellerButton({ productId, sellerId, className = '' }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Can't message yourself about your own listing.
  if (!sellerId || (user && user.id === sellerId)) return null;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // Does a conversation already exist for this product + buyer + seller?
      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (findError) throw findError;

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: created, error: insertError } = await supabase
          .from('conversations')
          .insert({ product_id: productId, buyer_id: user.id, seller_id: sellerId })
          .select('id')
          .single();

        if (insertError) throw insertError;
        conversationId = created.id;
      }

      router.push(`/messages?c=${conversationId}`);
    } catch (err: any) {
      alert('საუბრის დაწყება ვერ მოხერხდა: ' + (err?.message ?? 'უცნობი შეცდომა'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3
                  font-medium text-sm tracking-wide border
                  border-border-subtle text-text-primary
                  hover:border-vip-border/50 hover:text-vip-text
                  transition-all duration-200 disabled:opacity-60
                  ${className}`}
    >
      {messageIcon}
      {loading ? 'იტვირთება...' : 'შეტყობინების გაგზავნა'}
    </button>
  );
}