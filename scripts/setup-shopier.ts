/**
 * Shopier otomatik PRO aktivasyonu — yerel + Vercel hazırlık kontrolü.
 *
 * Kullanım:
 *   # Sadece durum kontrolü (secret yazdırmaz)
 *   npx tsx scripts/setup-shopier.ts
 *
 *   # Yerel .env.local'e secret yaz (değeri chat'e yapıştırma; terminalde gir)
 *   npx tsx scripts/setup-shopier.ts --set-local
 *
 *   # Vercel production'a ekle (CLI login gerekli)
 *   npx tsx scripts/setup-shopier.ts --set-vercel
 *
 * Akış (zaten kodda hazır):
 *   Shopier ödeme → webhook → imza doğrula → email eşleştir → PRO (180 gün)
 */

import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';
import { spawnSync } from 'child_process';

const ENV_LOCAL = resolve(process.cwd(), '.env.local');
const ENV = resolve(process.cwd(), '.env');
const WEBHOOK_URL = 'https://thegoallabs.com/api/billing/shopier/webhook';
const KEY = 'SHOPIER_WEBHOOK_SECRET';

function loadEnvFile(fileName: string): Record<string, string> {
  const p = resolve(process.cwd(), fileName);
  const out: Record<string, string> = {};
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function statusLine(label: string, ok: boolean, detail?: string) {
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`  [${mark}] ${label}${detail ? ` — ${detail}` : ''}`);
}

function readSecretPresence(): { local: boolean; processEnv: boolean; length: number } {
  const merged = { ...loadEnvFile('.env'), ...loadEnvFile('.env.local'), ...process.env };
  const v = (merged[KEY] ?? '').trim();
  const localOnly = {
    ...loadEnvFile('.env'),
    ...loadEnvFile('.env.local'),
  };
  return {
    local: Boolean((localOnly[KEY] ?? '').trim()),
    processEnv: Boolean((process.env[KEY] ?? '').trim()),
    length: v.length,
  };
}

function upsertEnvLocal(secret: string) {
  const line = `${KEY}=${secret}`;
  if (!existsSync(ENV_LOCAL)) {
    writeFileSync(ENV_LOCAL, `${line}\n`, 'utf8');
    return;
  }
  const raw = readFileSync(ENV_LOCAL, 'utf8');
  const lines = raw.split(/\r?\n/);
  let found = false;
  const next = lines.map((l) => {
    if (l.trim().startsWith(`${KEY}=`)) {
      found = true;
      return line;
    }
    return l;
  });
  if (!found) {
    const suffix = raw.endsWith('\n') || raw.length === 0 ? '' : '\n';
    appendFileSync(ENV_LOCAL, `${suffix}${line}\n`, 'utf8');
  } else {
    writeFileSync(ENV_LOCAL, next.join('\n'), 'utf8');
  }
}

function askSecret(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolveAsk) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolveAsk(answer.trim());
    });
  });
}

function printShopierPanelSteps() {
  console.log(`
Shopier Developer Portal adımları:
  1. https://developer.shopier.com  → Webhook oluştur
  2. URL:  ${WEBHOOK_URL}
  3. Event: order.created
  4. Oluşan Webhook Token / Secret = bizim ${KEY}
  5. Token'ı Vercel Production env'e ekle (aşağıdaki --set-vercel)
`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const setLocal = args.has('--set-local');
  const setVercel = args.has('--set-vercel');

  console.log('\n=== Shopier otomatik PRO kurulumu ===\n');
  console.log(`Webhook URL: ${WEBHOOK_URL}\n`);

  const presence = readSecretPresence();
  statusLine(
    `${KEY} yerel (.env / .env.local)`,
    presence.local,
    presence.local ? `configured (len=${presence.length || '?'})` : 'yok',
  );
  statusLine(
    `${KEY} process.env`,
    presence.processEnv,
    presence.processEnv ? 'var' : 'yok',
  );

  const envFiles = loadEnvFile('.env.local');
  const checkout =
    envFiles.SHOPIER_CHECKOUT_URL ||
    loadEnvFile('.env').SHOPIER_CHECKOUT_URL ||
    'https://www.shopier.com/zeosoft/47039117 (constants default)';
  const productId = envFiles.SHOPIER_PRO_PRODUCT_ID || loadEnvFile('.env').SHOPIER_PRO_PRODUCT_ID;
  statusLine('SHOPIER_CHECKOUT_URL', true, checkout);
  statusLine('SHOPIER_PRO_PRODUCT_ID', Boolean(productId), productId || 'opsiyonel (URL son segment kullanılır)');

  printShopierPanelSteps();

  if (!setLocal && !setVercel) {
    console.log(`Sonraki adım:
  npx tsx scripts/setup-shopier.ts --set-local     # .env.local
  npx tsx scripts/setup-shopier.ts --set-vercel    # Vercel Production
  Sonra: Vercel redeploy + Shopier'de test sipariş
`);
    return;
  }

  let secret = (process.env[KEY] ?? '').trim();
  if (!secret) {
    secret = await askSecret(`${KEY} değerini yapıştır (ekranda görünür; commit etme): `);
  }
  if (!secret || secret.length < 8) {
    console.error('Secret çok kısa veya boş. Shopier webhook token gerekli.');
    process.exit(1);
  }

  if (setLocal) {
    upsertEnvLocal(secret);
    console.log(`\n[OK] ${KEY} .env.local içine yazıldı (değer loglanmadı).`);
  }

  if (setVercel) {
    console.log('\nVercel Production env ekleniyor...');
    const result = spawnSync(
      'vercel',
      ['env', 'add', KEY, 'production'],
      {
        input: `${secret}\n`,
        encoding: 'utf8',
        stdio: ['pipe', 'inherit', 'inherit'],
        shell: true,
      },
    );
    if (result.status !== 0) {
      console.error(`
Vercel CLI başarısız. Manuel:
  1. Vercel Dashboard → Project → Settings → Environment Variables
  2. Name: ${KEY}
  3. Value: (Shopier webhook token)
  4. Environment: Production
  5. Redeploy
`);
      process.exit(result.status ?? 1);
    }
    console.log('[OK] Vercel production env eklendi. Redeploy gerekli.');
  }

  console.log(`
Tamamlandı. Otomatik akış:
  Ödeme (Shopier) → POST ${WEBHOOK_URL}
  → imza OK → kullanıcı email eşleşir → Organization = PRO (180 gün)
  → purchase + pro_activated

Test: FREE hesapla Shopier'den öde → dashboard'da PRO görünmeli.
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
