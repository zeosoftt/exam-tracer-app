'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

interface PlanStat {
  planId: string | null;
  planCode: string;
  planName: string;
  planType: string;
  userCount: number;
}

export function PlansContent() {
  const [planStats, setPlanStats] = useState<PlanStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/super-admin/stats');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Yüklenemedi');
      }
      const data = await res.json();
      startTransition(() => setPlanStats(data.data?.planStats ?? []));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Plan verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            <Link
              href="/dashboard/super-admin"
              className="flex items-center gap-2 text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Super Admin</span>
            </Link>
            <h1 className="text-center text-lg font-semibold text-stone-900 dark:text-stone-100 sm:flex-1">
              Planlar & Abonelikler
            </h1>
            <div className="flex w-28 justify-end">
              <ThemeToggleCompact />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
          Plan listesi, fiyatlar, limitler ve özellikler. Kurum bazlı plan atama / değiştirme.
        </p>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
          <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100">
              <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              Planlara göre kullanıcı sayısı
            </h2>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">FREE / PRO / ENTERPRISE dağılımı</p>
          </div>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : planStats.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500 dark:text-stone-400">Henüz plan verisi yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:bg-stone-900/80 dark:text-stone-400">
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Tür</th>
                    <th className="px-4 py-3">Kullanıcı</th>
                  </tr>
                </thead>
                <tbody>
                  {planStats.map((p) => (
                    <tr key={p.planId ?? p.planCode} className="border-t border-stone-100 hover:bg-stone-50/50 dark:border-stone-800 dark:hover:bg-stone-800/40">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">{p.planName}</span>
                          <span className="text-xs text-stone-500 dark:text-stone-400">{p.planCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{p.planType}</td>
                      <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-100">{p.userCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
