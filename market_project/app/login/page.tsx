'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../lib/LanguageContext';

type Errors = {
  email?: boolean;
  password?: boolean;
};

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const validate = (): Errors => ({
    email: email.trim() === '',
    password: password.trim() === '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    setErrorMsg('');
    setEmailNotConfirmed(false);
    setResent(false);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setEmailNotConfirmed(true);
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    router.push('/buyer');
    router.refresh();
  };

  const handleResend = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    if (!error) setResent(true);
  };

  const fieldClass = (hasError?: boolean) =>
    `bg-input-bg border rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder:text-text-muted/60 ${
      hasError
        ? 'border-red-500/70 focus:border-red-500'
        : 'border-border-subtle focus:border-vip-border'
    }`;

  return (
    <div className="bg-brand-bg min-h-screen flex items-center justify-center px-6 py-16 text-text-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold mb-6">
            <span className="text-vip-border">🛍️</span>
            Marketologi
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('login.welcomeBack')}</h1>
          <p className="text-text-muted text-sm">{t('login.subtitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-card-bg border border-border-subtle rounded-2xl p-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('login.email')} <span className="text-vip-border font-bold">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value.trim()) setErrors((p) => ({ ...p, email: false }));
              }}
              className={fieldClass(errors.email)}
            />
            {errors.email && <p className="text-xs text-red-400">{t('login.emailRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('login.password')} <span className="text-vip-border font-bold">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.trim()) setErrors((p) => ({ ...p, password: false }));
              }}
              className={fieldClass(errors.password)}
            />
            {errors.password && <p className="text-xs text-red-400">{t('login.passwordRequired')}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-vip-border text-black font-semibold rounded-lg py-3 hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            )}
            {submitting ? t('login.submitting') : t('login.submit')}
          </button>

          {emailNotConfirmed && (
            <div className="bg-vip-border/10 border border-vip-border/40 rounded-lg p-4 text-center">
              <p className="text-sm font-semibold text-text-primary mb-1">
                {t('login.emailNotConfirmedTitle')}
              </p>
              <p className="text-xs text-text-muted mb-3">
                {t('login.emailNotConfirmedBody')}
              </p>
              {resent ? (
                <p className="text-xs font-medium text-emerald-600">{t('login.resendSuccess')}</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs font-medium text-vip-text hover:underline disabled:opacity-50"
                >
                  {resending ? t('login.resending') : t('login.resendButton')}
                </button>
              )}
            </div>
          )}

          {errorMsg && <p className="text-sm text-center text-red-400">{errorMsg}</p>}

          <p className="text-sm text-center text-text-muted">
            {t('login.noAccount')}{' '}
            <Link href="/signup" className="text-vip-text font-medium hover:underline">
              {t('login.signUpLink')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}