# Lokal Backend — Ne Çalışıyor?

Bu projede **ayrı bir backend sunucusu yok**. Backend, **Next.js** ile birlikte tek süreçte çalışır.

---

## 1. Tek komut: `npm run dev`

Lokal geliştirmede backend’i (ve frontend’i) başlatmak için:

```bash
npm run dev
```

Bu komut **Next.js geliştirme sunucusunu** başlatır. Varsayılan port: **3000**.

---

## 2. Bu süreçte neler çalışır?

| Bileşen | Açıklama |
|--------|----------|
| **Next.js dev server** | Hem sayfaları (React) hem de **API route’ları** sunar. |
| **API route’ları** | `app/api/` altındaki route’lar bu sunucuda çalışır (auth, dashboard, exams, user, health, billing, vb.). |
| **NextAuth** | `/api/auth/*` üzerinden giriş/kayıt/oturum. |
| **Prisma Client** | API isteklerinde veritabanına `.env` içindeki `DATABASE_URL` ile bağlanır. |

Yani tek çalışan süreç: **Node.js üzerinde Next.js**. Veritabanı (PostgreSQL) ayrı bir serviste (örn. Supabase) ise onu siz ayrıca çalıştırmıyorsunuz; sadece `DATABASE_URL` ile bağlanıyorsunuz.

---

## 3. Adresler (localhost)

| Ne | URL |
|----|-----|
| Uygulama (frontend) | http://localhost:3000 |
| API (genel) | http://localhost:3000/api/... |
| Health check | http://localhost:3000/api/health |
| NextAuth | http://localhost:3000/api/auth/... |

---

## 4. Veritabanı

- **Lokal PostgreSQL kurulu değilse:** `.env` içindeki `DATABASE_URL` ile dış bir veritabanına (örn. Supabase) bağlanırsınız; ekstra bir şey çalıştırmanız gerekmez.
- **Lokal PostgreSQL kullanıyorsanız:** PostgreSQL servisinin açık olması ve `DATABASE_URL`’in buna işaret etmesi gerekir.

---

## 5. Ortamlar: Local vs Production

Lokal ve production’da **aynı uygulama** çalışır (Next.js + API + Prisma + NextAuth). Ayrım **ortam değişkenleri** ve **hangi veritabanına bağlanıldığı** ile yapılır.

### Ne aynı, ne farklı?

| | Local | Production |
|--|--------|------------|
| **Çalışan uygulama** | Aynı (Next.js) | Aynı (Next.js) |
| **Başlatma** | `npm run dev` | `npm run build` + `npm run start` (veya Vercel vb. otomatik) |
| **Ortam değişkenleri** | `.env`, `.env.local` (proje klasöründe) | Hosting panelinde tanımlı (Vercel: Environment Variables) |
| **Veritabanı** | `DATABASE_URL` → lokal/test DB önerilir | `DATABASE_URL` → sadece production DB |
| **NEXTAUTH_URL** | `http://localhost:3000` | `https://yourdomain.com` |

### İki ortamı birbirinden ayırmak

1. **Farklı veritabanı kullanın**  
   - Local: Test/geliştirme için ayrı bir DB (veya Supabase’te ayrı proje).  
   - Production: Canlı veri için ayrı DB.  
   Aynı DB’yi iki ortamda kullanmayın; böylece local’de yaptığınız denemeler prod verisini bozmaz.

2. **Env dosyalarını karıştırmayın**  
   - Local: `.env` ve `.env.local` (bu dosyalar Git’e commit edilmemeli; `.gitignore`’da olmalı).  
   - Production: Değişkenleri sadece Vercel (veya kullandığınız hosting) panelinden girin. Production secret’ları `.env` dosyasına yazmayın.

3. **NEXTAUTH_URL ve APP_URL**  
   - Local: `http://localhost:3000`  
   - Production: `https://gerçek-domain.com`  
   Her ortamda doğru URL’in tanımlı olduğundan emin olun.

4. **NEXTAUTH_SECRET**  
   Local ve production için **farklı** güçlü secret kullanın (en az 32 karakter).

### Dikkat edilecekler

- Production’da **asla** local’e özel `DATABASE_URL` veya test şifreleri kullanmayın.
- `.env.local` ve `.env.production` (içinde gerçek secret varsa) Git’e eklenmemeli.
- Migration’ları önce local/test DB’de deneyin; sonra production’da `prisma migrate deploy` çalıştırın.

**Yerelde güvenle çalışıp prod verisini korumak için:** [GUVENLI_DB_IS_AKISI.md](./GUVENLI_DB_IS_AKISI.md) dosyasına bakın.

---

## 6. Özet

Lokal backend = **`npm run dev`** ile açılan **Next.js sunucusu**.  
API’ler bu sunucuda, **http://localhost:3000/api/** altında çalışır; veritabanı ise `DATABASE_URL` ile bağlandığınız adreste (lokal veya uzak) çalışır.  
Local ile production’ı **ayrı env** ve **ayrı veritabanı** ile kullanarak birbirinden ayırırsınız.
