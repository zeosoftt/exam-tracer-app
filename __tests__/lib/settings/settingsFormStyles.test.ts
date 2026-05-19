import { formatExamOptionLabel } from '@/lib/settings/settingsFormStyles';

describe('formatExamOptionLabel', () => {
  it('does not duplicate code when name already contains it', () => {
    expect(formatExamOptionLabel('KPSS (Kamu Personeli Seçme Sınavı)', 'KPSS')).toBe(
      'KPSS (Kamu Personeli Seçme Sınavı)',
    );
  });

  it('appends code when not present in name', () => {
    expect(formatExamOptionLabel('ALES', 'ALES')).toBe('ALES');
    expect(formatExamOptionLabel('Akademik Personel', 'ALES')).toBe('Akademik Personel (ALES)');
  });
});
