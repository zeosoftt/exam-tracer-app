# 🚀 Hızlı Deploy Rehberi

Bu rehber, uygulamayı en hızlı şekilde production'a deploy etmek için minimal adımları içerir.

## ⚡ En Hızlı Yol: Vercel (5 dakika)

### 1. Veritabanı Oluştur (Supabase - Ücretsiz)

1. [supabase.com](https://supabase.com) → "Start your project"
2. "New Project" oluştur
3. Settings > Database > Connection String kopyala

### 2. Vercel'e Deploy Et

1. [vercel.com](https://vercel.com) → GitHub ile giriş yap
2. "New Project" → Repository'ni seç
3. Environment Variables ekle:

```
DATABASE_URL=postgresql://... (Supabase'den aldığın)
NEXTAUTH_URL=https://your-app.vercel.app (deploy sonrası güncelle)
NEXTAUTH_SECRET=openssl rand -base64 32 ile oluştur
NODE_ENV=production
```

4. "Deploy" butonuna tıkla

### 3. Database Migration Çalıştır

Deploy tamamlandıktan sonra:

```bash
# Local'den veya Vercel CLI ile
npx vercel env pull .env.production
npx prisma migrate deploy
npm run db:seed
```

### 4. NEXTAUTH_URL'i Güncelle

Deploy sonrası aldığın URL'i Vercel dashboard'dan güncelle:
- Project Settings > Environment Variables
- `NEXTAUTH_URL`'i gerçek URL ile güncelle
- Redeploy et

✅ **Tamamlandı!** Uygulamanız çalışıyor.

---

## 🔄 Alternatif: Railway (10 dakika)

### 1. Railway'e Giriş Yap

1. [railway.app](https://railway.app) → GitHub ile giriş
2. "New Project" → "Deploy from GitHub repo"

### 2. PostgreSQL Database Ekle

1. "New" → "Database" → "Add PostgreSQL"
2. Database otomatik oluşturulur (`DATABASE_URL` otomatik eklenir)

### 3. Environment Variables Ekle

Variables sekmesine:
```
NEXTAUTH_URL=https://your-app.up.railway.app
NEXTAUTH_SECRET=openssl rand -base64 32 ile oluştur
NODE_ENV=production
```

### 4. Database Migration

Railway Console > Terminal:
```bash
npx prisma migrate deploy
npm run db:seed
```

✅ **Tamamlandı!**

---

## 📋 Environment Variables Özeti

**Zorunlu:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Uygulamanın public URL'i
- `NEXTAUTH_SECRET` - Güvenli random secret (`openssl rand -base64 32`)

**Opsiyonel:**
- `NODE_ENV=production`
- `LOG_LEVEL=warn`

---

## 🎯 Production Kontrol Listesi

Deploy sonrası:

- [ ] Health check: `curl https://yourdomain.com/api/health`
- [ ] İlk kullanıcı oluştur (onboarding flow ile)
- [ ] Login test et
- [ ] Dashboard'a erişim test et
- [ ] `NEXTAUTH_URL` gerçek domain'e işaret ediyor mu?

---

## 🆘 Sorun mu Yaşıyorsunuz?

**Build Hatası:**
```bash
npm run build  # Local'de test et
npx prisma generate  # Prisma Client generate et
```

**Database Connection Hatası:**
- `DATABASE_URL` doğru mu?
- Database erişilebilir mi?
- SSL gerekiyor mu? (`?sslmode=require` ekle)

**NextAuth Hatası:**
- `NEXTAUTH_URL` doğru mu?
- `NEXTAUTH_SECRET` ayarlanmış mı?

---

## 📚 Detaylı Rehber

Daha detaylı bilgi için: [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

---

**İyi çalışmalar! 🚀**
