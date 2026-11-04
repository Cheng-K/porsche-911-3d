import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);

// open both doors + hood + engine cover via the pivot groups
await page.evaluate(() => {
  const car = window.__car;
  const find = (name) => {
    let hit = null;
    car.group.traverse((o) => { if (o.name === name) hit = o; });
    return hit;
  };
  const dl = find('pivot_doorLeft');
  const dr = find('pivot_doorRight');
  const hd = find('pivot_hood');
  const ec = find('pivot_engineCover');
  if (dl) dl.rotation.y = 1.35;
  if (dr) dr.rotation.y = -1.35;
  if (hd) hd.rotation.x = -0.85;
  if (ec) ec.rotation.x = 0.95;
  console.log('pivots', { dl: !!dl, dr: !!dr, hd: !!hd, ec: !!ec });
});
await page.waitForTimeout(2000);
await page.screenshot({ path: 'view_doors.png', timeout: 120000 });
await browser.close();
console.log('done');
