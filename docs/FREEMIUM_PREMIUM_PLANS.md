# Freemium ve Premium Plan Sistemi

Bu dokümanda **ücretsiz (freemium)** ve **premium** planların kapsamı açıklanır. Pro satın alma **Shopier** üzerinden yapılır; tıklamalar `ShopierCheckoutLink` ile izlenir.

---

## Deneme takibi — ücretsiz vs Pro

| Özellik | Ücretsiz | Pro |
|---------|----------|-----|
| Deneme listesi | Evet | Evet |
| Yeni deneme kaydı | Evet | Evet |
| Deneme detayı, ders/konu analizi | Hayır | Evet |
| ÖSYM uyumlu puan önizlemesi, net trendi | Hayır | Evet |

Kaynak: `lib/deneme/denemeAccess.ts` — Premium yalnızca detay/analiz için zorunludur.

---

## 1. Plan Özeti

| Plan        | Tür       | Temel takip | Premium özellikler                    |
|------------|-----------|-------------|----------------------------------------|
| **FREE**   | Freemium  | Evet        | Yok                                     |
| **PRO**    | Premium   | Evet        | Raporlar, CSV/PDF export, gelişmiş analitik |
| **ENTERPRISE** | Kurumsal | Evet        | Tümü + API, özel marka, destek          |

---

## 2. Freemium Plan (FREE) — Sadece Temel Takip

**Kapsam:**

- Sınav listesi görüntüleme
- Konu bazlı ilerleme takibi
- Basit dashboard (istatistikler)
- **Limitler:** 1 kullanıcı, 3 sınav, 10 öğrenci, 100 MB depolama

**Olmayanlar (Premium’a özel):**

- Gelişmiş analitik
- CSV / PDF dışa aktarma
- API erişimi
- Özel marka / white label

Uygulama tarafında: Temel takip için ekstra bir “feature” kodu yok; tüm kullanıcılar varsayılan olarak bu özelliklere erişir. Premium özellikler `hasFeatureAccess(organizationId, featureCode)` ile kontrol edilir.

---

## 3. Premium Plan (PRO)

**Kapsam:**

- Freemium’daki tüm temel takip özellikleri
- Gelişmiş analitik
- CSV ve PDF dışa aktarma
- **Limitler:** 1 kullanıcı, 50 sınav, 100 öğrenci, 1000 MB depolama
- Plan ataması: yönetici paneli veya ileride eklenecek ödeme sağlayıcı ile

---

## 4. Uygulama Akışı (Kod Tarafı)

1. **Plan bilgisi:** `getOrganizationPlanInfo(organizationId)` → plan kodu, limitler, `features` listesi.
2. **Limit kontrolü:** Yeni sınav/öğrenci eklemeden önce `canPerformAction(organizationId, 'CREATE_EXAM' | 'CREATE_STUDENT')` veya `checkPlanLimit(organizationId, 'EXAMS' | 'STUDENTS')`.
3. **Premium özellik:** Rapor/export/analitik ekranlarında `hasFeatureAccess(organizationId, 'EXPORT_CSV' | 'ADVANCED_ANALYTICS' | ...)` ile kontrol; yoksa plan bilgisi veya “Premium plan gerekli” mesajı gösterilir.

---

## 5. Varsayılan Freemium

- **Yeni kayıt:** Her yeni kayıt otomatik olarak **Freemium (FREE)** kabul edilir. Kayıt sırasında kullanıcı için FREE planlı kişisel organizasyon oluşturulur (limitler: 3 sınav, 10 öğrenci).
- **Mevcut kullanıcılar:** Daha önce kayıt olmuş ve henüz kişisel organizasyonu olmayan kullanıcılar için backfill script çalıştırılır:
  ```bash
  npm run db:seed:auth    # Önce plan/rol seed (bir kez)
  npm run db:backfill-freemium
  ```
  Bu script, `personalOrganizationId` boş olan tüm kullanıcılar için FREE planlı kişisel organizasyon oluşturur.

## 6. Kurulum Özeti

1. **Plan ve feature** — `lib/auth/seedPermissions.ts` içinde FREE = freemium (sadece temel takip), PRO = premium tanımlandı. Seed: `npm run db:seed:auth`.
2. **Yeni kayıt** — `app/api/auth/register` kayıttan hemen sonra `createFreemiumPersonalOrganization` ile FREE planlı kişisel org atar.
3. **Plan ataması** — Organizasyonun planı `Organization.currentPlanId` veya `Subscription` kaydı ile yönetilir; Shopier satın alma sonrası manuel/yarı otomatik atama veya yönetici paneli ile güncellenebilir.
4. **UI** — Ayarlar sayfasında “Plan ve Faturalandırma” kartı: mevcut plan ve limitler gösterilir.
