/**
 * Müfredat kataloğu için küçük DSL.
 *
 * Konu: `'Konu Adı'` (kod addan üretilir) veya `['MEVCUT_KOD', 'Konu Adı']`
 * (veritabanında zaten var olan bir konuyla eşleşmesi gerekiyorsa — ilerleme kayıtları
 * topicId'ye bağlı olduğu için mevcut kodlar asla değiştirilmez).
 */

export type CatalogTopicInput = string | readonly [code: string, name: string];

export type CatalogTopic = { code: string; name: string };
export type CatalogSubject = { code: string; name: string; topics: CatalogTopic[] };
export type CatalogSection = { code: string; name: string; subjects: CatalogSubject[] };
export type CatalogExam = {
  code: string;
  name: string;
  description: string;
  sections: CatalogSection[];
};

const TR_MAP: Record<string, string> = {
  ç: 'C', Ç: 'C', ğ: 'G', Ğ: 'G', ı: 'I', I: 'I', İ: 'I', i: 'I',
  ö: 'O', Ö: 'O', ş: 'S', Ş: 'S', ü: 'U', Ü: 'U', â: 'A', Â: 'A', î: 'I', û: 'U',
};

/** "Hücre Zarından Madde Geçişi" → "HUCRE_ZARINDAN_MADDE_GECISI" */
export function slugCode(name: string, maxLength = 60): string {
  const ascii = Array.from(name)
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return ascii.slice(0, maxLength).replace(/_+$/g, '');
}

function toTopic(input: CatalogTopicInput, prefix: string): CatalogTopic {
  if (typeof input === 'string') {
    return { code: `${prefix}${slugCode(input)}`, name: input };
  }
  return { code: input[0], name: input[1] };
}

/** `prefix`: yalnızca addan üretilen kodlara eklenir (ör. mevcut alt kod düzeni `MATEMATIK_...`). */
export function sub(
  code: string,
  name: string,
  topics: readonly CatalogTopicInput[],
  options?: { codePrefix?: string },
): CatalogSubject {
  const prefix = options?.codePrefix ?? '';
  return { code, name, topics: topics.map((t) => toTopic(t, prefix)) };
}

export function sec(code: string, name: string, subjects: CatalogSubject[]): CatalogSection {
  return { code, name, subjects };
}

export function exam(
  code: string,
  name: string,
  description: string,
  sections: CatalogSection[],
): CatalogExam {
  return { code, name, description, sections };
}

/** Katalog tutarlılığı: her seviyede kod benzersiz, boş ad yok. */
export function validateCatalog(exams: CatalogExam[]): string[] {
  const errors: string[] = [];
  const dup = (label: string, codes: string[]) => {
    const seen = new Set<string>();
    for (const c of codes) {
      if (!c) errors.push(`${label}: boş kod`);
      if (seen.has(c)) errors.push(`${label}: tekrar eden kod ${c}`);
      seen.add(c);
    }
  };
  dup('exam', exams.map((e) => e.code));
  for (const e of exams) {
    dup(`${e.code} section`, e.sections.map((s) => s.code));
    for (const s of e.sections) {
      dup(`${e.code}/${s.code} subject`, s.subjects.map((x) => x.code));
      for (const x of s.subjects) {
        if (x.topics.length === 0) errors.push(`${e.code}/${s.code}/${x.code}: konu yok`);
        dup(`${e.code}/${s.code}/${x.code} topic`, x.topics.map((t) => t.code));
        for (const t of x.topics) if (!t.name.trim()) errors.push(`${e.code}/${s.code}/${x.code}/${t.code}: boş ad`);
      }
    }
  }
  return errors;
}
