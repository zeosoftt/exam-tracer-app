import fs from 'fs';
import path from 'path';
import { parsePegemResultHtml } from '@/lib/deneme/pegem/parsePegemResultHtml';
import { validatePegemResultUrl } from '@/lib/deneme/pegem/validatePegemUrl';

const fixturePath = path.join(__dirname, '../../../fixtures/pegem-kpss-sample.html');
const sampleHtml = fs.readFileSync(fixturePath, 'utf-8');
const sampleUrl =
  'https://sonuc.pegemakademi.com/kpss/090B5102FC35457BA44863AE59DECE62/FLJONYQOH2/';

describe('validateInstitutionResultUrl', () => {
  it('accepts pegem result URLs', async () => {
    const url = await validatePegemResultUrl(sampleUrl);
    expect(url.hostname).toBe('sonuc.pegemakademi.com');
  });

  it('accepts other institution domains with https path', async () => {
    const url = await validatePegemResultUrl('https://example.com/kpss/token/');
    expect(url.hostname).toBe('example.com');
  });

  it('rejects http links', async () => {
    await expect(validatePegemResultUrl('http://sonuc.pegemakademi.com/kpss/x/')).rejects.toThrow(/https/);
  });

  it('rejects localhost', async () => {
    await expect(validatePegemResultUrl('https://localhost/kpss/x/')).rejects.toThrow(/desteklenmiyor/);
  });
});

describe('parseInstitutionResultHtml', () => {
  const parsed = parsePegemResultHtml(sampleHtml, sampleUrl);

  it('extracts source metadata', () => {
    expect(parsed.sourceUrl).toBe(sampleUrl);
    expect(parsed.sourceHost).toBe('sonuc.pegemakademi.com');
    expect(parsed.platform).toBe('verisayar');
  });

  it('extracts exam metadata', () => {
    expect(parsed.examName).toBe('Kpss Türkiye Geneli 4 2026');
    expect(parsed.examDate).toBe('2026-03-10');
    expect(parsed.examNumber).toBe('4');
    expect(parsed.institution).toContain('MODA KURS');
    expect(parsed.studentName).toBe('AYDOĞAN ZELİHA');
  });

  it('extracts subject nets', () => {
    const turkce = parsed.subjects.find((s) => s.name === 'Türkçe');
    const matematik = parsed.subjects.find((s) => s.name === 'Matematik');
    expect(turkce).toMatchObject({ questionCount: 30, right: 9, wrong: 6, net: 7.5, empty: 15 });
    expect(matematik).toMatchObject({ questionCount: 30, right: 9, wrong: 0, net: 9, empty: 21 });
  });

  it('extracts section totals', () => {
    expect(parsed.sectionTotals.generalAbility).toMatchObject({ right: 18, wrong: 6, net: 16.5 });
    expect(parsed.sectionTotals.generalCulture).toMatchObject({ right: 1, wrong: 1, net: 0.75 });
  });

  it('extracts score types', () => {
    expect(parsed.scores.length).toBeGreaterThanOrEqual(4);
    expect(parsed.scores.find((s) => s.type.startsWith('P1'))?.score).toBeCloseTo(51.775, 3);
  });

  it('extracts topic breakdown', () => {
    expect(parsed.topics.length).toBeGreaterThan(50);
    const sayilar = parsed.topics.find((t) => t.topicName === 'SAYILAR');
    expect(sayilar).toMatchObject({
      subjectName: 'Matematik',
      questionCount: 4,
      right: 4,
      wrong: 0,
      empty: 0,
      successRate: 100,
    });
  });

  it('computes overall totals from subjects', () => {
    expect(parsed.totals.right).toBe(19);
    expect(parsed.totals.wrong).toBe(7);
    expect(parsed.totals.net).toBeCloseTo(17.25, 2);
  });
});
