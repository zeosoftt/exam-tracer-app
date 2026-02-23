# Exam Tracker Platform

Modern, scalable exam tracking platform for institutions and individuals to track their responsibilities for government exams.

## Features

- 🎯 Role-based access control (Admin, Institution Admin, Individual, Viewer)
- 📊 Track exams, subjects, and topics
- 📈 Progress tracking for individuals and institutions
- 🔒 Enterprise-grade security
- ⚡ Optimized for 10M+ users
- 🎨 Modern, Codecademy-inspired UI

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials

# Generate NEXTAUTH_SECRET (required for authentication)
node scripts/generate-secret.js
# Copy the generated secret to .env file as NEXTAUTH_SECRET=...
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
exam-tracker/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages
│   └── (dashboard)/       # Dashboard pages
├── components/            # React components
├── lib/                   # Utilities and helpers
│   ├── auth/             # Authentication logic
│   ├── db/               # Database utilities
│   ├── errors/           # Error handling
│   ├── validation/       # Validation schemas
│   └── logger/           # Logging utilities
├── types/                 # TypeScript types
├── config/               # Configuration files
└── prisma/               # Prisma schema and migrations
```

## Security Features

- ✅ SQL Injection protection (Prisma ORM)
- ✅ XSS protection (Output escaping)
- ✅ CSRF protection (NextAuth)
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ Password hashing (bcrypt)
- ✅ JWT-based authentication
- ✅ Role-based access control

## Development Guidelines

- Follow SOLID principles
- No magic numbers/strings
- Comprehensive error handling
- Input validation on all endpoints
- Structured logging
- Unit and integration tests

## Deployment

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Run database migrations:
```bash
docker-compose exec app npx prisma migrate deploy
```

### Environment Variables

**📖 Detaylı kılavuz için:** [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)

**Hızlı başlangıç:**
```bash
# 1. Template'i kopyala
cp .env.development.example .env.local

# 2. Değerleri doldur (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)

# 3. Secret oluştur
node scripts/generate-secret.js

# 4. Kontrol et
npm run dev:check
```

**Zorunlu değişkenler:**
- `DATABASE_URL`: PostgreSQL connection string (Supabase pooler kullanın)
- `NEXTAUTH_URL`: Application URL (`http://localhost:3000` veya production domain)
- `NEXTAUTH_SECRET`: JWT secret key (min 32 karakter)

**Opsiyonel değişkenler:**
- `NODE_ENV`: `development` | `production` (otomatik ayarlanır)
- `LOG_LEVEL`: `error` | `warn` | `info` | `debug` (varsayılan: `info`)
- `ALLOWED_ORIGINS`: CORS origins (virgülle ayrılmış)

### Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure rate limiting (consider Redis)
- [ ] Set up monitoring and alerting
- [ ] Enable HTTPS
- [ ] Configure log rotation
- [ ] Set up health check monitoring

## Architecture

### Scalability (10M+ Users)

- **Database**: PostgreSQL with proper indexing
- **Caching**: Consider Redis for session storage and rate limiting
- **CDN**: Static assets served via CDN
- **Load Balancing**: Multiple app instances behind load balancer
- **Database Connection Pooling**: Prisma connection pooling
- **Pagination**: All list endpoints support pagination
- **Lazy Loading**: Frontend components loaded on demand

### Security Measures

1. **Authentication**: JWT-based with NextAuth.js
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Zod schemas on all endpoints
4. **SQL Injection**: Prevented by Prisma ORM
5. **XSS**: Output escaping utilities
6. **CSRF**: NextAuth built-in protection
7. **Rate Limiting**: In-memory (use Redis in production)
8. **Password Security**: bcrypt with configurable rounds
9. **Error Handling**: Never expose stack traces to clients
10. **Logging**: Structured logging with Winston (no sensitive data)

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Documentation

### Authentication Required Endpoints

Most endpoints require authentication. Include the session cookie in requests.

### Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `GET /api/exams` - List exams (paginated)
- `POST /api/exams` - Create exam (Admin/Institution Admin)
- `GET /api/exams/[id]` - Get exam details
- `GET /api/progress` - Get user progress (paginated)
- `POST /api/progress` - Update progress
- `GET /api/dashboard/stats` - Dashboard statistics

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
