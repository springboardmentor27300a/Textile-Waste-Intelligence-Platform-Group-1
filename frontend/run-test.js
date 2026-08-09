const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // create a dummy image to upload
  fs.writeFileSync('dummy.jpg', 'fake image data');

  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));

  console.log("Navigating to http://localhost:8080");
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

  console.log("Logging in via UI...");
  await page.type('#email', 'test@example.com');
  await page.type('#password', 'password');
  await page.click('button[type="submit"]');
  
  console.log("Waiting for dashboard to load...");
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  console.log("Navigating to Image Analysis...");
  await page.goto('http://localhost:8080/image-analysis.html', { waitUntil: 'networkidle0' });
  
  console.log("Uploading file...");
  const fileInput = await page.$('#file-input');
  await fileInput.uploadFile('dummy.jpg');
  
  // Wait for the preview container to be visible (which means upload succeeded)
  await page.waitForSelector('#preview-container:not(.hidden)', { timeout: 10000 });
  
  console.log("Clicking Analyze Image...");
  await page.click('#btn-analyze-master');
  
  console.log("Waiting for processing to finish...");
  // Wait until either success-panel is visible or processing-panel shows an error
  await page.waitForFunction(() => {
    const success = document.getElementById('success-panel');
    const pPanel = document.getElementById('processing-panel');
    const isSuccessVisible = success && !success.classList.contains('hidden');
    const hasError = pPanel && pPanel.innerHTML.includes('Analysis Failed');
    return isSuccessVisible || hasError;
  }, { timeout: 30000 });

  console.log("Analysis finished. Checking DOM state...");
  
  const results = await page.evaluate(() => {
    return {
      successPanelVisible: !document.getElementById('success-panel').classList.contains('hidden'),
      pPanelVisible: !document.getElementById('processing-panel').classList.contains('hidden'),
      pPanelHtml: document.getElementById('processing-panel').innerHTML,
      successHtml: document.getElementById('success-panel').innerHTML,
      printAreaHtml: document.getElementById('print-area').innerHTML
    };
  });
  
  if (results.successPanelVisible) {
    console.log("SUCCESS: Final report is visible!");
    console.log("Print Area HTML:", results.printAreaHtml);
  } else {
    console.log("FAILURE: Final report is NOT visible.");
    console.log("Processing panel HTML:", results.pPanelHtml);
  }

  await browser.close();
})();
