/**
 * Settings Page
 * Hesap, şifre, hedef puan, sınav ve uygulama ayarları
 */

'use client';

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  User,
  Bell,
  Palette,
  Save,
  Lock,
  Target,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  LifeBuoy,
} from 'lucide-react';
import { ThemeSelect } from '@/components/theme/ThemeSelect';
import { ToggleSwitch, SettingsSectionCard } from '@/components/settings/SettingsUi';
import {
  formatExamOptionLabel,
  settingsFieldClass,
  settingsFieldDisabledClass,
  settingsLabelClass,
  settingsSelectClass,
  settingsHelperClass,
} from '@/lib/settings/settingsFormStyles';
import {
  fetchSettingsPageBundle,
  patchUserSettings,
  changeUserPassword,
} from '@/lib/client-api/userSettings';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false, loading: () => null },
);

type ExamOption = { id: string; name: string; code: string };
type SettingsData = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    targetScore: number | null;
    dailyStudyHours: number | null;
  };
  activeExam: { id: string; name: string; code: string } | null;
};
type PlanInfo = {
  planCode: string;
  planName: string;
  planType: string;
  subscriptionStatus: string;
  limits: Array<{ resourceType: string; current: number; limit: number; allowed: boolean }>;
  features: string[];
  expiresAt: string | null;
};

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [targetScore, setTargetScore] = useState<string>('');
  const [dailyStudyHours, setDailyStudyHours] = useState<string>('');
  const [examId, setExamId] = useState<string>('');

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const initialFetchDoneRef = useRef(false);

  const fetchSettingsPageData = useCallback(async () => {
    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;
    try {
      const { settings: settingsRes, exams: examsList, plan: planRes } =
        await fetchSettingsPageBundle();
      if (settingsRes.ok) {
        const data = settingsRes.body as {
          success?: boolean;
          data?: SettingsData;
        };
        if (data.success && data.data) {
          const d = data.data;
          startTransition(() => {
            setSettings(d);
            setFirstName(d.user?.firstName ?? '');
            setLastName(d.user?.lastName ?? '');
            setTargetScore(d.user?.targetScore != null ? String(d.user.targetScore) : '');
            setDailyStudyHours(d.user?.dailyStudyHours != null ? String(d.user.dailyStudyHours) : '');
            setExamId(d.activeExam?.id ?? '');
          });
        }
      }
      if (examsList.length > 0) {
        startTransition(() => setExams(examsList));
      }
      if (planRes.ok) {
        const planData = planRes.body as { success?: boolean; data?: PlanInfo };
        if (planData.success && planData.data) {
          const p = planData.data;
          startTransition(() => setPlanInfo(p));
        }
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Ayarlar yüklenemedi.' });
    } finally {
      setLoading(false);
      setPlanLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettingsPageData();
  }, [fetchSettingsPageData]);

  const handleSaveSettings = useCallback(async () => {
    setMessage(null);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        examId: examId === '' ? '' : examId || undefined,
      };
      const ts = targetScore.trim();
      const dh = dailyStudyHours.trim();
      if (ts !== '') body.targetScore = parseInt(ts, 10);
      else body.targetScore = null;
      if (dh !== '') body.dailyStudyHours = parseInt(dh, 10);
      else body.dailyStudyHours = null;

      const { ok, result: data } = await patchUserSettings(body);
      if (ok) {
        const payload = data as { data?: SettingsData };
        const next = payload.data;
        if (next) {
          startTransition(() => setSettings(next));
          updateSession?.({ user: { name: next.user?.name } });
        }
        setMessage({ type: 'success', text: 'Ayarlar kaydedildi.' });
      } else {
        const err = data as { error?: { message?: string } };
        setMessage({
          type: 'error',
          text: err?.error?.message || 'Kaydetme başarısız.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Kaydetme başarısız.' });
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, examId, targetScore, dailyStudyHours, updateSession]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalı.' });
      return;
    }
    setChangingPassword(true);
    try {
      const { ok, result: data } = await changeUserPassword({
        currentPassword,
        newPassword,
      });
      if (ok) {
        setPasswordMessage({ type: 'success', text: 'Şifre güncellendi.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        const err = data as { error?: { message?: string } };
        setPasswordMessage({
          type: 'error',
          text: err?.error?.message || 'Şifre güncellenemedi.',
        });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Şifre güncellenemedi.' });
    } finally {
      setChangingPassword(false);
    }
  }, [newPassword, confirmPassword, currentPassword]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-stone-700 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Geri</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">Ayarlar</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">Ayarlar</h1>
          <p className="text-stone-600 dark:text-stone-400">Hesap, görünüm, hedef ve sınav tercihleri</p>
        </div>

        <Link
          href="/destek"
          className="mb-8 flex items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50/90 p-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-primary-900/50 dark:bg-primary-950/30 dark:hover:border-primary-800"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
            <LifeBuoy className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-bold text-stone-900 dark:text-stone-100">Sorun mu yaşıyorsunuz?</span>
            <span className="mt-0.5 block text-xs text-stone-600 dark:text-stone-400">
              Destek ekibine yazın — teknik sorun, hesap veya geri bildirim.
            </span>
          </span>
        </Link>

        {message && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Hesap Ayarları */}
          <SettingsSectionCard
            title="Hesap Ayarları"
            icon={<User className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
          >
            <div className="space-y-4">
              <div>
                <label className={settingsLabelClass}>E-posta</label>
                <input
                  type="email"
                  value={session?.user?.email ?? settings?.user?.email ?? ''}
                  disabled
                  className={settingsFieldDisabledClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Şifre değiştir */}
              <div className="pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Lock className="h-4 w-4" />
                  {showPasswordForm ? 'Şifre değiştirmeyi kapat' : 'Şifre değiştir'}
                </button>
                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="mt-4 space-y-4 p-4 bg-stone-50 rounded-xl">
                    {passwordMessage && (
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          passwordMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {passwordMessage.type === 'success' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {passwordMessage.text}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Mevcut şifre</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Mevcut şifreniz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Yeni şifre</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="En az 8 karakter"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Yeni şifre (tekrar)</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Yeni şifreyi tekrar girin"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {changingPassword ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      Şifreyi güncelle
                    </button>
                  </form>
                )}
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            title="Plan ve Faturalandırma"
            icon={<CreditCard className="h-6 w-6 text-emerald-600" />}
            iconClassName="bg-emerald-100"
          >
            {planLoading ? (
              <div className="flex items-center gap-2 text-stone-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Plan bilgisi yükleniyor...</span>
              </div>
            ) : planInfo ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{planInfo.planName}</span>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                    {planInfo.planType}
                  </span>
                  {planInfo.subscriptionStatus === 'ACTIVE' && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-600">
                  {planInfo.planCode === 'FREE'
                    ? 'Sadece temel takip: sınav listesi, konu ilerlemesi ve basit dashboard.'
                    : 'Raporlar, dışa aktarma ve gelişmiş analitik dahil.'}
                </p>
                {planInfo.planCode === 'FREE' && (
                  <ShopierCheckoutLink className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-95 sm:w-auto sm:px-6">
                    Pro planı Shopier&apos;da satın al
                  </ShopierCheckoutLink>
                )}
                {planInfo.limits.length > 0 && (
                  <ul className="text-sm text-stone-600 space-y-1">
                    {planInfo.limits.map((l) => (
                      <li key={l.resourceType}>
                        {l.resourceType === 'EXAMS' && `Sınav: ${l.current} / ${l.limit}`}
                        {l.resourceType === 'STUDENTS' && `Öğrenci: ${l.current} / ${l.limit}`}
                        {l.resourceType === 'USERS' && `Kullanıcı: ${l.current} / ${l.limit}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-500">Plan bilgisi alınamadı.</p>
            )}
          </SettingsSectionCard>

          <SettingsSectionCard
            title="Çalışma Hedefleri"
            icon={<Target className="h-6 w-6 text-amber-600" />}
            iconClassName="bg-amber-100"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={settingsLabelClass}>Hedef puan (0–100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className={settingsFieldClass}
                  placeholder="Örn. 96"
                />
              </div>
              <div>
                <label className={settingsLabelClass}>Günlük çalışma saati (0–24)</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={dailyStudyHours}
                  onChange={(e) => setDailyStudyHours(e.target.value)}
                  className={settingsFieldClass}
                  placeholder="Örn. 4"
                />
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            title="Sınav / Ders"
            icon={<BookOpen className="h-6 w-6 text-primary-600" />}
          >
            <div>
              <label className={settingsLabelClass}>Aktif sınavınız</label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className={settingsSelectClass}
              >
                <option value="">Sınav seçin</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {formatExamOptionLabel(exam.name, exam.code)}
                  </option>
                ))}
              </select>
              <p className={settingsHelperClass}>
                İlerleme ve konular bu sınava göre gösterilir. Değiştirdiğinizde yeni sınav aktif olur.
              </p>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            title="Bildirimler"
            icon={<Bell className="h-6 w-6 text-pink-600" />}
            iconClassName="bg-pink-100"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">E-posta bildirimleri</div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">Önemli güncellemeler için e-posta alın</div>
                </div>
                <ToggleSwitch defaultChecked aria-label="E-posta bildirimleri" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">Çalışma hatırlatıcıları</div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">Günlük hedefler için hatırlatıcılar</div>
                </div>
                <ToggleSwitch defaultChecked aria-label="Çalışma hatırlatıcıları" />
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            title="Görünüm"
            icon={<Palette className="h-6 w-6 text-stone-600 dark:text-stone-300" />}
            iconClassName="bg-stone-100 dark:bg-stone-800"
            description="Tercih bu cihazda saklanır; ister buradan ister üst menüdeki ikonlardan değiştirin."
          >
            <ThemeSelect />
          </SettingsSectionCard>

          {/* Kaydet */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-700 to-primary-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Değişiklikleri kaydet
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
