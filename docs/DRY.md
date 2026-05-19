# DRY (Don't Repeat Yourself) — Adım Adım Plan

Bu belge, tekrarlayan kodun projeden nasıl temizlendiğini ve sıradaki adımları listeler.

## Adım 1 — Tamamlandı ✅

### Paylaşılan istemci HTTP katmanı
- **`lib/client-api/http.ts`** — `fetchJson`, `fetchApiData`, `mutateApi`, `parseJsonSafe`, `getApiErrorMessage`
- Güncellenen modüller: `userSettings`, `pomodoroClient`, `examsAvailable`, `authForms`

### Paylaşılan sunucu oturum doğrulama
- **`lib/auth/requireSession.ts`** — `requireSession()`, `getSessionUserId()`
- Güncellenen route'lar: `user/settings`, `billing/plan`

### Paylaşılan veri erişimi
- **`lib/settings/settingsRepository.ts`** — ayarlar GET/PATCH Prisma sorguları tek yerde
- **`lib/billing/planInfoDto.ts`** — plan DTO eşlemesi

### Client-api tek konum
- **`lib/client-api/dashboardClient.ts`** — dashboard + detail + plan badge
- **`lib/client-api/examsClient.ts`** — sınav listesi/oluşturma
- Eski yollar `@deprecated` re-export ile korunuyor

### UI / domain tekrarları
- **`lib/settings/settingsFormStyles.ts`** — form sınıfları + `formatExamOptionLabel`
- **`components/settings/SettingsUi.tsx`** — `ToggleSwitch`, `SettingsSectionCard`
- **`lib/utils/denemeScore.ts`** — `KpssPopulationStats` tek kaynak: `kpssStats.ts`

## Adım 2 — Tamamlandı ✅

1. **Kalan API route'ları** → `requireSession()` — pomodoro, deneme, kpss-stats, progress, dashboard stats/detail
2. **denemeClient, progressClient** → `http.ts`
3. **super-admin / support client'ları** → `lib/client-api/`
4. **SettingsPageClient** → paylaşılan form stilleri (hesap + hedef alanları)
5. **Scoring** → `lib/scoring/index.ts` barrel

## Adım 3 — Tamamlandı ✅

1. **`requireSession` genişletildi** — `requireAdminSession()`, `guardAdminSession()`, `toUserPermissions()`
2. **Tüm super-admin API route'ları** → `guardAdminSession()` (12 dosya)
3. **Kullanıcı API route'ları** → `requireSession()` — exams, subjects, progress, change-password, setup-wizard, exam structure
4. **Deneme katmanı** — `lib/deneme/denemeRepository.ts`, `lib/deneme/computeDenemeScores.ts`; route inceltildi
5. **SettingsPageClient** → tüm bölümler `SettingsSectionCard` ile

## Adım 4 — Tamamlandı ✅

- **Dashboard stats parçalı servisler** — `lib/services/dashboard/stats/*`
- **Auth route POST yardımcıları** — `lib/auth/authRouteHelpers.ts`
- **DenemePageClient hook ayrımı** — `components/deneme/hooks/*`, `lib/deneme/computeDenemeAnalysis.ts`
- **Server page oturum helper'ları** — `lib/auth/pageSession.ts` (10 sayfa)

## Adım 5 — Tamamlandı ✅

### Tamamlandı (DashboardContent)
- **`components/dashboard/hooks/useDashboardPage.ts`** — mevcut hook'ları birleştirir
- **`components/dashboard/home/*`** — `DashboardHeader`, `DashboardHeroSection`, `DashboardStatsGrid`, `DashboardSpacedRepetitionSection`, `DashboardEvaluationSection`, `DashboardQuickLinksSection`
- **`DashboardContent.tsx`** — ~940 satırdan ~70 satıra ince orchestrator

### Tamamlandı (DashboardDetailContent)
- **`components/dashboard/hooks/useDashboardDetailPage.ts`** — `useDashboardDetailData` + `useDashboardDetailTopicActions`
- **`components/dashboard/detail/*`** — header, back link, sections view, topics table, evaluation banner, empty state, `topicStatusConfig`
- **`DashboardDetailContent.tsx`** — ~657 satırdan ~35 satıra ince orchestrator

### Tamamlandı (PomodoroPageClient)
- **`components/pomodoro/hooks/*`** — `usePomodoroPage`, `usePomodoroSound`, `usePomodoroDashboard`, `usePomodoroTimer`, `useDenemePracticeTimer`
- **`components/pomodoro/*`** — header, tab nav, timer panelleri, sidebar, sabitler/tipler
- **`PomodoroPageClient.tsx`** — ~683 satırdan ~45 satıra ince orchestrator

### Tamamlandı (middleware authorization)
- **`lib/auth/requireSession.ts`** — `toAuthErrorResponse()` (guardAdminSession + middleware paylaşımı)
- **`lib/middleware/authorization.ts`** — `getAuthContext()` → `requireSession` + `getSessionUserId`; hata yanıtları `toAuthErrorResponse`

## Adım 6 — Tamamlandı ✅ (Reusable UI)

### Temel bileşenler
- **`components/ui/`** — `AppBrandLink`, `AppPageHeader`, `AppHeaderActions`, `PageBackLink`, `CircularProgressRing`, `EmptyStateCard`, `SkeletonRows`, `RouteShellSkeleton`
- **`components/ui/index.ts`** — barrel export
- Dashboard / Detail / Pomodoro header ve boş durumlar bu bileşenlere taşındı
- Pomodoro timer halkaları → `CircularProgressRing`

### Sayfa düzeni ve geri bildirim
- **`SubAppPageHeader`**, **`HeaderBackLink`**, **`PageTitleBlock`** — alt sayfa başlıkları (Ayarlar, Deneme, Pomodoro)
- **`FlashMessage`** — başarı / hata mesajları
- **`SectionIconHeader`** — bölüm başlığı (ikon + başlık + açıklama)

### Kart ve panel
- **`lib/ui/pageStyles.ts`** — `pageCardClass`, `panelCardClass`
- **`PageSectionCard`** — ayarlar bölüm kartı (`settingsCardClass` ile uyumlu)
- **`PanelCard`** — pomodoro yan panel / istatistik / geçmiş kabuğu
- **`StatCard`**, **`StatCardGridSkeleton`** — dashboard özet kartları
- **`QuickLinkCard`** — dashboard hızlı erişim kutuları
- **`TimerControlButtons`** — pomodoro ve deneme zamanlayıcı kontrolleri

### Kullanım yerleri
- `SettingsPageClient`, `DenemePageClient` → `SubAppPageHeader`, `PageTitleBlock`, `FlashMessage`
- `DashboardStatsGrid` → `SectionIconHeader`, `StatCard`, `StatCardGridSkeleton`
- `DashboardQuickLinksSection` → `QuickLinkCard`
- `PomodoroTimerPanel`, `DenemePracticeTimerPanel` → `TimerControlButtons`, `PanelCard` / `CircularProgressRing`
- `PomodoroStatsPanel`, `PomodoroHistoryPanel`, `PomodoroSidebar` → `PanelCard`

## Adım 7 — Tamamlandı ✅ (KISS)

- **`BackLink`** — `HeaderBackLink` + `PageBackLink` birleşimi
- Çift başlık kaldırıldı; `pageIntroClass` ile kısa açıklama
- Tek kullanımlık wrapper ve `components/*/api` shim dosyaları silindi

## Adım 8 — Tamamlandı ✅ (Separation of Concerns)

### Katmanlar

| Katman | Konum | Sorumluluk |
|--------|--------|------------|
| **Sunum** | `app/**/PageClient`, `components/**/sections/*` | JSX, kullanıcı etkileşimi, stil |
| **Uygulama durumu** | `components/**/hooks/use*Page` | Form state, yan etkiler, API çağrısı orchestration |
| **İş kuralları** | `lib/**` (pure functions) | Doğrulama, payload oluşturma, parse, skor hesabı |
| **Veri erişimi** | `lib/client-api/*`, `lib/**/repository.ts` | HTTP, Prisma |
| **Sunucu** | `app/api/**` | Auth, route → service/repository |

### Ayarlar sayfası (örnek)

- **`useSettingsPage`** — oturum, fetch, kaydet, şifre değiştir
- **`lib/settings/buildSettingsPatchBody`**, **`validatePasswordChange`**, **`parseSettingsPageBundle`** — saf iş kuralları
- **`components/settings/sections/*`** — bölüm bazlı sunum
- **`SettingsPageClient`** — ~15 satır orchestrator

### SoC kuralları

1. **PageClient** içinde `fetch` / Prisma **yazma** — hook veya server loader kullan.
2. Doğrulama ve DTO dönüşümü **UI’da değil** `lib/` içinde tut.
3. Büyük sayfayı böl: hook (durum) + view/sections (sunum).
4. API route: auth → service/repository → JSON; iş mantığını route gövdesinde şişirme.

## Kurallar

1. Yeni client fetch **asla** ham `fetch().json().catch()` yazma — `http.ts` kullan.
2. Yeni API route **asla** inline `getServerSession` + null check — `requireSession()` veya `guardAdminSession()` kullan.
3. Yeni korumalı sayfa **asla** inline `getServerSession` + `redirect` — `requirePageSession()` kullan.
4. Aynı Prisma sorgusu iki yerde görünürse → repository/service çıkar.
5. Eski import yollarını hemen silme — önce `@deprecated` re-export, sonra migrate.
6. Yeni sayfa header / geri link / boş durum / progress ring → önce `components/ui` kontrol et.
7. Yeni kart, panel, istatistik kutusu veya timer kontrolü → `StatCard`, `PanelCard`, `PageSectionCard`, `TimerControlButtons` önce bak; tekrarlayan Tailwind sınıflarını `lib/ui/pageStyles.ts` ile paylaş.
8. **KISS:** Gereksiz wrapper, çift başlık veya sadece re-export eden dosya ekleme — önce mevcut bileşeni genişlet veya doğrudan import et.
9. **SoC:** Sunum / hook / `lib` iş kuralı / veri erişimini karıştırma; yeni özellikte önce hangi katmana ait olduğuna karar ver.

## Kontrol listesi (PR öncesi)

- [ ] Duplicate string/class 3+ tekrar ediyor mu?
- [ ] Aynı API response parse mantığı kopyalandı mı?
- [ ] Prisma sorgusu route + loader'da çift mi?
