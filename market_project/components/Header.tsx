'use client';
import { CATEGORIES } from '../lib/categories';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import CartButton from './CartButton';
import FavoritesLink from './FavoritesLink';
import MessagesLink from './MessagesLink';


export default function Header() {
  const { user, loading } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) setCategoriesOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close the mobile menu automatically on route change, so it doesn't stay
  // open after tapping a link inside it.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/buyer?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleCategoryClick = (category: string) => {
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
    router.push(`/buyer?category=${encodeURIComponent(category)}`);
  };

  const initials = (user?.user_metadata?.full_name || user?.email || '?')
    .split(' ')
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? 'text-vip-text border-b-2 border-vip-border pb-1'
        : 'text-text-muted hover:text-text-primary'
    }`;

  return (
    <header className="bg-brand-bg border-b border-border-subtle sticky top-0 z-40">
      {/* ზედა ხაზი: ლოგო + Categories + search + auth */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 px-6 py-4">
        <div className="w-full sm:w-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-primary shrink-0">
            <span className="text-vip-text">🛍️</span>
            Marketologi
          </Link>

          <div className="relative shrink-0" ref={categoriesRef}>
            <button
              onClick={() => setCategoriesOpen((o) => !o)}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-text-primary border border-border-subtle hover:border-vip-border/50 rounded-full px-4 py-2.5 transition-colors"
            > 
              კატეგორიები
              <svg
                className={`w-3.5 h-3.5 text-text-muted transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {categoriesOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-card-bg border border-border-subtle rounded-xl overflow-hidden shadow-lg shadow-black/5 z-20">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-card-hover transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          <FavoritesLink />
          <MessagesLink />
          <CartButton />

          {/* mobile-only: hamburger — inside this same always-full-width-on-mobile
              group, so ml-auto reliably pushes it to the right edge of THIS row
              instead of interacting unpredictably with the outer flex-wrap */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="მენიუ"
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-card-hover transition-colors shrink-0 ml-auto"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" strokeWidth={1.8}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" strokeWidth={1.8}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto sm:flex-1 sm:max-w-xl min-w-0">
          <div className="flex items-center bg-card-bg border border-border-subtle focus-within:border-vip-border/60 rounded-full overflow-hidden transition-colors">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="მოძებნე ნებისმიერი..."
              className="flex-1 min-w-0 bg-transparent px-5 py-2.5 text-sm outline-none placeholder:text-text-muted/70"
            />
            <button
              type="submit"
              className="m-1 w-9 h-9 flex items-center justify-center bg-vip-border rounded-full hover:opacity-90 transition-opacity shrink-0"
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* desktop-only: language switch + account (avatar or login/signup) */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center text-xs font-semibold border border-border-subtle rounded-full overflow-hidden">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-vip-border text-black' : 'text-text-muted hover:text-text-primary'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ka')}
              className={`px-3 py-1.5 transition-colors ${lang === 'ka' ? 'bg-vip-border text-black' : 'text-text-muted hover:text-text-primary'}`}
            >
              KA
            </button>
          </div>

          {loading ? (
            <div className="w-9 h-9 rounded-full bg-card-bg border border-border-subtle animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-vip-border/15 border border-vip-border/50 text-vip-text text-sm font-semibold hover:border-vip-border transition-colors"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card-bg border border-border-subtle rounded-lg overflow-hidden shadow-lg shadow-black/10 z-20">
                  <div className="px-4 py-3 border-b border-border-subtle">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-text-primary hover:bg-card-hover transition-colors">
                    {t('auth.myProfile')}
                  </Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-text-primary hover:bg-card-hover transition-colors">
                    {t('auth.myDashboard')}
                  </Link>
                  <Link href="/favorites" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-text-primary hover:bg-card-hover transition-colors">
                    {t('auth.myFavorites')}
                  </Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-text-primary hover:bg-card-hover transition-colors">
                    {t('auth.settings')}
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-card-hover transition-colors border-t border-border-subtle">
                    {t('auth.logOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-text-primary border border-border-subtle hover:border-vip-border/50 rounded-full px-4 py-2 transition-colors">
                {t('auth.logIn')}
              </Link>
              <Link href="/signup" className="bg-vip-border text-black text-sm font-semibold rounded-full px-4 py-2 hover:opacity-90 transition-opacity">
                {t('auth.signUp')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ქვედა ხაზი: ნავიგაცია */}
      <div className="border-t border-border-subtle">
        <nav className="max-w-7xl mx-auto flex items-center gap-8 px-6 py-3 overflow-x-auto">
          <Link href="/" className={navLinkClass('/')}>{t('nav.home')}</Link>
          <Link href="/about" className={navLinkClass('/about')}>{t('nav.about')}</Link>
          <Link href="/buyer" className={navLinkClass('/buyer')}>{t('nav.buying')}</Link>
          <Link href="/seller" className={navLinkClass('/seller')}>{t('nav.selling')}</Link>
        </nav>
      </div>

      {/* mobile menu panel — Categories / Language / Account, all previously
          hidden on small screens with no alternative way to reach them */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border-subtle bg-card-bg px-6 py-5 flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              კატეგორიები
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="text-sm border border-border-subtle rounded-full px-3 py-1.5 hover:border-vip-border/50 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-5">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">ენა</p>
            <div className="flex items-center text-xs font-semibold border border-border-subtle rounded-full overflow-hidden">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-vip-border text-black' : 'text-text-muted hover:text-text-primary'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ka')}
                className={`px-3 py-1.5 transition-colors ${lang === 'ka' ? 'bg-vip-border text-black' : 'text-text-muted hover:text-text-primary'}`}
              >
                KA
              </button>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-5">
            {loading ? (
              <div className="w-full h-10 rounded-lg bg-card-hover animate-pulse" />
            ) : user ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-text-primary truncate mb-1">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <Link href="/profile" className="py-2 text-sm text-text-primary">
                  {t('auth.myProfile')}
                </Link>
                <Link href="/dashboard" className="py-2 text-sm text-text-primary">
                  {t('auth.myDashboard')}
                </Link>
                <Link href="/favorites" className="py-2 text-sm text-text-primary">
                  {t('auth.myFavorites')}
                </Link>
                <Link href="/settings" className="py-2 text-sm text-text-primary">
                  {t('auth.settings')}
                </Link>
                <button onClick={handleLogout} className="text-left py-2 text-sm text-red-500">
                  {t('auth.logOut')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="flex-1 text-center text-sm font-medium text-text-primary border border-border-subtle rounded-full px-4 py-2.5"
                >
                  {t('auth.logIn')}
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center bg-vip-border text-black text-sm font-semibold rounded-full px-4 py-2.5"
                >
                  {t('auth.signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}