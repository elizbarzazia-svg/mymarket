'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { supabase } from '../../lib/supabaseClient';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { user } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [email, setEmail] = useState(user?.email || '');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fieldClass =
    'bg-input-bg border border-border-subtle focus:border-vip-border rounded-lg px-4 py-3 text-sm outline-none transition-colors w-full';

  const handleSaveName = async () => {
    setNameSaving(true);
    setNameSaved(false);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    setNameSaving(false);
    if (!error) setNameSaved(true);
  };

  const handleSaveEmail = async () => {
    setEmailSaving(true);
    setEmailMsg('');
    const { error } = await supabase.auth.updateUser({ email });
    setEmailSaving(false);
    setEmailMsg(error ? error.message : t('settings.emailNote'));
  };

  const handleSavePassword = async () => {
    if (newPassword.trim().length < 6) {
      setPasswordError(t('settings.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }
    setPasswordError('');
    setPasswordSaving(true);
    setPasswordSaved(false);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setDeleting(false);
      setDeleteError(t('dashboard.unknownError'));
      return;
    }

    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? t('dashboard.unknownError'));
      }

      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setDeleteError(t('settings.deleteAccountError') + (err?.message ?? ''));
      setDeleting(false);
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen text-text-primary">
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>

        {/* Personal Information */}
        <section className="bg-card-bg border border-border-subtle rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-semibold mb-5">{t('settings.personalInfo')}</h2>
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm font-medium text-text-muted">{t('settings.fullName')}</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameSaved(false);
              }}
              className={fieldClass}
            />
          </div>
          <button
            onClick={handleSaveName}
            disabled={nameSaving}
            className="bg-vip-border text-black font-semibold rounded-lg px-5 py-2.5 text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {nameSaving ? t('settings.saving') : t('settings.save')}
          </button>
          {nameSaved && <p className="text-sm text-emerald-600 mt-3">{t('settings.saved')}</p>}
        </section>

        {/* Email */}
        <section className="bg-card-bg border border-border-subtle rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-semibold mb-5">{t('settings.email')}</h2>
          <div className="flex flex-col gap-2 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailMsg('');
              }}
              className={fieldClass}
            />
          </div>
          <button
            onClick={handleSaveEmail}
            disabled={emailSaving}
            className="bg-vip-border text-black font-semibold rounded-lg px-5 py-2.5 text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {emailSaving ? t('settings.saving') : t('settings.changeEmail')}
          </button>
          {emailMsg && <p className="text-sm text-text-muted mt-3">{emailMsg}</p>}
        </section>

        {/* Security */}
        <section className="bg-card-bg border border-border-subtle rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-semibold mb-5">{t('settings.security')}</h2>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-muted">{t('settings.newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                  setPasswordSaved(false);
                }}
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-muted">{t('settings.confirmNewPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                  setPasswordSaved(false);
                }}
                className={fieldClass}
              />
            </div>
          </div>
          <button
            onClick={handleSavePassword}
            disabled={passwordSaving}
            className="bg-vip-border text-black font-semibold rounded-lg px-5 py-2.5 text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {passwordSaving ? t('settings.saving') : t('settings.updatePassword')}
          </button>
          {passwordError && <p className="text-sm text-red-400 mt-3">{passwordError}</p>}
          {passwordSaved && <p className="text-sm text-emerald-600 mt-3">{t('settings.passwordUpdated')}</p>}
        </section>

        {/* Preferences */}
        <section className="bg-card-bg border border-border-subtle rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-semibold mb-5">{t('settings.preferences')}</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">{t('settings.language')}</span>
            <div className="flex items-center text-xs font-semibold border border-border-subtle rounded-full overflow-hidden">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 transition-colors ${
                  lang === 'en' ? 'bg-vip-border text-black' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ka')}
                className={`px-4 py-2 transition-colors ${
                  lang === 'ka' ? 'bg-vip-border text-black' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                KA
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card-bg border border-red-500/30 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-red-400 mb-5">{t('settings.dangerZone')}</h2>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto border border-red-500/40 hover:border-red-500 text-red-400 font-medium rounded-lg px-5 py-2.5 text-sm transition-colors mb-4"
          >
            {t('settings.logOut')}
          </button>
          <div className="border-t border-red-500/20 pt-4 mt-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto bg-red-500/90 hover:bg-red-500 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
            >
              {t('settings.deleteAccountButton')}
            </button>
          </div>
        </section>
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card-bg border border-red-500/30 rounded-2xl p-8"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-3">
              {t('settings.deleteAccountModalTitle')}
            </h3>
            <p className="text-sm text-text-muted leading-relaxed mb-5">
              {t('settings.deleteAccountWarning')}
            </p>

            <label className="text-sm font-medium text-text-muted block mb-2">
              {t('settings.deleteAccountTypeEmailLabel')}
            </label>
            <input
              value={deleteEmailInput}
              onChange={(e) => setDeleteEmailInput(e.target.value)}
              placeholder={user?.email ?? ''}
              className="w-full bg-input-bg border border-border-subtle focus:border-red-500 rounded-lg px-4 py-3 text-sm outline-none transition-colors mb-2"
            />

            {deleteError && <p className="text-sm text-red-400 mb-4">{deleteError}</p>}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteEmailInput('');
                  setDeleteError('');
                }}
                disabled={deleting}
                className="flex-1 border border-border-subtle rounded-lg py-3 text-sm hover:border-vip-border/40 transition-colors disabled:opacity-50"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteEmailInput.trim().toLowerCase() !== (user?.email ?? '').toLowerCase()}
                className="flex-1 bg-red-500/90 hover:bg-red-500 text-white rounded-lg py-3 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? t('settings.deleteAccountDeleting') : t('settings.deleteAccountConfirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}