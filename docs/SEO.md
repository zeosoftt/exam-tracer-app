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

- `next.config.js` — `poweredByHeader: false`, sıkıştırma, güvenlik başlıkları (HSTS, X-Frame-Options, vb.), üretimde `removeConsole` (error/warn hariç), `images.formats` (AVIF/WebP), `experimental.optimizePackageImports: ['lucide-react']`, isteğe bağlı `ASSET_PREFIX` (CDN’den `_next/static` ön eki).
- Ana sayfa — `MobileLandingCta` `next/dynamic` ile ayrı chunk (ilk yüklemede gereksiz client JS azalır).
- `middleware.ts` — `FORCE_HTTPS_REDIRECT=true` ile (localhost hariç) `x-forwarded-proto: http` → HTTPS 308; Vercel’de TLS zaten edge’de sonlanır, bu değişken çoğu kurulumda kapalı kalabilir.

## Kontrol listesi (hız, mobil, HTTPS, SEO, CDN)

| İstenen | Projede / barındırıcıda |
|--------|-------------------------|
| Hızlı açılma | `compress`, görsel formatları, lucide tree-shake, dinamik CTA chunk’ı, Lighthouse ile ölçüm |
| Mobil uyum | `viewport` kök metadata, responsive Tailwind; `globals.css` içinde `text-size-adjust` |
| HTTPS | Üretimde HSTS başlığı; Vercel’de HTTPS varsayılan; kendi sunucuda `FORCE_HTTPS_REDIRECT` |
| SEO URL | App Router yolları = URL; kebab-case (`/destek`, `/sss`); canonical `SITE_URL` |
| Sayfa başlıkları | `siteSeo` + sayfa `metadata`; panel `app/(dashboard)/layout.tsx` `title.template` |
| Sitemap | `app/sitemap.ts` → `/sitemap.xml` |
| Robots | `app/robots.ts` → `/robots.txt` + middleware muafiyeti |
| Görseller | `next/image` + `images.formats`; uzak domain için `remotePatterns` |
| Gereksiz JS/CSS | Paket import optimizasyonu, dinamik import, üretim `removeConsole` |
| CDN | Vercel = edge CDN; ek CDN için `ASSET_PREFIX` (`.env.example`) |

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
