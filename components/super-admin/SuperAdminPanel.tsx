'use client';

import { useSuperAdminPanel } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { formatAdminDateTime } from '@/components/super-admin/formatAdminDateTime';
import { TrackingSettingsSection } from '@/components/super-admin/TrackingSettingsSection';
import {
  ROLE_LABELS,
} from '@/components/super-admin/domain/superAdminTypes';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Timer,
  ClipboardList,
  MousePointerClick,
  Shield,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MailCheck,
  MailX,
} from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';
import { AuditLogsSection } from '@/components/super-admin/AuditLogsSection';

export function SuperAdminPanel() {
  const {
    stats,
    users,
    page,
    setPage,
    pagination,
    isLoadingStats,
    isLoadingUsers,
    statsLoadError,
    usersLoadError,
    siteSettings,
    siteSettingsLoading,
    siteSettingsPatching,
    siteSettingsLoadError,
    siteSettingsPatchError,
    patchSiteSettings,
  } = useSuperAdminPanel();

  return (
    <div className="min-h-screen bg-gradient-to-br bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Super Admin Panel</span>
            </div>
            <div className="flex w-24 justify-end">
              <ThemeToggleCompact />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-100">Sistem Özeti</h1>

        {statsLoadError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {statsLoadError}
          </div>
        ) : null}

        {/* Stats */}
        {isLoadingStats ? (
          <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        ) : stats ? (
          <>
          <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-950/50">
                  <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Toplam Kullanıcı</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.usersCount}</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950/40">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Aktif Kullanıcı</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.activeUsersCount}</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950/40">
                  <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Sınav</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.examsCount}</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-950/40">
                  <Timer className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Pomodoro Oturum</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.pomodoroSessionsCount}</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-950/40">
                  <ClipboardList className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Sınav Ataması</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.examAssignmentsCount}</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-950/40">
                  <MousePointerClick className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Shopier satın al tıklaması</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {stats.shopierCheckoutClicks ?? 0}
              </p>
            </div>
          </div>

          </>
        ) : null}

        {/* Users table */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
          <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Kullanıcılar</h2>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">Kayıtlı kullanıcı listesi (sayfalı)</p>
          </div>
          {usersLoadError ? (
            <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {usersLoadError}
            </div>
          ) : null}
          {isLoadingUsers ? (
            <div className="p-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:bg-stone-900/80 dark:text-stone-400">
                      <th
                        scope="col"
                        className="w-14 px-2 py-3 text-center"
                        title="E-posta doğrulama"
                      >
                        <span className="sr-only">E-posta doğrulama</span>
                        <Mail className="mx-auto h-4 w-4 opacity-70" aria-hidden />
                      </th>
                      <th className="px-5 py-3">Ad Soyad</th>
                      <th className="px-5 py-3">E-posta</th>
                      <th className="min-w-[120px] max-w-[200px] px-5 py-3">Kaynak</th>
                      <th className="min-w-[140px] px-5 py-3">Sınavlar</th>
                      <th className="px-5 py-3">Rol</th>
                      <th className="px-5 py-3">Durum</th>
                      <th className="px-5 py-3">Son Giriş</th>
                      <th className="px-5 py-3">Kayıt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoadError ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-8 text-center text-stone-500 dark:text-stone-400">
                          Liste yüklenemedi. Yukarıdaki mesaja bakın veya sayfayı yenileyin.
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-8 text-center text-stone-500 dark:text-stone-400">
                          Kullanıcı bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="border-t border-stone-100 hover:bg-stone-50/50 dark:border-stone-800 dark:hover:bg-stone-800/40">
                          <td className="px-2 py-3 text-center align-middle">
                            {u.emailVerified ? (
                              <span
                                className="inline-flex rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                title="E-posta doğrulandı"
                              >
                                <MailCheck className="h-4 w-4" aria-hidden />
                                <span className="sr-only">E-posta doğrulandı</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex rounded-full bg-amber-100 p-2 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                title="E-posta doğrulanmadı"
                              >
                                <MailX className="h-4 w-4" aria-hidden />
                                <span className="sr-only">E-posta doğrulanmadı</span>
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 font-medium text-stone-900 dark:text-stone-100">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="px-5 py-3 text-stone-600 dark:text-stone-400">{u.email}</td>
                          <td className="max-w-[200px] px-5 py-3 align-top text-sm text-stone-600 dark:text-stone-400">
                            <span className="line-clamp-2" title={u.hearAboutLabel}>
                              {u.hearAboutLabel ?? '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3 align-top">
                            {u.exams?.length ? (
                              <div className="flex max-w-xs flex-wrap gap-1.5">
                                {u.exams.map((ex) => (
                                  <span
                                    key={ex.id}
                                    title={ex.code}
                                    className="inline-flex max-w-full items-center truncate rounded-lg border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-200"
                                  >
                                    {ex.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-stone-400 dark:text-stone-500">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                                u.role === 'ADMIN'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200'
                                  : u.role === 'INSTITUTION_ADMIN'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                              }`}
                            >
                              {ROLE_LABELS[u.role || ''] ?? u.role ?? '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {u.isActive ? (
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">Aktif</span>
                            ) : (
                              <span className="text-sm text-stone-400 dark:text-stone-500">Pasif</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-sm text-stone-500 dark:text-stone-400">{formatAdminDateTime(u.lastLoginAt)}</td>
                          <td className="px-5 py-3 text-sm text-stone-500 dark:text-stone-400">{formatAdminDateTime(u.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stone-200 px-5 py-3 dark:border-stone-800">
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Toplam {pagination.total} kullanıcı · Sayfa {page} / {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-lg border border-stone-200 p-2 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                      className="rounded-lg border border-stone-200 p-2 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Ana sayfa bölümleri: göster/gizle */}
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Ana Sayfa Bölümleri</h2>
          {siteSettingsLoadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {siteSettingsLoadError}
            </div>
          ) : null}
          {siteSettingsPatchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {siteSettingsPatchError}
            </div>
          ) : null}
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Ana sayfada (landing) hangi bölümlerin görüneceğini açıp kapatabilirsiniz.
          </p>
          {siteSettingsLoading ? (
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Yükleniyor...</span>
            </div>
          ) : (
            <div className="max-w-xl rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">Birlikte Çalıştığımız Kurumlar</p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    Ana sayfada &quot;Birlikte Çalıştığımız Kurumlar&quot; bölümü gösterilsin mi?
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={siteSettings?.landing_show_partners ?? true}
                  disabled={siteSettingsPatching}
                  onClick={() =>
                    patchSiteSettings({
                      landing_show_partners: !(siteSettings?.landing_show_partners ?? true),
                    })
                  }
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-stone-950 ${
                    siteSettings?.landing_show_partners ?? true
                      ? 'bg-primary-600'
                      : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition dark:bg-stone-200 ${
                      siteSettings?.landing_show_partners ?? true ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {siteSettings?.landing_show_partners ?? true ? 'Gösteriliyor' : 'Gizli'}
              </p>
            </div>
          )}
        </section>

        {/* Deneme sayfası: gelişmiş özellikler */}
        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Deneme Takibi Sayfası</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Kapalıyken kullanıcılar sadece mevcut deneme listesini görür; analiz, yeni kayıt formu, ders bazlı
            giriş ve KPSS önizlemesi gizlenir. Açtığınızda sayfa tam özelliklidir.
          </p>
          {siteSettingsLoading ? (
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Yükleniyor...</span>
            </div>
          ) : (
            <div className="max-w-xl rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">Gelişmiş deneme özellikleri</p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    Analiz grafiği, yeni deneme formu, ders ders D/Y/B, süre, not ve KPSS puan önizlemesi
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={siteSettings?.deneme_show_advanced ?? true}
                  disabled={siteSettingsPatching}
                  onClick={() =>
                    patchSiteSettings({
                      deneme_show_advanced: !(siteSettings?.deneme_show_advanced ?? true),
                    })
                  }
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-stone-950 ${
                    siteSettings?.deneme_show_advanced ?? true
                      ? 'bg-primary-600'
                      : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition dark:bg-stone-200 ${
                      siteSettings?.deneme_show_advanced ?? true ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {siteSettings?.deneme_show_advanced ?? true ? 'Açık — kullanıcılar tam deneme arayüzünü görür' : 'Kapalı — sadece liste'}
              </p>
            </div>
          )}
        </section>

        {/* İzleme: GTM, GA, AdSense */}
        <section className="mt-10 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary-600" aria-hidden />
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">İzleme & Analytics</h2>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Google Tag Manager, Google Analytics (GA4) ve AdSense kodlarını buradan açıp kapatabilir, kimliklerini
            güncelleyebilirsiniz. Değişiklikler tüm public sayfalarda geçerlidir.
          </p>
          <TrackingSettingsSection
            settings={siteSettings}
            loading={siteSettingsLoading}
            patching={siteSettingsPatching}
            onSave={patchSiteSettings}
          />
        </section>

        <AuditLogsSection />

        {/* Yönetim alanları */}
        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Yönetim Alanları</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Bu bölümde planlar, kurumlar, sınavlar ve sistem ayarları için gelişmiş yönetim ekranları olacak.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Planlar & abonelikler */}
            <Link
              href="/dashboard/super-admin/plans"
              className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-primary-800"
            >
              <div>
                <h3 className="mb-1 text-sm font-semibold text-stone-900 group-hover:text-primary-700 dark:text-stone-100 dark:group-hover:text-primary-400">
                  Planlar &amp; Abonelikler
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Plan listesi, fiyatlar, limitler ve özellikler. Kurum bazlı plan atama / değiştirme.
                </p>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 group-hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300 dark:group-hover:bg-primary-950/60">
                  Görüntüle
                </span>
              </div>
            </Link>

            {/* Sınav & içerik yönetimi */}
            <Link
              href="/dashboard/super-admin/exam-content"
              className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-primary-800"
            >
              <div>
                <h3 className="mb-1 text-sm font-semibold text-stone-900 group-hover:text-primary-700 dark:text-stone-100 dark:group-hover:text-primary-400">
                  Sınav &amp; İçerik Yönetimi
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Sınav şablonları, ders / konu ağaçları ve sistem genelinde kullanılacak içeriklerin yönetimi.
                </p>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 group-hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300 dark:group-hover:bg-primary-950/60">
                  Aç
                </span>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
