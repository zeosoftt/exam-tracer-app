/**
 * Generate NEXTAUTH_SECRET
 * Run: node scripts/generate-secret.js
 */

const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64');
console.log('\n🔐 Generated NEXTAUTH_SECRET:');
console.log(secret);
console.log('\nAdd this to your .env file:');
console.log(`NEXTAUTH_SECRET=${secret}\n`);
