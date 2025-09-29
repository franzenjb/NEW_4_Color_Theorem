const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Checking unified-app.html...');
  const response1 = await page.goto('https://franzenjb.github.io/NEW_4_Color_Theorem/unified-app.html');
  console.log('unified-app.html status:', response1.status());
  
  if (response1.status() === 404) {
    console.log('\nChecking index.html...');
    const response2 = await page.goto('https://franzenjb.github.io/NEW_4_Color_Theorem/index.html');
    console.log('index.html status:', response2.status());
    
    console.log('\nChecking root...');
    const response3 = await page.goto('https://franzenjb.github.io/NEW_4_Color_Theorem/');
    console.log('Root status:', response3.status());
    const title = await page.title();
    console.log('Page title:', title);
  }
  
  await browser.close();
})();