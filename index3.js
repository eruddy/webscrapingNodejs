
const cheerio = require('cheerio');
const  axios = require('axios');
const url='https://books.toscrape.com/'
const urlPropiedades='https://propiedades.com/df/residencial-venta'
const urlProxy =  `https://proxy.scrapeops.io/v1/?api_key=8bca33d9-d950-4a35-8c22-fa8df6491a21&url=${url}`

axios.get(urlProxy)
  .then(function (response) {
//     const html=response.data;
//     const $=cheerio.load(html);
//     const totalPages=parseInt($('.pager .current').text().trim().split('of')[1].trim());
//     console.log("TotalPages:"+totalPages)
//     console.log("TypoVariable:"+typeof totalPages)
//     const book=$('article.product_pod h3 a').attr('href');
//     console.log("books"+book)
//     const urls =$('section ol > li')
//     .filter((index, element)=>$(element))
//     .map((index,element)=>$(element).find('h3 > a').attr('href')).get()
//     console.log(urls)
//     const precio=$('.price_color').text();
//     console.log('Precio'+precio);

console.log(response.data)
  })

  .catch(function (error) {
    // handle error
    console.log(error);
  });
      