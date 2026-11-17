import { detectInstitutionResultPage } from '@/lib/deneme/institutionResult/detectResultPage';
import { parseInstitutionResultHtml } from '@/lib/deneme/institutionResult/parseResultHtml';
import type { InstitutionResultImport } from '@/lib/deneme/institutionResult/types';
import { validateInstitutionResultUrl } from '@/lib/deneme/institutionResult/validateResultUrl';

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 600_000;
const MAX_REDIRECTS = 3;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const REQUEST_HEADERS = {
  Accept: 'text/html,application/xhtml+xml',
  'User-Agent': 'ExamTracker/1.0 (+https://thegoallabs.com)',
} as const;

/**
 * Yönlendirmeleri elle izler: her hedef yeniden SSRF doğrulamasından geçer.
 * `redirect: 'follow'` ile doğrulanmış public bir host iç ağa yönlendirebilirdi.
 */
async function fetchFollowingValidatedRedirects(
  initialUrl: URL,
  signal: AbortSignal,
): Promise<{ response: Response; finalUrl: string }> {
  let url = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: REQUEST_HEADERS,
      signal,
      cache: 'no-store',
      redirect: 'manual',
    });

    if (!REDIRECT_STATUSES.has(response.status)) {
      return { response, finalUrl: url.toString() };
    }

    // 3xx gövdesi kullanılmaz; bağlantıyı serbest bırakmak için iptal edilir.
    await response.body?.cancel().catch(() => undefined);

    const location = response.headers.get('location');
    if (!location || hop === MAX_REDIRECTS) {
      throw new Error('Sonuç sayfası yönlendirmesi izlenemedi.');
    }

    let nextUrl: URL;
    try {
      nextUrl = new URL(location, url);
    } catch {
      throw new Error('Sonuç sayfası yönlendirmesi geçersiz.');
    }
    url = await validateInstitutionResultUrl(nextUrl.toString());
  }

  throw new Error('Sonuç sayfası yönlendirmesi izlenemedi.');
}

export async function fetchInstitutionResult(sourceUrl: string): Promise<InstitutionResultImport> {
  const url = await validateInstitutionResultUrl(sourceUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const { response, finalUrl } = await fetchFollowingValidatedRedirects(url, controller.signal);

    if (!response.ok) {
      throw new Error(`Sonuç sayfası yüklenemedi (HTTP ${response.status}).`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('Beklenmeyen yanıt türü alındı.');
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_HTML_BYTES) {
      throw new Error('Sonuç sayfası çok büyük.');
    }

    const html = new TextDecoder('utf-8').decode(buffer);
    const detection = detectInstitutionResultPage(html);
    if (!detection.supported) {
      throw new Error(
        'Bu sayfa tanınan bir kurum deneme sonuç formatında değil. Linkin kişisel sonuç sayfasına ait olduğundan emin olun.',
      );
    }

    return parseInstitutionResultHtml(html, finalUrl);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Sonuç sayfası zaman aşımına uğradı. Lütfen tekrar deneyin.');
    }
    throw error instanceof Error ? error : new Error('Kurum sonucu alınamadı.');
  } finally {
    clearTimeout(timeout);
  }
}

/** @deprecated */
export const fetchPegemResult = fetchInstitutionResult;
