import { createRequire } from 'module';
const { chromium } = createRequire('C:/Users/EXCALIBUR/Desktop/exam-tracker/package.json')('@playwright/test');
const out = process.argv[2];
const svg = (rx) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs>
  <rect width="32" height="32" rx="${rx}" fill="url(#g)"/>
  <circle cx="16" cy="16" r="10" fill="none" stroke="white" stroke-width="1.5" opacity="0.5"/>
  <circle cx="16" cy="16" r="6" fill="none" stroke="white" stroke-width="1.5" opacity="0.75"/>
  <circle cx="16" cy="16" r="3" fill="white" opacity="0.95"/>
</svg>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
for (const [name, rx] of [['icon-512.png', 0], ['icon-512-rounded.png', 8]]) {
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(rx)}</body></html>`);
  await page.screenshot({ path: `${out}/${name}`, omitBackground: true, clip: { x: 0, y: 0, width: 512, height: 512 } });
  console.log('ok', name);
}
await browser.close();
