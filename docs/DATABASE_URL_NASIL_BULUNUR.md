# Prisma’da Veritabanı URL’i (DATABASE_URL)

Prisma, veritabanına **`.env`** dosyasındaki **`DATABASE_URL`** ile bağlanır. Bu dosyada Prisma ile ilgili bilgiler.

---

## 1. Prisma nereden okuyor?

`prisma/schema.prisma` içinde:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Yani Prisma **ortam değişkeni** `DATABASE_URL`’i kullanır. Bu değişken genelde **proje kökündeki `.env`** dosyasında tanımlanır.

---

## 2. .env’de ne yazmalı?

`.env` dosyasında (proje kökünde):

```env
DATABASE_URL="postgresql://KULLANICI:ŞİFRE@HOST:PORT/VERITABANI_ADI"
```

**PostgreSQL için örnek:**

```env
DATABASE_URL="postgresql://postgres:myPassword@localhost:5432/exam_tracker"
```

| Parça            | Açıklama                    | Örnek        |
|------------------|-----------------------------|-------------|
| `KULLANICI`      | Veritabanı kullanıcı adı    | `postgres`  |
| `ŞİFRE`          | Veritabanı şifresi          | `myPassword`|
| `HOST`           | Sunucu adresi               | `localhost` veya `db.xxx.supabase.co` |
| `PORT`           | Port (PostgreSQL varsayılan)| `5432`      |
| `VERITABANI_ADI` | Veritabanı adı              | `postgres` veya `exam_tracker` |

Şifrede özel karakter varsa URL encode edin (örn. `@` → `%40`).

---

## 3. Prisma komutları hangi URL’i kullanır?

| Komut / kullanım      | Kullandığı URL   |
|------------------------|------------------|
| `prisma generate`      | `DATABASE_URL`   |
| `prisma migrate dev`   | `DATABASE_URL` (ve varsa `directUrl`) |
| `prisma migrate deploy`| `DATABASE_URL`   |
| `prisma db push`       | `DATABASE_URL`   |
| Uygulama (Prisma Client)| `DATABASE_URL`   |

Hepsi aynı `.env` → `DATABASE_URL` değerini kullanır.

---

## 4. Connection pooler kullanıyorsanız (opsiyonel)

Bazı servisler (ör. Supabase Session Pooling) **iki** bağlantı sunar:

- **Pooler URL** (uygulama için, örn. port 6543)
- **Direct URL** (migration için, örn. port 5432)

Bu durumda `.env`:

```env
DATABASE_URL="postgresql://...@pooler-host:6543/postgres"
DIRECT_URL="postgresql://...@db-host:5432/postgres"
```

`prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Pooler kullanmıyorsanız sadece `DATABASE_URL` yeterli; `directUrl` eklemeniz gerekmez.

---

## 5. Bağlantıyı test etmek

```bash
npm run db:test
```

veya:

```bash
npx prisma db pull
```

Hata alırsanız `.env` içindeki `DATABASE_URL`’i (kullanıcı, şifre, host, port, veritabanı adı) kontrol edin.

---

## Özet

| Ne?              | Nerede?                    |
|------------------|----------------------------|
| URL’i nereden alır? | `.env` → `DATABASE_URL` |
| Schema’da nerede?   | `prisma/schema.prisma` → `url = env("DATABASE_URL")` |
| Format            | `postgresql://KULLANICI:ŞİFRE@HOST:PORT/DB_ADI` |

Veritabanı bilgileriniz (kullanıcı, şifre, host, port, db adı) hangi serviste olursa olsun, bu bilgileri yukarıdaki formatta bir string yapıp `.env`’e `DATABASE_URL` olarak yazmanız Prisma için yeterlidir.
