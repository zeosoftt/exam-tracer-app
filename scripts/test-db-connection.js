/**
 * Database Connection Test Script
 * Tests if database connection is working
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  console.log('🔍 Veritabanı Bağlantısı Test Ediliyor...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Temel bağlantı testi...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✅ Bağlantı başarılı!\n');

    // Test 2: Database info
    console.log('2. Veritabanı bilgisi...');
    const result = await prisma.$queryRaw`SELECT version() as version`;
    console.log('   ✅ Veritabanı versiyonu:', result[0]?.version || 'Bilinmiyor\n');

    // Test 3: Table count
    console.log('3. Tablo sayısı...');
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('   ✅ Toplam tablo sayısı:', tableCount[0]?.count || 0, '\n');

    console.log('✅ Tüm testler başarılı! Veritabanı bağlantısı çalışıyor.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:\n');
    
    if (error instanceof Error) {
      console.error('Hata Tipi:', error.name);
      console.error('Hata Mesajı:', error.message);
      
      // Prisma specific errors
      if (error.message.includes("Can't reach database server")) {
        console.error('\n🔍 Olası Nedenler:');
        console.error('   1. IPv4 uyumluluk sorunu (Session Pooling gerekli)');
        console.error('   2. Supabase projesi paused/stopped olabilir');
        console.error('   3. Network bağlantı sorunu');
        console.error('   4. IP restriction aktif olabilir');
        console.error('   5. Firewall/antivirus engelliyor olabilir');
        console.error('\n💡 Çözüm:');
        console.error('   1. Supabase Dashboard > Settings > Database');
        console.error('   2. Connection string\'de "Session mode" seçin');
        console.error('   3. Yeni connection string\'i .env.local\'e kopyalayın');
        console.error('   4. Port 6543 ve pooler.supabase.com host kullanılmalı');
        console.error('\n📖 Detaylı rehber: FIX_IPV4_CONNECTION.md');
      } else if (error.message.includes('Authentication failed')) {
        console.error('\n🔍 Olası Neden: Şifre yanlış');
        console.error('💡 Çözüm: Supabase Dashboard\'dan connection string\'i yeniden kopyalayın');
      }
    } else {
      console.error('Bilinmeyen hata:', error);
    }
    
    console.error('\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
