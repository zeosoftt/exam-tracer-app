/** Kurum sonuç linklerini karşılaştırma / duplicate kontrolü için normalize eder. */
export function normalizeInstitutionSourceUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return rawUrl.trim().toLowerCase();
  }

  parsed.hash = '';
  parsed.search = '';
  parsed.hostname = parsed.hostname.toLowerCase();

  let pathname = parsed.pathname;
  if (!pathname.endsWith('/')) {
    pathname += '/';
  }
  parsed.pathname = pathname;

  return parsed.toString();
}

export function institutionSourceUrlMatches(stored: string, candidate: string): boolean {
  const normalizedStored = normalizeInstitutionSourceUrl(stored);
  const normalizedCandidate = normalizeInstitutionSourceUrl(candidate);
  if (normalizedStored === normalizedCandidate) return true;

  return (
    normalizedStored.includes(normalizedCandidate) ||
    normalizedCandidate.includes(normalizedStored)
  );
}
