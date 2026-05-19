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
      }),
    ).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      examId: '',
      targetScore: null,
      dailyStudyHours: null,
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

  it('rejects short passwords', () => {
    expect(validatePasswordChange('short', 'short')).toEqual({
      valid: false,
      message: 'Yeni şifre en az 8 karakter olmalı.',
    });
  });

  it('accepts valid passwords', () => {
    expect(validatePasswordChange('longenough', 'longenough')).toEqual({ valid: true });
  });
});
