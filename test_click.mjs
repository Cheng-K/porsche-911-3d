import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);

const readOpen = () => page.evaluate(() => {
  const out = {};
  document.querySelectorAll('button').forEach((b) => {
    if (['Door L', 'Door R', 'Hood', 'Engine deck'].includes(b.textContent.trim())) {
      out[b.textContent.trim()] = b.style.background.includes('0.92') ? 'open' : 'closed';
    }
  });
  return out;
});

console.log('before click:', JSON.stringify(await readOpen()));

// Click the car's door area in-scene (right door ≈ screen 700,400 in default view).
// Confirm the toggle flips by comparing state before/after.
await page.mouse.click(700, 400);
await page.waitForTimeout(800);
console.log('after click(700,400):', JSON.stringify(await readOpen()));

await page.mouse.click(700, 400);
await page.waitForTimeout(800);
console.log('after 2nd click (should close):', JSON.stringify(await readOpen()));

await page.screenshot({ path: 'view_click_test.png', timeout: 120000 });
await browser.close();
console.log('done');
