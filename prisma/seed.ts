/**
 * Prisma Seed Script
 * Master data: Sınavlar, Bölümler, Dersler ve Konular
 * Hiyerarşi: Exam → Section → Subject → Topic
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // KPSS Sınavı
  const kpss = await prisma.exam.upsert({
    where: { code: 'KPSS' },
    update: {},
    create: {
      code: 'KPSS',
      name: 'KPSS (Kamu Personeli Seçme Sınavı)',
      description: 'Genel Yetenek, Genel Kültür, Eğitim Bilimleri',
      status: 'ACTIVE',
    },
  });

  // KPSS Bölümleri
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
      name: 'Genel Kültür',
      order: 2,
    },
  });

  // KPSS Genel Yetenek Bölümü - Dersleri
  const kpssGYTurkce = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: kpssGenelYetenek.id, code: 'TURKCE' } },
    update: {},
    create: {
      sectionId: kpssGenelYetenek.id,
      code: 'TURKCE',
      name: 'Türkçe',
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

  // KPSS Genel Yetenek - Türkçe Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SOZCUKTE_ANLAM' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SOZCUKTE_ANLAM',
      name: 'Sözcükte Anlam',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'CUMLEDE_ANLAM' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'CUMLEDE_ANLAM',
      name: 'Cümlede Anlam',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SOZCUK_TURLERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SOZCUK_TURLERI',
      name: 'Sözcük Türleri',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SOZCUKTE_YAPI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SOZCUKTE_YAPI',
      name: 'Sözcükte Yapı',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'CUMLENIN_OGELERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'CUMLENIN_OGELERI',
      name: 'Cümlenin Ögeleri',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'CUMLE_TURLERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'CUMLE_TURLERI',
      name: 'Cümle Türleri',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SES_OLAYLARI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SES_OLAYLARI',
      name: 'Dil Bilgisi Ses Olayları',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'YAZIM_KURALLARI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'YAZIM_KURALLARI',
      name: 'Yazım Kuralları',
      order: 8,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'NOKTALAMA_ISARETLERI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'NOKTALAMA_ISARETLERI',
      name: 'Noktalama İşaretleri',
      order: 9,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'ANLATIM_BOZUKLUKLARI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'ANLATIM_BOZUKLUKLARI',
      name: 'Anlatım Bozuklukları',
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
      name: 'Paragrafta Anlatım Biçim',
      order: 12,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'SOZEL_MANTIK' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'SOZEL_MANTIK',
      name: 'Sözel Mantık',
      order: 13,
    },
  });
  

  // KPSS Genel Yetenek - Matematik Dersi Konuları
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
      name: 'Rasyonel Sayılar- Ondalıklı Sayılar',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'BASIT_ESITSIZLIKLER' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'BASIT_ESITSIZLIKLER',
      name: 'Basit Eşitsizlikler',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'MUTLAK_DEGER' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'MUTLAK_DEGER',
      name: 'Mutlak Değer',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'USLU_SAYILAR' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'USLU_SAYILAR',
      name: 'Üslü Sayılar',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'KOKLU_SAYILAR' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'KOKLU_SAYILAR',
      name: 'Köklü Sayılar',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'CARPANLARA_AYIRMA' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'CARPANLARA_AYIRMA',
      name: 'Çarpanlara Ayırma',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'ORAN_ORANTI' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'ORAN_ORANTI',
      name: 'Oran- Orantı',
      order: 8,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'DENKLEM_COZME' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'DENKLEM_COZME',
      name: 'Denklem Çözme',
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
      name: 'Kümeler',
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
      name: 'İşlem',
      order: 13,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'PERMUTASYON_KOMBINASYON' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'PERMUTASYON_KOMBINASYON',
      name: 'Permütasyon / Konbinasyon',
      order: 14,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'OLASILIK' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'OLASILIK',
      name: 'Olasılık',
      order: 15,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'SAYISAL_MANTIK' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'SAYISAL_MANTIK',
      name: 'Sayısal Mantık',
      order: 16,
    },
  });
  

  // KPSS Genel Yetenek - Geometri Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'GEOMETRIK_KAVRAMLAR_VE_ACILAR' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'GEOMETRIK_KAVRAMLAR_VE_ACILAR',
      name: 'Geometrik Kavramlar ve Açılar',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'COKGENLER_VE_DORTGENLER' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'COKGENLER_VE_DORTGENLER',
      name: 'Çokgenler ve Dörtgenler',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'CEMBER_VE_DAIRE' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'CEMBER_VE_DAIRE',
      name: 'Çember ve Daire',
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
      name: 'Katı Cisimler',
      order: 5,
    },
  });
  

  // KPSS Genel Kültür Bölümü - Dersleri
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
      name: 'Coğrafya',
      order: 2,
    },
  });

  const kpssGKVatandaslik = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: kpssGenelKultur.id, code: 'VATANDASLIK' } },
    update: {},
    create: {
      sectionId: kpssGenelKultur.id,
      code: 'VATANDASLIK',
      name: 'Vatandaşlık',
      order: 3,
    },
  });

  // KPSS Genel Kültür - Tarih Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ISLAMIYET_ONCESI_TURK_TARIHI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ISLAMIYET_ONCESI_TURK_TARIHI',
      name: 'İslamiyet Öncesi Türk Tarihi-İlk ve Orta Çağda Türk Dünyası',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ISLAMIYET_ONCESI_KULTUR_UYGARLIK' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ISLAMIYET_ONCESI_KULTUR_UYGARLIK',
      name: 'İslamiyet Öncesi Türk Devletlerinde Kültür ve Uygarlık',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ILK_TURK_ISLAM_DEVLETLERI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ILK_TURK_ISLAM_DEVLETLERI',
      name: 'İlk Türk İslam Devletleri -Türklerin İslamiyeti Kabulü',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ILK_TURK_ISLAM_KULTUR_UYGARLIK' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ILK_TURK_ISLAM_KULTUR_UYGARLIK',
      name: 'İlk Türk İslam Devletlerinde Kültür ve Uygarlık',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'OSMANLI_SIYASI_TARIH' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'OSMANLI_SIYASI_TARIH',
      name: 'Osmanlı Devleti Siyaseti',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'OSMANLI_KULTUR_UYGARLIK' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'OSMANLI_KULTUR_UYGARLIK',
      name: 'Osmanlı Devleti Kültür ve Uygarlık',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'YIRMINCI_YUZYIL_OSMANLI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'YIRMINCI_YUZYIL_OSMANLI',
      name: '20. Yüzyıl Osmanlı Devleti',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'KURTULUS_SAVASI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'KURTULUS_SAVASI',
      name: 'Kurtuluş Savaşı',
      order: 8,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'INKILAP_TARIHI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'INKILAP_TARIHI',
      name: 'İnkılap Tarihi',
      order: 9,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ATATURK_DONEMI_POLITIKALAR' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ATATURK_DONEMI_POLITIKALAR',
      name: 'Atatürk Dönemi İç ve Dış Politikalar',
      order: 10,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ATATURK_ILKE_INKILAPLARI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ATATURK_ILKE_INKILAPLARI',
      name: 'Atatürk’ün İlke ve İnkılapları',
      order: 11,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'CAGDAS_TURK_DUNYA_TARIHI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'CAGDAS_TURK_DUNYA_TARIHI',
      name: 'Çağdaş Türk ve Dünya Edebiyatı',
      order: 12,
    },
  });
  

  // KPSS Genel Kültür - Coğrafya Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYENIN_COGRAFI_KONUMU' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYENIN_COGRAFI_KONUMU',
      name: 'Türkiye’nin Coğrafi Konumu',
      order: 1,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYENIN_IKLIMI_VE_BITKI_ORTUSU' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYENIN_IKLIMI_VE_BITKI_ORTUSU',
      name: 'Türkiye’nin İklimi ve Bitki Örtüsü',
      order: 2,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYENIN_FIZIKI_OZELLIKLERI' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYENIN_FIZIKI_OZELLIKLERI',
      name: 'Türkiye’nin Fiziki Özellikleri',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYEDE_NUFUS_VE_YERLESME' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYEDE_NUFUS_VE_YERLESME',
      name: 'Türkiye’de Nüfus ve Yerleşme',
      order: 4,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TARIM' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TARIM',
      name: 'Tarım',
      order: 5,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'HAYVANCILIK' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'HAYVANCILIK',
      name: 'Hayvancılık',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'MADENLER_VE_ENERJI_KAYNAKLARI' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'MADENLER_VE_ENERJI_KAYNAKLARI',
      name: 'Madenler ve Enerji Kaynakları',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'SANAYI_VE_ENDUSTRI' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'SANAYI_VE_ENDUSTRI',
      name: 'Sanayi ve Endüstri',
      order: 8,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'ULASIM' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'ULASIM',
      name: 'Ulaşım',
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
      name: 'Bölgeler Coğrafyası',
      order: 12,
    },
  });
  

  // KPSS Genel Kültür - Vatandaşlık Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'TEMEL_HUKUK_KAVRAMLARI' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'TEMEL_HUKUK_KAVRAMLARI',
      name: 'Temel Hukuk Kavramları',
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
      name: 'Türk Anayasa Tarihi',
      order: 3,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'TEMEL_HAK_ODEVLER' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'TEMEL_HAK_ODEVLER',
      name: 'Temel Hak Ödevler',
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
      name: 'Yürütme',
      order: 6,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'YARGI' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'YARGI',
      name: 'Yargı',
      order: 7,
    },
  });
  
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'IDARE_HUKUKU' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'IDARE_HUKUKU',
      name: 'İdare Hukuku',
      order: 8,
    },
  });
  

  // ALES Sınavı
  const ales = await prisma.exam.upsert({
    where: { code: 'ALES' },
    update: {},
    create: {
      code: 'ALES',
      name: 'ALES (Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı)',
      description: 'Yüksek lisans ve doktora başvuruları için',
      status: 'ACTIVE',
    },
  });

  // ALES Bölümleri
  const alesSayisal = await prisma.section.upsert({
    where: { examId_code: { examId: ales.id, code: 'SAYISAL' } },
    update: {},
    create: {
      examId: ales.id,
      code: 'SAYISAL',
      name: 'Sayısal',
      order: 1,
    },
  });

  const alesSozel = await prisma.section.upsert({
    where: { examId_code: { examId: ales.id, code: 'SOZEL' } },
    update: {},
    create: {
      examId: ales.id,
      code: 'SOZEL',
      name: 'Sözel',
      order: 2,
    },
  });

  // ALES Sayısal Bölümü - Dersleri
  const alesSayMatematik = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: alesSayisal.id, code: 'MATEMATIK' } },
    update: {},
    create: {
      sectionId: alesSayisal.id,
      code: 'MATEMATIK',
      name: 'Matematik',
      order: 1,
    },
  });

  const alesSayGeometri = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: alesSayisal.id, code: 'GEOMETRI' } },
    update: {},
    create: {
      sectionId: alesSayisal.id,
      code: 'GEOMETRI',
      name: 'Geometri',
      order: 2,
    },
  });

  // ALES Sayısal - Matematik Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: alesSayMatematik.id, code: 'ALES_MATEMATIK' } },
    update: {},
    create: {
      subjectId: alesSayMatematik.id,
      code: 'ALES_MATEMATIK',
      name: 'Matematik',
      order: 1,
    },
  });

  // ALES Sayısal - Geometri Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: alesSayGeometri.id, code: 'ALES_GEOMETRI' } },
    update: {},
    create: {
      subjectId: alesSayGeometri.id,
      code: 'ALES_GEOMETRI',
      name: 'Geometri',
      order: 1,
    },
  });

  // ALES Sözel Bölümü - Dersleri
  const alesSozTurkce = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: alesSozel.id, code: 'TURKCE' } },
    update: {},
    create: {
      sectionId: alesSozel.id,
      code: 'TURKCE',
      name: 'Türkçe',
      order: 1,
    },
  });

  // ALES Sözel - Türkçe Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: alesSozTurkce.id, code: 'ALES_TURKCE' } },
    update: {},
    create: {
      subjectId: alesSozTurkce.id,
      code: 'ALES_TURKCE',
      name: 'Türkçe',
      order: 1,
    },
  });

  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: alesSozTurkce.id, code: 'ALES_SOZEL_MANTIK' } },
    update: {},
    create: {
      subjectId: alesSozTurkce.id,
      code: 'ALES_SOZEL_MANTIK',
      name: 'Sözel Mantık',
      order: 2,
    },
  });

  // DGS Sınavı
  const dgs = await prisma.exam.upsert({
    where: { code: 'DGS' },
    update: {},
    create: {
      code: 'DGS',
      name: 'DGS (Dikey Geçiş Sınavı)',
      description: 'Önlisans mezunlarının lisans tamamlaması için',
      status: 'ACTIVE',
    },
  });

  // DGS Bölümleri
  const dgsSayisal = await prisma.section.upsert({
    where: { examId_code: { examId: dgs.id, code: 'SAYISAL_YETENEK' } },
    update: {},
    create: {
      examId: dgs.id,
      code: 'SAYISAL_YETENEK',
      name: 'Sayısal Yetenek',
      order: 1,
    },
  });

  const dgsSozel = await prisma.section.upsert({
    where: { examId_code: { examId: dgs.id, code: 'SOZEL_YETENEK' } },
    update: {},
    create: {
      examId: dgs.id,
      code: 'SOZEL_YETENEK',
      name: 'Sözel Yetenek',
      order: 2,
    },
  });

  // DGS Sayısal Yetenek Bölümü - Dersleri
  const dgsSayMatematik = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: dgsSayisal.id, code: 'MATEMATIK' } },
    update: {},
    create: {
      sectionId: dgsSayisal.id,
      code: 'MATEMATIK',
      name: 'Matematik',
      order: 1,
    },
  });

  // DGS Sayısal - Matematik Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: dgsSayMatematik.id, code: 'DGS_MATEMATIK' } },
    update: {},
    create: {
      subjectId: dgsSayMatematik.id,
      code: 'DGS_MATEMATIK',
      name: 'Matematik',
      order: 1,
    },
  });

  // DGS Sözel Yetenek Bölümü - Dersleri
  const dgsSozTurkce = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: dgsSozel.id, code: 'TURKCE' } },
    update: {},
    create: {
      sectionId: dgsSozel.id,
      code: 'TURKCE',
      name: 'Türkçe',
      order: 1,
    },
  });

  // DGS Sözel - Türkçe Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: dgsSozTurkce.id, code: 'DGS_TURKCE' } },
    update: {},
    create: {
      subjectId: dgsSozTurkce.id,
      code: 'DGS_TURKCE',
      name: 'Türkçe',
      order: 1,
    },
  });

  // YKS-TYT Sınavı
  const yksTyt = await prisma.exam.upsert({
    where: { code: 'YKS_TYT' },
    update: {},
    create: {
      code: 'YKS_TYT',
      name: 'YKS-TYT (Temel Yeterlilik Testi)',
      description: 'Üniversiteye giriş birinci aşama sınavı',
      status: 'ACTIVE',
    },
  });

  // YKS-TYT Bölümleri
  const yksTytTurkce = await prisma.section.upsert({
    where: { examId_code: { examId: yksTyt.id, code: 'TURKCE' } },
    update: {},
    create: {
      examId: yksTyt.id,
      code: 'TURKCE',
      name: 'Türkçe',
      order: 1,
    },
  });

  const yksTytSosyal = await prisma.section.upsert({
    where: { examId_code: { examId: yksTyt.id, code: 'SOSYAL_BILIMLER' } },
    update: {},
    create: {
      examId: yksTyt.id,
      code: 'SOSYAL_BILIMLER',
      name: 'Sosyal Bilimler',
      order: 2,
    },
  });

  const yksTytMatematik = await prisma.section.upsert({
    where: { examId_code: { examId: yksTyt.id, code: 'TEMEL_MATEMATIK' } },
    update: {},
    create: {
      examId: yksTyt.id,
      code: 'TEMEL_MATEMATIK',
      name: 'Temel Matematik',
      order: 3,
    },
  });

  const yksTytFen = await prisma.section.upsert({
    where: { examId_code: { examId: yksTyt.id, code: 'FEN_BILIMLERI' } },
    update: {},
    create: {
      examId: yksTyt.id,
      code: 'FEN_BILIMLERI',
      name: 'Fen Bilimleri',
      order: 4,
    },
  });

  // YKS-TYT Türkçe Bölümü - Dersleri
  const yksTytTrDers = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: yksTytTurkce.id, code: 'TYT_TURKCE' } },
    update: {},
    create: {
      sectionId: yksTytTurkce.id,
      code: 'TYT_TURKCE',
      name: 'Türkçe',
      order: 1,
    },
  });

  // YKS-TYT Türkçe Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: yksTytTrDers.id, code: 'TYT_PARAGRAF' } },
    update: {},
    create: {
      subjectId: yksTytTrDers.id,
      code: 'TYT_PARAGRAF',
      name: 'Paragraf',
      order: 1,
    },
  });

  // YKS-AYT Sınavı
  const yksAyt = await prisma.exam.upsert({
    where: { code: 'YKS_AYT' },
    update: {},
    create: {
      code: 'YKS_AYT',
      name: 'YKS-AYT (Alan Yeterlilik Testi)',
      description: 'Üniversiteye giriş ikinci aşama sınavı',
      status: 'ACTIVE',
    },
  });

  // YKS-AYT Bölümleri
  const yksAytMatematik = await prisma.section.upsert({
    where: { examId_code: { examId: yksAyt.id, code: 'MATEMATIK' } },
    update: {},
    create: {
      examId: yksAyt.id,
      code: 'MATEMATIK',
      name: 'Matematik',
      order: 1,
    },
  });

  // YKS-AYT Matematik Bölümü - Dersleri
  const yksAytMatDers = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: yksAytMatematik.id, code: 'AYT_MATEMATIK' } },
    update: {},
    create: {
      sectionId: yksAytMatematik.id,
      code: 'AYT_MATEMATIK',
      name: 'Matematik',
      order: 1,
    },
  });

  // YKS-AYT Matematik Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: yksAytMatDers.id, code: 'TUREV' } },
    update: {},
    create: {
      subjectId: yksAytMatDers.id,
      code: 'TUREV',
      name: 'Türev',
      order: 1,
    },
  });

  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: yksAytMatDers.id, code: 'INTEGRAL' } },
    update: {},
    create: {
      subjectId: yksAytMatDers.id,
      code: 'INTEGRAL',
      name: 'İntegral',
      order: 2,
    },
  });

  // YKS-YDT Sınavı
  const yksYdt = await prisma.exam.upsert({
    where: { code: 'YKS_YDT' },
    update: {},
    create: {
      code: 'YKS_YDT',
      name: 'YKS-YDT (Yabancı Dil Testi)',
      description: 'Yabancı dil bölümleri için üniversite sınavı',
      status: 'ACTIVE',
    },
  });

  // YKS-YDT Bölümleri
  const yksYdtIngilizce = await prisma.section.upsert({
    where: { examId_code: { examId: yksYdt.id, code: 'INGILIZCE' } },
    update: {},
    create: {
      examId: yksYdt.id,
      code: 'INGILIZCE',
      name: 'İngilizce',
      order: 1,
    },
  });

  // YKS-YDT İngilizce Bölümü - Dersleri
  const yksYdtIngDers = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: yksYdtIngilizce.id, code: 'YDT_INGILIZCE' } },
    update: {},
    create: {
      sectionId: yksYdtIngilizce.id,
      code: 'YDT_INGILIZCE',
      name: 'İngilizce',
      order: 1,
    },
  });

  // e-YDS Sınavı
  const eYds = await prisma.exam.upsert({
    where: { code: 'E_YDS' },
    update: {},
    create: {
      code: 'E_YDS',
      name: 'e-YDS (Elektronik Yabancı Dil Bilgisi Seviye Tespit Sınavı)',
      description: 'Yabancı dil yeterlilik sınavı',
      status: 'ACTIVE',
    },
  });

  // e-YDS Bölümleri
  const eYdsIngilizce = await prisma.section.upsert({
    where: { examId_code: { examId: eYds.id, code: 'INGILIZCE' } },
    update: {},
    create: {
      examId: eYds.id,
      code: 'INGILIZCE',
      name: 'İngilizce',
      order: 1,
    },
  });

  // e-YDS İngilizce Bölümü - Dersleri
  const eYdsIngDers = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: eYdsIngilizce.id, code: 'E_YDS_ENG' } },
    update: {},
    create: {
      sectionId: eYdsIngilizce.id,
      code: 'E_YDS_ENG',
      name: 'İngilizce',
      order: 1,
    },
  });

  // e-YDS İngilizce Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: eYdsIngDers.id, code: 'KELIME_BILGISI' } },
    update: {},
    create: {
      subjectId: eYdsIngDers.id,
      code: 'KELIME_BILGISI',
      name: 'Kelime Bilgisi',
      order: 1,
    },
  });

  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: eYdsIngDers.id, code: 'DIL_BILGISI' } },
    update: {},
    create: {
      subjectId: eYdsIngDers.id,
      code: 'DIL_BILGISI',
      name: 'Dil Bilgisi',
      order: 2,
    },
  });

  // YÖKDİL Sınavı
  const yokdil = await prisma.exam.upsert({
    where: { code: 'YOKDIL' },
    update: {},
    create: {
      code: 'YOKDIL',
      name: 'YÖKDİL',
      description: 'Yükseköğretim Kurumları Yabancı Dil Sınavı',
      status: 'ACTIVE',
    },
  });

  // YÖKDİL Bölümleri
  const yokdilSaglik = await prisma.section.upsert({
    where: { examId_code: { examId: yokdil.id, code: 'SAGLIK_BILIMLERI' } },
    update: {},
    create: {
      examId: yokdil.id,
      code: 'SAGLIK_BILIMLERI',
      name: 'Sağlık Bilimleri',
      order: 1,
    },
  });

  const yokdilSosyal = await prisma.section.upsert({
    where: { examId_code: { examId: yokdil.id, code: 'SOSYAL_BILIMLER' } },
    update: {},
    create: {
      examId: yokdil.id,
      code: 'SOSYAL_BILIMLER',
      name: 'Sosyal Bilimler',
      order: 2,
    },
  });

  const yokdilFen = await prisma.section.upsert({
    where: { examId_code: { examId: yokdil.id, code: 'FEN_BILIMLERI' } },
    update: {},
    create: {
      examId: yokdil.id,
      code: 'FEN_BILIMLERI',
      name: 'Fen Bilimleri',
      order: 3,
    },
  });

  // YÖKDİL Sağlık Bilimleri Bölümü - Dersleri
  const yokdilSagDers = await prisma.subject.upsert({
    where: { sectionId_code: { sectionId: yokdilSaglik.id, code: 'YOKDIL_SB' } },
    update: {},
    create: {
      sectionId: yokdilSaglik.id,
      code: 'YOKDIL_SB',
      name: 'Sağlık Bilimleri',
      order: 1,
    },
  });

  // YÖKDİL Sağlık Bilimleri Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: yokdilSagDers.id, code: 'TIP_TERIMLERI' } },
    update: {},
    create: {
      subjectId: yokdilSagDers.id,
      code: 'TIP_TERIMLERI',
      name: 'Tıbbi Terimler',
      order: 1,
    },
  });

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
