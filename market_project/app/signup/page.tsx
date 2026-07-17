'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../lib/LanguageContext';

type Errors = {
  name?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
};

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = (): Errors => ({
    name: name.trim() === '',
    email: email.trim() === '',
    password: password.trim().length < 6,
    confirmPassword: confirmPassword !== password || confirmPassword.trim() === '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.session) {
      router.push('/buyer');
      router.refresh();
    } else {
      setSuccess(true);
    }
  };

  const fieldClass = (hasError?: boolean) =>
    `bg-input-bg border rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder:text-text-muted/60 ${
      hasError
        ? 'border-red-500/70 focus:border-red-500'
        : 'border-border-subtle focus:border-vip-border'
    }`;

  if (success) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center px-6 py-16 text-text-primary">
        <div className="w-full max-w-md bg-card-bg border border-border-subtle rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-vip-border/15 border border-vip-border/40 flex items-center justify-center text-vip-text text-xl">
            ✓
          </div>
          <h2 className="text-xl font-bold mb-2">{t('signup.checkEmailTitle')}</h2>
          <p className="text-text-muted text-sm mb-6">
            {t('signup.checkEmailBodyPrefix')} <span className="text-text-primary">{email}</span>.{' '}
            {t('signup.checkEmailBodySuffix')}
          </p>
          <Link
            href="/login"
            className="inline-block bg-vip-border text-black font-semibold rounded-lg px-6 py-3 hover:opacity-90 transition-opacity"
          >
            {t('signup.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen flex items-center justify-center px-6 py-16 text-text-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold mb-6">
            <span className="text-vip-border">🛍️</span>
            Marketologi
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('signup.createAccount')}</h1>
          <p className="text-text-muted text-sm">{t('signup.subtitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-card-bg border border-border-subtle rounded-2xl p-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('signup.fullName')} <span className="text-vip-border font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder={t('signup.fullNamePlaceholder')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setErrors((p) => ({ ...p, name: false }));
              }}
              className={fieldClass(errors.name)}
            />
            {errors.name && <p className="text-xs text-red-400">{t('signup.nameRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('signup.email')} <span className="text-vip-border font-bold">*</span>
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
            {errors.email && <p className="text-xs text-red-400">{t('signup.emailRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('signup.password')} <span className="text-vip-border font-bold">*</span>
            </label>
            <input
              type="password"
              placeholder={t('signup.passwordPlaceholder')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: e.target.value.trim().length < 6 }));
              }}
              className={fieldClass(errors.password)}
            />
            {errors.password && <p className="text-xs text-red-400">{t('signup.passwordTooShort')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('signup.confirmPassword')} <span className="text-vip-border font-bold">*</span>
            </label>
            <input
              type="password"
              placeholder={t('signup.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((p) => ({ ...p, confirmPassword: e.target.value !== password }));
              }}
              className={fieldClass(errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">{t('signup.passwordMismatch')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-vip-border text-black font-semibold rounded-lg py-3 hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            )}
            {submitting ? t('signup.submitting') : t('signup.submit')}
          </button>

          {errorMsg && <p className="text-sm text-center text-red-400">{errorMsg}</p>}

          <p className="text-sm text-center text-text-muted">
            {t('signup.haveAccount')}{' '}
            <Link href="/login" className="text-vip-text font-medium hover:underline">
              {t('signup.logInLink')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}