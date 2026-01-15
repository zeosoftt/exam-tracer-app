# Environment Variables Setup

`.env` dosyasını proje kök dizininde oluşturun ve aşağıdaki içeriği ekleyin:

```env
# Database Configuration
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
# ÖRNEK: postgresql://postgres:password@localhost:5432/exam_tracker?schema=public
DATABASE_URL="postgresql://examtracker:changeme@localhost:5432/exam_tracker?schema=public"

# NextAuth Configuration
# Secret oluşturmak için: node scripts/generate-secret.js
# Veya: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="qmnGy/ol9a+MEmeuhK9zl3BindcWztZTmMKjx4eYnhc="

# Application Environment
NODE_ENV="development"
APP_URL="http://localhost:3000"

# Logging Configuration
LOG_LEVEL="info"

# Rate Limiting Configuration
# Window in milliseconds (15 minutes = 900000)
RATE_LIMIT_WINDOW_MS=900000
# Maximum requests per window
RATE_LIMIT_MAX_REQUESTS=100

# Security Configuration
# Bcrypt rounds for password hashing (12 is recommended)
BCRYPT_ROUNDS=12
# JWT token expiration
JWT_EXPIRES_IN="7d"
# Session expiration
SESSION_EXPIRES_IN="30d"

# CORS Configuration (comma-separated list of allowed origins)
# Production için domain'inizi ekleyin: https://yourdomain.com
ALLOWED_ORIGINS="http://localhost:3000"
```

## Önemli Notlar:

1. **DATABASE_URL**: PostgreSQL veritabanı bağlantı bilgilerinizi güncelleyin
   - `examtracker`: Kullanıcı adı
   - `changeme`: Şifre
   - `localhost:5432`: Host ve port
   - `exam_tracker`: Veritabanı adı

2. **NEXTAUTH_SECRET**: Production için mutlaka değiştirin!
   - Yeni secret oluşturmak için: `node scripts/generate-secret.js`

3. **NEXTAUTH_URL**: Production'da domain'inizi kullanın
   - Örnek: `https://yourdomain.com`

4. **ALLOWED_ORIGINS**: Production'da frontend domain'inizi ekleyin

## Hızlı Kurulum:

1. Proje kök dizininde `.env` dosyası oluşturun
2. Yukarıdaki içeriği kopyalayıp yapıştırın
3. `DATABASE_URL`'i kendi veritabanı bilgilerinizle güncelleyin
4. Production için `NEXTAUTH_SECRET`'i değiştirin
