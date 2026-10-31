// Captures portfolio screenshots of the web version at phone size.
// 1) npm install --save-dev playwright && npx playwright install --with-deps chromium
// 2) In another terminal: npx expo start --web   (wait until it is running on port 8081)
// 3) node scripts/screenshots.js
const { chromium } = require('playwright');
const URL = process.env.APP_URL || 'http://localhost:8081';
const OUT = 'docs/screenshots';

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const shot = async name => { await page.waitForTimeout(600); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log('saved', name); };
  const pin = async () => { for (const d of ['1', '2', '3', '4']) await page.getByRole('button', { name: d, exact: true }).click(); };
  const tab = async name => { await page.getByText(name, { exact: true }).last().click(); };

  await page.goto(URL);
  await page.getByLabel('Username').waitFor();
  await shot('login');
  await page.getByLabel('Username').fill('demo');
  await page.getByLabel('Password').fill('Khaya@2026');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await pin(); await page.waitForTimeout(500); await pin();
  await page.getByText('Accounts', { exact: true }).waitFor();
  await shot('home');

  const steps = [
    ['account', async () => { await page.getByRole('button', { name: /Cheque account/ }).first().click(); }],
    ['pay', async () => { await page.goBack(); await tab('Pay'); }],
    ['cards', async () => { await tab('Cards'); }],
    ['more', async () => { await tab('More'); }],
    ['insights', async () => { await page.getByText('Spending insights', { exact: true }).click(); }],
  ];
  for (const [name, go] of steps) {
    try { await go(); await shot(name); } catch (e) { console.log('skipped', name, '-', e.message.split('\n')[0]); }
  }
  await browser.close();
})();
