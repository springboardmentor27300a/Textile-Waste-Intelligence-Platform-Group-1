const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set auth token so requireAuth() passes
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("twi_token", "fake-token");
    localStorage.setItem("twi_user", JSON.stringify({ email: "test@example.com", full_name: "Test User" }));
  });

  // Intercept backend API calls
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/auth/me')) {
      request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ email: "test@example.com", full_name: "Test User" }) });
    } else if (url.includes('/api/inventory')) {
      request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    } else if (url.includes('/image/upload')) {
      request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 123, file_url: '/dummy.jpg' }) });
    } else if (url.includes('/image')) {
      request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ images: [] }) });
    } else if (url.includes('/classification/material')) {
      request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ material: 'Cotton', confidence: 95 }) });
    } else if (url.includes('/classification/waste')) {
      request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ category: 'Recyclable', confidence: 90 }) });
    } else if (url.includes('/classification/recommendations')) {
      request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ recommendations: [{action: 'Shred', description: 'Shred the cotton'}] }) });
    } else {
      request.continue();
    }
  });

  // Navigate to local server
  console.log("Navigating to page...");
  await page.goto('http://localhost:8080/image-analysis.html', { waitUntil: 'networkidle0' });
  
  // Bypass file upload by manually triggering handleUpload with a fake file object
  console.log("Simulating file upload...");
  await page.evaluate(() => {
    const fakeFile = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });
    return window.handleUpload(fakeFile);
  });
  
  console.log("Waiting for preview container to show...");
  await page.waitForSelector('#preview-container:not(.hidden)');
  
  console.log("Clicking Analyze Master Button...");
  await page.click('#btn-analyze-master');
  
  console.log("Waiting for processing panel to appear...");
  await page.waitForSelector('#processing-panel:not(.hidden)');
  
  console.log("Waiting for results panel to appear...");
  await page.waitForSelector('#success-panel:not(.hidden)', { timeout: 10000 });
  
  console.log("Evaluating DOM state...");
  const isSuccessPanelVisible = await page.evaluate(() => {
    const successPanel = document.getElementById('success-panel');
    return successPanel && !successPanel.classList.contains('hidden');
  });
  console.log('Success panel is visible:', isSuccessPanelVisible);
  
  const isProcessingPanelHidden = await page.evaluate(() => {
    const pPanel = document.getElementById('processing-panel');
    return pPanel && pPanel.classList.contains('hidden');
  });
  console.log('Processing panel is hidden:', isProcessingPanelHidden);
  
  await browser.close();
  console.log("VERIFICATION COMPLETE");
})();
