export type ResultPageDetection = {
  supported: boolean;
  platform: 'verisayar' | 'unknown';
};

/** Kurum linki farklı olsa da aynı sonuç şablonunu (Verisayar vb.) taşıyıp taşımadığını kontrol eder. */
export function detectInstitutionResultPage(html: string): ResultPageDetection {
  const hasNetTable =
    /class=["']netler["']/i.test(html) ||
    (/S\.\s*SAYISI/i.test(html) && /DOĞRU/i.test(html) && /YANLIŞ/i.test(html) && /NET/i.test(html));

  const hasExamMeta =
    /class=["']sonuctanim["']/i.test(html) ||
    /Sınav Adı\s*:/i.test(html) ||
    /<title>[\s\S]+<\/title>/i.test(html);

  const isVerisayar =
    /verisayar\.com/i.test(html) ||
    /pronet\s+ltd/i.test(html) ||
    /class=["']netler["']/i.test(html);

  return {
    supported: hasNetTable && hasExamMeta,
    platform: isVerisayar ? 'verisayar' : 'unknown',
  };
}
