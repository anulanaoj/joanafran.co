const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/index.html');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
        // click on project 10
        const proj10 = document.querySelector('#project-10 img');
        if(proj10) proj10.click();
    });
    await page.waitForTimeout(500);
    const box = await page.evaluate(() => {
        const o = document.querySelector('.lightbox-overlay');
        const c = document.querySelector('.lightbox-content');
        const m = document.querySelector('.lightbox-media');
        return JSON.stringify({
           o: o?.getBoundingClientRect(),
           c: c?.getBoundingClientRect(),
           m: m?.getBoundingClientRect(),
           window: {w: window.innerWidth, h: window.innerHeight},
        }, null, 2);
    });
    console.log("Proj 10:", box);
    await browser.close();
})();
