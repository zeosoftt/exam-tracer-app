/**
 * Prisma Seed Script
 * Master data: SÄ±navlar, BÃ¶lÃ¼mler, Dersler ve Konular
 * HiyerarÅŸi: Exam â†’ Section â†’ Subject â†’ Topic
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('ğŸŒ± Starting seed...');

  // KPSS SÄ±navÄ±
  const kpss = await prisma.exam.upsert({
    where: { code: 'KPSS' },
    update: {},
    create: {
      code: 'KPSS',
      name: 'KPSS (Kamu Personeli SeÃ§me SÄ±navÄ±)',
      description: 'Genel Yetenek, Genel KÃ¼ltÃ¼r, EÄŸitim Bilimleri',
      status: 'ACTIVE',
    },
  });

  // KPSS BÃ¶lÃ¼mleri
  const kpssGenelYetenek = await prisma.section.upsert({
    where: { examId_code: { examId: kpss.id, code: 'GENEL_YETENEK' } },
    update: {},
    create: {
      examId: kpss.id,
      code: 'GENEL_YETENEK',
      name: 'Genel Yetenek',
      order: 1,
    },
  });

  const kpssGenelKultur = await prisma.section.upsert({
    where: { examId_code: { examId: kpss.id, code: 'GENEL_KULTUR' } },
    update: {},
    create: {
      examId: kpss.id,
      code: 'GENEL_KULTUR',
      name: 'Genel KÃ¼ltÃ¼r',
      order: 2,
    },
  });

  // KPSS Genel Yetenek BÃ¶lÃ¼mÃ¼ - Dersleri
  const kpssGYTurkce = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: kpssGenelYetenek.id, code: 'TURKCE' } },
    update: {},
    create: {
      sectionId: kpssGenelYetenek.id,
      code: 'TURKCE',
      name: 'TÃ¼rkÃ§e',
      order: 1,
    },
  });

  const kpssGYMatematik = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: kpssGenelYetenek.id, code: 'MATEMATIK' } },
    update: {},
    create: {
      sectionId: kpssGenelYetenek.id,
      code: 'MATEMATIK',
      name: 'Matematik',
      order: 2,
    },
  });

  const kpssGYGeometri = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: kpssGenelYetenek.id, code: 'GEOMETRI' } },
    update: {},
    create: {
      sectionId: kpssGenelYetenek.id,
      code: 'GEOMETRI',
      name: 'Geometri',
      order: 3,
    },
  });

  // KPSS Genel Yetenek - TÃ¼rkÃ§e Dersi KonularÄ±
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SOZCUKTE_ANLAM' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SOZCUKTE_ANLAM',
      name: 'SÃ¶zcÃ¼kte Anlam',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'CUMLEDE_ANLAM' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'CUMLEDE_ANLAM',
      name: 'CÃ¼mlede Anlam',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SOZCUK_TURLERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SOZCUK_TURLERI',
      name: 'SÃ¶zcÃ¼k TÃ¼rleri',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SOZCUKTE_YAPI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SOZCUKTE_YAPI',
      name: 'SÃ¶zcÃ¼kte YapÄ±',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'CUMLENIN_OGELERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'CUMLENIN_OGELERI',
      name: 'CÃ¼mlenin Ã–geleri',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'CUMLE_TURLERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'CUMLE_TURLERI',
      name: 'CÃ¼mle TÃ¼rleri',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SES_OLAYLARI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SES_OLAYLARI',
      name: 'Dil Bilgisi Ses OlaylarÄ±',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'YAZIM_KURALLARI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'YAZIM_KURALLARI',
      name: 'YazÄ±m KurallarÄ±',
      order: 8,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'NOKTALAMA_ISARETLERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'NOKTALAMA_ISARETLERI',
      name: 'Noktalama Ä°ÅŸaretleri',
      order: 9,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'ANLATIM_BOZUKLUKLARI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'ANLATIM_BOZUKLUKLARI',
      name: 'AnlatÄ±m BozukluklarÄ±',
      order: 10,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'PARAGRAFTA_ANLAM' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'PARAGRAFTA_ANLAM',
      name: 'Paragrafta Anlam',
      order: 11,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'PARAGRAFTA_ANLATIM_BICIMLERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'PARAGRAFTA_ANLATIM_BICIMLERI',
      name: 'Paragrafta AnlatÄ±m BiÃ§im',
      order: 12,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SOZEL_MANTIK' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SOZEL_MANTIK',
      name: 'SÃ¶zel MantÄ±k',
      order: 13,
    },
  });
  

  // KPSS Genel Yetenek - Matematik Dersi KonularÄ±
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'TEMEL_KAVRAMLAR' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'TEMEL_KAVRAMLAR',
      name: 'Temel Kavramlar',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'RASYONEL_VE_ONDALIKLI_SAYILAR' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'RASYONEL_VE_ONDALIKLI_SAYILAR',
      name: 'Rasyonel SayÄ±lar- OndalÄ±klÄ± SayÄ±lar',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'BASIT_ESITSIZLIKLER' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'BASIT_ESITSIZLIKLER',
      name: 'Basit EÅŸitsizlikler',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'MUTLAK_DEGER' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'MUTLAK_DEGER',
      name: 'Mutlak DeÄŸer',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'USLU_SAYILAR' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'USLU_SAYILAR',
      name: 'ÃœslÃ¼ SayÄ±lar',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'KOKLU_SAYILAR' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'KOKLU_SAYILAR',
      name: 'KÃ¶klÃ¼ SayÄ±lar',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'CARPANLARA_AYIRMA' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'CARPANLARA_AYIRMA',
      name: 'Ã‡arpanlara AyÄ±rma',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'ORAN_ORANTI' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'ORAN_ORANTI',
      name: 'Oran- OrantÄ±',
      order: 8,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'DENKLEM_COZME' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'DENKLEM_COZME',
      name: 'Denklem Ã‡Ã¶zme',
      order: 9,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'PROBLEMLER' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'PROBLEMLER',
      name: 'Problemler',
      order: 10,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'KUMELER' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'KUMELER',
      name: 'KÃ¼meler',
      order: 11,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'FONKSIYONLAR' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'FONKSIYONLAR',
      name: 'Fonksiyonlar',
      order: 12,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'ISLEM' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'ISLEM',
      name: 'Ä°ÅŸlem',
      order: 13,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'PERMUTASYON_KOMBINASYON' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'PERMUTASYON_KOMBINASYON',
      name: 'PermÃ¼tasyon / Konbinasyon',
      order: 14,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'OLASILIK' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'OLASILIK',
      name: 'OlasÄ±lÄ±k',
      order: 15,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'SAYISAL_MANTIK' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'SAYISAL_MANTIK',
      name: 'SayÄ±sal MantÄ±k',
      order: 16,
    },
  });
  

  // KPSS Genel Yetenek - Geometri Dersi KonularÄ±
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'GEOMETRIK_KAVRAMLAR_VE_ACILAR' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'GEOMETRIK_KAVRAMLAR_VE_ACILAR',
      name: 'Geometrik Kavramlar ve AÃ§Ä±lar',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'COKGENLER_VE_DORTGENLER' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'COKGENLER_VE_DORTGENLER',
      name: 'Ã‡okgenler ve DÃ¶rtgenler',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'CEMBER_VE_DAIRE' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'CEMBER_VE_DAIRE',
      name: 'Ã‡ember ve Daire',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'ANALITIK_GEOMETRI' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'ANALITIK_GEOMETRI',
      name: 'Analitik Geometri',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'KATI_CISIMLER' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'KATI_CISIMLER',
      name: 'KatÄ± Cisimler',
      order: 5,
    },
  });
  

  // KPSS Genel KÃ¼ltÃ¼r BÃ¶lÃ¼mÃ¼ - Dersleri
  const kpssGKTarih = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: kpssGenelKultur.id, code: 'TARIH' } },
    update: {},
    create: {
      sectionId: kpssGenelKultur.id,
      code: 'TARIH',
      name: 'Tarih',
      order: 1,
    },
  });

  const kpssGKCografya = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: kpssGenelKultur.id, code: 'COGRAFYASI' } },
    update: {},
    create: {
      sectionId: kpssGenelKultur.id,
      code: 'COGRAFYASI',
      name: 'CoÄŸrafya',
      order: 2,
    },
  });

  const kpssGKVatandaslik = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: kpssGenelKultur.id, code: 'VATANDASLIK' } },
    update: {},
    create: {
      sectionId: kpssGenelKultur.id,
      code: 'VATANDASLIK',
      name: 'VatandaÅŸlÄ±k',
      order: 3,
    },
  });

  // KPSS Genel KÃ¼ltÃ¼r - Tarih Dersi KonularÄ±
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ISLAMIYET_ONCESI_TURK_TARIHI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ISLAMIYET_ONCESI_TURK_TARIHI',
      name: 'Ä°slamiyet Ã–ncesi TÃ¼rk Tarihi-Ä°lk ve Orta Ã‡aÄŸda TÃ¼rk DÃ¼nyasÄ±',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ISLAMIYET_ONCESI_KULTUR_UYGARLIK' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ISLAMIYET_ONCESI_KULTUR_UYGARLIK',
      name: 'Ä°slamiyet Ã–ncesi TÃ¼rk Devletlerinde KÃ¼ltÃ¼r ve UygarlÄ±k',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ILK_TURK_ISLAM_DEVLETLERI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ILK_TURK_ISLAM_DEVLETLERI',
      name: 'Ä°lk TÃ¼rk Ä°slam Devletleri -TÃ¼rklerin Ä°slamiyeti KabulÃ¼',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ILK_TURK_ISLAM_KULTUR_UYGARLIK' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ILK_TURK_ISLAM_KULTUR_UYGARLIK',
      name: 'Ä°lk TÃ¼rk Ä°slam Devletlerinde KÃ¼ltÃ¼r ve UygarlÄ±k',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'OSMANLI_SIYASI_TARIH' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'OSMANLI_SIYASI_TARIH',
      name: 'OsmanlÄ± Devleti Siyaseti',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'OSMANLI_KULTUR_UYGARLIK' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'OSMANLI_KULTUR_UYGARLIK',
      name: 'OsmanlÄ± Devleti KÃ¼ltÃ¼r ve UygarlÄ±k',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'YIRMINCI_YUZYIL_OSMANLI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'YIRMINCI_YUZYIL_OSMANLI',
      name: '20. YÃ¼zyÄ±l OsmanlÄ± Devleti',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'KURTULUS_SAVASI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'KURTULUS_SAVASI',
      name: 'KurtuluÅŸ SavaÅŸÄ±',
      order: 8,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'INKILAP_TARIHI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'INKILAP_TARIHI',
      name: 'Ä°nkÄ±lap Tarihi',
      order: 9,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ATATURK_DONEMI_POLITIKALAR' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ATATURK_DONEMI_POLITIKALAR',
      name: 'AtatÃ¼rk DÃ¶nemi Ä°Ã§ ve DÄ±ÅŸ Politikalar',
      order: 10,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ATATURK_ILKE_INKILAPLARI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ATATURK_ILKE_INKILAPLARI',
      name: 'AtatÃ¼rkâ€™Ã¼n Ä°lke ve Ä°nkÄ±laplarÄ±',
      order: 11,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'CAGDAS_TURK_DUNYA_TARIHI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'CAGDAS_TURK_DUNYA_TARIHI',
      name: 'Ã‡aÄŸdaÅŸ TÃ¼rk ve DÃ¼nya EdebiyatÄ±',
      order: 12,
    },
  });
  

  // KPSS Genel KÃ¼ltÃ¼r - CoÄŸrafya Dersi KonularÄ±
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYENIN_COGRAFI_KONUMU' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYENIN_COGRAFI_KONUMU',
      name: 'TÃ¼rkiyeâ€™nin CoÄŸrafi Konumu',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYENIN_IKLIMI_VE_BITKI_ORTUSU' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYENIN_IKLIMI_VE_BITKI_ORTUSU',
      name: 'TÃ¼rkiyeâ€™nin Ä°klimi ve Bitki Ã–rtÃ¼sÃ¼',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYENIN_FIZIKI_OZELLIKLERI' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYENIN_FIZIKI_OZELLIKLERI',
      name: 'TÃ¼rkiyeâ€™nin Fiziki Ã–zellikleri',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYEDE_NUFUS_VE_YERLESME' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYEDE_NUFUS_VE_YERLESME',
      name: 'TÃ¼rkiyeâ€™de NÃ¼fus ve YerleÅŸme',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TARIM' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TARIM',
      name: 'TarÄ±m',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'HAYVANCILIK' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'HAYVANCILIK',
      name: 'HayvancÄ±lÄ±k',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'MADENLER_VE_ENERJI_KAYNAKLARI' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'MADENLER_VE_ENERJI_KAYNAKLARI',
      name: 'Madenler ve Enerji KaynaklarÄ±',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'SANAYI_VE_ENDUSTRI' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'SANAYI_VE_ENDUSTRI',
      name: 'Sanayi ve EndÃ¼stri',
      order: 8,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'ULASIM' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'ULASIM',
      name: 'UlaÅŸÄ±m',
      order: 9,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TICARET' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TICARET',
      name: 'Ticaret',
      order: 10,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURIZM' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURIZM',
      name: 'Turizm',
      order: 11,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'BOLGELER_COGRAFYASI' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'BOLGELER_COGRAFYASI',
      name: 'BÃ¶lgeler CoÄŸrafyasÄ±',
      order: 12,
    },
  });
  

  // KPSS Genel KÃ¼ltÃ¼r - VatandaÅŸlÄ±k Dersi KonularÄ±
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'TEMEL_HUKUK_KAVRAMLARI' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'TEMEL_HUKUK_KAVRAMLARI',
      name: 'Temel Hukuk KavramlarÄ±',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'ANAYASAL_KAVRAMLAR' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'ANAYASAL_KAVRAMLAR',
      name: 'Anayasal Kavramlar',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'TURK_ANAYASA_TARIHI' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'TURK_ANAYASA_TARIHI',
      name: 'TÃ¼rk Anayasa Tarihi',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'TEMEL_HAK_ODEVLER' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'TEMEL_HAK_ODEVLER',
      name: 'Temel Hak Ã–devler',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'YASAMA' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'YASAMA',
      name: 'Yasama',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'YURUTME' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'YURUTME',
      name: 'YÃ¼rÃ¼tme',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'YARGI' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'YARGI',
      name: 'YargÄ±',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'IDARE_HUKUKU' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'IDARE_HUKUKU',
      name: 'Ä°dare Hukuku',
      order: 8,
    },
  });
  

  // ALES, DGS, YKS, YDS, YOKDIL, OABT müfredatları
  console.log('📚 Seeding exam curricula...');
  // Tek kaynak: prisma/curriculum/catalog (kodları mevcut veritabanıyla uyumlu, silme yok).
  const { CATALOG_EXAMS } = await import('./curriculum/catalog');
  const { loadCatalog } = await import('./curriculum/loadCatalog');
  await loadCatalog(prisma, CATALOG_EXAMS, { apply: true, log: (line) => console.log(`  ${line}`) });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
