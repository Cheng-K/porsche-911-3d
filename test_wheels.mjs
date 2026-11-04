import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
page.on('console', (m) => { const t = m.text(); if (t.includes('wheels:') || t.includes('front') || t.includes('rear')) console.log('[c]', t); });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);

// steer hard left + start rolling
await page.evaluate(() => {
  const input = document.querySelector('input[type="range"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, '-1');
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.click('button:has-text("Roll wheels")');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'view_wheels.png', timeout: 120000 });
console.log('wheel shot done');
await browser.close();
