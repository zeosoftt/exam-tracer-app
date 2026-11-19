import { createRequire } from 'module';
const { chromium } = createRequire('C:/Users/EXCALIBUR/Desktop/exam-tracker/package.json')('@playwright/test');
const out = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light', locale: 'tr-TR', reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 90000 });
await page.addStyleTag({ content: '.landing-reveal{opacity:1!important;transform:none!important}' });
for (let y = 0; y < 9500; y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(100); }
await page.evaluate(() => { document.querySelectorAll('body *').forEach((el) => { const cs = getComputedStyle(el); if (cs.position === 'fixed' || cs.position === 'sticky') el.style.setProperty('display', 'none', 'important'); }); });
await page.waitForTimeout(300);
for (const id of ['sorunlar', 'ozellikler', 'nasil', 'paketler']) {
  const el = page.locator('#' + id).first();
  await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  await el.screenshot({ path: `${out}/sec_${id}.png` });
  const b = await el.boundingBox(); console.log('ok', id, Math.round(b.width), Math.round(b.height));
}
await browser.close();
