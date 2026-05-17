'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PUBLIC_FAQ_ITEMS } from '@/lib/seo/faqData';

const FAQ_ITEMS = PUBLIC_FAQ_ITEMS;

export function LandingFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="sss" className="border-y border-stone-100 bg-white py-12 dark:border-stone-800 dark:bg-stone-900 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Sıkça sorulan sorular
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 sm:text-base">
            Kayıt öncesi merak edilenler — tıklayarak yanıtı görün
          </p>
        </div>
        <ul className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={q}>
                <button
                  type="button"
                  id={`faq-btn-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={cn(
                    'landing-hover-lift flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors sm:px-5',
                    isOpen
                      ? 'border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-950/30'
                      : 'border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-950/60',
                  )}
                >
                  <HelpCircle
                    className={cn(
                      'mt-0.5 h-5 w-5 shrink-0',
                      isOpen ? 'text-primary-600' : 'text-stone-400',
                    )}
                    aria-hidden
                  />
                  <span className="flex-1 font-semibold text-stone-900 dark:text-stone-100">{q}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200',
                      isOpen && 'rotate-180 text-primary-600',
                    )}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    className="-mt-2 rounded-b-2xl border border-t-0 border-primary-200 bg-primary-50/30 px-4 pb-4 dark:border-primary-800 dark:bg-primary-950/20 sm:px-5"
                  >
                    <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
                      {a}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Hâlâ emin değil misiniz? Ücretsiz deneyin
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sss"
            className="inline-flex items-center gap-1 font-semibold text-primary-700 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            Tüm sorular ve destek
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
