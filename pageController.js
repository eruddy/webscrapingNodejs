
const pageScraper =require('./pageScraper');
async function scrapeAll(browserInstance){
    let browser;
    try {
        browser = await browserInstance;
        await pageScraper.scraper(browser);
        // await browser.close();

    } catch (error) {
        console.log("Error:",error)
    }
}
module.exports = (browserInstance)=>scrapeAll(browserInstance)