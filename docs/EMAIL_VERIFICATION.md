# E-posta doğrulama

## Akış

1. **Kayıt** → `emailVerified = false`, doğrulama e-postası gider.
2. **Giriş** → Şifre doğru olsa bile `emailVerified` false ise giriş reddedilir; kullanıcıya doğrulama gerekir mesajı ve **tekrar mail gönder** seçeneği sunulur.
3. **Doğrulama linki** → `/auth/verify-email?token=...` → `emailVerified = true` → giriş yapılabilir.

## Güvenlik

- E-posta doğrulanmamış hesap, **şifre doğrulandıktan sonra** reddedilir (hesap varlığı + doğrulanmamış bilgisi birlikte sızdırılmaz).
- Tekrar gönder: `POST /api/auth/resend-verification` `{ "email": "..." }` — IP başına rate limit uygulanır; yanıt her zaman başarılı mesajı döner (enumeration yok).

## Mevcut kullanıcılar (backfill)

Yeni kuraldan önce kayıtlı kullanıcıların kilitlenmemesi için **bir kez** şunu çalıştırın:

```bash
# Örnek: psql
psql "$DATABASE_URL" -f scripts/backfill-email-verified.sql
```

## Ortam değişkenleri

- `NEXTAUTH_URL` — doğrulama linkinin doğru domain’e gitmesi için zorunlu (production).
- `RESEND_API_KEY` + `EMAIL_FROM` — gerçek e-posta gönderimi için.
