import { buildSettingsPatchBody } from '@/lib/settings/buildSettingsPatchBody';
import { validatePasswordChange } from '@/lib/settings/validatePasswordChange';

describe('buildSettingsPatchBody', () => {
  it('maps empty numeric fields to null', () => {
    expect(
      buildSettingsPatchBody({
        firstName: 'Ada',
        lastName: 'Lovelace',
        examId: '',
        targetScore: '',
        dailyStudyHours: '',
        emailNotifications: true,
        studyReminders: false,
      }),
    ).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      examId: '',
      targetScore: null,
      dailyStudyHours: null,
      emailNotifications: true,
      studyReminders: false,
    });
  });

  it('parses numeric strings', () => {
    expect(
      buildSettingsPatchBody({
        firstName: '',
        lastName: '',
        examId: 'exam-1',
        targetScore: '96',
        dailyStudyHours: '4',
        emailNotifications: true,
        studyReminders: true,
      }).targetScore,
    ).toBe(96);
  });
});

describe('validatePasswordChange', () => {
  it('rejects mismatched passwords', () => {
    expect(validatePasswordChange('abcdefgh', 'different')).toEqual({
      valid: false,
      message: 'Yeni şifreler eşleşmiyor.',
    });
  });

  it('rejects weak passwords', () => {
    const result = validatePasswordChange('short', 'short');
    expect(result.valid).toBe(false);
  });

  it('accepts valid passwords', () => {
    expect(validatePasswordChange('ValidPass1', 'ValidPass1')).toEqual({ valid: true });
  });
});
