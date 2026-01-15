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
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'PARAGRAF' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'PARAGRAF',
      name: 'Paragraf',
      order: 1,
    },
  });

  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'DIL_BILGISI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'DIL_BILGISI',
      name: 'Dil Bilgisi',
      order: 2,
    },
  });

  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYTurkce.id, code: 'YAZIM_KURALLARI' } },
    update: {},
    create: {
      subjectId: kpssGYTurkce.id,
      code: 'YAZIM_KURALLARI',
      name: 'Yazım Kuralları',
      order: 3,
    },
  });

  // KPSS Genel Yetenek - Matematik Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'PROBLEMLER' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'PROBLEMLER',
      name: 'Problemler',
      order: 1,
    },
  });

  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYMatematik.id, code: 'SAYISAL_MANTIK' } },
    update: {},
    create: {
      subjectId: kpssGYMatematik.id,
      code: 'SAYISAL_MANTIK',
      name: 'Sayısal Mantık',
      order: 2,
    },
  });

  // KPSS Genel Yetenek - Geometri Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGYGeometri.id, code: 'TEMEL_GEOMETRI' } },
    update: {},
    create: {
      subjectId: kpssGYGeometri.id,
      code: 'TEMEL_GEOMETRI',
      name: 'Temel Geometri',
      order: 1,
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
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'ATATURK_ILKE_INKILAP' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'ATATURK_ILKE_INKILAP',
      name: 'Atatürk İlkeleri ve İnkılap Tarihi',
      order: 1,
    },
  });

  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKTarih.id, code: 'TURKIYE_TARIHI' } },
    update: {},
    create: {
      subjectId: kpssGKTarih.id,
      code: 'TURKIYE_TARIHI',
      name: 'Türkiye Tarihi',
      order: 2,
    },
  });

  // KPSS Genel Kültür - Coğrafya Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKCografya.id, code: 'TURKIYE_COGRAFYASI' } },
    update: {},
    create: {
      subjectId: kpssGKCografya.id,
      code: 'TURKIYE_COGRAFYASI',
      name: 'Türkiye Coğrafyası',
      order: 1,
    },
  });

  // KPSS Genel Kültür - Vatandaşlık Dersi Konuları
  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'ANAYASA' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'ANAYASA',
      name: 'Anayasa',
      order: 1,
    },
  });

  await prisma.topic.upsert({
    where: { subjectId_code: { subjectId: kpssGKVatandaslik.id, code: 'GUNCEL_BILGILER' } },
    update: {},
    create: {
      subjectId: kpssGKVatandaslik.id,
      code: 'GUNCEL_BILGILER',
      name: 'Güncel Bilgiler',
      order: 2,
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
