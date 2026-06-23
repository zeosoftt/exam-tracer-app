import fs from 'fs';
import path from 'path';
import { parseInstitutionResultHtml } from '@/lib/deneme/institutionResult/parseResultHtml';
import { pickInstitutionScoreForExam } from '@/lib/deneme/institutionResult/pickInstitutionScore';

const fixturePath = path.join(__dirname, '../../../fixtures/pegem-kpss-sample.html');
const sampleHtml = fs.readFileSync(fixturePath, 'utf-8');
const sampleUrl = 'https://sonuc.pegemakademi.com/kpss/sample/';

describe('pickInstitutionScoreForExam', () => {
  it('selects P3 for KPSS exams from institution score table', () => {
    const parsed = parseInstitutionResultHtml(sampleHtml, sampleUrl);

    expect(pickInstitutionScoreForExam(parsed.scores, 'KPSS_LISANS')).toBeCloseTo(
      parsed.scores.find((entry) => entry.type.startsWith('P3'))?.score ?? 0,
      3,
    );
  });

  it('falls back to first positive score when primary key is missing', () => {
    const score = pickInstitutionScoreForExam(
      [{ type: 'EA Puanı', score: 72.5, rankKurum: null, rankNational: null }],
      'ALES',
    );
    expect(score).toBe(72.5);
  });
});
