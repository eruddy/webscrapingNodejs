const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
async function capturaImagen() {
    try {
      const browser = await puppeteer.launch(
        {headless:false}
      );
      const page = await browser.newPage();
      const url = 'https://books.toscrape.com/';
  
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.setViewport({ width: 1200, height: 800 });
      const mainPage= await page.content();
      const $ =cheerio.load(mainPage);
      const totalPages=parseInt($('.pager .current').text().trim().split('of')[1].trim());
      console.log("TotalPages:"+totalPages)
      console.log("TypoVariable:"+typeof totalPages)
      const book=$('article.product_pod h3 a').attr('href');
      console.log("books"+book)
      const urls =$('section ol > li')
      .filter((index, element)=>$(element))
      .map((index,element)=>$(element).find('h3 > a').attr('href')).get()
      console.log(urls)
      const precio=$('.price_color').text();
      console.log('Precio'+precio);
      // await page.screenshot({ path: 'captura.png' });
  
      // console.log('Imagen capturada correctamente.');
  
      await browser.close();
    } catch (error) {
      console.error('Error al capturar la imagen:', error);
    }
  }
  
  capturaImagen();