# 🚀 Backend Başlatma Rehberi

## ✅ Mevcut Durum

- ✅ **Server başarıyla başlatıldı**: `http://localhost:3000`
- ⚠️ **Database bağlantısı yok**: IPv4 uyumluluk sorunu

## 🔧 Hızlı Çözüm

### Adım 1: Supabase Session Pooling Connection String Alın

1. [Supabase Dashboard](https://app.supabase.com) → Projenize gidin
2. **Settings** → **Database** → **Connection string** sekmesi
3. **Connection mode**: **Session mode** seçin
4. **Connection string** kopyalayın (port `6543` ve `pooler.supabase.com` içermeli)

Örnek format:
```
postgresql://postgres:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

### Adım 2: .env.local Dosyasını Güncelleyin

`.env.local` dosyanızı açın ve `DATABASE_URL`'i güncelleyin:

```env
# Eski (Direct Connection - IPv4 uyumlu değil)
# DATABASE_URL="postgresql://postgres:...@db.xxx.supabase.co:5432/postgres?sslmode=require"

# Yeni (Session Pooling - IPv4 uyumlu)
DATABASE_URL="postgresql://postgres:...@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"
```

**Önemli:** 
- Port `6543` olmalı (5432 değil)
- Host `pooler.supabase.com` içermeli (db.xxx.supabase.co değil)

### Adım 3: Server'ı Yeniden Başlatın

```powershell
# Mevcut server'ı durdurun (Ctrl+C)
# Sonra tekrar başlatın:
npm run dev
```

### Adım 4: Bağlantıyı Test Edin

```powershell
# Database bağlantısını test et
npm run db:test

# Health endpoint'i test et
curl http://localhost:3000/api/health
# veya tarayıcıda: http://localhost:3000/api/health
```

## 📋 Kontrol Listesi

- [ ] Supabase Dashboard'dan Session Pooling connection string alındı
- [ ] `.env.local` dosyasında `DATABASE_URL` güncellendi (port 6543, pooler.supabase.com)
- [ ] Server yeniden başlatıldı
- [ ] `npm run db:test` başarılı
- [ ] `http://localhost:3000/api/health` 200 OK döndürüyor

## 🎯 Başarı Kriterleri

✅ Server çalışıyor: `http://localhost:3000`  
✅ Database bağlantısı var: `npm run db:test` başarılı  
✅ Health endpoint çalışıyor: `/api/health` 200 OK  
✅ Linter hataları yok  

## 🆘 Sorun Giderme

### "Can't reach database server"

1. Supabase projenizin **active** olduğundan emin olun (paused değil)
2. Connection string'de **Session mode** kullandığınızdan emin olun
3. Port **6543** olduğundan emin olun
4. Host **pooler.supabase.com** içerdiğinden emin olun

### "EPERM: operation not permitted" (Prisma generate)

Bu Windows'ta normal bir durum. Development server çalışırken Prisma generate yapmaya çalışırsanız bu hatayı alırsınız. Server'ı durdurup tekrar başlatın.

### Server başlamıyor

1. Port 3000'in kullanılmadığından emin olun:
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Node modules'ü temizleyip yeniden yükleyin:
   ```powershell
   rm -r node_modules
   npm install
   ```

## 📚 İlgili Dosyalar

- `lib/db/prisma.ts` - Prisma client konfigürasyonu
- `app/api/health/route.ts` - Health check endpoint
- `scripts/test-db-connection.js` - Database bağlantı test scripti

---

**Not:** Server şu anda çalışıyor ama database bağlantısı olmadığı için API endpoint'leri 500 hatası veriyor. Session Pooling connection string'i ekledikten sonra her şey düzgün çalışacak.
