# Veritabanı Kurulum Rehberi

## Seçenek 1: Docker ile PostgreSQL (Önerilen)

En kolay yöntem Docker kullanmaktır:

```bash
# Sadece PostgreSQL'i başlat
docker-compose up -d postgres

# Veritabanı hazır olduğunda schema'yı push et
npm run db:push
```

## Seçenek 2: Yerel PostgreSQL Kurulumu

### Windows

1. **PostgreSQL Servisini Başlatın:**
   - Windows + R tuşlarına basın
   - `services.msc` yazın ve Enter'a basın
   - "postgresql" servisini bulun ve başlatın
   
   Veya PowerShell'de (yönetici olarak):
   ```powershell
   net start postgresql-x64-14
   # veya sürümünüze göre
   ```

2. **PostgreSQL'e Bağlanın:**
   ```bash
   psql -U postgres
   ```

3. **Veritabanı ve Kullanıcı Oluşturun:**
   ```sql
   -- Kullanıcı oluştur
   CREATE USER examtracker WITH PASSWORD 'changeme';
   
   -- Veritabanı oluştur
   CREATE DATABASE exam_tracker;
   
   -- Yetkileri ver
   GRANT ALL PRIVILEGES ON DATABASE exam_tracker TO examtracker;
   
   -- Veritabanına bağlan
   \c exam_tracker
   
   -- Schema'ya yetki ver
   GRANT ALL ON SCHEMA public TO examtracker;
   ```

4. **Schema'yı Push Edin:**
   ```bash
   npm run db:push
   ```

### .env Dosyasını Güncelleyin

Eğer farklı kullanıcı adı/şifre kullanıyorsanız, `.env` dosyasındaki `DATABASE_URL`'i güncelleyin:

```env
DATABASE_URL="postgresql://KULLANICI_ADI:ŞİFRE@localhost:5432/exam_tracker?schema=public"
```

## Veritabanı Bağlantısını Test Etme

```bash
# Prisma Studio ile veritabanını görüntüle
npm run db:studio
```

Bu komut http://localhost:5555 adresinde bir arayüz açar.

## Sorun Giderme

### "Can't reach database server" Hatası
- PostgreSQL servisinin çalıştığından emin olun
- Port 5432'nin açık olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### "Authentication failed" Hatası
- Kullanıcı adı ve şifrenin doğru olduğundan emin olun
- `pg_hba.conf` dosyasını kontrol edin

### "Database does not exist" Hatası
- Veritabanının oluşturulduğundan emin olun
- `.env` dosyasındaki veritabanı adını kontrol edin
