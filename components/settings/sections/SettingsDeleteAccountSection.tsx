'use client';

import { useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import { settingsFieldClass, settingsLabelClass } from '@/lib/settings/settingsFormStyles';
import { deleteUserAccount } from '@/lib/client-api/userSettings';
import { getApiErrorMessage } from '@/lib/client-api/http';

export function SettingsDeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleDelete = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!confirmed) {
        setMessage({ type: 'error', text: 'Hesap silme onayını işaretleyin.' });
        return;
      }
      setLoading(true);
      setMessage(null);
      try {
        const { ok, result } = await deleteUserAccount({ password, confirm: true });
        if (ok) {
          await signOut({ callbackUrl: '/auth/login' });
          return;
        }
        setMessage({
          type: 'error',
          text: getApiErrorMessage(result, 'Hesap silinemedi.'),
        });
      } catch {
        setMessage({ type: 'error', text: 'Hesap silinemedi.' });
      } finally {
        setLoading(false);
      }
    },
    [password, confirmed],
  );

  return (
    <PageSectionCard
      title="Tehlikeli bölge"
      icon={<AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />}
      iconClassName="bg-red-100 dark:bg-red-950/40"
      description="Hesabınızı sildiğinizde verilerinize erişemezsiniz. Bu işlem geri alınamaz."
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Hesabımı sil
        </button>
      ) : (
        <form onSubmit={handleDelete} className="space-y-4">
          {message ? (
            <p
              className={`text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600'}`}
            >
              {message.text}
            </p>
          ) : null}
          <div>
            <label className={settingsLabelClass}>Şifreniz</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={settingsFieldClass}
              placeholder="Onaylamak için şifrenizi girin"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            Hesabımın kalıcı olarak silinmesini ve tüm oturumlarımın kapatılmasını onaylıyorum.
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Kalıcı olarak sil
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold dark:border-stone-700"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}
    </PageSectionCard>
  );
}
