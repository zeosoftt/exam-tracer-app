import { calculateExamScore } from '@/lib/scoring/calculateExamScore';
import { subjectNet, spFromNet } from '@/lib/scoring/osymCore';

describe('osymCore', () => {
  it('computes net as right minus wrong/4', () => {
    expect(subjectNet(40, 4)).toBe(39);
  });

  it('computes SP from net with mean and std', () => {
    expect(spFromNet(30, 30, 10)).toBe(50);
    expect(spFromNet(40, 30, 10)).toBe(60);
  });
});

describe('calculateExamScore', () => {
  const gySubject = { subjectId: 'gy1', subjectName: 'Türkçe', right: 30, wrong: 6, empty: 24 };
  const gkSubject = { subjectId: 'gk1', subjectName: 'Tarih', right: 25, wrong: 5, empty: 30 };
  const kpssSections = [
    { code: 'GENEL_YETENEK', subjects: [{ id: 'gy1' }] },
    { code: 'GENEL_KULTUR', subjects: [{ id: 'gk1' }] },
  ];

  it('KPSS: P3 is primary score with default population', () => {
    const result = calculateExamScore({
      examCode: 'KPSS',
      breakdown: [gySubject, gkSubject],
      sections: kpssSections,
    });
    expect(result.sectionNets.GY).toBe(28.5);
    expect(result.sectionNets.GK).toBe(23.75);
    expect(result.variants.P1).toBeDefined();
    expect(result.variants.P2).toBeDefined();
    expect(result.variants.P3).toBeDefined();
    expect(result.calculatedScore).toBe(result.variants.P3);
    expect(result.scoreLabel).toBe('P3');
  });

  it('KPSS: uses population stats when provided', () => {
    const result = calculateExamScore({
      examCode: 'KPSS',
      breakdown: [gySubject, gkSubject],
      sections: kpssSections,
      populationStats: {
        GY: { mean: 28.5, std: 5, sampleSize: 10 },
        GK: { mean: 23.75, std: 5, sampleSize: 10 },
      },
    });
    expect(result.sectionSP.GY).toBe(50);
    expect(result.sectionSP.GK).toBe(50);
    expect(result.variants.P3).toBe(50);
  });

  it('E_YDS: score is (right/80)*100', () => {
    const result = calculateExamScore({
      examCode: 'E_YDS',
      breakdown: [],
      simpleTotals: { right: 60, wrong: 10, empty: 10 },
    });
    expect(result.calculatedScore).toBe(75);
    expect(result.variants.PUAN).toBe(75);
  });

  it('TYT: uses section nets and coefficients', () => {
    const result = calculateExamScore({
      examCode: 'YKS_TYT',
      breakdown: [
        { subjectId: 't1', subjectName: 'Türkçe', right: 30, wrong: 2, empty: 8 },
        { subjectId: 'm1', subjectName: 'Mat', right: 20, wrong: 4, empty: 16 },
        { subjectId: 's1', subjectName: 'Sosyal', right: 15, wrong: 1, empty: 4 },
        { subjectId: 'f1', subjectName: 'Fen', right: 10, wrong: 2, empty: 8 },
      ],
      sections: [
        { code: 'TURKCE', subjects: [{ id: 't1' }] },
        { code: 'TEMEL_MATEMATIK', subjects: [{ id: 'm1' }] },
        { code: 'SOSYAL_BILIMLER', subjects: [{ id: 's1' }] },
        { code: 'FEN_BILIMLERI', subjects: [{ id: 'f1' }] },
      ],
    });
    const expected =
      100 +
      29.5 * 3.2 +
      19 * 3.3 +
      14.75 * 3.0 +
      9.5 * 3.2;
    expect(result.calculatedScore).toBe(Math.min(500, Math.round(expected * 100) / 100));
    expect(result.variants.TYT).toBe(result.calculatedScore);
  });

  it('ALES: exposes SAY, EA, SOZ variants', () => {
    const result = calculateExamScore({
      examCode: 'ALES',
      breakdown: [
        { subjectId: 'say1', subjectName: 'Say', right: 30, wrong: 5, empty: 15 },
        { subjectId: 'soz1', subjectName: 'Söz', right: 25, wrong: 5, empty: 20 },
      ],
      sections: [
        { code: 'SAYISAL', subjects: [{ id: 'say1' }] },
        { code: 'SOZEL', subjects: [{ id: 'soz1' }] },
      ],
    });
    expect(result.variants.SAY).toBeDefined();
    expect(result.variants.EA).toBeDefined();
    expect(result.variants.SOZ).toBeDefined();
    expect(result.calculatedScore).toBe(result.variants.EA);
  });
});
