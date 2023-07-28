const puppeteer = require('puppeteer');
async function startBrowser(){
    let browser;
    try {
        browser=await puppeteer.launch({
            headless:false
        });
        console.log("Abriendo el Navegador .. ");
        // await browser.close();
    } catch (error) {
        console.log('No se pudo crear la instancia del Navegador =>:',error)
    }
    return browser;
}

module.exports={
    startBrowser:startBrowser
}