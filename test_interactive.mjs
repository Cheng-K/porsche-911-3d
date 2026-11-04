import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);

// 1) paint red via the UI swatch
await page.click('button[aria-label="Guards Red"]');
await page.waitForTimeout(500);

// 2) open the right door + hood via the panel buttons
await page.click('button:has-text("Door R")');
await page.click('button:has-text("Hood")');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'view_paint_doors.png', timeout: 120000 });

// 3) verify in-scene click: project the left door's center to screen and click it
const pt = await page.evaluate(() => {
  const { group } = window.__car;
  let pivot = null;
  group.traverse((o) => { if (o.name === 'pivot_doorLeft') pivot = o; });
  if (!pivot) return null;
  const box = { min: [1e9,1e9,1e9], max: [-1e9,-1e9,-1e9] };
  pivot.updateWorldMatrix(true, true);
  pivot.traverse((o) => {
    if (!o.isMesh) return;
    const p = o.geometry.getAttribute('position');
    const m = o.matrixWorld.elements;
    for (let i = 0; i < p.count; i += 7) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const wx = m[0]*x + m[4]*y + m[8]*z + m[12];
      const wy = m[1]*x + m[5]*y + m[9]*z + m[13];
      const wz = m[2]*x + m[6]*y + m[10]*z + m[14];
      if (wx<box.min[0])box.min[0]=wx; if (wy<box.min[1])box.min[1]=wy; if (wz<box.min[2])box.min[2]=wz;
      if (wx>box.max[0])box.max[0]=wx; if (wy>box.max[1])box.max[1]=wy; if (wz>box.max[2])box.max[2]=wz;
    }
  });
  const cx = (box.min[0]+box.max[0])/2, cy = (box.min[1]+box.max[1])/2, cz = (box.min[2]+box.max[2])/2;
  // project using the canvas camera
  const canvas = document.querySelector('canvas');
  const THREE = window.__car.group.type ? null : null;
  // manual projection: find camera via renderer props on canvas
  const r3 = canvas.__r3f ?? null;
  return { cx, cy, cz, hasR3f: !!r3 };
});
console.log('left door center:', JSON.stringify(pt));

// fall back: click near where the left door appears (screen-left of car body)
await page.mouse.click(430, 400);
await page.waitForTimeout(1200);
const state = await page.evaluate(() => {
  const el = document.querySelector('button:has-text("Door L")');
  return el ? el.style.background : 'no button';
});
console.log('Door L button background after body click:', state);
await page.screenshot({ path: 'view_click_test.png', timeout: 120000 });
await browser.close();
console.log('done');
