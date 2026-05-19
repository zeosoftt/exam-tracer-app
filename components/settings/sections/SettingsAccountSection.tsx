'use client';

import { CheckCircle, AlertCircle, Lock, Loader2, User } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import {
  settingsFieldClass,
  settingsFieldDisabledClass,
  settingsLabelClass,
} from '@/lib/settings/settingsFormStyles';
import type { SettingsPageState } from '@/components/settings/hooks/useSettingsPage';

type SettingsAccountSectionProps = Pick<
  SettingsPageState,
  | 'email'
  | 'firstName'
  | 'setFirstName'
  | 'lastName'
  | 'setLastName'
  | 'showPasswordForm'
  | 'setShowPasswordForm'
  | 'currentPassword'
  | 'setCurrentPassword'
  | 'newPassword'
  | 'setNewPassword'
  | 'confirmPassword'
  | 'setConfirmPassword'
  | 'changingPassword'
  | 'passwordMessage'
  | 'handleChangePassword'
>;

export function SettingsAccountSection(props: SettingsAccountSectionProps) {
  const {
    email,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    showPasswordForm,
    setShowPasswordForm,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    changingPassword,
    passwordMessage,
    handleChangePassword,
  } = props;

  return (
    <PageSectionCard
      title="Hesap Ayarları"
      icon={<User className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
    >
      <div className="space-y-4">
        <div>
          <label className={settingsLabelClass}>E-posta</label>
          <input type="email" value={email} disabled className={settingsFieldDisabledClass} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={settingsLabelClass}>Ad</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={settingsFieldClass}
              placeholder="Adınız"
            />
          </div>
          <div>
            <label className={settingsLabelClass}>Soyad</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={settingsFieldClass}
              placeholder="Soyadınız"
            />
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <Lock className="h-4 w-4" aria-hidden />
            {showPasswordForm ? 'Şifre değiştirmeyi kapat' : 'Şifre değiştir'}
          </button>
          {showPasswordForm ? (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4 rounded-xl bg-stone-50 p-4 dark:bg-stone-900/50">
              {passwordMessage ? (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    passwordMessage.type === 'success'
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" aria-hidden />
                  ) : (
                    <AlertCircle className="h-4 w-4" aria-hidden />
                  )}
                  {passwordMessage.text}
                </div>
              ) : null}
              <div>
                <label className={settingsLabelClass}>Mevcut şifre</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={settingsFieldClass}
                  placeholder="Mevcut şifreniz"
                />
              </div>
              <div>
                <label className={settingsLabelClass}>Yeni şifre</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className={settingsFieldClass}
                  placeholder="En az 8 karakter"
                />
              </div>
              <div>
                <label className={settingsLabelClass}>Yeni şifre (tekrar)</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={settingsFieldClass}
                  placeholder="Yeni şifreyi tekrar girin"
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {changingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Lock className="h-4 w-4" aria-hidden />
                )}
                Şifreyi güncelle
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </PageSectionCard>
  );
}
