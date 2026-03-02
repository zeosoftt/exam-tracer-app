/**
 * Settings Page
 * Hesap, şifre, hedef puan, sınav ve uygulama ayarları
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
} from 'lucide-react';

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

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, examsRes] = await Promise.all([
          fetch('/api/user/settings'),
          fetch('/api/exams/available'),
        ]);
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.success && data.data) {
            setSettings(data.data);
            setFirstName(data.data.user?.firstName ?? '');
            setLastName(data.data.user?.lastName ?? '');
            setTargetScore(data.data.user?.targetScore != null ? String(data.data.user.targetScore) : '');
            setDailyStudyHours(data.data.user?.dailyStudyHours != null ? String(data.data.user.dailyStudyHours) : '');
            setExamId(data.data.activeExam?.id ?? '');
          }
        }
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          if (examsData.success && Array.isArray(examsData.data)) {
            setExams(examsData.data);
          }
        }
        const planRes = await fetch('/api/billing/plan');
        if (planRes.ok) {
          const planData = await planRes.json();
          if (planData.success && planData.data) {
            setPlanInfo(planData.data);
          }
        }
      } catch (e) {
        console.error(e);
        setMessage({ type: 'error', text: 'Ayarlar yüklenemedi.' });
      } finally {
        setLoading(false);
        setPlanLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
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

      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.data);
        setMessage({ type: 'success', text: 'Ayarlar kaydedildi.' });
        updateSession?.({ user: { name: data.data?.user?.name } });
      } else {
        setMessage({ type: 'error', text: data?.error?.message || 'Kaydetme başarısız.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Kaydetme başarısız.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMessage({ type: 'success', text: 'Şifre güncellendi.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPasswordMessage({ type: 'error', text: data?.error?.message || 'Şifre güncellenemedi.' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Şifre güncellenemedi.' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Geri</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Ayarlar
              </span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Ayarlar</h1>
          <p className="text-gray-600">Hesap, hedef ve sınav tercihlerinizi yönetin</p>
        </div>

        {message && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
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
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-blue-100 p-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hesap Ayarları</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
                <input
                  type="email"
                  value={session?.user?.email ?? settings?.user?.email ?? ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ad</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>

              {/* Şifre değiştir */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  <Lock className="h-4 w-4" />
                  {showPasswordForm ? 'Şifre değiştirmeyi kapat' : 'Şifre değiştir'}
                </button>
                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut şifre</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Mevcut şifreniz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yeni şifre</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="En az 8 karakter"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yeni şifre (tekrar)</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Yeni şifreyi tekrar girin"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
          </div>

          {/* Plan ve Faturalandırma */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-emerald-100 p-3">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Plan ve Faturalandırma</h2>
            </div>
            {planLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Plan bilgisi yükleniyor...</span>
              </div>
            ) : planInfo ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">{planInfo.planName}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {planInfo.planType}
                  </span>
                  {planInfo.subscriptionStatus === 'ACTIVE' && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {planInfo.planCode === 'FREE'
                    ? 'Sadece temel takip: sınav listesi, konu ilerlemesi ve basit dashboard.'
                    : 'Raporlar, dışa aktarma ve gelişmiş analitik dahil.'}
                </p>
                {planInfo.limits.length > 0 && (
                  <ul className="text-sm text-gray-600 space-y-1">
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
              <p className="text-sm text-gray-500">Plan bilgisi alınamadı.</p>
            )}
          </div>

          {/* Hedef ve çalışma */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-amber-100 p-3">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Çalışma Hedefleri</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hedef puan (0–100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn. 96"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Günlük çalışma saati (0–24)</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={dailyStudyHours}
                  onChange={(e) => setDailyStudyHours(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn. 4"
                />
              </div>
            </div>
          </div>

          {/* Sınav / Ders seçimi */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-purple-100 p-3">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Sınav / Ders</h2>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Aktif sınavınız</label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Sınav seçin</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.code})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                İlerleme ve konular bu sınava göre gösterilir. Değiştirdiğinizde yeni sınav aktif olur.
              </p>
            </div>
          </div>

          {/* Bildirimler (placeholder) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-pink-100 p-3">
                <Bell className="h-6 w-6 text-pink-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bildirimler</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">E-posta bildirimleri</div>
                  <div className="text-sm text-gray-600">Önemli güncellemeler için e-posta alın</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Çalışma hatırlatıcıları</div>
                  <div className="text-sm text-gray-600">Günlük hedefler için hatırlatıcılar</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </div>

          {/* Görünüm */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-gray-100 p-3">
                <Palette className="h-6 w-6 text-gray-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Görünüm</h2>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tema</label>
              <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Açık</option>
                <option>Koyu</option>
                <option>Sistem</option>
              </select>
            </div>
          </div>

          {/* Kaydet */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-70"
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
