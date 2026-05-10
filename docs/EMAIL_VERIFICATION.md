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
- `EMAIL_VERIFICATION_TTL_HOURS` — doğrulama token süresi (saat, varsayılan 24, en fazla 168). Veritabanı `expiresAt` ve e-posta metni buna uyumlu.

## Oturum süresi

- `SESSION_EXPIRES_IN` — “Beni hatırla” **kapalıyken** geçerli oturum süresi (`7d`, `12h`, saniye vb.). Varsayılan `30d`.
- `SESSION_REMEMBER_EXPIRES_IN` — “Beni hatırla” **açıkken** üst süre; kısa süreden kısa olamaz. Varsayılan `30d`.
- JWT çerezi `maxAge` = ikisinin uzunu; kısa politika sunucuda JWT callback ile uygulanır.

## Şifre sıfırlama

`POST /api/auth/forgot-password` Resend ile (`RESEND_API_KEY`, `EMAIL_FROM`) kullanıcıya sıfırlama linki gönderir. IP başına rate limit uygulanır. Üretim loglarında tam URL/token tutulmaz.
