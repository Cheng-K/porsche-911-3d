import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', (m) => { const t = m.text(); if (t.includes('[probe]')) console.log(t); });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);

await page.evaluate(() => {
  const THREE = window.__car.group.constructor ? null : null;
  const { group } = window.__car;
  const box = new (Object.getPrototypeOf(group).constructor.prototype.updateMatrixWorld ? window.__THREE_BOX__ || Object : Object)();
  // plain walk: compute bbox manually from geometry attributes
  const walkBbox = (obj) => {
    let min = [1e9,1e9,1e9], max = [-1e9,-1e9,-1e9], n = 0;
    obj.updateWorldMatrix(true, true);
    obj.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry;
      const p = g.getAttribute('position');
      const m = o.matrixWorld.elements;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const wx = m[0]*x + m[4]*y + m[8]*z + m[12];
        const wy = m[1]*x + m[5]*y + m[9]*z + m[13];
        const wz = m[2]*x + m[6]*y + m[10]*z + m[14];
        if (wx<min[0])min[0]=wx; if (wy<min[1])min[1]=wy; if (wz<min[2])min[2]=wz;
        if (wx>max[0])max[0]=wx; if (wy>max[1])max[1]=wy; if (wz>max[2])max[2]=wz;
        n++;
      }
    });
    return { min: min.map(v=>v.toFixed(2)), max: max.map(v=>v.toFixed(2)), verts: n };
  };
  for (const name of ['pivot_doorLeft','pivot_doorRight','pivot_hood','pivot_engineCover']) {
    let hit = null;
    group.traverse((o) => { if (o.name === name) hit = o; });
    if (!hit) { console.log('[probe]', name, 'MISSING'); continue; }
    const b = walkBbox(hit);
    console.log('[probe]', name, 'min=', b.min.join(','), 'max=', b.max.join(','), 'verts=', b.verts);
    hit.traverse((o) => {
      if (o.isMesh) console.log('[probe]   mesh', o.name, 'mat=', o.material?.name, 'verts=', o.geometry.getAttribute('position').count);
    });
  }
});
await browser.close();
