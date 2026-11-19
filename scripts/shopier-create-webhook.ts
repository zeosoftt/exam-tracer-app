/**
 * Shopier webhook aboneliğini API ile oluşturur ve dönen imza token'ını .env.local'e yazar.
 *
 * Neden: Shopier, webhook imza token'ını yalnızca oluşturma yanıtında bir kez döner.
 * Kendi mağazan için en kısa yol Personal Access Token (PAT) kullanmaktır; uygulama
 * Client ID / Client Secret değerleri OAuth içindir ve bu akışta gerekmez.
 *
 * Hazırlık (Shopier paneli):
 *   Hesap → Hesap Güvenliği → 2FA aç
 *   Hesap → Personal Access Token → Generate (bir kez gösterilir)
 *
 * Kullanım:
 *   npx tsx scripts/shopier-create-webhook.ts           # oluştur + .env.local'e yaz
 *   npx tsx scripts/shopier-create-webhook.ts --list      # mevcut abonelikleri listele
 *   npx tsx scripts/shopier-create-webhook.ts --recreate  # aynı URL kayıtlıysa sil + yeniden oluştur (yeni token)
 *   SHOPIER_PAT=... npx tsx scripts/shopier-create-webhook.ts   # prompt'suz
 *
 * Sonra: npx tsx scripts/setup-shopier.ts --set-vercel  (veya Vercel panelinden ekle) + redeploy
 */

import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

const API_BASE = 'https://api.shopier.com/v1';
const WEBHOOK_URL = process.env.SHOPIER_WEBHOOK_URL?.trim() || 'https://thegoallabs.com/api/billing/shopier/webhook';
const EVENT = 'order.created';
const KEY = 'SHOPIER_WEBHOOK_SECRET';
const ENV_LOCAL = resolve(process.cwd(), '.env.local');

function ask(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((done) => rl.question(prompt, (a) => { rl.close(); done(a.trim()); }));
}

function upsertEnvLocal(value: string): void {
  const line = `${KEY}=${value}`;
  if (!existsSync(ENV_LOCAL)) {
    writeFileSync(ENV_LOCAL, `${line}\n`, 'utf8');
    return;
  }
  const raw = readFileSync(ENV_LOCAL, 'utf8');
  const lines = raw.split(/\r?\n/);
  let found = false;
  const next = lines.map((l) => {
    if (l.trim().startsWith(`${KEY}=`)) { found = true; return line; }
    return l;
  });
  if (found) {
    writeFileSync(ENV_LOCAL, next.join('\n'), 'utf8');
  } else {
    const suffix = raw.endsWith('\n') || raw.length === 0 ? '' : '\n';
    appendFileSync(ENV_LOCAL, `${suffix}${line}\n`, 'utf8');
  }
}

async function api(path: string, pat: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let json: unknown = text;
  try { json = JSON.parse(text); } catch { /* düz metin */ }
  if (!res.ok) {
    throw new Error(`Shopier API ${res.status} ${path}: ${typeof json === 'string' ? json : JSON.stringify(json)}`);
  }
  return json;
}

type WebhookRow = { id?: string; event?: string; url?: string; token?: string };

async function main() {
  const list = process.argv.includes('--list');
  const recreate = process.argv.includes('--recreate');
  let pat = (process.env.SHOPIER_PAT ?? '').trim();
  if (!pat) pat = await ask('Shopier Personal Access Token (PAT) yapıştır: ');
  if (pat.length < 16) {
    console.error('PAT boş veya çok kısa.');
    process.exitCode = 1;
    return;
  }

  const existing = (await api('/webhooks', pat)) as WebhookRow[] | { data?: WebhookRow[] };
  const rows: WebhookRow[] = Array.isArray(existing) ? existing : existing.data ?? [];
  console.log(`\nMevcut abonelikler: ${rows.length}`);
  for (const r of rows) console.log(`  - ${r.event ?? '?'} → ${r.url ?? '?'} (id: ${r.id ?? '?'})`);

  if (list) return;

  const duplicate = rows.find((r) => r.event === EVENT && r.url === WEBHOOK_URL);
  if (duplicate && !recreate) {
    console.log(`\n[!] ${EVENT} için ${WEBHOOK_URL} zaten kayıtlı (id: ${duplicate.id}).`);
    console.log('    Token yalnızca ilk oluşturmada döner. Elinde yoksa sil + yeniden oluştur:');
    console.log('    npx tsx scripts/shopier-create-webhook.ts --recreate');
    process.exitCode = 2;
    return;
  }
  if (duplicate && recreate && duplicate.id) {
    await api(`/webhooks/${duplicate.id}`, pat, { method: 'DELETE' });
    console.log(`\n[OK] Eski abonelik silindi (id: ${duplicate.id}); yenisi oluşturuluyor...`);
  }

  const created = (await api('/webhooks', pat, {
    method: 'POST',
    body: JSON.stringify({ event: EVENT, url: WEBHOOK_URL }),
  })) as WebhookRow;

  const token = created.token?.trim();
  console.log(`\n[OK] Webhook oluşturuldu: ${created.event} → ${created.url} (id: ${created.id})`);
  if (!token) {
    console.error('[!] Yanıtta token yok. Shopier panelindeki Webhook Token değerini kullan.');
    process.exitCode = 3;
    return;
  }

  upsertEnvLocal(token);
  console.log(`[OK] ${KEY} .env.local içine yazıldı (uzunluk ${token.length}; değer loglanmadı).`);
  console.log(`
Sonraki adımlar:
  1. npx tsx scripts/setup-shopier.ts --set-vercel   # veya Vercel → Settings → Environment Variables → ${KEY}
  2. Vercel redeploy
  3. Shopier'de küçük bir test siparişi → dashboard'da PRO görünmeli
`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
