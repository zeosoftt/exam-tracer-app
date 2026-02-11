/**
 * Development Environment Setup Script
 * Creates .env.local from .env or .env.production if needed
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🛠️  Development Ortamı Hazırlanıyor...\n');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');
const envProdPath = path.join(process.cwd(), '.env.production');

let sourceEnv = null;
let sourceContent = '';

// Check existing .env.local
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local mevcut');
  sourceContent = fs.readFileSync(envLocalPath, 'utf8');
} else if (fs.existsSync(envPath)) {
  console.log('📋 .env dosyasından kopyalanıyor...');
  sourceContent = fs.readFileSync(envPath, 'utf8');
  sourceEnv = envPath;
} else if (fs.existsSync(envProdPath)) {
  console.log('📋 .env.production dosyasından kopyalanıyor...');
  sourceContent = fs.readFileSync(envProdPath, 'utf8');
  sourceEnv = envProdPath;
} else if (fs.existsSync(path.join(process.cwd(), '.env.example'))) {
  console.log('📋 .env.example şablonundan .env.local oluşturulacak (değerleri doldurun!)');
  sourceContent = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
} else {
  console.log('❌ Hiçbir .env dosyası bulunamadı');
  console.log('💡 .env.example oluşturup kopyalayın: cp .env.example .env.local\n');
  sourceContent = '';
}

// Parse existing content
const envVars = {};
sourceContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  }
});

// Check and add required variables
const requiredVars = {
  'DATABASE_URL': {
    description: 'Supabase Pooler connection string (port 6543, pooler.supabase.com)',
    example: 'postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require',
    required: true,
  },
  'NEXTAUTH_SECRET': {
    description: 'NextAuth secret key',
    example: crypto.randomBytes(32).toString('hex'),
    required: true,
  },
  'NEXTAUTH_URL': {
    description: 'NextAuth URL',
    example: 'http://localhost:3000',
    required: true,
  },
};

let needsUpdate = false;
const newContent = [];

// Add existing variables
if (sourceContent) {
  newContent.push('# Development Environment Variables');
  newContent.push('# Generated automatically - do not commit to git');
  newContent.push('');
}

// Check each required variable
for (const [key, config] of Object.entries(requiredVars)) {
  if (envVars[key]) {
    newContent.push(`${key}="${envVars[key]}"`);
    console.log(`   ✅ ${key}: Mevcut`);
  } else {
    if (config.required) {
      console.log(`   ⚠️  ${key}: Eksik - ${config.description}`);
      if (key === 'NEXTAUTH_SECRET') {
        // Generate a new secret
        const secret = crypto.randomBytes(32).toString('hex');
        newContent.push(`${key}="${secret}"`);
        console.log(`      💡 Yeni secret oluşturuldu`);
      } else {
        newContent.push(`# ${key}="${config.example}"`);
        console.log(`      💡 Örnek değer eklendi (düzenleyin!)`);
      }
      needsUpdate = true;
    }
  }
}

// Add other existing variables (non-required)
for (const [key, value] of Object.entries(envVars)) {
  if (!requiredVars[key]) {
    newContent.push(`${key}="${value}"`);
  }
}

// Write .env.local
if (needsUpdate || !fs.existsSync(envLocalPath)) {
  fs.writeFileSync(envLocalPath, newContent.join('\n') + '\n', 'utf8');
  console.log('\n✅ .env.local dosyası oluşturuldu/güncellendi');
  console.log('\n⚠️  ÖNEMLİ: DATABASE_URL ve diğer değerleri kontrol edin!');
  console.log('   .env.local dosyasını düzenleyin ve gerekli değerleri ekleyin.\n');
} else {
  console.log('\n✅ Tüm gerekli environment variables mevcut!\n');
}

console.log('🚀 Development server\'ı başlatmak için:');
console.log('   npm run dev\n');
