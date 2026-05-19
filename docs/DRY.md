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

## Kurallar

1. Yeni client fetch **asla** ham `fetch().json().catch()` yazma — `http.ts` kullan.
2. Yeni API route **asla** inline `getServerSession` + null check — `requireSession()` veya `guardAdminSession()` kullan.
3. Yeni korumalı sayfa **asla** inline `getServerSession` + `redirect` — `requirePageSession()` kullan.
4. Aynı Prisma sorgusu iki yerde görünürse → repository/service çıkar.
5. Eski import yollarını hemen silme — önce `@deprecated` re-export, sonra migrate.

## Kontrol listesi (PR öncesi)

- [ ] Duplicate string/class 3+ tekrar ediyor mu?
- [ ] Aynı API response parse mantığı kopyalandı mı?
- [ ] Prisma sorgusu route + loader'da çift mi?
