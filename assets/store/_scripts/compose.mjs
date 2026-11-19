import { createRequire } from 'module';
import { readFileSync } from 'fs';
const { chromium } = createRequire('C:/Users/EXCALIBUR/Desktop/exam-tracker/package.json')('@playwright/test');
const shots = process.argv[2], out = process.argv[3];
const W = 1920, H = 1200;
const b64 = (p) => 'data:image/png;base64,' + readFileSync(p).toString('base64');
const logo = `<svg width="56" height="56" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14b8a6"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/><circle cx="16" cy="16" r="10" fill="none" stroke="#fff" stroke-width="1.5" opacity=".5"/><circle cx="16" cy="16" r="6" fill="none" stroke="#fff" stroke-width="1.5" opacity=".75"/><circle cx="16" cy="16" r="3" fill="#fff" opacity=".95"/></svg>`;
const slides = [
  { file: '01-genel-bakis.png', shot: 'hero2x.png', kicker: 'SINAV HAZIRLIĞI · TEK PANEL', title: 'Sınav hazırlığını <em>tek panelde</em> topla', sub: 'KPSS, ALES, ÖABT, YKS, DGS ve YDS için konu ilerlemesi, deneme kaydı, net trendi ve hedef puan takibi.' },
  { file: '02-ozellikler.png', shot: 'sec_ozellikler.png', kicker: 'DÖRT ARAÇ, TEK PLATFORM', title: 'Konu takibi, deneme analizi, <em>aralıklı tekrar</em> ve Pomodoro', sub: 'Dört araç, tek platform: tamamlanan konular, net grafiği, otomatik tekrar planı ve odak seansları.', shift: 105 },
  { file: '03-sorun-cozum.png', shot: 'sec_sorunlar.png', shift: 60, kicker: 'SORUN → ÇÖZÜM', title: 'Dağınık deneme notlarına <em>son</em>', sub: 'Tüm denemeler tek listede; net ve puan otomatik hesaplanır, hangi konuda geride kaldığın anında görünür.' },
  { file: '04-nasil-calisir.png', shot: 'sec_nasil.png', shift: 120, kicker: '3 ADIM', title: 'Üç adımda <em>başla</em>', sub: 'Ücretsiz kayıt ol, sınavını ve konularını seç, takip et. Kredi kartı gerekmez.' },
  { file: '05-paketler.png', shot: 'sec_paketler.png', shift: 40, kicker: 'ÜCRETSİZ + PRO', title: 'Ücretsiz başla, <em>Pro</em> ile derinleş', sub: 'Pro: 99 ₺ / 6 ay, taahhüt yok. Deneme detayı, ders/konu analizi ve ÖSYM uyumlu puan önizlemesi.' },
];
const html = (s) => `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:Inter,'Segoe UI',system-ui,sans-serif;color:#1c1917;background:
 radial-gradient(900px 600px at 8% 0%, rgba(20,184,166,.18), transparent 60%),
 radial-gradient(900px 600px at 95% 10%, rgba(245,158,11,.14), transparent 60%),
 linear-gradient(180deg,#fafaf9 0%,#f5f5f4 100%);position:relative}
.brand{position:absolute;left:96px;top:72px;display:flex;align-items:center;gap:18px;font-weight:800;font-size:34px;letter-spacing:-.5px}
.text{position:absolute;left:96px;right:96px;top:168px;text-align:left}
.kicker{display:inline-block;font-size:18px;font-weight:600;letter-spacing:.22em;color:#0f766e;background:rgba(20,184,166,.10);border:1px solid rgba(20,184,166,.25);border-radius:999px;padding:10px 20px}
h1{margin-top:26px;font-size:76px;line-height:1.06;font-weight:800;letter-spacing:-2px;max-width:1500px}
h1 em{font-style:normal;background:linear-gradient(90deg,#0d9488,#b45309);-webkit-background-clip:text;background-clip:text;color:transparent}
p{margin-top:22px;font-size:30px;line-height:1.4;color:#57534e;max-width:1400px;font-weight:500}
.frame{position:absolute;left:160px;right:160px;top:${s.top}px;bottom:${s.fit ? 'auto' : '-40px'};background:#fff;border-radius:28px;box-shadow:0 40px 100px rgba(28,25,23,.18),0 0 0 1px rgba(28,25,23,.06);overflow:hidden}
.bar{height:52px;background:#f5f5f4;border-bottom:1px solid #e7e5e4;display:flex;align-items:center;gap:10px;padding:0 22px}
.bar i{width:14px;height:14px;border-radius:50%;display:block}
.bar .url{margin-left:14px;flex:1;height:30px;border-radius:8px;background:#fff;border:1px solid #e7e5e4;font-size:15px;color:#78716c;display:flex;align-items:center;padding:0 14px}
.frame img{display:block;width:100%;height:auto;margin-top:-${s.shift || 0}px}
</style></head><body>
<div class="brand">${logo}<span>The Goal Lab</span></div>
<div class="text"><span class="kicker">${s.kicker}</span><h1>${s.title}</h1><p>${s.sub}</p></div>
<div class="frame"><div class="bar"><i style="background:#f87171"></i><i style="background:#fbbf24"></i><i style="background:#34d399"></i><span class="url">thegoallabs.com</span></div><div style="overflow:hidden"><img src="${s.src}"></div></div>
</body></html>`;
const browser = await chromium.launch();
// Hero at 2x, sticky/fixed CTA hidden but header kept
const p0 = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light', reducedMotion: 'reduce' });
await p0.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 90000 });
await p0.addStyleTag({ content: '.landing-reveal{opacity:1!important;transform:none!important}' });
await p0.evaluate(() => { document.querySelectorAll('body *').forEach((el) => { const cs = getComputedStyle(el); if (cs.position === 'fixed' && el.tagName !== 'HEADER' && !el.closest('header')) el.style.setProperty('display', 'none', 'important'); }); });
await p0.waitForTimeout(500);
await p0.screenshot({ path: `${shots}/hero2x.png` });
await p0.close();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const s of slides) {
  const top = s.shot === 'hero2x.png' ? 520 : 540; const fit = s.shot === 'sec_sorunlar.png' || s.shot === 'sec_nasil.png';
  await page.setContent(html({ ...s, src: b64(`${shots}/${s.shot}`), top, fit }), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${s.file}`, clip: { x: 0, y: 0, width: W, height: H } });
  console.log('ok', s.file);
}
await browser.close();
