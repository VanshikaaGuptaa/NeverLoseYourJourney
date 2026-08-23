const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto('http://localhost');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Type in email
  await page.focus('input[name="email"]');
  await page.keyboard.type('test2@example.com');
  
  // Type in password
  await page.focus('input[name="password"]');
  await page.keyboard.type('password');
  
  // Click login
  await page.click('button:has-text("Login")');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Click Next
  console.log("CLICKING NEXT...");
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("FINAL URL:", page.url());

  await browser.close();
})();
