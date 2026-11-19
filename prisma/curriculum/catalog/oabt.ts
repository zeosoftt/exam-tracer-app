/**
 * ÖABT — her öğretmenlik alanı ayrı sınav (`OABT_<ALAN>`).
 * Tek sınav olsaydı ilerleme yüzdesi tüm branşların konularıyla hesaplanırdı.
 * Bölüm kodu `OGRETIM_ALANI`: puanlama profili bu kodla eşleşir.
 */

import { exam, sec, sub, type CatalogExam, type CatalogSubject, type CatalogTopicInput } from './dsl';

function oabt(code: string, branchName: string, subjects: CatalogSubject[]): CatalogExam {
  return exam(
    `OABT_${code}`,
    `ÖABT - ${branchName}`,
    `${branchName} öğretmen adayları için alan bilgisi ve alan eğitimi testi`,
    [sec('OGRETIM_ALANI', 'Alan Bilgisi ve Alan Eğitimi', subjects)],
  );
}

const alanEgitimi = (dersAdi: string, extra: CatalogTopicInput[] = []): CatalogSubject =>
  sub('ALAN_EGITIMI', 'Alan Eğitimi', [
    `${dersAdi} Öğretim Programı`,
    'Öğrenme ve Öğretme Yaklaşımları',
    'Öğretim Yöntem ve Teknikleri',
    'Kavram Yanılgıları',
    'Ölçme ve Değerlendirme',
    'Materyal ve Teknoloji Kullanımı',
    ...extra,
  ]);

const MATEMATIK_ALAN: CatalogSubject[] = [
  sub('ANALIZ', 'Analiz', [
    'Fonksiyonlar',
    'Diziler ve Seriler',
    'Limit ve Süreklilik',
    'Türev ve Uygulamaları',
    'İntegral ve Uygulamaları',
    'Çok Değişkenli Fonksiyonlar',
  ]),
  sub('CEBIR', 'Cebir', [
    'Mantık ve Kümeler',
    'Bağıntı ve Fonksiyonlar',
    'Sayılar Teorisi',
    'Polinomlar',
    'Matrisler ve Determinantlar',
    'Lineer Cebir',
    'Soyut Cebir (Grup, Halka, Cisim)',
  ]),
  sub('GEOMETRI', 'Geometri', [
    'Öklid Geometrisi',
    'Analitik Geometri',
    'Vektörler',
    'Dönüşüm Geometrisi',
    'Diferansiyel Geometri',
  ]),
  sub('UYGULAMALI_MATEMATIK', 'Uygulamalı Matematik', [
    'Kombinatorik',
    'Olasılık',
    'İstatistik',
    'Diferansiyel Denklemler',
  ]),
];

const TURK_DILI: CatalogSubject = sub('TURK_DILI', 'Türk Dili', [
  'Ses Bilgisi',
  'Yapı Bilgisi (Kök ve Ekler)',
  'Sözcük Türleri',
  'Cümle Bilgisi',
  'Anlam Bilgisi',
  'Yazım ve Noktalama',
]);

const ESKI_TURK_DILI: CatalogSubject = sub('ESKI_TURK_DILI', 'Eski Türk Dili ve Dil Tarihi', [
  'Türk Dilinin Tarihî Gelişimi',
  'Göktürk ve Uygur Türkçesi',
  'Karahanlı Türkçesi',
  'Harezm ve Çağatay Türkçesi',
  'Eski Anadolu ve Osmanlı Türkçesi',
  'Türk Lehçeleri',
]);

const HALK_EDEBIYATI: CatalogSubject = sub('TURK_HALK_EDEBIYATI', 'Türk Halk Edebiyatı', [
  'Halk Edebiyatına Giriş',
  'Anonim Halk Edebiyatı',
  'Âşık Edebiyatı',
  'Tekke ve Tasavvuf Edebiyatı',
  'Destan, Halk Hikâyesi ve Masal',
]);

const DIVAN_EDEBIYATI: CatalogSubject = sub('ESKI_TURK_EDEBIYATI', 'Eski Türk (Divan) Edebiyatı', [
  'Nazım Şekilleri ve Türleri',
  'Aruz Ölçüsü ve Söz Sanatları',
  'Divan Şairleri ve Eserleri',
  'Divan Nesri',
  'Metin Şerhi',
]);

const YENI_EDEBIYAT: CatalogSubject = sub('YENI_TURK_EDEBIYATI', 'Yeni Türk Edebiyatı', [
  'Tanzimat Edebiyatı',
  'Servet-i Fünun ve Fecr-i Âti',
  'Milli Edebiyat',
  'Cumhuriyet Dönemi Şiiri',
  'Cumhuriyet Dönemi Roman ve Hikâyesi',
  'Tiyatro',
]);

const EDEBIYAT_KURAM: CatalogSubject = sub('EDEBIYAT_BILGI_KURAMLARI', 'Edebiyat Bilgi ve Kuramları', [
  'Edebi Türler',
  'Edebi Akımlar',
  'Edebiyat Kuramları ve Eleştiri',
  'Metin Çözümleme',
]);

const COCUK_EDEBIYATI: CatalogSubject = sub('COCUK_EDEBIYATI', 'Çocuk Edebiyatı', [
  'Çocuk Edebiyatının Temel Özellikleri',
  'Çocuk Edebiyatı Türleri',
  'Çocuk Kitaplarında Nitelik',
]);

export const OABT_EXAMS: CatalogExam[] = [
  oabt('TURKCE', 'Türkçe Öğretmenliği', [
    TURK_DILI,
    ESKI_TURK_DILI,
    HALK_EDEBIYATI,
    DIVAN_EDEBIYATI,
    YENI_EDEBIYAT,
    EDEBIYAT_KURAM,
    COCUK_EDEBIYATI,
    alanEgitimi('Türkçe', [
      'Dinleme ve Konuşma Becerilerinin Öğretimi',
      'Okuma ve Yazma Becerilerinin Öğretimi',
      'İlk Okuma Yazma',
    ]),
  ]),
  oabt('TURK_DILI_EDEBIYATI', 'Türk Dili ve Edebiyatı Öğretmenliği', [
    ESKI_TURK_DILI,
    TURK_DILI,
    HALK_EDEBIYATI,
    DIVAN_EDEBIYATI,
    YENI_EDEBIYAT,
    EDEBIYAT_KURAM,
    alanEgitimi('Türk Dili ve Edebiyatı'),
  ]),
  oabt('ILKOGRETIM_MATEMATIK', 'İlköğretim Matematik Öğretmenliği', [
    ...MATEMATIK_ALAN,
    alanEgitimi('Ortaokul Matematik', ['Problem Çözme ve Matematiksel Modelleme']),
  ]),
  oabt('LISE_MATEMATIK', 'Lise Matematik Öğretmenliği', [
    ...MATEMATIK_ALAN,
    alanEgitimi('Ortaöğretim Matematik', ['Problem Çözme ve Matematiksel Modelleme']),
  ]),
  oabt('FEN_BILIMLERI', 'Fen Bilimleri Öğretmenliği', [
    sub('FIZIK', 'Fizik', [
      'Mekanik',
      'Elektrik ve Manyetizma',
      'Dalgalar ve Optik',
      'Isı ve Termodinamik',
      'Modern Fizik',
    ]),
    sub('KIMYA', 'Kimya', [
      'Atom ve Periyodik Sistem',
      'Kimyasal Bağlar',
      'Kimyasal Tepkimeler ve Hesaplamalar',
      'Çözeltiler',
      'Asitler ve Bazlar',
      'Organik Kimya',
    ]),
    sub('BIYOLOJI', 'Biyoloji', [
      'Hücre',
      'Canlıların Sınıflandırılması',
      'Kalıtım ve Genetik',
      'İnsan Anatomisi ve Fizyolojisi',
      'Bitki Biyolojisi',
      'Ekoloji',
    ]),
    sub('YER_GOK', 'Yer ve Gök Bilimleri', ['Yer Bilimleri', 'Astronomi']),
    alanEgitimi('Fen Bilimleri', ['Bilimin Doğası', 'Laboratuvar Uygulamaları ve Güvenliği']),
  ]),
  oabt('SOSYAL_BILGILER', 'Sosyal Bilgiler Öğretmenliği', [
    sub('TARIH', 'Tarih', [
      'Tarih Bilimi ve Yöntemi',
      'İlk Çağ Uygarlıkları',
      'İslamiyet Öncesi Türk Tarihi',
      'İslam Tarihi ve Türk-İslam Devletleri',
      'Osmanlı Tarihi',
      'Türkiye Cumhuriyeti Tarihi',
      'Çağdaş Dünya Tarihi',
    ]),
    sub('COGRAFYA', 'Coğrafya', [
      'Fiziki Coğrafya',
      'Beşeri ve Ekonomik Coğrafya',
      'Türkiye Coğrafyası',
      'Kıtalar ve Ülkeler Coğrafyası',
      'Harita Bilgisi',
    ]),
    sub('SOSYAL_BILIMLER', 'Sosyal Bilimler', [
      'Sosyoloji',
      'Antropoloji',
      'Psikoloji',
      'Felsefe',
    ]),
    sub('VATANDASLIK_EKONOMI', 'Vatandaşlık ve Ekonomi', [
      'Siyaset Bilimi',
      'Anayasa ve İnsan Hakları',
      'Ekonomi',
    ]),
    alanEgitimi('Sosyal Bilgiler', ['Değerler ve Beceriler Eğitimi']),
  ]),
  oabt('TARIH', 'Tarih Öğretmenliği', [
    sub('TARIH_METODOLOJI', 'Tarih Metodolojisi', ['Tarih Bilimi ve Yöntemi', 'Tarihe Yardımcı Bilimler']),
    sub('ESKI_ORTA_CAG', 'Eski ve Orta Çağ Tarihi', [
      'Eski Çağ Uygarlıkları',
      'İslamiyet Öncesi Türk Tarihi',
      'Orta Çağ Avrupa Tarihi',
    ]),
    sub('ISLAM_TURK_ISLAM', 'İslam ve Türk-İslam Tarihi', [
      'İslam Tarihi',
      'İlk Türk-İslam Devletleri',
      'Anadolu Selçuklu ve Beylikler',
    ]),
    sub('OSMANLI_TARIHI', 'Osmanlı Tarihi', [
      'Kuruluş ve Yükselme Dönemi',
      'Duraklama ve Gerileme Dönemi',
      'Dağılma Dönemi ve Islahatlar',
      'Osmanlı Kültür ve Medeniyeti',
    ]),
    sub('YENI_YAKIN_CAG', 'Yeni ve Yakın Çağ Tarihi', [
      'Yeni Çağ Avrupa Tarihi',
      'Yakın Çağ Avrupa Tarihi',
      'Çağdaş Dünya Tarihi',
    ]),
    sub('TC_TARIHI', 'Türkiye Cumhuriyeti Tarihi', [
      'Milli Mücadele',
      'Atatürk İlke ve İnkılapları',
      'Çok Partili Dönem ve Sonrası',
    ]),
    alanEgitimi('Tarih'),
  ]),
  oabt('COGRAFYA', 'Coğrafya Öğretmenliği', [
    sub('FIZIKI_COGRAFYA', 'Fiziki Coğrafya', [
      'Klimatoloji',
      'Jeomorfoloji',
      'Hidrografya',
      'Biyocoğrafya ve Toprak Coğrafyası',
    ]),
    sub('BESERI_EKONOMIK', 'Beşeri ve Ekonomik Coğrafya', [
      'Nüfus Coğrafyası',
      'Yerleşme Coğrafyası',
      'Ekonomik Coğrafya',
      'Siyasi Coğrafya',
    ]),
    sub('TURKIYE_COGRAFYASI', 'Türkiye Coğrafyası', [
      'Türkiye’nin Fiziki Coğrafyası',
      'Türkiye’nin Beşeri ve Ekonomik Coğrafyası',
      'Türkiye’nin Bölgeleri',
    ]),
    sub('KITALAR_ULKELER', 'Kıtalar ve Ülkeler Coğrafyası', ['Kıtalar Coğrafyası', 'Ülkeler Coğrafyası']),
    sub('HARITA', 'Harita Bilgisi ve CBS', ['Harita Bilgisi', 'Coğrafi Bilgi Sistemleri']),
    alanEgitimi('Coğrafya'),
  ]),
  oabt('FIZIK', 'Fizik Öğretmenliği', [
    sub('MEKANIK', 'Mekanik', ['Kinematik', 'Dinamik', 'İş ve Enerji', 'Momentum ve Çarpışmalar', 'Dönme Hareketi', 'Titreşimler']),
    sub('ELEKTRIK_MANYETIZMA', 'Elektrik ve Manyetizma', ['Elektrostatik', 'Elektrik Devreleri', 'Manyetizma', 'Elektromanyetik İndüksiyon']),
    sub('OPTIK_DALGALAR', 'Optik ve Dalgalar', ['Dalgalar', 'Geometrik Optik', 'Fiziksel Optik']),
    sub('TERMODINAMIK', 'Termodinamik', ['Isı ve Sıcaklık', 'Termodinamiğin Yasaları', 'Kinetik Teori']),
    sub('MODERN_FIZIK', 'Modern Fizik', ['Özel Görelilik', 'Kuantum Fiziği', 'Atom ve Çekirdek Fiziği']),
    alanEgitimi('Fizik'),
  ]),
  oabt('KIMYA', 'Kimya Öğretmenliği', [
    sub('GENEL_KIMYA', 'Genel Kimya', ['Atom ve Periyodik Sistem', 'Kimyasal Bağlar', 'Stokiyometri', 'Gazlar', 'Çözeltiler']),
    sub('ANALITIK_KIMYA', 'Analitik Kimya', ['Kimyasal Denge', 'Asit-Baz Dengeleri', 'Çözünürlük Dengesi', 'Volumetrik ve Gravimetrik Analiz']),
    sub('ANORGANIK_KIMYA', 'Anorganik Kimya', ['Atom Yapısı ve Bağ Teorileri', 'Koordinasyon Kimyası', 'Elementlerin Kimyası']),
    sub('ORGANIK_KIMYA', 'Organik Kimya', ['Organik Bileşikler ve Adlandırma', 'Fonksiyonel Gruplar', 'Organik Tepkimeler']),
    sub('FIZIKOKIMYA', 'Fizikokimya', ['Termodinamik', 'Kimyasal Kinetik', 'Elektrokimya']),
    sub('BIYOKIMYA', 'Biyokimya', ['Biyomoleküller', 'Enzimler', 'Metabolizma']),
    alanEgitimi('Kimya', ['Laboratuvar Uygulamaları ve Güvenliği']),
  ]),
  oabt('BIYOLOJI', 'Biyoloji Öğretmenliği', [
    sub('HUCRE_MOLEKULER', 'Hücre ve Moleküler Biyoloji', ['Hücre Yapısı', 'Hücre Bölünmesi', 'DNA, RNA ve Protein Sentezi', 'Biyoteknoloji']),
    sub('GENETIK', 'Genetik ve Evrim', ['Mendel Genetiği', 'Popülasyon Genetiği', 'Evrim']),
    sub('BITKI_BIYOLOJISI', 'Bitki Biyolojisi', ['Bitki Anatomisi ve Morfolojisi', 'Bitki Fizyolojisi']),
    sub('HAYVAN_INSAN', 'Hayvan Biyolojisi ve İnsan Fizyolojisi', ['Hayvan Sistematiği', 'İnsan Anatomisi ve Fizyolojisi', 'Embriyoloji']),
    sub('EKOLOJI_MIKRO', 'Ekoloji ve Mikrobiyoloji', ['Ekoloji', 'Mikrobiyoloji', 'Canlıların Sınıflandırılması']),
    alanEgitimi('Biyoloji', ['Laboratuvar Uygulamaları ve Güvenliği']),
  ]),
  oabt('DIN_KULTURU', 'Din Kültürü ve Ahlak Bilgisi Öğretmenliği', [
    sub('TEFSIR_HADIS', 'Tefsir ve Hadis', ['Kur’an-ı Kerim ve Tecvid', 'Tefsir', 'Hadis']),
    sub('FIKIH_KELAM', 'Fıkıh ve Kelam', ['İslam Hukuku (Fıkıh)', 'Kelam ve Akaid', 'İslam Mezhepleri']),
    sub('ISLAM_TARIHI_DUSUNCE', 'İslam Tarihi ve Düşüncesi', ['Siyer ve İslam Tarihi', 'İslam Felsefesi', 'Tasavvuf']),
    sub('DIN_BILIMLERI', 'Din Bilimleri', ['Dinler Tarihi', 'Din Psikolojisi', 'Din Sosyolojisi', 'Din Felsefesi']),
    alanEgitimi('Din Kültürü ve Ahlak Bilgisi', ['Değerler Eğitimi']),
  ]),
  oabt('INGILIZCE', 'İngilizce Öğretmenliği', [
    sub('DIL_YETERLIGI', 'Dil Yeterliği', ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Cloze Test ve Paragraf Tamamlama']),
    sub('DILBILIM', 'Dilbilim', ['Phonetics ve Phonology', 'Morphology ve Syntax', 'Semantics ve Pragmatics', 'Sociolinguistics ve Language Acquisition']),
    sub('EDEBIYAT', 'İngiliz Edebiyatı', ['Literary Periods', 'Poetry', 'Drama', 'Novel ve Short Story']),
    sub('ALAN_EGITIMI', 'Alan Eğitimi (ELT)', [
      'Language Teaching Methods',
      'Teaching Language Skills',
      'Teaching English to Young Learners',
      'Classroom Management',
      'Materials Evaluation and Development',
      'Language Testing and Assessment',
    ]),
  ]),
  oabt('REHBERLIK', 'Rehberlik ve Psikolojik Danışmanlık', [
    sub('PD_KURAMLARI', 'Psikolojik Danışma Kuramları', ['Psikanalitik ve Adlerci Kuramlar', 'Varoluşçu ve Danışan Merkezli Kuramlar', 'Bilişsel ve Davranışçı Kuramlar', 'Sistemik ve Postmodern Yaklaşımlar']),
    sub('PD_BECERILERI', 'Psikolojik Danışma İlke ve Teknikleri', ['Temel Danışma Becerileri', 'Psikolojik Danışma Süreci', 'Meslek Etiği']),
    sub('GRUPLA_PD', 'Grupla Psikolojik Danışma', ['Grup Süreci ve Dinamikleri', 'Grup Liderliği']),
    sub('KARIYER', 'Kariyer Danışmanlığı', ['Kariyer Gelişim Kuramları', 'Mesleki Rehberlik Uygulamaları']),
    sub('BIREYI_TANIMA', 'Bireyi Tanıma Teknikleri', ['Test Teknikleri', 'Test Dışı Teknikler']),
    sub('PSIKOPATOLOJI', 'Davranış Bozuklukları', ['Ruh Sağlığı ve Psikopatoloji', 'Çocuk ve Ergen Ruh Sağlığı']),
    sub('ARASTIRMA', 'Araştırma Yöntemleri ve İstatistik', ['Araştırma Yöntemleri', 'Temel İstatistik']),
    sub('OKULDA_REHBERLIK', 'Okulda Rehberlik', ['Gelişimsel Rehberlik Programları', 'Kriz Müdahalesi ve Önleme', 'Aile ve Öğretmenle Çalışma']),
  ]),
  oabt('SINIF_OGRETMENLIGI', 'Sınıf Öğretmenliği', [
    sub('TURKCE', 'Türkçe', ['Dil Bilgisi', 'Anlam Bilgisi', 'Okuma ve Anlama']),
    sub('MATEMATIK', 'Matematik', ['Sayılar ve İşlemler', 'Cebir', 'Geometri ve Ölçme', 'Veri İşleme ve Olasılık']),
    sub('FEN_BILIMLERI', 'Fen Bilimleri', ['Fizik', 'Kimya', 'Biyoloji', 'Yer ve Gök Bilimleri']),
    sub('SOSYAL_BILGILER', 'Sosyal Bilgiler', ['Tarih', 'Coğrafya', 'Vatandaşlık ve İnsan Hakları']),
    COCUK_EDEBIYATI,
    sub('ALAN_EGITIMI', 'Alan Eğitimi', [
      'İlk Okuma Yazma Öğretimi',
      'Türkçe Öğretimi',
      'Matematik Öğretimi',
      'Fen Bilimleri Öğretimi',
      'Sosyal Bilgiler Öğretimi',
      'Hayat Bilgisi Öğretimi',
    ]),
  ]),
  oabt('OKUL_ONCESI', 'Okul Öncesi Öğretmenliği', [
    sub('GELISIM', 'Erken Çocukluk Gelişimi', ['Bilişsel ve Dil Gelişimi', 'Motor Gelişim', 'Sosyal ve Duygusal Gelişim']),
    sub('ERKEN_COCUKLUK_EGITIMI', 'Erken Çocukluk Eğitimi', ['Okul Öncesi Eğitime Giriş', 'Okul Öncesi Eğitim Programı', 'Oyun ve Etkinlik Planlama']),
    sub('SAGLIK', 'Çocuk Sağlığı ve Güvenliği', ['Çocuk Sağlığı', 'İlk Yardım', 'Beslenme']),
    COCUK_EDEBIYATI,
    sub('OZEL_EGITIM_AILE', 'Özel Eğitim ve Aile Katılımı', ['Özel Eğitim ve Kaynaştırma', 'Aile Eğitimi ve Katılımı']),
    sub('ALAN_EGITIMI', 'Alan Eğitimi', [
      'Fen ve Matematik Eğitimi',
      'Müzik, Drama ve Sanat Eğitimi',
      'Dil ve Erken Okuryazarlık',
      'Gözlem ve Değerlendirme',
    ]),
  ]),
  oabt('BEDEN_EGITIMI', 'Beden Eğitimi ve Spor Öğretmenliği', [
    sub('SPOR_BILIMLERI', 'Spor Bilimleri', ['Anatomi', 'Egzersiz Fizyolojisi', 'Biyomekanik', 'Antrenman Bilgisi']),
    sub('HAREKET_GELISIM', 'Hareket ve Motor Gelişim', ['Motor Gelişim', 'Motor Öğrenme']),
    sub('PSIKOSOSYAL', 'Spor Psikolojisi ve Sosyolojisi', ['Spor Psikolojisi', 'Spor Sosyolojisi']),
    sub('SAGLIK', 'Sporda Sağlık', ['Sporda Sağlık ve İlk Yardım', 'Sporcu Beslenmesi']),
    alanEgitimi('Beden Eğitimi ve Spor'),
  ]),
];
