import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:5174/', { waitUntil: 'load' });
  
  // Click on "Layout System" tab
  const tabs = await page.$$('.sidebar-item');
  for (const t of tabs) {
    const text = await page.evaluate(el => el.textContent, t);
    if (text.includes('Layout System')) {
      await t.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  console.log('--- Initial UI ---');
  let roleText = await page.evaluate(() => document.querySelector('strong')?.textContent);
  console.log('Role Text:', roleText);
  let adminSidebar = await page.evaluate(() => document.querySelector('.sidebar.admin'));
  console.log('Admin Sidebar exists?', !!adminSidebar);

  console.log('--- Clicking Admin Role ---');
  const buttons = await page.$$('.demo-btn');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Admin Role')) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 500));

  console.log('--- UI After Click ---');
  roleText = await page.evaluate(() => document.querySelector('strong')?.textContent);
  console.log('Role Text:', roleText);
  adminSidebar = await page.evaluate(() => document.querySelector('.sidebar.admin'));
  console.log('Admin Sidebar exists?', !!adminSidebar);

  await browser.close();
})();
