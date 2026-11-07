// Renders html/*.html to PNG (2x). Usage: node render.js
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'html', 'jobs.json')));
  const b = await chromium.launch();
  for (const j of jobs) {
    const pg = await b.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 2 });
    await pg.goto('file://' + j.html); await pg.waitForTimeout(300);
    await pg.screenshot({ path: j.png }); await pg.close(); console.log('ok', path.basename(j.png));
  }
  await b.close();
})();
