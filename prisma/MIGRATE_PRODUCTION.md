# Production veritabanına tablo oluşturma (Supabase)

Vercel'de "The table `public.exams` does not exist" hatası alıyorsanız, Supabase'deki veritabanında tablolar henüz yoktur. Aşağıdaki adımları **bir kez** uygulayın.

## 1. Production DATABASE_URL kullanın

Vercel'deki **aynı** connection string'i kullanmalısınız (Supabase → Settings → Database → Connection pooling, port 6543).

- Vercel Dashboard → Proje → Settings → Environment Variables → `DATABASE_URL` değerini kopyalayın.
- Veya `.env.production` içindeki `DATABASE_URL` ile çalışın.

## 2. Şemayı veritabanına uygulayın (tabloları oluşturun)

**PowerShell (Windows):**

```powershell
cd C:\Users\EXCALIBUR\Desktop\exam-tracker

# DATABASE_URL'i production değeri ile ayarlayın (tek satırda)
$env:DATABASE_URL = "postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require"

# Tabloları oluştur
npx prisma db push
```

**Veya .env.production ile:**

```powershell
# .env.production dosyanızda DATABASE_URL doğru ise:
npx dotenv -e .env.production -- npx prisma db push
```

`dotenv` yüklü değilse: `npm install -g dotenv-cli` veya önce `$env:DATABASE_URL = "..."` ile atayıp `npx prisma db push` çalıştırın.

## 3. (İsteğe bağlı) Seed verisi

Sınavlar, bölümler vb. master veriyi eklemek için:

```powershell
$env:DATABASE_URL = "..."   # aynı production URL
npm run db:seed
```

## 4. Kontrol

- Supabase Dashboard → Table Editor: `exams`, `users` vb. tablolar görünmeli.
- Vercel uygulamasını tekrar deneyin; hata kaybolmalı.

---

**Not:** `prisma db push` migration geçmişi tutmaz; şemayı doğrudan veritabanına uyumlu hale getirir. İleride migration kullanmak isterseniz `npx prisma migrate dev --name init` ile ilk migration'ı oluşturup sonra `prisma migrate deploy` kullanabilirsiniz.
