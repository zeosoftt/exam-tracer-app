import {
  institutionSourceUrlMatches,
  normalizeInstitutionSourceUrl,
} from '@/lib/deneme/institutionResult/normalizeSourceUrl';

describe('normalizeInstitutionSourceUrl', () => {
  it('normalizes host case and trailing slash', () => {
    expect(normalizeInstitutionSourceUrl('https://Sonuc.Pegemakademi.com/kpss/abc')).toBe(
      'https://sonuc.pegemakademi.com/kpss/abc/',
    );
  });

  it('matches urls with and without trailing slash', () => {
    const a = 'https://sonuc.indeksakademi.com/kpss/token/karne/';
    const b = 'https://sonuc.indeksakademi.com/kpss/token/karne';
    expect(institutionSourceUrlMatches(a, b)).toBe(true);
  });
});
