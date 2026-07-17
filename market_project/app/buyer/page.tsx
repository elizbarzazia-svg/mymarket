'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { isVipActive } from '../../lib/vip';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import FavoriteButton from '../../components/FavoriteButton';
import AddToCartButton from '../../components/AddToCartButton';
import MessageSellerButton from '../../components/MessageSellerButton';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_vip: boolean;
  image_url?: string | null;
  phone?: string | null;
  category?: string | null;
  vip_expires_at?: string | null;
  created_at?: string;
  user_id?: string;
  views?: number;
};

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'vip_first';

const PAGE_SIZE = 9;

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function BuyerPage() {
  return (
    <Suspense fallback={null}>
      <BuyerPageContent />
    </Suspense>
  );
}

function BuyerPageContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  const SORT_LABELS: Record<SortOption, string> = {
    newest: t('buyer.sortNewest'),
    price_asc: t('buyer.sortPriceAsc'),
    price_desc: t('buyer.sortPriceDesc'),
    vip_first: t('buyer.sortVipFirst'),
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviews, setReviews] = useState<{ id: number; rating: number; comment: string | null; created_at: string; reviewer_id: string }[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        setProducts(data as Product[]);

        const productParam = searchParams.get('product');
        if (productParam) {
          const match = (data as Product[]).find((p) => String(p.id) === productParam);
          if (match) setSelected(match);
        }
      }
      setLoading(false);
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [selected]);

  useEffect(() => {
    setPhoneRevealed(false);
    setGalleryIndex(0);
    setShareCopied(false);
    setReportOpen(false);
    setReportReason('');
    setReportDetails('');
    setReportSubmitted(false);
    setReviewRating(0);
    setReviewComment('');

    if (!selected) {
      setGalleryImages([]);
      setReviews([]);
      return;
    }

    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, reviewer_id')
      .eq('product_id', selected.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReviews(data);
      });

    // Fire-and-forget view counter — never blocks the UI, never surfaces errors.
    supabase.rpc('increment_product_views', { product_id: selected.id }).then();

    const base = selected.image_url ? [selected.image_url] : [];
    setGalleryImages(base); // show the cover immediately, then extend once extras load

    let cancelled = false;
    supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', selected.id)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setGalleryImages([...base, ...data.map((row) => row.image_url)]);
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sort]);

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'vip_first':
        // already handled by the VIP-first pass below; no extra criteria needed
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );
    }

    // Always float active VIP listings to the top, regardless of sort mode —
    // Array.sort is stable in modern JS, so this preserves the ordering
    // already applied above within each group (VIP vs non-VIP).
    return list.sort((a, b) => Number(isVipActive(b)) - Number(isVipActive(a)));
  }, [products, sort, searchQuery, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / PAGE_SIZE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedProducts.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedProducts, currentPage]);

  const handleReviewSubmit = async () => {
    if (!selected || !user || reviewRating === 0) return;
    setReviewSubmitting(true);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: selected.id,
        reviewer_id: user.id,
        seller_id: selected.user_id,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      })
      .select('id, rating, comment, created_at, reviewer_id')
      .single();
    setReviewSubmitting(false);

    if (error) {
      alert('მიმოხილვის დამატება ვერ მოხერხდა: ' + error.message);
      return;
    }
    if (data) {
      setReviews((prev) => [data, ...prev]);
      setReviewRating(0);
      setReviewComment('');
    }
  };

  const handleReportSubmit = async () => {
    if (!selected || !reportReason || !user) return;
    setReportSubmitting(true);
    const { error } = await supabase.from('reports').insert({
      product_id: selected.id,
      reporter_id: user.id,
      reason: reportReason,
      details: reportDetails.trim() || null,
    });
    setReportSubmitting(false);
    if (!error) {
      setReportSubmitted(true);
      setReportReason('');
      setReportDetails('');
    } else {
      alert('დარეპორტება ვერ მოხერხდა: ' + error.message);
    }
  };

  const clearFilter = (key: 'search' | 'category') => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(params.toString() ? `/buyer?${params.toString()}` : '/buyer');
  };

  const hasActiveFilters = Boolean(searchQuery || categoryFilter);

  return (
    <div className="bg-brand-bg min-h-screen text-text-primary">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{t('buyer.title')}</h1>
            <p className="text-text-muted mt-2">
              {loading
                ? t('buyer.loading')
                : `${filteredAndSortedProducts.length} ${t('buyer.itemsAvailableSuffix')}`}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between bg-card-bg border border-border-subtle hover:border-vip-border/60 rounded-lg px-4 py-3 text-sm transition-colors"
            >
              <span>{SORT_LABELS[sort]}</span>
              <svg
                className={`w-4 h-4 text-text-muted transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute z-20 mt-2 w-full bg-card-bg border border-border-subtle rounded-lg overflow-hidden shadow-lg shadow-black/5">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSort(option);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        sort === option
                          ? 'bg-vip-border/10 text-vip-text'
                          : 'hover:bg-card-hover text-text-primary'
                      }`}
                    >
                      {SORT_LABELS[option]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {searchQuery && (
              <span className="flex items-center gap-2 bg-card-bg border border-border-subtle rounded-full pl-4 pr-2 py-1.5 text-sm">
                {t('buyer.searchLabel')}: „{searchQuery}"
                <button
                  onClick={() => clearFilter('search')}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-card-hover text-text-muted"
                >
                  ✕
                </button>
              </span>
            )}
            {categoryFilter && (
              <span className="flex items-center gap-2 bg-card-bg border border-border-subtle rounded-full pl-4 pr-2 py-1.5 text-sm">
                {t('buyer.categoryLabel')}: {categoryFilter}
                <button
                  onClick={() => clearFilter('category')}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-card-hover text-text-muted"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card-bg border border-border-subtle rounded-xl h-56 animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-24 text-text-muted">
            {hasActiveFilters ? t('buyer.noResultsFiltered') : t('buyer.noItemsYet')}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                // NOTE: was a <button> — changed to a clickable <div> so the
                // FavoriteButton / AddToCartButton (real <button>s) can nest
                // inside it safely. Nesting <button> inside <button> is
                // invalid HTML and breaks layout/hydration.
                <div
                  key={product.id}
                  onClick={() => setSelected(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(product);
                    }
                  }}
                  className="group relative text-left bg-card-bg border border-border-subtle hover:border-vip-border/50 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 cursor-pointer"
                >
                  {product.image_url ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-input-bg">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 z-10">
                        <FavoriteButton productId={product.id} variant="card" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video w-full bg-input-bg flex items-center justify-center text-text-muted text-xs">
                      {t('buyer.noPhoto')}
                      <div className="absolute top-3 right-3 z-10">
                        <FavoriteButton productId={product.id} variant="card" />
                      </div>
                    </div>
                  )}

                  <div className="relative p-6">
                    {isVipActive(product) && (
                      <span className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase text-vip-text bg-vip-border/15 border border-vip-border/40 rounded-full px-2.5 py-1">
                        ★ VIP
                      </span>
                    )}

                    <h3 className="text-lg font-semibold mb-1 pr-12 group-hover:text-vip-text transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-text-muted text-sm mb-6 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <span className="text-xl font-bold text-emerald-600">{product.price} ₾</span>
                      <div className="flex items-center gap-3">
                        <AddToCartButton
                          product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image_url: product.image_url ?? null,
                            phone: product.phone ?? null,
                          }}
                          variant="card"
                        />
                        <span className="hidden sm:inline text-sm font-medium text-vip-text opacity-0 group-hover:opacity-100 transition-opacity">
                          {t('buyer.viewDetails')} →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border-subtle hover:border-vip-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>

                {getPageNumbers(currentPage, totalPages).map((page, i) =>
                  page === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-text-muted text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-vip-border text-black'
                          : 'border border-border-subtle hover:border-vip-border/50 text-text-primary'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border-subtle hover:border-vip-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card-bg border border-border-subtle rounded-2xl shadow-2xl"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/60 hover:bg-black text-white transition-colors"
            >
              ✕
            </button>

            {galleryImages.length > 0 ? (
              <div className="relative w-full aspect-video bg-input-bg group">
                <img
                  src={galleryImages[galleryIndex]}
                  alt={`${selected.name} — ფოტო ${galleryIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1))
                      }
                      aria-label="წინა ფოტო"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1))
                      }
                      aria-label="შემდეგი ფოტო"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      ›
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {galleryImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setGalleryIndex(i)}
                          aria-label={`ფოტო ${i + 1}`}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === galleryIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium rounded-full px-2.5 py-1">
                      {galleryIndex + 1} / {galleryImages.length}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video bg-input-bg flex items-center justify-center text-text-muted">
                {t('buyer.noPhoto')}
              </div>
            )}

            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">{selected.name}</h2>
                {isVipActive(selected) && (
                  <span className="shrink-0 flex items-center gap-1 text-xs font-semibold tracking-wide uppercase text-vip-text bg-vip-border/15 border border-vip-border/40 rounded-full px-3 py-1.5">
                    ★ VIP
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                {selected.category && (
                  <span className="inline-block text-xs font-medium text-text-muted border border-border-subtle rounded-full px-3 py-1">
                    {selected.category}
                  </span>
                )}
                {typeof selected.views === 'number' && selected.views > 0 && (
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {selected.views} ნახვა
                  </span>
                )}
                {reviews.length > 0 && (
                  <span className="text-xs font-medium text-vip-text flex items-center gap-1">
                    ★ {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                    <span className="text-text-muted font-normal">({reviews.length})</span>
                  </span>
                )}
              </div>

              <p className="text-text-muted leading-relaxed mb-8 whitespace-pre-line">{selected.description}</p>

              {/* Favorite + Add to Cart + Message Seller — grouped together
                  right above the phone-reveal action, as requested */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <FavoriteButton productId={selected.id} variant="detail" />
                <AddToCartButton
                  product={{
                    id: selected.id,
                    name: selected.name,
                    price: selected.price,
                    image_url: selected.image_url ?? null,
                    phone: selected.phone ?? null,
                  }}
                  variant="card"
                />
                <MessageSellerButton productId={selected.id} sellerId={selected.user_id} />
              </div>

              {/* Share + Report — secondary, low-emphasis actions */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={async () => {
                    const url = `${window.location.origin}/buyer?product=${selected.id}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: selected.name, url });
                      } catch {
                        // user cancelled the native share sheet — no-op
                      }
                    } else {
                      await navigator.clipboard.writeText(url);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-vip-text transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
                  </svg>
                  {shareCopied ? 'ბმული დაკოპირდა!' : 'გაზიარება'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      router.push('/login');
                      return;
                    }
                    setReportOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-[#b3444c] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v18" />
                  </svg>
                  დარეპორტება
                </button>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
                <span className="text-3xl font-bold text-emerald-600">{selected.price} ₾</span>

                {phoneRevealed && selected.phone ? (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-center gap-2 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {selected.phone}
                  </a>
                ) : (
                  <button
                    onClick={() => setPhoneRevealed(true)}
                    disabled={!selected.phone}
                    className="bg-vip-border text-black font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selected.phone ? t('buyer.showPhone') : t('buyer.noPhoneListed')}
                  </button>
                )}
              </div>

              {/* ---------- Reviews ---------- */}
              <div className="mt-8 pt-6 border-t border-border-subtle">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  მიმოხილვები {reviews.length > 0 && `(${reviews.length})`}
                </h3>

                {user && selected.user_id !== user.id && !reviews.some((r) => r.reviewer_id === user.id) && (
                  <div className="bg-input-bg border border-border-subtle rounded-xl p-4 mb-5">
                    <p className="text-sm font-medium text-text-primary mb-2">დატოვე შენი შეფასება</p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          className="text-2xl leading-none transition-transform hover:scale-110"
                        >
                          <span className={(reviewHoverRating || reviewRating) >= star ? 'text-vip-border' : 'text-border-subtle'}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={2}
                      placeholder="დაწერე მოკლე კომენტარი (არასავალდებულო)"
                      className="w-full bg-card-bg border border-border-subtle focus:border-vip-border rounded-lg px-3 py-2 text-sm outline-none transition-colors resize-none mb-3"
                    />
                    <button
                      onClick={handleReviewSubmit}
                      disabled={reviewRating === 0 || reviewSubmitting}
                      className="rounded-lg px-5 py-2 bg-vip-border text-black text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {reviewSubmitting ? 'იგზავნება...' : 'გამოქვეყნება'}
                    </button>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <p className="text-sm text-text-muted">ჯერ არცერთი მიმოხილვა არ არის — იყავი პირველი!</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b border-border-subtle pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-vip-border text-sm">
                            {'★'.repeat(r.rating)}
                            <span className="text-border-subtle">{'★'.repeat(5 - r.rating)}</span>
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(r.created_at).toLocaleDateString('ka-GE')}
                          </span>
                        </div>
                        {r.comment && <p className="text-sm text-text-primary">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {reportOpen && selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setReportOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-card-bg border border-border-subtle rounded-2xl p-7"
          >
            {reportSubmitted ? (
              <div className="text-center">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  მადლობა შენი შეტყობინებისთვის
                </h3>
                <p className="text-sm text-text-muted mb-5">
                  ჩვენი გუნდი განიხილავს ამ განცხადებას უახლოეს დროში.
                </p>
                <button
                  onClick={() => setReportOpen(false)}
                  className="w-full rounded-lg py-2.5 bg-vip-border text-black text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  დახურვა
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  ნივთის დარეპორტება
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  „{selected.name}"
                </p>

                <div className="flex flex-col gap-2 mb-4">
                  {[
                    'ყალბი ან შეცდომაში შემყვანი განცხადება',
                    'აკრძალული/საშიში ნივთი',
                    'საეჭვო ან თაღლითური გამყიდველი',
                    'დუბლირებული განცხადება',
                    'სხვა',
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReportReason(reason)}
                      className={`text-left text-sm rounded-lg border px-3 py-2 transition-colors ${
                        reportReason === reason
                          ? 'border-[#b3444c] bg-[#b3444c]/10 text-text-primary'
                          : 'border-border-subtle text-text-muted hover:border-[#b3444c]/40'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder="დამატებითი დეტალები (არასავალდებულო)"
                  className="w-full bg-input-bg border border-border-subtle focus:border-[#b3444c]/60 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none mb-4"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setReportOpen(false)}
                    className="flex-1 border border-border-subtle rounded-lg py-2.5 text-sm hover:border-vip-border/40 transition-colors"
                  >
                    გაუქმება
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={!reportReason || reportSubmitting}
                    className="flex-1 bg-[#b3444c] hover:bg-[#a03d44] text-white rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
                  >
                    {reportSubmitting ? 'იგზავნება...' : 'გაგზავნა'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}