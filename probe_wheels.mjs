import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/home/ckei26/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(18000);

const read = () => page.evaluate(() => {
  const { registry } = window.__car;
  const out = {};
  for (const [id, w] of Object.entries(registry.wheels)) {
    out[id] = {
      steerY: +w.steerGroup.rotation.y.toFixed(3),
      spinW: +w.spinGroup.quaternion.w.toFixed(3),
      spinZ: +w.spinGroup.quaternion.z.toFixed(3),
    };
  }
  return out;
});

console.log('initial:', JSON.stringify(await read()));
await page.evaluate(() => {
  const input = document.querySelector('input[type="range"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, '-1');
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.click('button:has-text("Roll wheels")');
await page.waitForTimeout(1500);
console.log('after steer+roll:', JSON.stringify(await read()));
const btn = await page.evaluate(() => {
  let bg = '';
  document.querySelectorAll('button').forEach((b) => { if (b.textContent.trim() === 'Roll wheels') bg = b.style.background; });
  return bg;
});
console.log('roll button bg:', btn);
await browser.close();
