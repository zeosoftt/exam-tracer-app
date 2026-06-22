/** Kurum sonuç sayfasındaki kısa/eksik ders adları → sınav yapısındaki ad */
const INSTITUTION_TO_EXAM_ALIASES: Record<string, string[]> = {
  vatandas: ['vatandaşlık'],
  'vatandaş': ['vatandaşlık'],
  'vatandaşlık bilgisi': ['vatandaşlık'],
  'genel yetenek': ['gen.yet.'],
  'genel kültür': ['gen.kül.'],
  'temel mat': ['temel matematik'],
};

export function normalizeSubjectName(name: string): string {
  return name
    .trim()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('tr-TR');
}

export function institutionSubjectLookupKeys(name: string): string[] {
  const normalized = normalizeSubjectName(name);
  const keys = [normalized];
  const aliases = INSTITUTION_TO_EXAM_ALIASES[normalized];
  if (aliases) {
    for (const alias of aliases) keys.push(normalizeSubjectName(alias));
  }
  return keys;
}
