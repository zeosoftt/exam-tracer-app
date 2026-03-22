# SEO ve trafik — teknik + operasyonel

## Projede yapılanlar (teknik)

- `metadataBase`, başlık şablonu, açıklama, OG/Twitter, Google site doğrulama (`app/layout.tsx`)
- Dinamik **Open Graph görseli** (`app/opengraph-image.tsx`, 1200×630)
- `robots.ts` — `/dashboard`, `/api/`, `/auth/` tarama dışı
- `sitemap.ts` — ana sayfa, onboarding, SSS
- `/auth/*` için **noindex** (`app/(auth)/auth/layout.tsx`)
- Onboarding için canonical + açıklama (`app/(auth)/onboarding/layout.tsx`)
- Ana sayfa + SSS: JSON-LD (WebSite, Organization, SoftwareApplication, FAQPage)

## Trafik için sizin yapmanız gerekenler

1. **Google Search Console** — Mülk ekleyin, sitemap gönderin: `https://thegoallab.com/sitemap.xml`
2. **SITE_URL / NEXTAUTH_URL** — Canlı domain ile aynı olsun (canonical ve OG URL’leri için)
3. **İçerik** — Blog zorunlu değil; hedef anahtar kelimeler için 5–10 kaliteli sayfa/yazı zamanla fark yaratır
4. **Backlink** — Dershane, eğitim siteleri, sosyal profillerden doğal linkler
5. **Performans** — Core Web Vitals (Lighthouse); mobil deneyim

SEO tek başına genelde yavaş büyür; teknik temel + içerik + dağıtım birlikte işe yarar.
