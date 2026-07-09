'use client';

import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { useSession } from 'next-auth/react';
import {
  fetchSettingsPageBundle,
  patchUserSettings,
  changeUserPassword,
} from '@/lib/client-api/userSettings';
import { getApiErrorMessage } from '@/lib/client-api/http';
import { buildSettingsPatchBody, type SettingsFormFields } from '@/lib/settings/buildSettingsPatchBody';
import { validatePasswordChange } from '@/lib/settings/validatePasswordChange';
import {
  applySettingsDataToFormFields,
  parseSettingsPageBundle,
} from '@/lib/settings/parseSettingsPageBundle';
import type {
  PlanInfo,
  SettingsData,
  SettingsExamOption,
  SettingsFlashMessage,
} from '@/lib/settings/settingsTypes';

export function useSettingsPage() {
  const { data: session, update: updateSession } = useSession();

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [exams, setExams] = useState<SettingsExamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<SettingsFlashMessage | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [targetScore, setTargetScore] = useState('');
  const [dailyStudyHours, setDailyStudyHours] = useState('');
  const [examId, setExamId] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<SettingsFlashMessage | null>(null);

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [savedSnapshot, setSavedSnapshot] = useState<SettingsFormFields | null>(null);
  const initialFetchDoneRef = useRef(false);

  const currentFormFields = useMemo<SettingsFormFields>(
    () => ({
      firstName,
      lastName,
      examId,
      targetScore,
      dailyStudyHours,
      emailNotifications,
      studyReminders,
    }),
    [firstName, lastName, examId, targetScore, dailyStudyHours, emailNotifications, studyReminders],
  );

  const isDirty =
    savedSnapshot !== null &&
    JSON.stringify(currentFormFields) !== JSON.stringify(savedSnapshot);

  const fetchSettingsPageData = useCallback(async () => {
    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;
    try {
      const bundle = await fetchSettingsPageBundle();
      const parsed = parseSettingsPageBundle(bundle);

      if (parsed.settings) {
        const fields = applySettingsDataToFormFields(parsed.settings);
        startTransition(() => {
          setSettings(parsed.settings);
          setFirstName(fields.firstName);
          setLastName(fields.lastName);
          setTargetScore(fields.targetScore);
          setDailyStudyHours(fields.dailyStudyHours);
          setExamId(fields.examId);
          setEmailNotifications(fields.emailNotifications);
          setStudyReminders(fields.studyReminders);
          setSavedSnapshot(fields);
        });
      }

      if (parsed.exams.length > 0) {
        startTransition(() => setExams(parsed.exams));
      }
      if (parsed.planInfo) {
        startTransition(() => setPlanInfo(parsed.planInfo));
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

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const handleSaveSettings = useCallback(async () => {
    setMessage(null);
    setSaving(true);
    try {
      const body = buildSettingsPatchBody({
        firstName,
        lastName,
        examId,
        targetScore,
        dailyStudyHours,
        emailNotifications,
        studyReminders,
      });

      const { ok, result: data } = await patchUserSettings(body);
      if (ok) {
        const payload = data as { data?: SettingsData };
        const next = payload.data;
        if (next) {
          startTransition(() => setSettings(next));
          updateSession?.({ user: { name: next.user?.name } });
        }
        setSavedSnapshot(currentFormFields);
        setMessage({ type: 'success', text: 'Ayarlar kaydedildi.' });
      } else {
        setMessage({
          type: 'error',
          text: getApiErrorMessage(data, 'Kaydetme başarısız.'),
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Kaydetme başarısız.' });
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, examId, targetScore, dailyStudyHours, emailNotifications, studyReminders, updateSession, currentFormFields]);

  const handleChangePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordMessage(null);

      const validation = validatePasswordChange(newPassword, confirmPassword);
      if (!validation.valid) {
        setPasswordMessage({ type: 'error', text: validation.message });
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
          setPasswordMessage({
            type: 'error',
            text: getApiErrorMessage(data, 'Şifre güncellenemedi.'),
          });
        }
      } catch {
        setPasswordMessage({ type: 'error', text: 'Şifre güncellenemedi.' });
      } finally {
        setChangingPassword(false);
      }
    },
    [newPassword, confirmPassword, currentPassword],
  );

  const email = session?.user?.email ?? settings?.user?.email ?? '';

  return {
    email,
    settings,
    exams,
    loading,
    saving,
    message,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    targetScore,
    setTargetScore,
    dailyStudyHours,
    setDailyStudyHours,
    examId,
    setExamId,
    emailNotifications,
    setEmailNotifications,
    studyReminders,
    setStudyReminders,
    showPasswordForm,
    setShowPasswordForm,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    changingPassword,
    passwordMessage,
    planInfo,
    planLoading,
    isDirty,
    handleSaveSettings,
    handleChangePassword,
  };
}

export type SettingsPageState = ReturnType<typeof useSettingsPage>;
