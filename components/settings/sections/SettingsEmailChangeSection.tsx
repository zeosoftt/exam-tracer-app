'use client';

import { useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2, Mail } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import { settingsFieldClass, settingsLabelClass } from '@/lib/settings/settingsFormStyles';
import { requestEmailChange, confirmEmailChange } from '@/lib/client-api/userSettings';
import { getApiErrorMessage } from '@/lib/client-api/http';

export function SettingsEmailChangeSection() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleRequest = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage(null);
      try {
        const { ok, result } = await requestEmailChange({ newEmail, password });
        if (ok) {
          setMessage({ type: 'success', text: 'Doğrulama kodu yeni e-posta adresinize gönderildi.' });
          setStep('confirm');
          setPassword('');
        } else {
          setMessage({ type: 'error', text: getApiErrorMessage(result, 'İstek gönderilemedi.') });
        }
      } catch {
        setMessage({ type: 'error', text: 'İstek gönderilemedi.' });
      } finally {
        setLoading(false);
      }
    },
    [newEmail, password],
  );

  const handleConfirm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage(null);
      try {
        const { ok, result } = await confirmEmailChange({ code });
        if (ok) {
          await signOut({ callbackUrl: '/auth/login?verified=1' });
          return;
        }
        setMessage({ type: 'error', text: getApiErrorMessage(result, 'Doğrulama başarısız.') });
      } catch {
        setMessage({ type: 'error', text: 'Doğrulama başarısız.' });
      } finally {
        setLoading(false);
      }
    },
    [code],
  );

  return (
    <PageSectionCard
      title="E-posta değiştir"
      icon={<Mail className="h-6 w-6 text-sky-600 dark:text-sky-400" />}
      iconClassName="bg-sky-100 dark:bg-sky-950/40"
      description="Yeni adrese doğrulama kodu gönderilir; onay sonrası tekrar giriş yaparsınız."
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          E-posta adresimi değiştir
        </button>
      ) : step === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-4">
          {message ? (
            <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message.text}
            </p>
          ) : null}
          <div>
            <label className={settingsLabelClass}>Yeni e-posta</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={settingsFieldClass}
            />
          </div>
          <div>
            <label className={settingsLabelClass}>Mevcut şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={settingsFieldClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Kod gönder
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-4">
          {message ? (
            <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message.text}
            </p>
          ) : null}
          <p className="text-sm text-stone-600 dark:text-stone-400">
            <strong>{newEmail}</strong> adresine gönderilen 6 haneli kodu girin.
          </p>
          <div>
            <label className={settingsLabelClass}>Doğrulama kodu</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={settingsFieldClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            E-postayı onayla
          </button>
        </form>
      )}
    </PageSectionCard>
  );
}
