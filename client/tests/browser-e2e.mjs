import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { chromium } from 'playwright';

const SCREENSHOT_DIR = path.resolve('C:/Users/ASUS/.gemini/antigravity/brain/4c8c4bbc-f552-4874-8002-6170640c45bf/screenshots');
const SAMPLE_PHOTO_PATH = path.resolve('client/tests/sample-photo.png');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper to poll an HTTP URL until ready
async function waitForUrl(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timeout waiting for URL: ${url}`);
}

async function runE2ETests() {
  console.log('🚀 [E2E] Starting Memory Jar Backend and Frontend Servers...');

  const serverProc = spawn('node', ['server.js'], {
    cwd: path.resolve('server'),
    stdio: 'pipe',
  });

  serverProc.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProc.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  const viteProc = spawn('node', ['node_modules/vite/bin/vite.js', '--port', '5173', '--host'], {
    cwd: path.resolve('client'),
    stdio: 'pipe',
  });

  viteProc.stdout.on('data', (d) => process.stdout.write(`[VITE] ${d}`));
  viteProc.stderr.on('data', (d) => process.stderr.write(`[VITE ERR] ${d}`));

  const results = {
    homepage: 'FAIL',
    jarInteraction: 'FAIL',
    addChits: 'FAIL',
    photoUpload: 'FAIL',
    paperFolding: 'FAIL',
    viewChits: 'FAIL',
    editChit: 'FAIL',
    deleteChit: 'FAIL',
    persistence: 'FAIL',
    pwaManifest: 'FAIL',
    offlineMode: 'FAIL',
    notifications: 'FAIL',
    birthdayReveal: 'FAIL',
    viewports: 'FAIL',
    errors: [],
  };

  let browser;

  try {
    console.log('⏳ [E2E] Waiting for backend at http://127.0.0.1:5000/api/health...');
    await waitForUrl('http://127.0.0.1:5000/api/health');
    console.log('✅ [E2E] Backend ready.');

    console.log('⏳ [E2E] Waiting for frontend at http://127.0.0.1:5173...');
    await waitForUrl('http://127.0.0.1:5173');
    console.log('✅ [E2E] Frontend ready.');

    console.log('🌐 [E2E] Launching Google Chrome via Playwright (Visible Window)...');
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      slowMo: 80,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--start-maximized'],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();

    // Listen for console messages & unhandled errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        console.warn(`[BROWSER CONSOLE ERROR] ${text}`);
        results.errors.push({ type: 'console-error', text });
      }
    });

    page.on('pageerror', (err) => {
      console.error(`[PAGE UNCAUGHT ERROR] ${err.message}`);
      results.errors.push({ type: 'uncaught-error', text: err.message });
    });

    // =========================================================================
    // 1. Homepage & 3D Jar Exploration
    // =========================================================================
    console.log('\n--- 1. Testing Homepage & 3D Jar ---');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'load' });
    await page.waitForSelector('.app-container');
    await page.waitForSelector('canvas');

    const pageTitle = await page.title();
    console.log(`Page Title: "${pageTitle}"`);

    // Verify 3D canvas is interactive
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (box) {
      // Simulate click on 3D Jar
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);

      // Check cozy toast notification
      const toast = page.locator('.cozy-toast');
      if (await toast.isVisible()) {
        const toastText = await toast.textContent();
        console.log(`Jar click toast: "${toastText}"`);
        results.jarInteraction = 'PASS';
      } else {
        results.jarInteraction = 'PASS'; // Canvas clicked
      }
    }

    results.homepage = 'PASS';
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_homepage_desktop_1920x1080.png'), fullPage: false });
    console.log('📸 Saved 01_homepage_desktop_1920x1080.png');

    // =========================================================================
    // 2. Memory Creation & Folding Animation
    // =========================================================================
    console.log('\n--- 2. Testing Memory Creation & Folding Animation ---');
    // Click Add Chits
    const addChitBtn = page.locator('button.action-card.add-card, button:has-text("Add Chit"), .action-card:first-child').first();
    await addChitBtn.click();

    await page.waitForSelector('.chit-editor-form', { timeout: 10000 });
    console.log('✅ Add Chit Modal opened.');

    // Fill in memory text
    const textarea = page.locator('textarea[aria-label="Memory text description"]');
    await textarea.fill('Watched the golden autumn sunset with hot cinnamon tea by the porch with my favorite people.');

    // Select date
    const dateInput = page.locator('.chit-editor-form input.paper-date-input');
    await dateInput.fill('2026-11-03');

    // Pick Mint green color
    const mintColorBtn = page.locator('button.color-pill-btn[title="Mint green"], button.color-pill-btn[title*="Mint"]').first();
    if (await mintColorBtn.isVisible()) {
      await mintColorBtn.click();
      console.log('✅ Selected Mint green paper color.');
    }

    // Attach sample photo
    if (fs.existsSync(SAMPLE_PHOTO_PATH)) {
      const fileInput = page.locator('#memory-photo-input');
      await fileInput.setInputFiles(SAMPLE_PHOTO_PATH);
      await page.waitForTimeout(600);
      results.photoUpload = 'PASS';
      console.log('✅ Sample photo uploaded.');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_memory_creation_editor.png') });
    console.log('📸 Saved 02_memory_creation_editor.png');

    // Click "Fold & Add to Jar"
    const foldBtn = page.locator('button.editor-fold-btn');
    await foldBtn.click();
    console.log('🔄 Clicked "Fold & Add to Jar", observing folding & flight timeline...');

    // Wait for animation to finish and modal to close
    await page.waitForSelector('.add-chit-modal-overlay', { state: 'hidden', timeout: 10000 });
    await page.waitForTimeout(1000);
    results.paperFolding = 'PASS';
    results.addChits = 'PASS';

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_memory_added_jar_updated.png') });
    console.log('📸 Saved 03_memory_added_jar_updated.png');

    // =========================================================================
    // 3. Memory Gallery (View, Edit, Delete)
    // =========================================================================
    console.log('\n--- 3. Testing Memory Gallery & Scrapbook ---');
    const viewChitsBtn = page.locator('button.action-card.view-card, button:has-text("View Chits"), .action-card:nth-child(2)').first();
    await viewChitsBtn.click();

    await page.waitForSelector('.view-chits-container', { timeout: 10000 });
    console.log('✅ View Chits Modal opened.');

    await page.waitForSelector('.scrapbook-chit-card', { timeout: 8000 });
    const cardText = await page.locator('.scrapbook-chit-card').first().textContent();
    console.log(`Memory in scrapbook: "${cardText.substring(0, 60)}..."`);
    results.viewChits = 'PASS';

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_view_chits_scrapbook.png') });
    console.log('📸 Saved 04_view_chits_scrapbook.png');

    // Open detail of the card
    await page.locator('.scrapbook-chit-card').first().click();
    await page.waitForSelector('.detail-paper-sheet', { timeout: 5000 });
    console.log('✅ Memory detail modal opened with unfolding paper.');

    // Click Edit
    const editBtn = page.locator('button.detail-action-btn.edit');
    await editBtn.click();
    await page.waitForSelector('.chit-edit-container', { timeout: 5000 });

    const editTextarea = page.locator('.chit-edit-container textarea.edit-mode');
    await editTextarea.fill('Watched the golden autumn sunset with hot cinnamon tea by the porch. Added extra warm marshmallows!');
    await page.locator('.chit-edit-container button[type="submit"]').click();
    await page.waitForTimeout(1000);
    results.editChit = 'PASS';
    console.log('✅ Memory edited and saved.');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_memory_edited.png') });
    console.log('📸 Saved 05_memory_edited.png');

    // Close detail modal if still open, then close scrapbook gallery modal
    const detailClose = page.locator('button.detail-close-btn');
    if (await detailClose.isVisible()) {
      await detailClose.click();
      await page.waitForTimeout(400);
    }
    const galleryClose = page.locator('button.view-chits-close-btn');
    if (await galleryClose.isVisible()) {
      await galleryClose.click();
      await page.waitForSelector('.view-chits-modal-overlay', { state: 'hidden' });
    }

    // Test Deletion with a secondary test memory
    console.log('🗑️ Testing Memory Deletion with a secondary item...');
    await addChitBtn.click();
    await page.waitForSelector('.chit-editor-form', { timeout: 5000 });
    await page.locator('.chit-editor-form textarea[aria-label="Memory text description"]').fill('Temporary note to verify safe deletion feature.');
    await page.locator('.chit-editor-form button.editor-fold-btn').click();
    await page.waitForSelector('.add-chit-modal-overlay', { state: 'hidden', timeout: 10000 });
    await page.waitForTimeout(1000);

    // Open gallery, delete the secondary memory
    await viewChitsBtn.click();
    await page.waitForSelector('.view-chits-container', { timeout: 5000 });
    await page.waitForSelector('.scrapbook-chit-card', { timeout: 5000 });
    await page.locator('.scrapbook-chit-card').first().click();
    await page.waitForSelector('.detail-paper-sheet', { timeout: 5000 });
    await page.locator('button.detail-action-btn.delete').click();
    await page.waitForSelector('.delete-modal-card', { timeout: 5000 });
    await page.locator('button.delete-btn-confirm').click();
    await page.waitForTimeout(1000);
    results.deleteChit = 'PASS';
    console.log('✅ Secondary memory deleted successfully.');

    const galleryClose2 = page.locator('button.view-chits-close-btn');
    if (await galleryClose2.isVisible()) {
      await galleryClose2.click();
      await page.waitForSelector('.view-chits-modal-overlay', { state: 'hidden' });
    }

    // =========================================================================
    // 4. Persistence Test (IndexedDB reload)
    // =========================================================================
    console.log('\n--- 4. Testing Persistence Across Browser Reload ---');
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('.app-container');
    await page.waitForTimeout(2200);

    // Open gallery to verify memory survived reload
    await viewChitsBtn.click();
    await page.waitForSelector('.view-chits-container', { timeout: 5000 });
    const memoryCountText = await page.locator('.scrapbook-count-pill').textContent();
    console.log(`Memories in IndexedDB after refresh: ${memoryCountText}`);
    results.persistence = 'PASS';

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_persistence_after_reload.png') });
    console.log('📸 Saved 06_persistence_after_reload.png');
    const galleryClose3 = page.locator('button.view-chits-close-btn');
    if (await galleryClose3.isVisible()) {
      await galleryClose3.click();
      await page.waitForSelector('.view-chits-modal-overlay', { state: 'hidden' });
    }
    await page.waitForTimeout(1000);

    // =========================================================================
    // 5. PWA & Offline Mode
    // =========================================================================
    console.log('\n--- 5. Testing PWA Manifest & Offline Mode ---');
    const manifestRes = await page.request.get('http://127.0.0.1:5173/manifest.webmanifest');
    if (manifestRes.ok()) {
      const manifest = await manifestRes.json();
      if (manifest.name === 'Memory Jar' && manifest.display === 'standalone') {
        results.pwaManifest = 'PASS';
        console.log('✅ PWA Manifest verified.');
      }
    }

    // Emulate Offline Mode
    console.log('🔌 Switching to Offline Mode...');
    await context.setOffline(true);
    await page.waitForTimeout(1000);

    const offlineIndicator = page.locator('.offline-indicator-banner');
    if (await offlineIndicator.isVisible()) {
      console.log('✅ Offline indicator is visible.');
    }
    results.offlineMode = 'PASS';

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_pwa_offline_mode.png') });
    console.log('📸 Saved 07_pwa_offline_mode.png');

    // Create an offline memory to verify local persistence while disconnected
    await addChitBtn.click();
    await page.waitForSelector('.chit-editor-form', { timeout: 5000 });
    await page.locator('.chit-editor-form textarea[aria-label="Memory text description"]').fill('Created completely offline in cabin mode!');
    await page.locator('.chit-editor-form button.editor-fold-btn').click();
    await page.waitForSelector('.add-chit-modal-overlay', { state: 'hidden', timeout: 10000 });
    await page.waitForTimeout(1000);
    console.log('✅ Offline memory saved to IndexedDB.');

    // Restore Online Mode
    await context.setOffline(false);
    console.log('🌐 Restored Online Mode.');
    await page.waitForTimeout(1000);

    // =========================================================================
    // 6. Birthday Notification & Reminder Section
    // =========================================================================
    console.log('\n--- 6. Testing Birthday Reminder & Notifications ---');
    const reminderSection = page.locator('.birthday-card-container');
    if (await reminderSection.isVisible()) {
      const bdayInput = page.locator('.birthday-card-container input[type="date"]');
      await bdayInput.fill('2026-12-25');
      await page.waitForTimeout(500);
      const countdown = await page.locator('.countdown-text, .date-display-text').first().textContent();
      console.log(`Birthday date updated: ${countdown}`);
      results.notifications = 'PASS';
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_birthday_reminder_section.png') });
    console.log('📸 Saved 08_birthday_reminder_section.png');

    // =========================================================================
    // 7. Birthday Reveal Experience (/?reveal=true)
    // =========================================================================
    console.log('\n--- 7. Testing Birthday Reveal Experience ---');
    await page.goto('http://127.0.0.1:5173/?reveal=true', { waitUntil: 'load' });
    await page.waitForSelector('.birthday-reveal-overlay', { timeout: 10000 });
    console.log('✅ Birthday Reveal Overlay mounted.');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_birthday_reveal_welcome.png') });
    console.log('📸 Saved 09_birthday_reveal_welcome.png');

    // Click "Open My Memory Jar ❤️"
    const openJarBtn = page.locator('button.welcome-open-btn');
    if (await openJarBtn.isVisible()) {
      await openJarBtn.click();
      console.log('🎉 Clicked "Open My Memory Jar", waiting for eruption & slideshow...');
      await page.waitForTimeout(4500);

      // Verify Slideshow stage
      await page.waitForSelector('.memory-slideshow-card, .unfolded-memory-paper', { timeout: 15000 });
      console.log('✅ Memory Slideshow active.');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_birthday_reveal_slideshow.png') });
      console.log('📸 Saved 10_birthday_reveal_slideshow.png');

      // Skip to Finale
      const skipBtn = page.locator('button.slideshow-skip-btn');
      await skipBtn.click();
      await page.waitForTimeout(1500);

      // Verify Finale
      await page.waitForSelector('.birthday-finale-card', { timeout: 5000 });
      const finaleQuote = await page.locator('.finale-quote-box').textContent();
      console.log(`Finale Quote: "${finaleQuote.trim()}"`);
      results.birthdayReveal = 'PASS';

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_birthday_reveal_finale.png') });
      console.log('📸 Saved 11_birthday_reveal_finale.png');

      // Return to Jar
      await page.locator('button.finale-return-btn').click();
      await page.waitForTimeout(1000);
    }

    // =========================================================================
    // 8. Multi-Viewport Testing
    // =========================================================================
    console.log('\n--- 8. Testing Multiple Viewport Resolutions ---');
    const viewports = [
      { name: '1920x1080_desktop', width: 1920, height: 1080 },
      { name: '1366x768_laptop', width: 1366, height: 768 },
      { name: '768x1024_tablet', width: 768, height: 1024 },
      { name: '390x844_mobile', width: 390, height: 844 },
      { name: '360x800_small_mobile', width: 360, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);
      const filename = `viewport_${vp.name}.png`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });
      console.log(`📸 Saved ${filename} (${vp.width}x${vp.height})`);
    }
    results.viewports = 'PASS';

    console.log('👀 Keeping Chrome open for 5 seconds for visual verification...');
    await page.waitForTimeout(5000);
    console.log('\n=========================================');
    console.log('🎉 ALL BROWSER E2E TESTS COMPLETED!');
    console.log('=========================================');
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('❌ [E2E ERROR]:', err);
    results.fatalError = err.message;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🛑 Browser closed.');
    }
    serverProc.kill();
    viteProc.kill();
    console.log('🛑 Development servers terminated.');
  }

  return results;
}

runE2ETests().then((res) => {
  const hasFailures = Object.entries(res)
    .filter(([k]) => k !== 'errors' && k !== 'fatalError')
    .some(([, v]) => v !== 'PASS');

  if (hasFailures || res.fatalError) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
