import type { CurriculumTopic } from '../types';

/** KPSS / ALES / DGS / TYT ortak Türkçe konu listesi */
export const TURKCE_TOPICS: CurriculumTopic[] = [
  { code: 'SOZCUKTE_ANLAM', name: 'Sözcükte Anlam' },
  { code: 'CUMLEDE_ANLAM', name: 'Cümlede Anlam' },
  { code: 'SOZCUK_TURLERI', name: 'Sözcük Türleri' },
  { code: 'SOZCUKTE_YAPI', name: 'Sözcükte Yapı' },
  { code: 'CUMLENIN_OGELERI', name: 'Cümlenin Ögeleri' },
  { code: 'CUMLE_TURLERI', name: 'Cümle Türleri' },
  { code: 'SES_OLAYLARI', name: 'Ses Olayları' },
  { code: 'YAZIM_KURALLARI', name: 'Yazım Kuralları' },
  { code: 'NOKTALAMA_ISARETLERI', name: 'Noktalama İşaretleri' },
  { code: 'ANLATIM_BOZUKLUKLARI', name: 'Anlatım Bozuklukları' },
  { code: 'PARAGRAFTA_ANLAM', name: 'Paragrafta Anlam' },
  { code: 'PARAGRAFTA_ANLATIM_BICIMLERI', name: 'Paragrafta Anlatım Biçimleri' },
  { code: 'SOZEL_MANTIK', name: 'Sözel Mantık' },
];

/** Sayısal testler — Matematik */
export const MATEMATIK_TOPICS: CurriculumTopic[] = [
  { code: 'TEMEL_KAVRAMLAR', name: 'Temel Kavramlar' },
  { code: 'SAYILAR', name: 'Sayılar ve İşlemler' },
  { code: 'BOLUNEBILME', name: 'Bölünebilme Kuralları' },
  { code: 'EBOB_EKOK', name: 'EBOB-EKOK' },
  { code: 'RASYONEL_SAYILAR', name: 'Rasyonel Sayılar' },
  { code: 'BASIT_ESITSIZLIKLER', name: 'Basit Eşitsizlikler' },
  { code: 'MUTLAK_DEGER', name: 'Mutlak Değer' },
  { code: 'USLU_SAYILAR', name: 'Üslü Sayılar' },
  { code: 'KOKLU_SAYILAR', name: 'Köklü Sayılar' },
  { code: 'CARPANLARA_AYIRMA', name: 'Çarpanlara Ayırma' },
  { code: 'ORAN_ORANTI', name: 'Oran-Orantı' },
  { code: 'DENKLEM_COZME', name: 'Denklem Çözme' },
  { code: 'PROBLEMLER', name: 'Problemler' },
  { code: 'KUMELER', name: 'Kümeler' },
  { code: 'FONKSIYONLAR', name: 'Fonksiyonlar' },
  { code: 'PERMUTASYON_KOMBINASYON', name: 'Permütasyon ve Kombinasyon' },
  { code: 'OLASILIK', name: 'Olasılık' },
  { code: 'SAYISAL_MANTIK', name: 'Sayısal Mantık' },
];

/** Sayısal testler — Geometri */
export const GEOMETRI_TOPICS: CurriculumTopic[] = [
  { code: 'ACILAR', name: 'Açılar' },
  { code: 'UCGENLER', name: 'Üçgenler' },
  { code: 'DORTGENLER_COKGENLER', name: 'Dörtgenler ve Çokgenler' },
  { code: 'CEMBER_DAIRE', name: 'Çember ve Daire' },
  { code: 'ANALITIK_GEOMETRI', name: 'Analitik Geometri' },
  { code: 'KATI_CISIMLER', name: 'Katı Cisimler' },
];

/** TYT / KPSS — Tarih */
export const TARIH_TOPICS: CurriculumTopic[] = [
  { code: 'ISLAMIYET_ONCESI_TURK', name: 'İslamiyet Öncesi Türk Tarihi' },
  { code: 'ILK_TURK_ISLAM', name: 'İlk Türk İslam Devletleri' },
  { code: 'OSMANLI_KURULUS', name: 'Osmanlı Kuruluş Dönemi' },
  { code: 'OSMANLI_YUKSELIS', name: 'Osmanlı Yükselme Dönemi' },
  { code: 'OSMANLI_DURAKLAMA', name: 'Osmanlı Duraklama Dönemi' },
  { code: 'OSMANLI_GERILEME', name: 'Osmanlı Gerileme Dönemi' },
  { code: 'OSMANLI_DAGILMA', name: 'Osmanlı Dağılma Dönemi' },
  { code: 'KURTULUS_SAVASI', name: 'Kurtuluş Savaşı' },
  { code: 'INKILAP_TARIHI', name: 'İnkılap Tarihi' },
  { code: 'ATATURK_DONEMI', name: 'Atatürk Dönemi İç ve Dış Politika' },
  { code: 'CAGDAS_TURK_DUNYA', name: 'Çağdaş Türk ve Dünya Tarihi' },
];

/** TYT / KPSS — Coğrafya */
export const COGRAFYA_TOPICS: CurriculumTopic[] = [
  { code: 'COGRAFI_KONUM', name: 'Türkiye\'nin Coğrafi Konumu' },
  { code: 'IKLIM_BITKI', name: 'İklim ve Bitki Örtüsü' },
  { code: 'FIZIKI_OZELLIKLER', name: 'Fiziki Özellikler' },
  { code: 'NUFUS_YERLESME', name: 'Nüfus ve Yerleşme' },
  { code: 'TARIM_HAYVANCILIK', name: 'Tarım ve Hayvancılık' },
  { code: 'MADEN_ENERJI', name: 'Madenler ve Enerji' },
  { code: 'SANAYI', name: 'Sanayi' },
  { code: 'ULASIM_TICARET', name: 'Ulaşım ve Ticaret' },
  { code: 'TURIZM', name: 'Turizm' },
  { code: 'BOLGELER', name: 'Bölgeler Coğrafyası' },
];

/** TYT — Felsefe */
export const FELSEFE_TOPICS: CurriculumTopic[] = [
  { code: 'BILGI_FELSEFESI', name: 'Bilgi Felsefesi' },
  { code: 'VARLIK_FELSEFESI', name: 'Varlık Felsefesi' },
  { code: 'AHLAK_FELSEFESI', name: 'Ahlak Felsefesi' },
  { code: 'SANAT_FELSEFESI', name: 'Sanat Felsefesi' },
  { code: 'DIN_FELSEFESI', name: 'Din Felsefesi' },
  { code: 'SIYASET_FELSEFESI', name: 'Siyaset Felsefesi' },
  { code: 'BILIM_FELSEFESI', name: 'Bilim Felsefesi' },
];

/** TYT — Din Kültürü */
export const DIN_KULTURU_TOPICS: CurriculumTopic[] = [
  { code: 'INANC_ILKELERI', name: 'İnanç İlkeleri' },
  { code: 'IBADET', name: 'İbadet' },
  { code: 'AHLAK_HAYAT', name: 'Ahlak ve Hayat' },
  { code: 'HZ_MUHAMMED', name: 'Hz. Muhammed\'in Hayatı' },
  { code: 'KURAN_YORUM', name: 'Kur\'an-ı Kerim ve Yorumu' },
  { code: 'ISLAM_DUSUNCESI', name: 'İslam Düşüncesinde Yorumlar' },
];

/** TYT — Fizik */
export const TYT_FIZIK_TOPICS: CurriculumTopic[] = [
  { code: 'FIZIK_BILIMINE_GIRIS', name: 'Fizik Bilimine Giriş' },
  { code: 'MADDE_VE_OZELLIKLERI', name: 'Madde ve Özellikleri' },
  { code: 'HAREKET_KUVVET', name: 'Hareket ve Kuvvet' },
  { code: 'ENERJI', name: 'Enerji' },
  { code: 'ISI_SICAKLIK', name: 'Isı ve Sıcaklık' },
  { code: 'ELEKTROSTATIK', name: 'Elektrostatik' },
  { code: 'OPTIK', name: 'Optik' },
];

/** TYT — Kimya */
export const TYT_KIMYA_TOPICS: CurriculumTopic[] = [
  { code: 'KIMYA_BILIMI', name: 'Kimya Bilimi' },
  { code: 'ATOM_PERIYODIK', name: 'Atom ve Periyodik Sistem' },
  { code: 'KIMYASAL_TEPKIMELER', name: 'Kimyasal Tepkimeler' },
  { code: 'ASIT_BAZ_TUZ', name: 'Asit-Baz ve Tuzlar' },
  { code: 'KARIŞIMLAR', name: 'Karışımlar' },
  { code: 'KIMYA_HESAP', name: 'Kimya Hesaplamaları' },
  { code: 'KIMYA_VE_ENERJI', name: 'Kimya ve Enerji' },
];

/** TYT — Biyoloji */
export const TYT_BIYOLOJI_TOPICS: CurriculumTopic[] = [
  { code: 'CANLILARIN_TEMEL_BILESENLERI', name: 'Canlıların Temel Bileşenleri' },
  { code: 'HUCRE', name: 'Hücre' },
  { code: 'CANLILARIN_SINIFLANDIRILMASI', name: 'Canlıların Sınıflandırılması' },
  { code: 'HUCRE_BOLUNMESI', name: 'Hücre Bölünmesi' },
  { code: 'KALITIM', name: 'Kalıtım' },
  { code: 'EKOSISTEM', name: 'Ekosistem Ekolojisi' },
  { code: 'BITKI_BIYOLOJISI', name: 'Bitki Biyolojisi' },
];

/** AYT — Matematik */
export const AYT_MATEMATIK_TOPICS: CurriculumTopic[] = [
  { code: 'TRIGONOMETRI', name: 'Trigonometri' },
  { code: 'LOGARITMA', name: 'Logaritma' },
  { code: 'DIZILER', name: 'Diziler' },
  { code: 'LIMIT', name: 'Limit' },
  { code: 'TUREV', name: 'Türev' },
  { code: 'INTEGRAL', name: 'İntegral' },
  { code: 'KARMASIK_SAYILAR', name: 'Karmaşık Sayılar' },
  { code: 'BINOM', name: 'Binom' },
  { code: 'PERM_KOMB_OLAS_AYT', name: 'Permütasyon, Kombinasyon, Olasılık' },
];

/** AYT — Fizik */
export const AYT_FIZIK_TOPICS: CurriculumTopic[] = [
  { code: 'VEKTORLER', name: 'Vektörler' },
  { code: 'KUVVET_HAREKET_AYT', name: 'Kuvvet ve Hareket' },
  { code: 'ENERJI_IS_AYT', name: 'Enerji ve İş' },
  { code: 'ITME_MOMENTUM', name: 'İtme ve Momentum' },
  { code: 'TORK_DONME', name: 'Tork ve Dönme' },
  { code: 'BASINC_KALDIRMA', name: 'Basınç ve Kaldırma Kuvveti' },
  { code: 'ELEKTRIK_AYT', name: 'Elektrik' },
  { code: 'MANYETIZMA', name: 'Manyetizma' },
  { code: 'DALGALAR', name: 'Dalgalar' },
  { code: 'MODERN_FIZIK', name: 'Modern Fizik' },
];

/** AYT — Kimya */
export const AYT_KIMYA_TOPICS: CurriculumTopic[] = [
  { code: 'MODERN_ATOM', name: 'Modern Atom Teorisi' },
  { code: 'GAZLAR', name: 'Gazlar' },
  { code: 'SIVI_COZELTILER', name: 'Sıvı Çözeltiler' },
  { code: 'KIMYASAL_TEPKIME_HIZ', name: 'Kimyasal Tepkime Hızı' },
  { code: 'KIMYASAL_DENGE', name: 'Kimyasal Denge' },
  { code: 'ASIT_BAZ_DENGE', name: 'Asit-Baz Dengesi' },
  { code: 'ELEKTROKIMYA', name: 'Elektrokimya' },
  { code: 'ORGANIK_KIMYA', name: 'Organik Kimya' },
  { code: 'ENERJI_KIMYASI', name: 'Enerji Kimyası' },
];

/** AYT — Biyoloji */
export const AYT_BIYOLOJI_TOPICS: CurriculumTopic[] = [
  { code: 'SINIR_SISTEMI', name: 'Sinir Sistemi' },
  { code: 'ENDOKRIN_SISTEM', name: 'Endokrin Sistem' },
  { code: 'DOLASIM_SISTEMI', name: 'Dolaşım Sistemi' },
  { code: 'SOLUNUM_SISTEMI', name: 'Solunum Sistemi' },
  { code: 'SINDIRIM_SISTEMI', name: 'Sindirim Sistemi' },
  { code: 'BOŞALTIM_SISTEMI', name: 'Boşaltım Sistemi' },
  { code: 'DESTEK_HAREKET', name: 'Destek ve Hareket Sistemi' },
  { code: 'UREME_GELISIM', name: 'Üreme ve Gelişim' },
  { code: 'KOMUNITE_EKOLOJI', name: 'Komünite ve Popülasyon Ekolojisi' },
  { code: 'BITKI_BIYOLOJISI_AYT', name: 'Bitki Biyolojisi' },
  { code: 'HUCRE_BOLUNMESI_AYT', name: 'Hücre Bölünmesi ve Kalıtım' },
];

/** AYT — Edebiyat */
export const AYT_EDEBIYAT_TOPICS: CurriculumTopic[] = [
  { code: 'SIIR_BILGISI', name: 'Şiir Bilgisi' },
  { code: 'ISLAMIYET_ONCESI_EDEBIYAT', name: 'İslamiyet Öncesi Türk Edebiyatı' },
  { code: 'HALK_EDEBIYATI', name: 'Halk Edebiyatı' },
  { code: 'DIVAN_EDEBIYATI', name: 'Divan Edebiyatı' },
  { code: 'TANZIMAT_EDEBIYATI', name: 'Tanzimat Edebiyatı' },
  { code: 'SERVETIFUNUN', name: 'Servet-i Fünun' },
  { code: 'FECR_I_ATI', name: 'Fecr-i Ati' },
  { code: 'MILLI_EDEBIYAT', name: 'Milli Edebiyat' },
  { code: 'CUMHURIYET_EDEBIYATI', name: 'Cumhuriyet Dönemi Edebiyatı' },
  { code: 'CAGDAS_TURK_EDEBIYATI', name: 'Çağdaş Türk Edebiyatı' },
  { code: 'EDEBI_AKIMLAR', name: 'Edebi Akımlar' },
  { code: 'METIN_COZUMLEME', name: 'Metin Çözümleme' },
];

/** AYT — Tarih-1 */
export const AYT_TARIH1_TOPICS: CurriculumTopic[] = [
  { code: 'TARIH_BILIMI', name: 'Tarih Bilimi' },
  { code: 'UYGARLIK_TARIHI', name: 'Uygarlığın Doğuşu ve İlk Uygarlıklar' },
  { code: 'ISLAM_TARIHI', name: 'İslam Tarihi' },
  { code: 'TURK_ISLAM_TARIHI', name: 'Türk-İslam Tarihi' },
  { code: 'OSMANLI_TARIHI_AYT', name: 'Osmanlı Tarihi' },
  { code: 'YAKIN_CAG_TARIHI', name: 'Yakın Çağ Avrupa Tarihi' },
  { code: 'XX_YUZYIL_TARIHI', name: '20. Yüzyıl Başlarında Dünya' },
  { code: 'MILLI_MUCADELE', name: 'Milli Mücadele Dönemi' },
  { code: 'ATATURK_INKILAP', name: 'Atatürk İlke ve İnkılapları' },
  { code: 'II_DUNYA_SAVASI_SONRASI', name: 'II. Dünya Savaşı Sonrası' },
];

/** AYT — Coğrafya-1 */
export const AYT_COGRAFYA1_TOPICS: CurriculumTopic[] = [
  { code: 'DOGA_SISTEMLERI', name: 'Doğal Sistemler' },
  { code: 'BESERI_SISTEMLER', name: 'Beşeri Sistemler' },
  { code: 'CEVRE_BOLGE', name: 'Çevre ve Bölgeler' },
  { code: 'KURESEL_OLCEK', name: 'Küresel Ortam: Bölgeler ve Ülkeler' },
  { code: 'TURKIYE_COGRAFYASI_AYT', name: 'Türkiye Coğrafyası' },
  { code: 'CEVRE_SORUNLARI', name: 'Çevre ve Toplum' },
  { code: 'EKONOMIK_FAALIYETLER', name: 'Ekonomik Faaliyetler' },
];

/** YDT / YDS / YÖKDİL — İngilizce */
export const INGILIZCE_YDS_TOPICS: CurriculumTopic[] = [
  { code: 'KELIME_BILGISI', name: 'Kelime Bilgisi (Vocabulary)' },
  { code: 'DIL_BILGISI', name: 'Dil Bilgisi (Grammar)' },
  { code: 'CLOZE_TEST', name: 'Cloze Test' },
  { code: 'CUMLE_TAMAMLAMA', name: 'Cümle Tamamlama' },
  { code: 'PARAGRAF_TAMAMLAMA', name: 'Paragraf Tamamlama' },
  { code: 'CEVIRI', name: 'Çeviri' },
  { code: 'PARAGRAF_ANLAM', name: 'Paragraf Anlam' },
  { code: 'DIYALOG_TAMAMLAMA', name: 'Diyalog Tamamlama' },
  { code: 'ANLAMCA_YAKIN', name: 'Anlamca Yakın Cümle' },
  { code: 'IRRELEVANT', name: 'Paragraf Dışı Cümle' },
];

/** YÖKDİL alan terimleri — prefix ile kod benzersizliği */
export function yokdilFieldTopics(prefix: string) {
  return [
    { code: `${prefix}_ALAN_KELIMELERI`, name: 'Alan Kelimeleri' },
    { code: `${prefix}_AKADEMIK_IFADELER`, name: 'Akademik İfadeler' },
    { code: `${prefix}_METIN_ANLAMA`, name: 'Metin Anlama' },
    { code: `${prefix}_PARAGRAF_YORUM`, name: 'Paragraf Yorumlama' },
    { code: `${prefix}_TERIM_ESLESTIRME`, name: 'Terim Eşleştirme' },
    { code: `${prefix}_CLOZE`, name: 'Cloze Test' },
    { code: `${prefix}_CEVIRI`, name: 'Çeviri' },
  ];
}

/** @deprecated yokdilFieldTopics kullanın */
export const YOKDIL_FIELD_TOPICS = yokdilFieldTopics;
