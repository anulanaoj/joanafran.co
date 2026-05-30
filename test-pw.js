const { chromium } = require('@playwright/test');
(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/index.html');
    await page.waitForTimeout(500);
    const item = await page..media-wrapper img, .project-media img;
    if(item) {
        await item.click();
    } else {
        const anyImg = await page.img;
        if(anyImg) await anyImg.click();
    }
    await page.waitForTimeout(500);
    const box = await page.evaluate(() => {
        const o = document.querySelector('.lightbox-overlay');
        const c = document.querySelector('.lightbox-content');
        const m = document.querySelector('.lightbox-media');
        return JSON.stringify({
           html: document.documentElement.getBoundingClientRect(),
           body: document.body.getBoundingClientRect(),
           overlay: o ? o.getBoundingClientRect() : null,
           content: c ? c.getBoundingClientRect() : null,
           media: m ? m.getBoundingClientRect() : null
        }, null, 2);
    });
    console.log(box);
    await browser.close();
})();
