'use client';

import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border-subtle bg-card-bg mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 text-lg font-bold text-text-primary justify-center sm:justify-start">
            <span className="text-vip-text">🛍️</span>
            Marketologi
          </div>
          <p className="text-sm text-text-muted mt-1">{t('footer.tagline')}</p>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/about" className="text-text-muted hover:text-text-primary transition-colors">
            {t('nav.about')}
          </Link>
          <Link href="/terms" className="text-text-muted hover:text-text-primary transition-colors">
            {t('footer.termsLink')}
          </Link>
          <Link href="/privacy" className="text-text-muted hover:text-text-primary transition-colors">
            {t('footer.privacyLink')}
          </Link>
        </nav>

        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} Marketologi. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}