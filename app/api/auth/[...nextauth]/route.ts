/**
 * NextAuth API Route
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Validate configuration before creating handler
if (!authOptions.secret) {
  console.error('⚠️  WARNING: NEXTAUTH_SECRET is not set. Authentication may not work properly.');
  console.error('   Run: node scripts/generate-secret.js to generate a secret.');
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
