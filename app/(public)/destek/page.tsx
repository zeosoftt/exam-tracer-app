/**
 * Genel destek / iletişim (giriş gerekmez; girişliyse e-posta kilitlenir)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getOptionalPageSession } from '@/lib/auth/pageSession';
import { buildDestekJsonLd, buildPublicPageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicBackLink } from '@/components/layout/PublicBackLink';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { ContactSupportForm } from '@/components/support/ContactSupportForm';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LifeBuoy } from 'lucide-react';

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
    <PublicPageShell maxWidth="sm" className="py-12 sm:py-16">
      <JsonLd data={buildDestekJsonLd()} />
      <PublicBackLink href="/" label="Ana sayfa" />

      <LandingReveal>
        <div className="landing-glass-card landing-hover-lift rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/20">
              <LifeBuoy className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="landing-section-eyebrow mb-2 text-xs font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
                DESTEK
              </p>
              <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
                <span className="landing-gradient-text">Destek</span>
              </h1>
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
      </LandingReveal>
    </PublicPageShell>
  );
}
