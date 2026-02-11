/**
 * Supabase Connection Status Check
 * Tests various connection scenarios
 */

const https = require('https');
const dns = require('dns').promises;

const SUPABASE_HOST = 'db.hpmtdhftntrlbobuwqxc.supabase.co';

async function checkDNS() {
  console.log('🔍 DNS Çözümlemesi Kontrol Ediliyor...\n');
  try {
    const addresses = await dns.resolve4(SUPABASE_HOST);
    console.log('✅ DNS çözümlemesi başarılı!');
    console.log('   IP adresleri:', addresses.join(', '), '\n');
    return true;
  } catch (error) {
    console.error('❌ DNS çözümlemesi başarısız!');
    console.error('   Hata:', error.message, '\n');
    return false;
  }
}

async function checkHTTPS() {
  console.log('🔍 HTTPS Bağlantısı Kontrol Ediliyor...\n');
  return new Promise((resolve) => {
    const req = https.request({
      hostname: SUPABASE_HOST.replace('db.', ''),
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 5000,
    }, (res) => {
      console.log('✅ HTTPS bağlantısı başarılı!');
      console.log('   Status:', res.statusCode, '\n');
      resolve(true);
    });

    req.on('error', (error) => {
      console.error('❌ HTTPS bağlantısı başarısız!');
      console.error('   Hata:', error.message, '\n');
      resolve(false);
    });

    req.on('timeout', () => {
      console.error('❌ HTTPS bağlantısı zaman aşımına uğradı!\n');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Supabase Bağlantı Durumu Kontrolü\n');
  console.log('Host:', SUPABASE_HOST);
  console.log('Port: 5432 (PostgreSQL)\n');
  console.log('='.repeat(50), '\n');

  const dnsOk = await checkDNS();
  const httpsOk = await checkHTTPS();

  console.log('='.repeat(50), '\n');
  console.log('📋 SONUÇ:\n');

  if (!dnsOk) {
    console.log('❌ DNS çözümlemesi başarısız!');
    console.log('💡 Olası nedenler:');
    console.log('   1. İnternet bağlantısı sorunu');
    console.log('   2. DNS sunucusu sorunu');
    console.log('   3. Supabase projesi silinmiş/deaktif');
    console.log('\n🔧 Çözüm:');
    console.log('   1. İnternet bağlantınızı kontrol edin');
    console.log('   2. Farklı bir DNS sunucusu deneyin (8.8.8.8)');
    console.log('   3. Supabase Dashboard\'da projenizi kontrol edin\n');
    process.exit(1);
  }

  if (!httpsOk) {
    console.log('⚠️  HTTPS bağlantısı başarısız (ama DNS çalışıyor)');
    console.log('💡 Bu normal olabilir - PostgreSQL port 5432 kullanır\n');
  }

  console.log('✅ Temel bağlantı testleri tamamlandı');
  console.log('\n📋 Sonraki Adımlar:');
  console.log('   1. Supabase Dashboard\'da projenizi kontrol edin');
  console.log('   2. Proje durumunun ACTIVE olduğundan emin olun');
  console.log('   3. Connection string\'i doğrulayın');
  console.log('   4. IP whitelist kontrol edin\n');
}

main().catch(console.error);
