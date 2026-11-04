import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);

await page.click('button:has-text("Night")');
await page.click('button:has-text("Headlights")');
await page.click('button[aria-label="Guards Red"]');
await page.waitForTimeout(6000);
await page.screenshot({ path: 'view_night.png', timeout: 120000 });
console.log('night shot done');

await page.click('button:has-text("Warm")');
await page.click('button:has-text("Headlights")');
await page.waitForTimeout(6000);
await page.screenshot({ path: 'view_warm.png', timeout: 120000 });
console.log('warm shot done');
await browser.close();
