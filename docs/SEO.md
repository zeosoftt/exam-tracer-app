# SEO — teknik temel ve operasyon

“%100 verim” arama sıralamasında garanti değildir; burada **teknik SEO’yu mümkün olan en sıkı şekilde** topladık. Sıralama = teknik + içerik + otorite (backlink) + kullanıcı sinyalleri.

## Projede yapılanlar (teknik, güncel)

### Merkezi yapılandırma

- `lib/seo/siteSeo.ts` — varsayılan başlık/açıklama/anahtar kelimeler, kök `metadata`, `viewport`, `buildPublicPageMetadata()` (OG + Twitter + canonical + `hreflang` tr-TR + robots index).
- `lib/seo/baseUrl.ts` — `SITE_URL` / `NEXTAUTH_URL` / production canonical.

### Sayfa ve dizin

- `app/layout.tsx` — kök metadata `buildRootMetadata()` (yazar, `applicationName`, `formatDetection`, `referrer`, `appleWebApp`, OG/Twitter görselleri, Google doğrulama env ile geçersiz kılınabilir).
- `app/manifest.ts` — PWA manifest (isim, `theme_color`, `start_url`, ikon); Lighthouse “Installable” ve marka tutarlılığı.
- `app/(dashboard)/layout.tsx` — tüm `/dashboard/*` için **`noindex, nofollow`** (robots.txt ile çift emniyet).
- `app/robots.ts` — `host` + disallow `/dashboard`, `/api/`, `/auth/`.
- `app/sitemap.ts` — ana sayfa, onboarding, SSS, destek.
- `/auth/*` — `noindex` (`app/(auth)/auth/layout.tsx`).

### Görseller ve şema

- Dinamik OG görseli `app/opengraph-image.tsx` (1200×630).
- Ana sayfa JSON-LD: `WebSite` + `publisher`, `Organization` + **`sameAs`** (env `ORGANIZATION_SAME_AS` veya varsayılan Instagram), `SoftwareApplication`.
- `/destek` — `ContactPage` JSON-LD + tam metadata şablonu.
- `/sss` — `FAQPage` + **`BreadcrumbList`** (`@graph`).

### Güvenlik / performans ile örtüşenler

- `next.config.js` — `poweredByHeader: false`, sıkıştırma, güvenlik başlıkları (HSTS, X-Frame-Options, vb.).

## Search Console: “404” veya “robots.txt engelledi”

- **404 (favicon):** Tarayıcılar `/favicon.ico` ister; projede yalnızca `icon.svg` varsa 404 oluşur. `next.config.js` içinde `/favicon.ico` → `/icon.svg` yönlendirmesi tanımlıdır.
- **robots / sitemap / manifest / OG:** Bu URL’ler `next-auth` middleware’inden **muaf** tutulmalıdır; aksi halde oturumsuz Googlebot giriş sayfasına düşer veya 404 görür. `middleware.ts` matcher ve `authorized` içinde bu yollar açıktır.

## Sizin yapmanız gerekenler (operasyon)

1. **Google Search Console** — Mülk ekleyin, `https://thegoallab.com/sitemap.xml` gönderin (domain farklıysa `SITE_URL` ile aynı host).
2. **`SITE_URL` / `NEXTAUTH_URL`** — Canlı tek canonical domain.
3. **`GOOGLE_SITE_VERIFICATION`** / **`ORGANIZATION_SAME_AS`** — İsteğe bağlı `.env` (şema + doğrulama).
4. **İçerik** — Hedef kelimeler için kaliteli sayfalar; blog zorunlu değil.
5. **Core Web Vitals** — Lighthouse (mobil); gerçek kullanıcı verisi Search Console’da.

SEO tek başına yavaş büyür; teknik zemin + içerik + dağıtım birlikte işe yarar.
