import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', (m) => {
  const t = m.text();
  if (t.includes('[dbg]') || t.includes('ingest') || t.includes('pivot') || t.includes('NOT FOUND') || t.includes('junk') || t.includes('materials') || t.includes('source meshes') || t.includes('hidden') || t.includes('articulated') || t.includes('components →')) console.log('[c]', t);
});
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 500)));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);
await page.screenshot({ path: 'view_ingest.png', timeout: 120000 });
await browser.close();
console.log('done');
