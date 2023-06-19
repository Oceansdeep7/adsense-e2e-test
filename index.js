const puppeteer = require('puppeteer')

const URLS = [
    'https://www.appisfree.com',
];

const PC = {width: 1366, height: 768}
const MOBILE = {width: 414, height: 896};
const ATTRIBUTES = ['data-ad-slot', 'data-adsbygoogle-status', 'data-ad-status'];

(async () => {
    puppeteer.launch({headless: false}).then(async browser => {
        const promises = []
        for (let i = 0; i < URLS.length; i++) {
            promises.push(browser.newPage().then(async page => {
                const url = URLS[i]
                await page.setViewport(PC)
                await page.goto(`${url}#google_ia_debug`)

                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });

                await new Promise(r => setTimeout(r, 20 * 1000))

                await page.evaluate(() => {
                    window.scrollTo(0, 0);
                });

                const result = await page.evaluate((attributes) => {
                    return [...document.querySelectorAll('.ad-container > ins')].map(node => {
                        return Object.fromEntries(attributes.map(name => [name, node.getAttribute(name)]));
                    });
                }, ATTRIBUTES);

                console.log(url)
                console.table(result)


                await page.screenshot({ path: `./screenshot/${i}.png`, fullPage: true})
            }))
        }
        await Promise.all(promises)
        await browser.close()
    })
})()