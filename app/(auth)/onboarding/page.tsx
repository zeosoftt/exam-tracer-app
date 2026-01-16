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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoadingExams, setIsLoadingExams] = useState(true);

  // Fetch available exams from API
  useEffect(() => {
    async function fetchExams() {
      try {
        setIsLoadingExams(true);
        const response = await fetch('/api/exams/available');
        if (response.ok) {
          const data = await response.json();
          setAvailableExams(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch exams:', error);
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Nasıl kullanacaksınız?</h2>
        <p className="text-gray-600">Size en uygun seçeneği seçin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => {
            setUserType('individual');
            setStep(2);
          }}
          className="group relative p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all text-left"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Bireysel Kullanım</h3>
          </div>
          <p className="text-gray-600">
            Kendi sınav hazırlığınızı takip etmek için. Kişisel ilerlemenizi görüntüleyin ve yönetin.
          </p>
          <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
            Seç
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => {
            setUserType('institution');
            setStep(2);
          }}
          className="group relative p-8 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all text-left"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Kurumsal Kullanım</h3>
          </div>
          <p className="text-gray-600">
            Kurumunuz için. Tüm ekibinizin sınav hazırlığını merkezi olarak yönetin ve takip edin.
          </p>
          <div className="mt-4 flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Hangi sınava hazırlanıyorsunuz?</h2>
        <p className="text-gray-600">Size uygun sınavı listeden seçin</p>
      </div>

      <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableExams.map((exam) => (
            <button
              key={exam?.id}
              onClick={() => setSelectedExam(exam)}
              className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                selectedExam?.id === exam?.id
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 shadow-xl shadow-blue-500/20 scale-[1.02]'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white hover:bg-gray-50'
              }`}
            >
              {/* Selected indicator */}
              {selectedExam?.id === exam?.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              <div className="pr-8">
                <h3 className={`font-bold text-lg mb-2 leading-tight transition-colors ${
                  selectedExam?.id === exam?.id
                    ? 'text-blue-900'
                    : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  {exam?.name}
                </h3>
                
                {exam?.description && (
                  <p className={`text-sm mb-3 leading-relaxed ${
                    selectedExam?.id === exam.id ? 'text-gray-700' : 'text-gray-600'
                  }`}>
                    {exam.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedExam?.id === exam?.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                  }`}>
                    {exam?.code}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <button
          onClick={() => setStep(1)}
          className="inline-flex items-center px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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
          className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hedef Puanınız Nedir?</h2>
          <p className="text-gray-600">
            {selectedExam?.name} için hedeflediğiniz puanı seçin
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
                <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentScore}
                </span>
              </div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
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
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-3">
              <span className="font-medium">{scoreRange.min}</span>
              <span className="font-medium">{scoreRange.max}</span>
            </div>
          </div>

          {/* Quick select buttons */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Hızlı Seçim:</p>
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
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    targetScore === score
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
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
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Günlük Çalışma Hedefiniz</h2>
          <p className="text-gray-600">Günde kaç saat çalışmayı hedefliyorsunuz?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {studyHoursOptions.map((hours) => (
            <button
              key={hours}
              onClick={() => setDailyStudyHours(hours)}
              className={`relative p-6 rounded-2xl border-2 text-center transition-all duration-300 ${
                dailyStudyHours === hours
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 shadow-xl shadow-purple-500/20 scale-105'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-lg bg-white'
              }`}
            >
              {dailyStudyHours === hours && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              <div className={`text-4xl font-bold mb-2 ${
                dailyStudyHours === hours ? 'text-purple-900' : 'text-gray-900'
              }`}>
                {hours}
              </div>
              <div className={`text-sm font-semibold ${
                dailyStudyHours === hours ? 'text-purple-700' : 'text-gray-600'
              }`}>
                Saat
              </div>
            </button>
          ))}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-800">
            <strong>💡 İpucu:</strong> Gerçekçi bir hedef belirleyin. Düzenli çalışma, uzun saatler çalışmaktan daha etkilidir.
          </p>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            onClick={() => setStep(3)}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hemen Başlayın</h2>
          <p className="text-gray-600">Bilgilerinizi tamamlayın ve hesabınızı oluşturun</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Kullanım Tipi</p>
              <p className="font-semibold text-gray-900">
                {userType === 'individual' ? 'Bireysel Kullanım' : 'Kurumsal Kullanım'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Seçilen Sınav</p>
              <p className="font-semibold text-gray-900">{selectedExam?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Hedef Puan</p>
              <p className="font-semibold text-gray-900">{targetScore}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Günlük Çalışma Hedefi</p>
              <p className="font-semibold text-gray-900">{dailyStudyHours} saat</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            onClick={() => setStep(4)}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </button>
          <button
            onClick={handleComplete}
            disabled={false}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
          >
            Kayıt Ol
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Adım {step} / 5</span>
            <span className="text-sm font-medium text-gray-600">%{Math.round((step / 5) * 100)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
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
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
 