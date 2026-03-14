'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard } from 'lucide-react';

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

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/super-admin/stats');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Yüklenemedi');
        }
        const data = await res.json();
        setPlanStats(data.data?.planStats ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Plan verileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard/super-admin"
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Super Admin</span>
            </Link>
            <h1 className="text-lg font-semibold text-stone-900">Planlar & Abonelikler</h1>
            <div className="w-28" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-stone-600 mb-6">
          Plan listesi, fiyatlar, limitler ve özellikler. Kurum bazlı plan atama / değiştirme.
        </p>

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-200">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-600" />
              Planlara göre kullanıcı sayısı
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">FREE / PRO / ENTERPRISE dağılımı</p>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="p-6 text-red-600 text-sm">{error}</div>
          ) : planStats.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">Henüz plan verisi yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Tür</th>
                    <th className="px-4 py-3">Kullanıcı</th>
                  </tr>
                </thead>
                <tbody>
                  {planStats.map((p) => (
                    <tr key={p.planId ?? p.planCode} className="border-t border-stone-100 hover:bg-stone-50/50">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-900">{p.planName}</span>
                          <span className="text-xs text-stone-500">{p.planCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{p.planType}</td>
                      <td className="px-4 py-3 text-stone-900 font-semibold">{p.userCount}</td>
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
