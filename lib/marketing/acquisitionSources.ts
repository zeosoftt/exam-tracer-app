/**
 * "Bizi nereden buldunuz?" — onboarding / kayıtta kullanılan sabit seçenekler.
 * Veritabanında `acquisitionSource` alanında id saklanır.
 */

export const ACQUISITION_SOURCES = [
  { id: 'GOOGLE_SEARCH', label: 'Google veya başka arama motoru' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'TIKTOK', label: 'TikTok' },
  { id: 'YOUTUBE', label: 'YouTube' },
  { id: 'LINKEDIN', label: 'LinkedIn' },
  { id: 'FRIEND', label: 'Arkadaş / tanıdık tavsiyesi' },
  { id: 'SCHOOL', label: 'Okul, kurs veya öğretmen' },
  { id: 'PODCAST', label: 'Podcast' },
  { id: 'NEWS', label: 'Haber / blog yazısı' },
  { id: 'OTHER', label: 'Diğer' },
] as const;

export type AcquisitionSourceId = (typeof ACQUISITION_SOURCES)[number]['id'];

const LABEL_BY_ID = Object.fromEntries(ACQUISITION_SOURCES.map((o) => [o.id, o.label])) as Record<
  AcquisitionSourceId,
  string
>;

export function getAcquisitionSourceLabel(
  id: string | null | undefined,
  detail?: string | null
): string {
  if (!id) return '—';
  const base = LABEL_BY_ID[id as AcquisitionSourceId] ?? id;
  if (id === 'OTHER' && detail?.trim()) {
    return `${base}: ${detail.trim()}`;
  }
  return base;
}
