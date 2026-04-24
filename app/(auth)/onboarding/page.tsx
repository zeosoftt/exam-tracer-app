/**
 * Onboarding Page
 * Multi-step setup wizard for new users
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, ArrowRight, ArrowLeft, CheckCircle, Target, Clock } from 'lucide-react';
import Link from 'next/link';

type UserType = 'individual' | 'institution' | null;
type ExamType = {
  id: string;
  name: string;
  code: string;
  description?: string;
  minScore?: number;
  maxScore?: number;
  step?: number;
} | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [selectedExam, setSelectedExam] = useState<ExamType>(null);
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [dailyStudyHours, setDailyStudyHours] = useState<number | null>(null);
  const [availableExams, setAvailableExams] = useState<ExamType[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [examError, setExamError] = useState<string | null>(null);

  // Fetch available exams from API
  useEffect(() => {
    async function fetchExams() {
      try {
        setIsLoadingExams(true);
        setExamError(null);
        const response = await fetch('/api/exams/available');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAvailableExams(data.data || []);
          } else {
            setExamError('Sınavlar yüklenemedi. Lütfen sayfayı yenileyin.');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          setExamError(errorData.message || 'Sınavlar yüklenemedi. Lütfen sayfayı yenileyin.');
        }
      } catch (error) {
        console.error('Failed to fetch exams:', error);
        setExamError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
      } finally {
        setIsLoadingExams(false);
      }
    }

    fetchExams();
  }, []);

  // Get score range for selected exam
  const getScoreRange = () => {
    if (!selectedExam) return { min: 0, max: 100, step: 1 };
    const exam = availableExams.find(e => e?.id === selectedExam?.id);
    return {
      min: exam?.minScore || 0,
      max: exam?.maxScore || 100,
      step: exam?.step || 1,
    };
  };

  // Step 1: User Type Selection
  const Step1 = () => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">Nasıl kullanacaksınız?</h2>
        <p className="text-stone-600 dark:text-stone-400">Size en uygun seçeneği seçin</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <button
          onClick={() => {
            setUserType('individual');
            setStep(2);
          }}
          className="group relative rounded-2xl border-2 border-stone-200 bg-white p-8 text-left transition-all hover:border-primary-500 hover:shadow-xl dark:border-stone-700 dark:bg-stone-900/80 dark:hover:border-primary-600"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Bireysel Kullanım</h3>
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            Kendi sınav hazırlığınızı takip etmek için. Kişisel ilerlemenizi görüntüleyin ve yönetin.
          </p>
          <div className="mt-4 flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform">
            Seç
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => {
            setUserType('institution');
            setStep(2);
          }}
          className="group relative rounded-2xl border-2 border-stone-200 bg-white p-8 text-left transition-all hover:border-primary-400 hover:shadow-xl dark:border-stone-700 dark:bg-stone-900/80 dark:hover:border-primary-600"
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-teal-500 transition-transform group-hover:scale-110">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Kurumsal Kullanım</h3>
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            Kurumunuz için. Tüm ekibinizin sınav hazırlığını merkezi olarak yönetin ve takip edin.
          </p>
          <div className="mt-4 flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform">
            Seç
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  );

  // Step 2: Exam Selection
  const Step2 = () => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">Hangi sınava hazırlanıyorsunuz?</h2>
        <p className="text-stone-600 dark:text-stone-400">Size uygun sınavı listeden seçin</p>
      </div>

      <div className="custom-scrollbar max-h-[600px] overflow-y-auto pr-2">
        {isLoadingExams ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-primary-600 dark:border-stone-700"></div>
              <p className="text-stone-600 dark:text-stone-400">Sınavlar yükleniyor...</p>
            </div>
          </div>
        ) : examError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/40">
            <p className="mb-2 font-semibold text-red-800 dark:text-red-200">Hata</p>
            <p className="mb-4 text-sm text-red-600 dark:text-red-300">{examError}</p>
            <button
              onClick={() => {
                setIsLoadingExams(true);
                setExamError(null);
                fetch('/api/exams/available')
                  .then(res => res.json())
                  .then(data => {
                    if (data.success && data.data) {
                      setAvailableExams(data.data || []);
                    } else {
                      setExamError('Sınavlar yüklenemedi. Lütfen sayfayı yenileyin.');
                    }
                  })
                  .catch(() => {
                    setExamError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
                  })
                  .finally(() => setIsLoadingExams(false));
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : availableExams.length === 0 ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-900/40 dark:bg-yellow-950/30">
            <p className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">Henüz sınav bulunmuyor</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-300/90">Sistem yöneticisi ile iletişime geçin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {availableExams.map((exam) => (
            <button
              key={exam?.id}
              onClick={() => setSelectedExam(exam)}
              className={`group relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                selectedExam?.id === exam?.id
                  ? 'scale-[1.02] border-primary-500 bg-primary-50 shadow-soft-lg shadow-primary-500/20 dark:border-primary-600 dark:bg-primary-950/40'
                  : 'border-stone-200 bg-white hover:border-primary-300 hover:bg-stone-50 hover:shadow-lg dark:border-stone-700 dark:bg-stone-900/80 dark:hover:border-primary-700 dark:hover:bg-stone-800'
              }`}
            >
              {/* Selected indicator */}
              {selectedExam?.id === exam?.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              <div className="pr-8">
                <h3 className={`mb-2 text-lg font-bold leading-tight transition-colors ${
                  selectedExam?.id === exam?.id
                    ? 'text-primary-900 dark:text-primary-100'
                    : 'text-stone-900 group-hover:text-primary-600 dark:text-stone-100 dark:group-hover:text-primary-400'
                }`}>
                  {exam?.name}
                </h3>
                
                {exam?.description && (
                  <p className={`mb-3 text-sm leading-relaxed ${
                    selectedExam?.id === exam.id ? 'text-stone-700 dark:text-stone-300' : 'text-stone-600 dark:text-stone-400'
                  }`}>
                    {exam.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedExam?.id === exam?.id
                      ? 'border-primary-200 bg-primary-100 text-primary-700 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-200'
                      : 'border-transparent bg-stone-100 text-stone-700 group-hover:bg-primary-100 group-hover:text-primary-700 dark:bg-stone-800 dark:text-stone-300 dark:group-hover:bg-primary-950/40 dark:group-hover:text-primary-300'
                  }`}>
                    {exam?.code}
                  </span>
                </div>
              </div>
            </button>
          ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6">
        <button
          onClick={() => setStep(1)}
          className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </button>
        <button
          onClick={() => {
            if (selectedExam) {
              // Initialize target score with minimum
              const range = getScoreRange();
              setTargetScore(range.min);
              setStep(3);
            }
          }}
          disabled={!selectedExam}
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-primary-700 hover:to-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Devam Et
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Step 3: Target Score
  const Step3 = () => {
    const scoreRange = getScoreRange();
    const currentScore = targetScore ?? scoreRange.min;

    return (
      <div className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">Hedef Puanınız Nedir?</h2>
          <p className="text-stone-600 dark:text-stone-400">
            {selectedExam?.name} için hedeflediğiniz puanı seçin
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-primary-200 bg-gradient-to-br bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-950/30">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg dark:bg-stone-900">
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-4xl font-extrabold text-transparent">
                  {currentScore}
                </span>
              </div>
              <label className="mb-4 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Hedef Puan
              </label>
            </div>
            <input
              type="range"
              min={scoreRange.min}
              max={scoreRange.max}
              step={scoreRange.step}
              value={currentScore}
              onChange={(e) => setTargetScore(parseFloat(e.target.value))}
              className="h-4 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-primary-600 dark:bg-stone-700"
            />
            <div className="mt-3 flex justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="font-medium">{scoreRange.min}</span>
              <span className="font-medium">{scoreRange.max}</span>
            </div>
          </div>

          {/* Quick select buttons */}
          <div>
            <p className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-300">Hızlı Seçim:</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                Math.round(scoreRange.min + (scoreRange.max - scoreRange.min) * 0.5),
                Math.round(scoreRange.min + (scoreRange.max - scoreRange.min) * 0.6),
                Math.round(scoreRange.min + (scoreRange.max - scoreRange.min) * 0.7),
                Math.round(scoreRange.min + (scoreRange.max - scoreRange.min) * 0.8),
              ].map((score) => (
                <button
                  key={score}
                  onClick={() => setTargetScore(score)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    targetScore === score
                      ? 'scale-105 bg-primary-600 text-white shadow-lg'
                      : 'border-2 border-stone-200 bg-white text-stone-700 hover:border-primary-300 hover:bg-primary-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-primary-700 dark:hover:bg-stone-700'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>

      <div className="flex items-center justify-between pt-6">
          <button
            onClick={() => setStep(2)}
            className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </button>
          <button
            onClick={() => {
              if (targetScore !== null) {
                setStep(4);
              }
            }}
            disabled={targetScore === null}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-primary-700 hover:to-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Devam Et
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Step 4: Daily Study Hours
  const Step4 = () => {
    const studyHoursOptions = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
      <div className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">Günlük Çalışma Hedefiniz</h2>
          <p className="text-stone-600 dark:text-stone-400">Günde kaç saat çalışmayı hedefliyorsunuz?</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {studyHoursOptions.map((hours) => (
            <button
              key={hours}
              onClick={() => setDailyStudyHours(hours)}
              className={`relative rounded-2xl border-2 p-6 text-center transition-all duration-300 ${
                dailyStudyHours === hours
                  ? 'scale-105 border-primary-500 bg-primary-50 shadow-soft-lg shadow-primary-500/20 dark:border-primary-600 dark:bg-primary-950/40'
                  : 'border-stone-200 bg-white hover:border-primary-300 hover:shadow-lg dark:border-stone-700 dark:bg-stone-900/80 dark:hover:border-primary-700'
              }`}
            >
              {dailyStudyHours === hours && (
                <div className="absolute right-3 top-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-500 shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              <div className={`mb-2 text-4xl font-bold ${
                dailyStudyHours === hours ? 'text-primary-900 dark:text-primary-100' : 'text-stone-900 dark:text-stone-100'
              }`}>
                {hours}
              </div>
              <div className={`text-sm font-semibold ${
                dailyStudyHours === hours ? 'text-primary-700 dark:text-primary-300' : 'text-stone-600 dark:text-stone-400'
              }`}>
                Saat
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-950/30">
          <p className="text-sm text-primary-800 dark:text-primary-200">
            <strong>💡 İpucu:</strong> Gerçekçi bir hedef belirleyin. Düzenli çalışma, uzun saatler çalışmaktan daha etkilidir.
          </p>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            onClick={() => setStep(3)}
            className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </button>
          <button
            onClick={() => {
              if (dailyStudyHours !== null) {
                setStep(5);
              }
            }}
            disabled={dailyStudyHours === null}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-primary-700 hover:to-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Devam Et
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Step 5: Registration Summary
  const Step5 = () => {
    const handleComplete = () => {
      // Store onboarding data in sessionStorage
      const onboardingData = {
        userType,
        examId: selectedExam?.id,
        examName: selectedExam?.name,
        examCode: selectedExam?.code,
        targetScore,
        dailyStudyHours,
      };
      sessionStorage.setItem('onboarding', JSON.stringify(onboardingData));
      
      // Redirect to registration with query params
      router.push(`/auth/register?userType=${userType}&examId=${selectedExam?.id}&examCode=${selectedExam?.code}&targetScore=${targetScore}&dailyStudyHours=${dailyStudyHours}`);
    };

    return (
      <div className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">Hemen Başlayın</h2>
          <p className="text-stone-600 dark:text-stone-400">Bilgilerinizi tamamlayın ve hesabınızı oluşturun</p>
        </div>

        <div className="space-y-4 rounded-2xl bg-stone-50 p-6 dark:bg-stone-800/60">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary-600"></div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Kullanım Tipi</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                {userType === 'individual' ? 'Bireysel Kullanım' : 'Kurumsal Kullanım'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary-600"></div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Seçilen Sınav</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{selectedExam?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-600"></div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Hedef Puan</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{targetScore}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-orange-600"></div>
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Günlük Çalışma Hedefi</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{dailyStudyHours} saat</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            onClick={() => setStep(4)}
            className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </button>
          <button
            onClick={handleComplete}
            disabled={false}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-primary-700 hover:to-primary-600 disabled:opacity-50"
          >
            Kayıt Ol
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Adım {step} / 5</span>
            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">%{Math.round((step / 5) * 100)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90 sm:p-8 sm:p-12">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
 