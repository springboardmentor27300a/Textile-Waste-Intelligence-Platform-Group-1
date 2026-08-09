const fs = require('fs');
const html = fs.readFileSync('image-analysis.html', 'utf8');
const start = html.indexOf('<section class="step-panel" id="step-results">');
const end = html.indexOf('</section>', start);
const section = html.substring(start, end);

const openDivs = (section.match(/<div\b[^>]*>/g) || []).length;
const closeDivs = (section.match(/<\/div>/g) || []).length;

console.log('Open:', openDivs, 'Close:', closeDivs, 'Balanced:', openDivs === closeDivs);
console.log('Found success-panel:', section.includes('id="success-panel"'));
