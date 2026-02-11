/**
 * Authorization Seed Script
 * 
 * Run this after initial migration to create:
 * - Default permissions
 * - System roles
 * - Role-permission mappings
 * - Plans
 * - Features
 * - Plan-feature mappings
 * 
 * Usage:
 *   npx ts-node prisma/seed-auth.ts
 *   OR
 *   npm run seed:auth
 */

import { seedAll } from '../lib/auth/seedPermissions';

async function main() {
  console.log('🚀 Starting authorization seed...');
  await seedAll();
  console.log('✅ Authorization seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma client handles connection cleanup
  });
