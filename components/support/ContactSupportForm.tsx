'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { SUPPORT_CATEGORY_LABELS } from '@/lib/support/supportContactCategories';

type Props = {
  defaultEmail?: string | null;
  lockedEmail?: boolean;
};

const CATEGORIES = [
  { value: 'TECHNICAL' as const, label: SUPPORT_CATEGORY_LABELS.TECHNICAL },
  { value: 'ACCOUNT' as const, label: SUPPORT_CATEGORY_LABELS.ACCOUNT },
  { value: 'BILLING' as const, label: SUPPORT_CATEGORY_LABELS.BILLING },
  { value: 'FEEDBACK' as const, label: SUPPORT_CATEGORY_LABELS.FEEDBACK },
  { value: 'OTHER' as const, label: SUPPORT_CATEGORY_LABELS.OTHER },
];

export function ContactSupportForm({ defaultEmail, lockedEmail }: Props) {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['value']>('TECHNICAL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: lockedEmail ? defaultEmail : email,
          category,
          subject,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setFeedback({ type: 'ok', text: data.message ?? 'Teşekkürler.' });
        setSubject('');
        setMessage('');
      } else {
        const errText =
          typeof data.error === 'string'
            ? data.error
            : data.error && typeof data.error === 'object' && 'message' in data.error
              ? String((data.error as { message?: string }).message)
              : 'Gönderilemedi. Tekrar deneyin.';
        setFeedback({ type: 'err', text: errText });
      }
    } catch {
      setFeedback({ type: 'err', text: 'Bağlantı hatası.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="support-email" className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
          E-posta adresiniz
        </label>
        <input
          id="support-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={lockedEmail}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 read-only:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:read-only:bg-stone-800/80"
          placeholder="ornek@posta.com"
        />
        {lockedEmail ? (
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Oturum açtığınız adres kullanılacak.</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="support-category" className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
          Konu türü
        </label>
        <select
          id="support-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number]['value'])}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="support-subject" className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
          Kısa başlık
        </label>
        <input
          id="support-subject"
          type="text"
          required
          minLength={3}
          maxLength={120}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          placeholder="Örn. Deneme kaydı kaydedilmiyor"
        />
      </div>

      <div>
        <label htmlFor="support-message" className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
          Mesajınız
        </label>
        <textarea
          id="support-message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          placeholder="Ne yapmaya çalıştığınız, hangi cihaz/tarayıcı ve mümkünse ekran görüntüsü veya hata metni…"
        />
      </div>

      {feedback ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            feedback.type === 'ok'
              ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200'
              : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        Gönder
      </button>
    </form>
  );
}
