import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(fileName) {
  const p = resolve(process.cwd(), fileName);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const prisma = new PrismaClient();

async function main() {
  const secretConfigured = Boolean(process.env.SHOPIER_WEBHOOK_SECRET?.trim());
  const checkoutConfigured = Boolean(
    process.env.SHOPIER_CHECKOUT_URL?.trim() || true, // constant always exists in code
  );
  console.log(
    JSON.stringify(
      {
        local: {
          SHOPIER_WEBHOOK_SECRET_configured: secretConfigured,
          SHOPIER_CHECKOUT_URL_in_env: Boolean(process.env.SHOPIER_CHECKOUT_URL?.trim()),
        },
      },
      null,
      2,
    ),
  );

  const rows = await prisma.siteSetting.findMany({
    where: {
      key: { in: ['pro_plan_price_try', 'pro_plan_billing_period', 'shopier_checkout_url'] },
    },
    select: { key: true, value: true },
  });
  console.log('SITE_SETTINGS', JSON.stringify(rows));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
