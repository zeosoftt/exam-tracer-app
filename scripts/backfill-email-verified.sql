-- Tek sefer çalıştırın (production deploy öncesi veya hemen sonra):
-- Mevcut tüm kullanıcıları "e-posta doğrulandı" sayar; yeni kayıtlar yine doğrulama zorunludur.
UPDATE "users" SET "emailVerified" = true WHERE "emailVerified" = false;
