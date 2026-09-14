import type { CurriculumExam, CurriculumTopic } from '../types';

function topics(items: Array<[string, string]>): CurriculumTopic[] {
  return items.map(([code, name], i) => ({ code, name, order: i + 1 }));
}

const MATEMATIK_OABT = topics([
  ['ANALITIK_GEOMETRI', 'Analitik Geometri'],
  ['TRIGONOMETRI', 'Trigonometri'],
  ['LIMIT_SUREKLILIK', 'Limit ve Süreklilik'],
  ['TUREV', 'Türev'],
  ['INTEGRAL', 'İntegral'],
  ['OLASILIK', 'Olasılık'],
  ['PERM_KOMB', 'Permütasyon ve Kombinasyon'],
  ['KARMASIK_SAYILAR', 'Karmaşık Sayılar'],
  ['LOGARITMA', 'Logaritma'],
  ['DIZILER', 'Diziler'],
]);

const TURKCE_OABT = topics([
  ['DIL_BILGISI', 'Dil Bilgisi'],
  ['YAZIM_KURALLARI', 'Yazım Kuralları'],
  ['NOKTALAMA', 'Noktalama İşaretleri'],
  ['ANLATIM_BOZUKLUKLARI', 'Anlatım Bozuklukları'],
  ['EDEBI_SANATLAR', 'Edebi Sanatlar'],
  ['SIIR_BILGISI', 'Şiir Bilgisi'],
  ['EDEBIYAT_DONEMLERI', 'Türk Edebiyatı Dönemleri'],
  ['METIN_INCELEME', 'Metin İnceleme'],
  ['SOZEL_MANTIK', 'Sözel Mantık'],
]);

const FEN_OABT = topics([
  ['FIZIK', 'Fizik'],
  ['KIMYA', 'Kimya'],
  ['BIYOLOJI', 'Biyoloji'],
  ['FEN_OGRETIMI', 'Fen Öğretimi'],
  ['LAB_GUVENLIGI', 'Laboratuvar Güvenliği'],
  ['DENEY_TASARIMI', 'Deney Tasarımı'],
]);

const SOSYAL_OABT = topics([
  ['TARIH', 'Tarih'],
  ['COGRAFYA', 'Coğrafya'],
  ['VATANDASLIK', 'Vatandaşlık'],
  ['SOSYAL_OGRETIM', 'Sosyal Bilgiler Öğretimi'],
  ['GUNCEL_OLAYLAR', 'Güncel Olaylar'],
]);

const INGILIZCE_OABT = topics([
  ['KELIME', 'Kelime Bilgisi'],
  ['GRAMMAR', 'Dil Bilgisi'],
  ['READING', 'Okuma Anlama'],
  ['WRITING', 'Yazma Becerileri'],
  ['LISTENING', 'Dinleme Becerileri'],
  ['SPEAKING', 'Konuşma Becerileri'],
  ['YDL_OGRETIM', 'Yabancı Dil Öğretimi'],
]);

const REHBERLIK_OABT = topics([
  ['KURAMLAR', 'Rehberlik Kuramları'],
  ['OLCME', 'Ölçme ve Değerlendirme'],
  ['MESLEKI', 'Mesleki Rehberlik'],
  ['GRUP', 'Grup Rehberliği'],
  ['BIREYSEL', 'Bireysel Danışma'],
  ['KRIZ', 'Kriz Müdahalesi'],
  ['ETIK', 'Meslek Etiği'],
]);

const SINIF_OGRETMEN_OABT = topics([
  ['GELISIM', 'Gelişim Psikolojisi'],
  ['OGRENME', 'Öğrenme Psikolojisi'],
  ['OLCME_DEG', 'Ölçme ve Değerlendirme'],
  ['PROGRAM', 'Program Geliştirme'],
  ['SINIF_YON', 'Sınıf Yönetimi'],
  ['OZEL_EGITIM', 'Özel Eğitim'],
  ['REHBERLIK', 'Rehberlik'],
  ['EGITIM_SISTEMI', 'Türk Eğitim Sistemi'],
]);

export const OABT_CURRICULUM: CurriculumExam = {
  code: 'OABT',
  name: 'ÖABT (Öğretmenlik Alan Bilgisi Testi)',
  description: 'Öğretmen adayları için branş alan bilgisi sınavı',
  sections: [
    {
      code: 'OGRETIM_ALANI',
      name: 'Öğretim Alanı',
      subjects: [
        { code: 'MATEMATIK', name: 'Matematik ÖABT', topics: MATEMATIK_OABT },
        { code: 'TURKCE', name: 'Türkçe ÖABT', topics: TURKCE_OABT },
        { code: 'FEN_BILIMLERI', name: 'Fen Bilimleri ÖABT', topics: FEN_OABT },
        { code: 'SOSYAL_BILIMLER', name: 'Sosyal Bilimler ÖABT', topics: SOSYAL_OABT },
        { code: 'INGILIZCE', name: 'İngilizce ÖABT', topics: INGILIZCE_OABT },
        { code: 'REHBERLIK', name: 'Rehberlik ÖABT', topics: REHBERLIK_OABT },
        { code: 'SINIF_OGRETMENLIGI', name: 'Sınıf Öğretmenliği ÖABT', topics: SINIF_OGRETMEN_OABT },
      ],
    },
  ],
};
