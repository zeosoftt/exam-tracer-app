# Güvenli Veritabanı İş Akışı

Yerelde ayrı bir DB ile çalışıp, başarılı olduktan sonra production DB’yi kullanmak ve **production verilerinin kaybolmaması** için bu akışı izleyin.

---

## 1. İki ayrı veritabanı kullanın

| Ortam | Kullanım | DATABASE_URL nerede? |
|--------|-----------|----------------------|
| **Local (geliştirme)** | Günlük geliştirme, migration/seed testi | `.env.local` |
| **Production** | Canlı uygulama, gerçek kullanıcı verisi | Vercel (veya hosting) Environment Variables |

- **Local’de** mutlaka **production’dan farklı** bir veritabanı kullanın (ayrı Supabase projesi veya yerel PostgreSQL).
- **Production’daki** `DATABASE_URL` sadece Vercel/hosting’de tanımlı olsun; local dosyalarınıza **production DB bağlantısını yazmayın**.

Böylece yerelde yaptığınız denemeler production verisini **hiç etkilemez**.

---

## 2. Adım adım güvenli akış

### A) Yerel “geliştirme” DB’nizi belirleyin

İki seçenek:

- **Seçenek 1 – Supabase’te ayrı proje (önerilen):**  
  Supabase Dashboard’da yeni bir proje oluşturun (örn. “exam-tracker-dev”). Bu projenin Connection String’ini alın.  
  Bu bağlantıyı **sadece** `.env.local` içinde `DATABASE_URL` olarak kullanın.

- **Seçenek 2 – Yerel PostgreSQL:**  
  Bilgisayarınıza PostgreSQL kurun, yerel bir veritabanı oluşturun.  
  `.env.local` içinde örn. `DATABASE_URL="postgresql://postgres:şifre@localhost:5432/exam_tracker_dev"` kullanın.

### B) Yerelde her zaman bu DB ile çalışın

- `npm run dev` hep `.env.local` okuyacak → **geliştirme DB**’ye bağlanır.
- Migration’ları **önce yerelde** dener:
  ```bash
  npx prisma migrate dev
  ```
- Seed / backfill gibi işlemleri de **önce yerelde** çalıştırın:
  ```bash
  npm run db:seed:auth
  npm run db:backfill-freemium
  ```
- Prisma Studio ile baktığınız da yerel DB olur:
  ```bash
  npx prisma studio
  ```
  (Çalışan terminalde hangi `.env` yüklüyse o DB’ye bağlanır; `npm run dev` kullanırken `.env.local` kullanılıyorsa bu “yerel/geliştirme” DB’dir.)

### C) Production’a geçmeden önce

- Yerelde migration’lar hatasız çalışıyor mu kontrol edin.
- İstediğiniz seed/backfill yerelde doğru sonuç veriyor mu kontrol edin.
- Production’da **sadece** migration uygulayacaksınız; production’da gereksiz seed/backfill çalıştırmayın (gerekmedikçe).

### D) Production’da sadece migration uygulayın

- Production’da **veri kaybı riski taşıyan** işlemler yapmayın (gereksiz `db push`, prod’da deneme seed’leri vb.).
- Sadece **önceden yerelde test ettiğiniz** migration’ları uygulayın:
  ```bash
  # Bu komutu production build/deploy ortamında çalıştırın (Vercel’de genelde deploy hook veya manuel bir “migrate” adımı)
  npx prisma migrate deploy
  ```
- `migrate deploy` sadece **henüz uygulanmamış** migration dosyalarını çalıştırır; mevcut production verisini silmez (migration’lar veri silmeyecek şekilde yazıldığı sürece).

### E) Production verilerinin kaybolmaması için kurallar

1. **Production `DATABASE_URL`’i** sadece Vercel (veya kullandığınız hosting) Environment Variables’da olsun; `.env` / `.env.local` içine **yazmayın**.
2. **Yerelde** asla production’ın `DATABASE_URL`’i ile `migrate dev`, `db push`, `seed` veya `backfill` çalıştırmayın.
3. **Migration** yazarken: Mümkünse tablo/kolon **silme** yerine yeni tablo/kolon ekleyin; veri taşıma gerekiyorsa migration içinde dikkatli `UPDATE`/`INSERT` kullanın.
4. **Önemli değişikliklerden önce** Supabase’te production projesi için yedek alın (Supabase Dashboard → Settings → Backups veya pg_dump).

---

## 3. Özet tablo

| Yapılacak iş | Nerede yapılır? | Production verisi |
|--------------|------------------|--------------------|
| Günlük geliştirme | Local + **geliştirme DB** (.env.local) | Etkilenmez |
| Migration yazma / test | Local + geliştirme DB | Etkilenmez |
| Seed / backfill test | Local + geliştirme DB | Etkilenmez |
| Migration’ı canlıya uygulama | Production ortamında `prisma migrate deploy` | Sadece migration’daki değişiklik uygulanır; doğru yazılmış migration veriyi silmez |
| Canlı veriyi görüntüleme | Supabase Dashboard’da **production projesi** veya prod uygulama | — |

---

## 4. İlk kurulum özeti

1. **Geliştirme DB:** Supabase’te ayrı proje açın (veya yerel PostgreSQL) → Connection String’i alın.
2. **`.env.local`:** İçine sadece bu **geliştirme** `DATABASE_URL`’i yazın. Production URL’ini bu dosyaya koymayın.
3. **Vercel:** Production projesinin Environment Variables’ında **sadece production** `DATABASE_URL`’i tanımlı olsun.
4. **Günlük çalışma:** Her zaman `npm run dev` ile yerelde geliştirme DB’ye bağlı çalışın; başarılı olduktan sonra deploy edin ve production’da sadece `prisma migrate deploy` kullanın.

Bu akışa uyduğunuz sürece yerelde güvenle deneyebilir, production verileri korunur ve başarılı olduktan sonra production DB’yi sadece canlı ortamda kullanmaya devam edersiniz.
