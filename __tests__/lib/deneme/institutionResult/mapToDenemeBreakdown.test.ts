import { mapInstitutionSubjectsToBreakdown } from '@/lib/deneme/institutionResult/mapToDenemeBreakdown';
import type { InstitutionSubjectResult } from '@/lib/deneme/institutionResult/types';

const kpssExamSubjects = [
  { id: 'gy-tr', name: 'Türkçe' },
  { id: 'gy-mat', name: 'Matematik' },
  { id: 'gy-geo', name: 'Geometri' },
  { id: 'gk-tarih', name: 'Tarih' },
  { id: 'gk-cog', name: 'Coğrafya' },
  { id: 'gk-vat', name: 'Vatandaşlık' },
];

const institutionSubjects: InstitutionSubjectResult[] = [
  { name: 'Türkçe', questionCount: 30, right: 9, wrong: 6, empty: 15, net: 7.5 },
  { name: 'Matematik', questionCount: 30, right: 9, wrong: 0, empty: 21, net: 9 },
  { name: 'Tarih', questionCount: 27, right: 1, wrong: 1, empty: 25, net: 0.75 },
  { name: 'Coğrafya', questionCount: 18, right: 0, wrong: 0, empty: 18, net: 0 },
  { name: 'Vatandaş', questionCount: 9, right: 0, wrong: 0, empty: 9, net: 0 },
];

describe('mapInstitutionSubjectsToBreakdown', () => {
  it('maps institution subjects to exam breakdown with aliases', () => {
    const { breakdown, unmatchedInstitutionSubjects } = mapInstitutionSubjectsToBreakdown(
      institutionSubjects,
      kpssExamSubjects,
    );

    expect(unmatchedInstitutionSubjects).toEqual([]);
    expect(breakdown).toHaveLength(6);

    const turkce = breakdown.find((item) => item.subjectName === 'Türkçe');
    const vatandaslik = breakdown.find((item) => item.subjectName === 'Vatandaşlık');
    const geometri = breakdown.find((item) => item.subjectName === 'Geometri');

    expect(turkce).toMatchObject({ right: 9, wrong: 6, empty: 15 });
    expect(vatandaslik).toMatchObject({ right: 0, wrong: 0, empty: 9 });
    expect(geometri).toMatchObject({ right: 0, wrong: 0, empty: 0 });
  });
});
