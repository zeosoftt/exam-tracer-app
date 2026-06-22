import { detectInstitutionResultPage } from '@/lib/deneme/institutionResult/detectResultPage';
import { parseInstitutionResultHtml } from '@/lib/deneme/institutionResult/parseResultHtml';
import type { InstitutionResultImport } from '@/lib/deneme/institutionResult/types';
import { validateInstitutionResultUrl } from '@/lib/deneme/institutionResult/validateResultUrl';

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 600_000;

export async function fetchInstitutionResult(sourceUrl: string): Promise<InstitutionResultImport> {
  const url = await validateInstitutionResultUrl(sourceUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'ExamTracker/1.0 (+https://thegoallab.com)',
      },
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
    });

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

    return parseInstitutionResultHtml(html, url.toString());
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
