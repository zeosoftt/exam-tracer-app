#!/bin/bash
# Database initialization script

set -e

echo "Initializing database..."

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432 -U $DB_USER; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

echo "Database initialization complete!"
