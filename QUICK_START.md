# Hızlı Başlangıç Rehberi

## Durum: PostgreSQL Gerekli

Şu anda projeyi çalıştırmak için PostgreSQL veritabanına ihtiyacınız var.

## Çözüm Seçenekleri

### ✅ Seçenek 1: Docker Desktop ile (En Kolay)

1. **Docker Desktop'ı Başlatın:**
   - Windows başlat menüsünden "Docker Desktop" uygulamasını açın
   - Docker Desktop'ın tamamen başlamasını bekleyin (sistem tepsisinde icon görünene kadar)

2. **PostgreSQL'i Başlatın:**
   ```powershell
   docker-compose up -d postgres
   ```

3. **Veritabanını Kurun:**
   ```powershell
   npm run db:push
   ```

4. **Uygulamayı Başlatın:**
   ```powershell
   npm run dev
   ```

### ✅ Seçenek 2: PostgreSQL Yükleme

1. **PostgreSQL İndirin ve Yükleyin:**
   - https://www.postgresql.org/download/windows/ adresinden PostgreSQL'i indirin
   - Kurulum sırasında şifre belirleyin (örnek: `postgres`)

2. **Servisi Başlatın:**
   ```powershell
   # PowerShell'i Yönetici olarak çalıştırın
   net start postgresql-x64-15
   # veya sürümünüze göre
   ```

3. **Veritabanı Oluşturun:**
   ```powershell
   # PostgreSQL'e bağlanın (kurulum sırasında belirlediğiniz şifre ile)
   psql -U postgres
   ```
   
   SQL komutları:
   ```sql
   CREATE USER examtracker WITH PASSWORD 'changeme';
   CREATE DATABASE exam_tracker;
   GRANT ALL PRIVILEGES ON DATABASE exam_tracker TO examtracker;
   \q
   ```

4. **.env Dosyasını Güncelleyin:**
   ```env
   DATABASE_URL="postgresql://examtracker:changeme@localhost:5432/exam_tracker?schema=public"
   ```

5. **Veritabanını Kurun:**
   ```powershell
   npm run db:push
   ```

6. **Uygulamayı Başlatın:**
   ```powershell
   npm run dev
   ```

### ⚡ Seçenek 3: SQLite ile Development (Geçici Çözüm)

Eğer PostgreSQL kurmak istemiyorsanız, development için SQLite kullanabilirsiniz:

1. **Prisma Schema'yı SQLite için güncelleyin** (manuel)
2. **.env dosyasını güncelleyin:**
   ```env
   DATABASE_URL="file:./dev.db"
   ```

⚠️ **Not:** SQLite production için uygun değildir. Sadece test için kullanılmalıdır.

## Docker Desktop Başlatma

Eğer Docker Desktop yüklüyse ama çalışmıyorsa:

1. Windows başlat menüsünden "Docker Desktop" uygulamasını açın
2. Sistem tepsisinde Docker ikonunu kontrol edin
3. Docker Desktop tamamen başladığında (ikon yeşil/çalışıyor durumunda):
   ```powershell
   docker-compose up -d postgres
   ```

## Kontrol Komutları

```powershell
# Docker durumunu kontrol et
docker ps

# PostgreSQL servisini kontrol et
Get-Service -Name "*postgresql*"

# Veritabanı bağlantısını test et
npm run db:push
```

## Yardım

Sorun yaşıyorsanız:
1. Docker Desktop çalışıyor mu kontrol edin
2. PostgreSQL servisi çalışıyor mu kontrol edin
3. `.env` dosyasındaki `DATABASE_URL` doğru mu kontrol edin
4. Port 5432 kullanımda mı kontrol edin: `netstat -an | findstr 5432`
