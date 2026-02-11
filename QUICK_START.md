# 🚀 Hızlı Başlangıç - Development

## 1. Environment Variables Kurulumu

**Yeni Supabase projesi (sıfırdan):** Supabase'de yeni proje oluşturduktan sonra Settings → Database → **Connection pooling** (Transaction, port **6543**) URI'sini alın. Host `pooler.supabase.com` içermeli.

```bash
# .env.example varsa ondan .env.local oluşturur; yoksa otomatik şablon
node scripts/setup-dev-env.js

# .env.local'i düzenleyin: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
# Sonra kontrol:
npm run dev:check
```

## 2. Prisma Client Generate

```bash
# Prisma client'ı generate et
npx prisma generate
```

## 3. Development Server Başlat

```bash
npm run dev
```

Server `http://localhost:3000` adresinde çalışacak.

## 4. Veritabanı Bağlantısını Test Et

```bash
# Health check
curl http://localhost:3000/api/health

# Veya browser'da aç
http://localhost:3000/api/health
```

## Sorun Giderme

### Veritabanı Bağlantı Hatası

Eğer "Can't reach database server" hatası alıyorsanız:

1. **Supabase Dashboard Kontrolü:**
   - [Supabase Dashboard](https://app.supabase.com)
   - Projenizin aktif olduğundan emin olun
   - Connection string'i kontrol edin

2. **.env.local Kontrolü:** Pooler kullanın (Vercel ve local için):
   ```bash
   # Doğru (pooler, port 6543):
   DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require"
   # Yanlış (direkt DB - zaman aşımı verebilir): db.xxx.supabase.co:5432
   ```

3. **IP Restriction:**
   - Supabase Dashboard > Settings > Database
   - IP whitelist kontrol edin

### Prisma Generate Hatası

Windows'ta file lock hatası alıyorsanız:

```bash
# Tüm Node.js process'lerini kapat
taskkill /F /IM node.exe

# Sonra tekrar dene
npx prisma generate
```

### Port Zaten Kullanılıyor

```bash
# Farklı port ile başlat
PORT=3001 npm run dev
```

## Hızlı Komutlar

```bash
# Development ortamı kontrolü
npm run dev:check

# Development ortamı kurulumu
npm run dev:setup

# Development server
npm run dev

# Prisma Studio (veritabanı görüntüleme)
npm run db:studio

# Type check
npm run type-check
```

## Sonraki Adımlar

1. ✅ Environment variables set edildi
2. ✅ Prisma client generate edildi
3. ✅ Development server başlatıldı
4. ✅ Health check çalışıyor

Artık development'ta çalışmaya hazırsınız! 🎉

---

**Not:** Production deployment için `PRODUCTION_CHECKLIST.md` dosyasına bakın.
