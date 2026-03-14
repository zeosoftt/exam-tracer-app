# 📋 Environment Variables Kullanım Kılavuzu

Bu kılavuz, Exam Tracker projesinde environment variable'ların nasıl yapılandırılacağını açıklar.

## 📁 Dosya Yapısı

```
exam-tracker/
├── .env.example              # Genel template (örnek)
├── .env.development.example   # Development template
├── .env.production.example    # Production template
├── .env.local                 # Local development (GIT'e commit edilmez)
├── .env.development.local     # Development override (GIT'e commit edilmez)
└── .env.production.local      # Production override (GIT'e commit edilmez)
```

## 🚀 Hızlı Başlangıç

### Development Ortamı

1. **Template'i kopyalayın:**
   ```bash
   cp .env.development.example .env.local
   ```

2. **Değerleri doldurun:**
   - `DATABASE_URL`: Supabase connection string (pooler, port 6543)
   - `NEXTAUTH_URL`: `http://localhost:3000`
   - `NEXTAUTH_SECRET`: Güvenli bir secret oluşturun

3. **Secret oluşturma:**
   ```bash
   # Yöntem 1: OpenSSL
   openssl rand -base64 32
   
   # Yöntem 2: Node.js script
   node scripts/generate-secret.js
   ```

4. **Kontrol edin:**
   ```bash
   npm run dev:check
   ```

### Production Ortamı

#### Vercel Deployment

1. **Vercel Dashboard'a gidin:**
   - Project Settings > Environment Variables

2. **Aşağıdaki değişkenleri ekleyin:**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your-strong-secret
   NODE_ENV=production
   ```

3. **Her environment için ayrı ayrı ekleyin:**
   - Production
   - Preview
   - Development

#### Docker Deployment

1. **Environment dosyası oluşturun:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Değerleri doldurun**

3. **Docker Compose ile başlatın:**
   ```bash
   docker-compose up -d
   ```

## 📝 Environment Variable Açıklamaları

### Zorunlu Değişkenler

#### `DATABASE_URL`
- **Açıklama:** PostgreSQL veritabanı bağlantı string'i
- **Format:** `postgresql://user:password@host:port/database?sslmode=require`
- **Supabase için:**
  - Settings > Database > Connection pooling
  - **Transaction mode** seçin (port 6543)
  - Host: `pooler.supabase.com` içermeli
- **Örnek:**
  ```
  DATABASE_URL=postgresql://postgres.abc123:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
  ```
- **Performans (Vercel / istekler yavaşsa):** Aynı URL'ye mutlaka şu parametreleri ekleyin:
  `?pgbouncer=true&connection_limit=1`  
  Böylece "too many connections" ve yavaş yanıtlar azalır. Örnek:
  ```
  DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1
  ```

#### `NEXTAUTH_URL`
- **Açıklama:** Uygulamanın public URL'i
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`
- **Önemli:** Production'da mutlaka HTTPS kullanın

#### `NEXTAUTH_SECRET`
- **Açıklama:** JWT token'ları için secret key
- **Minimum:** 32 karakter
- **Oluşturma:**
  ```bash
  openssl rand -base64 32
  ```
- **Önemli:** Production'da güçlü bir secret kullanın!

### Opsiyonel Değişkenler

#### `NODE_ENV`
- **Değerler:** `development` | `production`
- **Varsayılan:** `development`
- **Otomatik:** Next.js `npm run dev` ile otomatik `development` olur

#### `LOG_LEVEL`
- **Değerler:** `error` | `warn` | `info` | `debug`
- **Varsayılan:** `info`
- **Development:** `debug` (daha detaylı loglar)
- **Production:** `error` (sadece hatalar)

#### `ALLOWED_ORIGINS`
- **Açıklama:** CORS için izin verilen origin'ler
- **Format:** Virgülle ayrılmış liste
- **Örnek:** `http://localhost:3000,https://app.example.com`
- **Varsayılan:** `http://localhost:3000`

## 🔒 Güvenlik Best Practices

### ✅ YAPILMASI GEREKENLER

1. **Secret'ları asla GIT'e commit etmeyin**
   - `.env.local` dosyaları `.gitignore`'da
   - Template dosyalar (`.env.example`) kullanın

2. **Production secret'ları güçlü oluşturun**
   ```bash
   openssl rand -base64 32
   ```

3. **Her environment için farklı secret kullanın**
   - Development, Staging, Production ayrı secret'lar

4. **Database connection string'i güvenli tutun**
   - Supabase'de connection pooling kullanın
   - IP restriction aktif edin

5. **HTTPS kullanın (Production)**
   - `NEXTAUTH_URL` mutlaka `https://` ile başlamalı

### ❌ YAPILMAMASI GEREKENLER

1. **Secret'ları kod içine yazmayın**
   ```typescript
   // ❌ YANLIŞ
   const secret = "my-secret-key";
   
   // ✅ DOĞRU
   const secret = process.env.NEXTAUTH_SECRET;
   ```

2. **Production secret'larını paylaşmayın**
   - Slack, email, vs. üzerinden göndermeyin
   - Password manager kullanın

3. **Template dosyalarına gerçek değerler yazmayın**
   - `.env.example` dosyaları sadece template

## 🔄 Environment Dosyaları Öncelik Sırası

Next.js environment dosyaları şu sırayla yüklenir (yüksek öncelikten düşüğe):

1. `.env.production.local` (production build'lerde)
2. `.env.local` (her zaman, GIT'e commit edilmez)
3. `.env.development.local` (development'ta)
4. `.env.production` (production build'lerde)
5. `.env.development` (development'ta)
6. `.env` (her zaman)

**Öneri:** Sadece `.env.local` kullanın, diğerlerini template olarak tutun.

## 🛠️ Troubleshooting

### "NEXTAUTH_SECRET is required" Hatası

**Çözüm:**
```bash
# Secret oluştur
openssl rand -base64 32

# .env.local'e ekle
echo "NEXTAUTH_SECRET=oluşturulan-secret" >> .env.local
```

### Database Connection Hatası

**Kontrol listesi:**
1. ✅ `DATABASE_URL` doğru mu?
2. ✅ Supabase projesi aktif mi?
3. ✅ Connection pooling kullanıyor musunuz? (port 6543)
4. ✅ IP restriction var mı?

**Test:**
```bash
npm run db:test
```

### Environment Variable Okunmuyor

**Kontrol:**
1. Dosya adı doğru mu? (`.env.local`)
2. Değişken adı doğru mu? (büyük/küçük harf duyarlı)
3. Server'ı yeniden başlattınız mı?
4. `.env.local` dosyası proje root'unda mı?

**Yeniden başlat:**
```bash
# Development server'ı durdur (Ctrl+C)
# Sonra tekrar başlat
npm run dev
```

## 📚 Ek Kaynaklar

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

## 🆘 Yardım

Sorun yaşıyorsanız:
1. `npm run dev:check` çalıştırın
2. `npm run db:test` ile database bağlantısını test edin
3. Log dosyalarını kontrol edin: `logs/error.log`
