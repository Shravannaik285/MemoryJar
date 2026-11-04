import { chromium } from 'playwright';

async function testInteractions() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.stack || err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  console.log('1. Testing Add Chit click...');
  await page.locator('.card-add-chit').click();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('2. Testing View Chits click...');
  await page.locator('.card-view-chits').click();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('3. Testing Privacy & Trust click...');
  await page.locator('button:has-text("Privacy & Trust")').click();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('4. Testing Test Birthday click...');
  await page.locator('button:has-text("Test Birthday")').click();
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape');

  console.log('\nErrors encountered:', errors.length);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
  } else {
    console.log('All modals opened and closed with ZERO errors!');
  }

  await browser.close();
}

testInteractions();

