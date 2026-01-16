# Deployment Guide

> **Yeni ve detaylı production deployment rehberi için**: [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) dosyasına bakın.

## Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 14+ (or use Docker)
- Domain name with SSL certificate
- Environment variables configured

### Step 1: Environment Setup

1. Copy `.env.example` to `.env.production`
2. Set all required environment variables:
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/exam_tracker
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NODE_ENV=production
   ```

### Step 2: Database Setup

1. Ensure PostgreSQL is running
2. Run migrations:
   ```bash
   npm run db:migrate
   ```

### Step 3: Build and Deploy

#### Option A: Docker

```bash
docker-compose -f docker-compose.yml up -d
```

#### Option B: Manual Deployment

1. Build the application:
   ```bash
   npm install
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

### Step 4: Health Check

Verify the application is running:
```bash
curl http://localhost:3000/api/health
```

## Monitoring

### Health Checks

The application exposes a health check endpoint at `/api/health` that checks:
- Database connectivity
- Application status

### Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Unhandled exceptions
- `logs/rejections.log` - Unhandled promise rejections

### Metrics to Monitor

- Response times
- Error rates
- Database connection pool usage
- Memory usage
- CPU usage

## Scaling

### Horizontal Scaling

1. Run multiple app instances behind a load balancer
2. Use shared session storage (Redis) instead of in-memory
3. Use Redis for rate limiting
4. Configure database connection pooling

### Database Scaling

1. Enable read replicas for read-heavy operations
2. Implement database sharding if needed
3. Regular backups and point-in-time recovery

## Backup Strategy

1. **Database Backups**: Daily automated backups
2. **Backup Retention**: 30 days
3. **Test Restores**: Monthly restore tests
4. **Point-in-Time Recovery**: Configured if needed

## Security Hardening

1. **HTTPS**: Always use HTTPS in production
2. **Security Headers**: Already configured in `next.config.js`
3. **Rate Limiting**: Configure appropriate limits
4. **CORS**: Restrict to known origins
5. **Environment Variables**: Never commit `.env` files
6. **Dependencies**: Regularly update and audit

## Troubleshooting

### Application Won't Start

1. Check environment variables
2. Verify database connectivity
3. Check logs in `logs/` directory
4. Verify port 3000 is available

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check PostgreSQL is running
3. Verify network connectivity
4. Check firewall rules

### Performance Issues

1. Check database query performance
2. Review slow query logs
3. Monitor connection pool usage
4. Consider adding indexes
