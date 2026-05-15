-- Supabase / PostgreSQL: SQL Editor'de bir kez çalıştırın (pooler yerine doğrudan DB önerilir).
-- Uygulama açılışında da otomatik denenir; yetki yoksa bu script ile ekleyin.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "setupWizardCompletedAt" TIMESTAMP(3);

-- Mevcut hesaplar: kurulum sihirbazını zorunlu tutma
UPDATE "users" SET "setupWizardCompletedAt" = NOW() WHERE "setupWizardCompletedAt" IS NULL;
