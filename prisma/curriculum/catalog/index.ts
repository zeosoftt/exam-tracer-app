/**
 * Tüm sınav müfredatlarının tek kaynağı.
 * Yükleme: `npx tsx scripts/load-curriculum.ts` (önizleme) / `--apply` (yazar).
 */

import type { CatalogExam } from './dsl';
import { KPSS, KPSS_EB } from './kpss';
import { YKS_AYT, YKS_TYT, YKS_YDT } from './yks';
import { ALES, DGS } from './alesDgs';
import { E_YDS, YOKDIL } from './yabanciDil';
import { OABT_EXAMS } from './oabt';

export const CATALOG_EXAMS: CatalogExam[] = [
  KPSS,
  KPSS_EB,
  YKS_TYT,
  YKS_AYT,
  YKS_YDT,
  ALES,
  DGS,
  E_YDS,
  YOKDIL,
  ...OABT_EXAMS,
];

/**
 * Tekrar eden veya yanlış sınava konmuş eski konular: [sınav, bölüm, ders, konu].
 * Yükleyici bunları YALNIZCA hiç kullanıcı ilerlemesi yoksa gizler (deletedAt);
 * ilerlemesi olanlara dokunmaz ve raporlar.
 */
export const CATALOG_CLEANUP: Array<[string, string, string, string]> = [
  // TYT Türkçe — KPSS/ALES'ten kopyalanmış tekrarlar
  ['YKS_TYT', 'turkce', 'TYT_TURKCE', 'TURKCE_CUMLEDE_ANLAM_2'],
  ['YKS_TYT', 'turkce', 'TYT_TURKCE', 'TURKCE_PARAGRAFTA_ANLAM'],
  ['YKS_TYT', 'turkce', 'TYT_TURKCE', 'TURKCE_PARAGRAFTA_ANLATIM_BICIMLERI'],
  ['YKS_TYT', 'turkce', 'TYT_TURKCE', 'TURKCE_SOZEL_MANTIK'],
  ['YKS_TYT', 'turkce', 'TYT_TURKCE', 'TURKCE_ALES_TURKCE'],
  // TYT Matematik — KPSS/ALES/DGS tekrarları ve AYT konuları
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_BOLME'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_BOLME_BOLUNEBILME'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_BOLUNEBILME_KURALLARI'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_ASAL_SAYILAR'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_CARPANLARINA_AYIRMA'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_DOGAL_SAYILAR'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_ESITSIZLIK'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_INTEGRAL'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_TUREV'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_ISLEM'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_ISLEM_MODULER_ARITMETIK_2'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_PERMUTASYON_KOMBINASYON_OLASILIK'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_PROBLEMLER'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_RAS_SAYILAR'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_RASYONEL_VE_ONDALIKLI_SAYILAR'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_KESIR_PROBLEMLERI'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_SAYI_BASAMAKLARI_2'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_TEMEL_ISLEMLER'],
  ['YKS_TYT', 'matematik', 'MATEMATIK', 'MATEMATIK_SAYISAL_MANTIK'],
  // TYT Geometri — ALES'ten kopyalanmış genel başlık
  ['YKS_TYT', 'geometri', 'GEOMETRI', 'GEOMETRI_ALES_GEOMETRI'],
  // ALES — içi boş genel başlıklar (yerlerine ayrıntılı konular geldi)
  ['ALES', 'SAYISAL', 'GEOMETRI', 'ALES_GEOMETRI'],
  ['ALES', 'SOZEL', 'TURKCE', 'ALES_TURKCE'],
];
