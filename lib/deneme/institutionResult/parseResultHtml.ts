import { detectInstitutionResultPage } from '@/lib/deneme/institutionResult/detectResultPage';
import type {
  InstitutionResultImport,
  InstitutionScoreResult,
  InstitutionSectionTotal,
  InstitutionSubjectResult,
  InstitutionTopicResult,
} from '@/lib/deneme/institutionResult/types';

const AGGREGATE_SUBJECTS = new Set(['Gen.Yet.', 'Gen.Kül.', 'Genel Yetenek', 'Genel Kültür']);

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#32;/g, ' ')
    .trim();
}

function stripTags(html: string): string {
  return decodeHtml(html.replace(/<[^>]+>/g, ''));
}

function parseTurkishNumber(raw: string): number {
  const cleaned = raw.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function parseTurkishInteger(raw: string): number {
  const cleaned = raw.replace(/\s/g, '').replace(/[^\d-]/g, '');
  const value = Number.parseInt(cleaned, 10);
  return Number.isFinite(value) ? value : 0;
}

function parseMetaList(html: string, className: string): Record<string, string> {
  const blockMatch = html.match(new RegExp(`<ul class="${className}">([\\s\\S]*?)</ul>`, 'i'));
  if (!blockMatch) return {};

  const entries: Record<string, string> = {};
  const liRegex = /<li><span>([^<:]+)\s*:<\/span>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(blockMatch[1])) !== null) {
    entries[match[1].trim()] = stripTags(match[2]);
  }
  return entries;
}

function parseMetaByPattern(html: string, patterns: Array<[string, RegExp]>): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const [key, pattern] of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) entries[key] = stripTags(match[1]);
  }
  return entries;
}

function parseExamMeta(html: string): Record<string, string> {
  const fromList = parseMetaList(html, 'sonuctanim');
  if (Object.keys(fromList).length > 0) return fromList;

  return parseMetaByPattern(html, [
    ['Sınav Adı', /Sınav Adı\s*:\s*<\/span>\s*([^<]+)/i],
    ['Sınav Tarihi', /Sınav Tarihi\s*:\s*<\/span>\s*([^<]+)/i],
    ['Sınav No', /Sınav No\s*:\s*<\/span>\s*([^<]+)/i],
  ]);
}

function parseStudentMeta(html: string): Record<string, string> {
  const fromList = parseMetaList(html, 'isimalan');
  if (Object.keys(fromList).length > 0) return fromList;

  return parseMetaByPattern(html, [
    ['Kurum', /Kurum\s*:\s*<\/span>\s*([^<]+)/i],
    ['İsim', /İsim\s*:\s*<\/span>\s*([^<]+)/i],
    ['Isim', /Isim\s*:\s*<\/span>\s*([^<]+)/i],
  ]);
}

function parseExamDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const parts = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!parts) return null;
  const [, day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function extractTableRows(tableHtml: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const cells: string[] = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

function findNetlerTableHtml(html: string): string {
  const byClass = html.match(/<table class="netler">([\s\S]*?)<\/table>/i);
  if (byClass) return byClass[1];

  const byContainer = html.match(/id="no-more-tables"[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i);
  if (byContainer) return byContainer[1];

  throw new Error('Ders/net tablosu bulunamadı.');
}

function parseNetlerTable(html: string): {
  subjects: InstitutionSubjectResult[];
  sectionTotals: InstitutionResultImport['sectionTotals'];
} {
  const rows = extractTableRows(findNetlerTableHtml(html));
  const headerRow =
    rows.find((row) => row.includes('Türkçe') || row.includes('Matematik') || row.includes('Fizik')) ??
    rows.find((row) => row[0] !== 'DERSLER' && row[0] !== 'S. SAYISI' && row.length > 3);
  const allHeaders = headerRow ?? [];

  const countRow = rows.find((row) => row[0] === 'S. SAYISI');
  const rightRow = rows.find((row) => row[0] === 'DOĞRU');
  const wrongRow = rows.find((row) => row[0] === 'YANLIŞ');
  const netRow = rows.find((row) => row[0] === 'NET');

  if (!headerRow || !countRow || !rightRow || !wrongRow || !netRow) {
    throw new Error('Net tablosu satırları eksik (S. SAYISI / DOĞRU / YANLIŞ / NET).');
  }

  const subjectHeaders = allHeaders.filter((name) => name && !AGGREGATE_SUBJECTS.has(name));
  const subjects: InstitutionSubjectResult[] = [];

  subjectHeaders.forEach((name) => {
    const index = allHeaders.indexOf(name) + 1;
    const questionCount = parseTurkishInteger(countRow[index] ?? '0');
    const right = parseTurkishInteger(rightRow[index] ?? '0');
    const wrong = parseTurkishInteger(wrongRow[index] ?? '0');
    const net = parseTurkishNumber(netRow[index] ?? '0');
    const empty = Math.max(0, questionCount - right - wrong);
    subjects.push({ name, questionCount, right, wrong, empty, net });
  });

  const readSection = (label: string): InstitutionSectionTotal | null => {
    const index = allHeaders.indexOf(label) + 1;
    if (index <= 0) return null;
    const questionCount = parseTurkishInteger(countRow[index] ?? '0');
    const right = parseTurkishInteger(rightRow[index] ?? '0');
    const wrong = parseTurkishInteger(wrongRow[index] ?? '0');
    const net = parseTurkishNumber(netRow[index] ?? '0');
    return { questionCount, right, wrong, net };
  };

  return {
    subjects,
    sectionTotals: {
      generalAbility: readSection('Gen.Yet.'),
      generalCulture: readSection('Gen.Kül.'),
    },
  };
}

function parseScoresTable(html: string): InstitutionScoreResult[] {
  const tableMatch = html.match(/<table class="puanlar">([\s\S]*?)<\/table>/i);
  if (!tableMatch) return [];

  const rows = extractTableRows(tableMatch[1]).filter((row) => row[0]?.includes('Puanı'));
  return rows.map((row) => ({
    type: row[0].replace(/\s+/g, ' ').trim(),
    score: parseTurkishNumber(row[1] ?? '0'),
    rankKurum: parseTurkishInteger(row[3] ?? '') || null,
    rankNational: parseTurkishInteger(row[9] ?? '') || null,
  }));
}

function parseTopics(html: string): InstitutionTopicResult[] {
  const topicsBlockMatch =
    html.match(/<div class="konular konubasliklari">[\s\S]*?<\/div><div class="konular">([\s\S]*?)<\/div>\s*<\/div>/i) ??
    html.match(/<div class="konular">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="row">/i);

  if (!topicsBlockMatch) return [];

  const topics: InstitutionTopicResult[] = [];
  const subjectRegex = /<span class="ders">([\s\S]*?)<\/span><ul>([\s\S]*?)<\/ul>/gi;
  let subjectMatch: RegExpExecArray | null;

  while ((subjectMatch = subjectRegex.exec(topicsBlockMatch[1])) !== null) {
    const subjectName = stripTags(subjectMatch[1]);
    const topicRegex =
      /<span class="konu">([\s\S]*?)<\/span><span class="s">([\s\S]*?)<\/span><span class="d">([\s\S]*?)<\/span><span class="y">([\s\S]*?)<\/span><span class="b">([\s\S]*?)<\/span><span class="o">([\s\S]*?)<\/span>/gi;
    let topicMatch: RegExpExecArray | null;
    while ((topicMatch = topicRegex.exec(subjectMatch[2])) !== null) {
      const questionCount = parseTurkishInteger(topicMatch[2]);
      const right = parseTurkishInteger(topicMatch[3]);
      const wrong = parseTurkishInteger(topicMatch[4]);
      const empty = parseTurkishInteger(topicMatch[5]);
      topics.push({
        subjectName,
        topicName: stripTags(topicMatch[1]),
        questionCount,
        right,
        wrong,
        empty,
        successRate: parseTurkishNumber(topicMatch[6]),
      });
    }
  }

  return topics;
}

export function parseInstitutionResultHtml(html: string, sourceUrl: string): InstitutionResultImport {
  if (!html || html.length < 500) {
    throw new Error('Sonuç sayfası boş veya okunamadı.');
  }

  const detection = detectInstitutionResultPage(html);
  if (!detection.supported) {
    throw new Error(
      'Bu link desteklenen bir kurum sonuç sayfası gibi görünmüyor. Net tablosu ve sınav bilgisi bulunamadı.',
    );
  }

  if (/Lütfen Bekleyiniz|fa-spin/i.test(html) && !/class=["']netler["']/i.test(html) && !/S\.\s*SAYISI/i.test(html)) {
    throw new Error('Sonuç sayfası henüz yüklenmemiş olabilir. Linki tarayıcıda açıp tekrar deneyin.');
  }

  let sourceHost = 'unknown';
  try {
    sourceHost = new URL(sourceUrl).hostname;
  } catch {
    /* ignore */
  }

  const examMeta = parseExamMeta(html);
  const studentMeta = parseStudentMeta(html);
  const { subjects, sectionTotals } = parseNetlerTable(html);
  const scores = parseScoresTable(html);
  const topics = parseTopics(html);

  if (subjects.length === 0) {
    throw new Error('Ders sonuçları çıkarılamadı.');
  }

  const totals = subjects.reduce(
    (acc, subject) => ({
      right: acc.right + subject.right,
      wrong: acc.wrong + subject.wrong,
      empty: acc.empty + subject.empty,
      net: acc.net + subject.net,
      questionCount: acc.questionCount + subject.questionCount,
    }),
    { right: 0, wrong: 0, empty: 0, net: 0, questionCount: 0 },
  );

  return {
    sourceUrl,
    sourceHost,
    platform: detection.platform,
    examName: examMeta['Sınav Adı'] ?? 'Bilinmeyen sınav',
    examDate: parseExamDate(examMeta['Sınav Tarihi']),
    examNumber: examMeta['Sınav No'] ?? null,
    institution: studentMeta.Kurum ?? null,
    studentName: studentMeta.İsim ?? studentMeta.Isim ?? null,
    subjects,
    sectionTotals,
    scores,
    topics,
    totals,
  };
}

/** @deprecated */
export const parsePegemResultHtml = parseInstitutionResultHtml;
