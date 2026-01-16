# Production Deployment Rehberi

Bu rehber, Exam Tracker uygulamasını production ortamına deploy etmek için tüm adımları içerir.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Hızlı Başlangıç](#hızlı-başlangıç)
3. [Platform Seçenekleri](#platform-seçenekleri)
   - [Vercel (Önerilen)](#vercel-önerilen)
   - [Railway](#railway)
   - [Render](#render)
   - [Docker ile VPS](#docker-ile-vps)
4. [Production Hazırlığı](#production-hazırlığı)
5. [Veritabanı Kurulumu](#veritabanı-kurulumu)
6. [Environment Variables](#environment-variables)
7. [Deploy Sonrası İşlemler](#deploy-sonrası-işlemler)

---

## 🎯 Genel Bakış

Exam Tracker uygulaması **Next.js 14** ile geliştirilmiştir ve aşağıdaki teknolojileri kullanır:
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS

### Sistem Gereksinimleri

- **Node.js**: 18.x veya üzeri
- **PostgreSQL**: 14+ veya üzeri
- **RAM**: Minimum 512MB (önerilen: 1GB+)
- **Disk**: Minimum 1GB

---

## 🚀 Hızlı Başlangıç

### 1. Veritabanı Hazırlığı

Production için bir PostgreSQL veritabanı oluşturun. Seçenekler:
- **Supabase** (ücretsiz tier)
- **Neon** (ücretsiz tier)
- **Railway PostgreSQL**
- **Render PostgreSQL**
- **ElephantSQL**
- **Kendi VPS'nizde PostgreSQL**

### 2. Environment Variables

Aşağıdaki environment variable'ları hazırlayın:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"
NODE_ENV="production"
```

> **Önemli**: `NEXTAUTH_SECRET` için güvenli bir secret oluşturun:
> ```bash
> openssl rand -base64 32
> # veya
> node scripts/generate-secret.js
> ```

### 3. Deploy İşlemi

Aşağıdaki platform seçeneklerinden birini seçin ve adımları takip edin.

---

## 🌐 Platform Seçenekleri

### Vercel (Önerilen) ⭐

**Avantajları:**
- Next.js için optimize edilmiş
- Otomatik CI/CD
- Ücretsiz tier (hobby plan)
- Global CDN
- Kolay domain bağlama

**Deploy Adımları:**

1. **Vercel'e Kayıt Olun**
   - [vercel.com](https://vercel.com) adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Projeyi İmport Edin**
   - "New Project" butonuna tıklayın
   - GitHub repository'nizi seçin
   - İmport edin

3. **Environment Variables Ekleyin**
   - Project Settings > Environment Variables
   - Aşağıdaki değişkenleri ekleyin:
     ```
     DATABASE_URL=postgresql://...
     NEXTAUTH_URL=https://your-project.vercel.app
     NEXTAUTH_SECRET=your-secret
     NODE_ENV=production
     ```

4. **Build Settings**
   - Build Command: `npm run build` (otomatik algılanır)
   - Output Directory: `.next` (otomatik algılanır)
   - Install Command: `npm install`

5. **Deploy**
   - "Deploy" butonuna tıklayın
   - İlk deploy 2-5 dakika sürebilir

6. **Database Migration**
   - Deploy sonrası terminalden:
     ```bash
     npx prisma migrate deploy
     ```
   - Veya Vercel CLI ile:
     ```bash
     vercel env pull .env.production
     npx prisma migrate deploy
     ```

7. **Seed Data (İsteğe Bağlı)**
   ```bash
   npm run db:seed
   ```

**Vercel CLI ile Deploy:**

```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production'a deploy
vercel --prod
```

**Önemli Notlar:**
- Vercel otomatik olarak `prisma generate` çalıştırır (postinstall script)
- Database migration'ları manuel yapılmalı (Vercel'de cron job veya Vercel CLI)
- Serverless function'lar için timeout limitleri var (max 60 saniye)

---

### Railway

**Avantajları:**
- Database + App birlikte deploy
- Kolay setup
- Ücretsiz $5 kredi/ay

**Deploy Adımları:**

1. **Railway'e Kayıt Olun**
   - [railway.app](https://railway.app) adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni Proje Oluşturun**
   - "New Project" > "Deploy from GitHub repo"
   - Repository'nizi seçin

3. **PostgreSQL Database Ekleyin**
   - "New" > "Database" > "Add PostgreSQL"
   - Database otomatik oluşturulur ve `DATABASE_URL` environment variable olarak eklenir

4. **Environment Variables Ekleyin**
   - Variables sekmesine gidin
   - Şunları ekleyin:
     ```
     NEXTAUTH_URL=https://your-app.up.railway.app
     NEXTAUTH_SECRET=your-secret
     NODE_ENV=production
     ```

5. **Build & Deploy Settings**
   - Railway otomatik algılar
   - Build Command: `npm run build`
   - Start Command: `npm start`

6. **Custom Domain (İsteğe Bağlı)**
   - Settings > Networking
   - Custom domain ekleyin

7. **Database Migration**
   - Railway Console'dan terminal açın veya:
   ```bash
   railway link
   railway run npx prisma migrate deploy
   railway run npm run db:seed
   ```

**Railway CLI ile:**

```bash
# Railway CLI yükleyin
npm i -g @railway/cli

# Login
railway login

# Projeyi link edin
railway link

# Deploy
railway up

# Environment variables
railway variables

# Migration
railway run npx prisma migrate deploy
```

---

### Render

**Avantajları:**
- Ücretsiz tier (kısıtlı)
- PostgreSQL desteği
- Kolay setup

**Deploy Adımları:**

1. **Render'e Kayıt Olun**
   - [render.com](https://render.com) adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Web Service Oluşturun**
   - "New +" > "Web Service"
   - GitHub repository'nizi bağlayın

3. **Settings:**
   ```
   Name: exam-tracker
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **PostgreSQL Database Ekleyin**
   - "New +" > "PostgreSQL"
   - Database oluşturun
   - Connection string'i kopyalayın

5. **Environment Variables:**
   ```
   DATABASE_URL=<connection-string>
   NEXTAUTH_URL=https://your-app.onrender.com
   NEXTAUTH_SECRET=your-secret
   NODE_ENV=production
   ```

6. **Create Web Service**

7. **Database Migration:**
   - Render Shell'den veya local'den:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

**Not:** Render'ın ücretsiz tier'inde uygulama 15 dakika idle olduğunda durur (cold start).

---

### Docker ile VPS

**Avantajları:**
- Tam kontrol
- Ölçeklenebilir
- Kendi sunucunuz

**Gereksinimler:**
- VPS (DigitalOcean, AWS EC2, Hetzner, vb.)
- Docker ve Docker Compose kurulu
- Domain ve SSL sertifikası (Let's Encrypt)

**Deploy Adımları:**

1. **Sunucuya Bağlanın**
   ```bash
   ssh user@your-server-ip
   ```

2. **Docker ve Docker Compose Yükleyin**
   ```bash
   # Ubuntu/Debian için
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Projeyi Klonlayın**
   ```bash
   git clone https://github.com/your-username/exam-tracker.git
   cd exam-tracker
   ```

4. **Environment Variables Oluşturun**
   ```bash
   cp .env.example .env.production
   nano .env.production
   ```
   - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` değerlerini girin

5. **Docker Compose ile Deploy**
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

6. **Database Migration**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   docker-compose exec app npm run db:seed
   ```

7. **Nginx Reverse Proxy (Önerilen)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **SSL Sertifikası (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

9. **Log Kontrolü**
   ```bash
   docker-compose logs -f app
   ```

---

## 🔧 Production Hazırlığı

### 1. Environment Variables Kontrolü

Production'da aşağıdaki değişkenler **mutlaka** ayarlanmalı:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"  # Production domain
NEXTAUTH_SECRET="strong-random-secret" # Güçlü random secret

# Environment
NODE_ENV="production"
APP_URL="https://yourdomain.com"

# Logging
LOG_LEVEL="warn"  # Production'da warn veya error

# CORS (gerekirse)
ALLOWED_ORIGINS="https://yourdomain.com"
```

### 2. Database Migration

Production'a ilk deploy'da:

```bash
# Migration'ları çalıştır
npx prisma migrate deploy

# İlk data'yı seed et
npm run db:seed
```

### 3. Build Kontrolü

Local'de production build test edin:

```bash
npm run build
npm start
```

Tarayıcıda `http://localhost:3000` açın ve test edin.

### 4. Performance Optimizasyonları

`next.config.js` dosyası zaten optimize edilmiş durumda:
- ✅ `standalone` output mode
- ✅ Compression enabled
- ✅ Security headers
- ✅ Image optimization

---

## 🗄️ Veritabanı Kurulumu

### Supabase (Önerilen - Ücretsiz)

1. [supabase.com](https://supabase.com) hesap oluşturun
2. "New Project" oluşturun
3. Settings > Database > Connection String kopyalayın
4. `DATABASE_URL` olarak kullanın

### Neon (Ücretsiz - Serverless PostgreSQL)

1. [neon.tech](https://neon.tech) hesap oluşturun
2. "Create Project" oluşturun
3. Connection String kopyalayın
4. `DATABASE_URL` olarak kullanın

### Railway PostgreSQL

1. Railway'de "New" > "Database" > "Add PostgreSQL"
2. Otomatik `DATABASE_URL` oluşturulur

---

## 📝 Environment Variables

### Gerekli Variables

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Uygulamanın public URL'i | `https://exam-tracker.vercel.app` |
| `NEXTAUTH_SECRET` | JWT secret key | `openssl rand -base64 32` |
| `NODE_ENV` | Environment | `production` |

### Opsiyonel Variables

| Variable | Varsayılan | Açıklama |
|----------|-----------|----------|
| `LOG_LEVEL` | `info` | Log seviyesi (error, warn, info, debug) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Rate limit max istek sayısı |
| `ALLOWED_ORIGINS` | - | CORS allowed origins |

---

## ✅ Deploy Sonrası İşlemler

### 1. Health Check

Uygulamanın çalıştığını kontrol edin:

```bash
curl https://yourdomain.com/api/health
```

Beklenen yanıt:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Database Migration Kontrolü

```bash
npx prisma migrate status
```

Tüm migration'ların uygulandığını doğrulayın.

### 3. İlk Kullanıcı Oluşturma

Onboarding flow'unu kullanarak ilk kullanıcıyı oluşturun veya API'den:

```bash
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123",
    "name": "Admin User"
  }'
```

### 4. Monitoring

- **Logs**: Uygulama loglarını düzenli kontrol edin
- **Database**: Connection pool ve query performance
- **Errors**: Error tracking (Sentry gibi bir servis ekleyebilirsiniz)

### 5. Backup Stratejisi

- **Database**: Düzenli backup alın (günlük önerilir)
- **Automatic Backups**: Supabase, Neon gibi servisler otomatik backup sağlar

---

## 🔒 Güvenlik Kontrol Listesi

- [ ] `NEXTAUTH_SECRET` güçlü ve unique
- [ ] `DATABASE_URL` production database'e işaret ediyor
- [ ] HTTPS aktif (SSL sertifikası)
- [ ] Environment variables production'da doğru
- [ ] `.env` dosyası commit edilmemiş
- [ ] Database şifresi güçlü
- [ ] CORS doğru ayarlanmış
- [ ] Rate limiting aktif
- [ ] Security headers aktif (zaten `next.config.js`'de var)

---

## 🆘 Troubleshooting

### Build Hatası

```bash
# Local'de build test edin
npm run build

# Prisma Client generate edin
npx prisma generate
```

### Database Connection Hatası

1. `DATABASE_URL` doğru mu kontrol edin
2. Database erişilebilir mi test edin
3. Firewall/Security Group ayarları kontrol edin

### Migration Hatası

```bash
# Migration durumunu kontrol edin
npx prisma migrate status

# Migration'ları sıfırdan uygulayın
npx prisma migrate deploy
```

### NextAuth Hatası

- `NEXTAUTH_URL` production domain'e işaret etmeli
- `NEXTAUTH_SECRET` ayarlanmış olmalı
- Cookie ayarları kontrol edin

---

## 📚 Ek Kaynaklar

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

## 🎉 Başarılı Deploy!

Deploy işlemi tamamlandıktan sonra uygulamanız production'da çalışıyor olmalı. Herhangi bir sorun yaşarsanız yukarıdaki troubleshooting bölümüne bakın veya logları kontrol edin.

**İyi çalışmalar! 🚀**
