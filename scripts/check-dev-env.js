/**
 * Development Environment Check Script
 * Checks if all required environment variables and dependencies are set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Development Ortamı Kontrol Ediliyor...\n');

// Check .env.local file
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

let envFile = null;
if (fs.existsSync(envLocalPath)) {
  envFile = envLocalPath;
  console.log('✅ .env.local bulundu');
} else if (fs.existsSync(envPath)) {
  envFile = envPath;
  console.log('✅ .env bulundu');
} else {
  console.log('❌ .env veya .env.local bulunamadı');
  console.log('💡 .env.local dosyası oluşturun ve gerekli değişkenleri ekleyin\n');
  process.exit(1);
}

// Read environment variables
const envContent = fs.readFileSync(envFile, 'utf8');
const envVars = {};

envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  // Skip comments and empty lines
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

// Check required variables
const requiredVars = {
  'DATABASE_URL': 'Veritabanı bağlantı string\'i',
  'NEXTAUTH_SECRET': 'NextAuth secret key',
  'NEXTAUTH_URL': 'NextAuth URL (örn: http://localhost:3000)',
};

let allPresent = true;
console.log('\n📋 Environment Variables Kontrolü:');
for (const [key, description] of Object.entries(requiredVars)) {
  if (envVars[key]) {
    // Mask sensitive values
    const value = key === 'DATABASE_URL' 
      ? envVars[key].replace(/:[^:@]+@/, ':****@')
      : key === 'NEXTAUTH_SECRET'
      ? '***' + envVars[key].slice(-4)
      : envVars[key];
    console.log(`   ✅ ${key}: ${value}`);
  } else {
    console.log(`   ❌ ${key}: Eksik - ${description}`);
    allPresent = false;
  }
}

// Check Prisma client
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client', 'index.js');
if (fs.existsSync(prismaClientPath)) {
  console.log('\n✅ Prisma client generate edilmiş');
} else {
  console.log('\n❌ Prisma client generate edilmemiş');
  console.log('💡 Çözüm: npx prisma generate\n');
  allPresent = false;
}

// Check node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules mevcut');
} else {
  console.log('❌ node_modules bulunamadı');
  console.log('💡 Çözüm: npm install\n');
  allPresent = false;
}

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('✅ Development ortamı hazır!');
  console.log('\n🚀 Development server\'ı başlatmak için:');
  console.log('   npm run dev\n');
  process.exit(0);
} else {
  console.log('❌ Development ortamı eksik!');
  console.log('\n📖 Detaylar için DEVELOPMENT_SETUP.md dosyasına bakın\n');
  process.exit(1);
}
