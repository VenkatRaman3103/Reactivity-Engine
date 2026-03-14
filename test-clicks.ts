import { chromium } from 'playwright';

(async () => {
  console.log('Starting playwright...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
     // intercept the state wrapper to log traces for what calls ProductList
    // Or we can just hijack document.createElement to print stack traces for DIVs created by ProductList?
    // Better: hijack __h
    const _h = (window as any).__h;
    if (_h) {
      console.log("__h is accessible!");
    }
  });
  
  console.log('Clicking Products...');
  await page.click('button:has-text("Products")');
  await page.waitForTimeout(500);

  console.log('Done.');
  await browser.close();
})();
