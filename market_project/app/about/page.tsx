'use client';

import Link from 'next/link';
import { useLanguage } from '../../lib/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* ---------- HERO ---------- */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-14 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-vip-text mb-3">
          {t('about.eyebrow')}
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-text-primary">
          {t('about.heroLine1')}
          <br />
          <span className="text-vip-text">{t('about.heroLine2')}</span>
        </h1>
        <p className="mt-6 text-text-muted text-base sm:text-lg max-w-xl mx-auto">
          {t('about.heroSubtitle')}
        </p>
      </section>

      {/* ---------- MISSION ---------- */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-card-bg border border-border-subtle p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            {t('about.missionTitle')}
          </h2>
          <p className="text-text-muted leading-relaxed mb-4">
            {t('about.missionP1')}
          </p>
          <p className="text-text-muted leading-relaxed">
            {t('about.missionP2')}
          </p>
        </div>
      </section>

      {/* ---------- VALUES ---------- */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold text-text-primary text-center mb-8">
          {t('about.valuesTitle')}
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-card-bg border border-border-subtle p-6 text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-text-primary mb-1">
              {t('about.value1Title')}
            </h3>
            <p className="text-sm text-text-muted">
              {t('about.value1Text')}
            </p>
          </div>

          <div className="rounded-2xl bg-card-bg border border-border-subtle p-6 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-text-primary mb-1">
              {t('about.value2Title')}
            </h3>
            <p className="text-sm text-text-muted">
              {t('about.value2Text')}
            </p>
          </div>

          <div className="rounded-2xl bg-card-bg border border-border-subtle p-6 text-center">
            <div className="text-3xl mb-3">🌱</div>
            <h3 className="font-semibold text-text-primary mb-1">
              {t('about.value3Title')}
            </h3>
            <p className="text-sm text-text-muted">
              {t('about.value3Text')}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold text-text-primary text-center mb-8">
          {t('about.howTitle')}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-vip-border/15 border border-vip-border/40 flex items-center justify-center text-vip-text font-semibold">
              1
            </div>
            <h3 className="font-semibold text-text-primary mb-1">{t('about.step1Title')}</h3>
            <p className="text-sm text-text-muted">
              {t('about.step1Text')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-vip-border/15 border border-vip-border/40 flex items-center justify-center text-vip-text font-semibold">
              2
            </div>
            <h3 className="font-semibold text-text-primary mb-1">{t('about.step2Title')}</h3>
            <p className="text-sm text-text-muted">
              {t('about.step2Text')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-vip-border/15 border border-vip-border/40 flex items-center justify-center text-vip-text font-semibold">
              3
            </div>
            <h3 className="font-semibold text-text-primary mb-1">{t('about.step3Title')}</h3>
            <p className="text-sm text-text-muted">
              {t('about.step3Text')}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <div className="rounded-3xl border border-vip-border bg-gradient-to-r from-[#fff9ec] to-brand-bg px-8 py-10">
          <h3 className="text-2xl font-semibold text-text-primary mb-2">
            {t('about.ctaTitle')}
          </h3>
          <p className="text-text-muted mb-6">
            {t('about.ctaSubtitle')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/buyer"
              className="rounded-full px-7 py-3 bg-vip-border text-[#1c1c1c] font-medium hover:brightness-95 transition-all"
            >
              {t('about.ctaBuy')}
            </Link>
            <Link
              href="/seller"
              className="rounded-full px-7 py-3 border border-border-subtle bg-white text-text-primary font-medium hover:border-vip-border hover:text-vip-text transition-all"
            >
              {t('about.ctaSell')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}