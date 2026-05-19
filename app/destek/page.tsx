/**
 * Genel destek / iletişim (giriş gerekmez; girişliyse e-posta kilitlenir)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getOptionalPageSession } from '@/lib/auth/pageSession';
import { buildDestekJsonLd, buildPublicPageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { ContactSupportForm } from '@/components/support/ContactSupportForm';
import { LifeBuoy, ArrowLeft } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Destek ve iletişim';
  const description =
    'The Goal Lab ile ilgili teknik sorun, hesap veya geri bildirim için bize yazın. Mümkün olan en kısa sürede yanıt veriyoruz.';
  return buildPublicPageMetadata({ title, description, path: '/destek' });
}

export default async function DestekPage() {
  const session = await getOptionalPageSession();
  const defaultEmail = session?.user?.email ?? null;
  const lockedEmail = Boolean(session?.user?.email);
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <JsonLd data={buildDestekJsonLd()} />
      <MarketingHeader />
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana sayfa
        </Link>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90 sm:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
              <LifeBuoy className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">Destek</h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Bir hata, belirsizlik veya öneriniz için aşağıdaki formu doldurun. Giriş yaptıysanız yanıtları aynı e-posta
                adresine göndeririz.
              </p>
            </div>
          </div>

          <ContactSupportForm defaultEmail={defaultEmail} lockedEmail={lockedEmail} />

          <p className="mt-8 border-t border-stone-100 pt-6 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
            Sık sorulanlar için{' '}
            <Link href="/sss" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
              SSS sayfasına
            </Link>{' '}
            göz atabilirsiniz.
          </p>
        </div>
      </main>
    </div>
  );
}
