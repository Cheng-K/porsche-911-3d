import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', (m) => { const t = m.text(); if (t.includes('[stats]')) console.log(t); });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);
await page.evaluate(() => {
  const { group } = window.__car;
  let meshes = 0, tris = 0;
  group.traverse((o) => {
    if (!o.isMesh) return;
    meshes++;
    const idx = o.geometry.getIndex();
    tris += (idx ? idx.count : o.geometry.getAttribute('position').count) / 3;
  });
  console.log('[stats] meshes(draw calls)=' + meshes + ' triangles=' + Math.round(tris));
});
await browser.close();
