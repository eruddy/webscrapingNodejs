const {Pool}=require("pg");
const mysql=require("mysql2");
const randomUserAgent=require('random-useragent');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

//POOL DE CONEXION PARA POSTGRES
const pool=new Pool({
    user:"postgres",
    host:"127.0.0.1",
    database:'scraping_books',
    password:'postgres',
    port:5432
});

//POOL DE CONEXIONES MYSQL
const poolMysql =mysql.createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"scraping_books",
    port:3306
})

const scraperObject={
    url:'https://books.toscrape.com/',
    async scraper(browser){
        const url=this.url
        let page= await browser.newPage();
        // const userAgent='Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36';
        // const userAgentList = [
        //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
        //     'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
        //     'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)',
        //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 Edg/87.0.664.75',
        //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363',
        // ]
        // const randomUserAgent=userAgentList[Math.floor(Math.random()*userAgentList.length)];
        const userAgent=randomUserAgent.getRandom(function(ua){
            return ua.browserName ==='Firefox';
        })
        await page.setUserAgent(userAgent);
        console.log(randomUserAgent);
        console.log(`Navegando a ${url}`)

        // console.log('Navegando a'+this.url)
        await page.goto(url);
        let scrapedData=[]
        async function scrapeCurrentPage(){
            await page.waitForSelector('.page_inner');
            const mainPage= await page.content();
          const $ =cheerio.load(mainPage);
            const urls =$('section ol > li')
          .filter((index, element)=>$(element))
          .map((index,element)=>$(element).find('h3 > a').attr('href')).get()
        //   console.log(urls)
          const scrapeData = await scrapeDataFromUrls(browser,urls,url);
        //   console.log(scrapeData);
    
          const nextButton=$('.next > a');
          if(nextButton.length > 0){
            await page.click(".next > a");
            return scrapeCurrentPage();
          }
          return scrapedData;
        }
        let data = await scrapeCurrentPage();
       //guardar como json
      saveDataJSON(data, 'booksData.json');
    }

}

async function scrapeDataFromUrls(browser,urls,urlBase){
    const scrapeData=[]
    for(const link of urls){
        const dataObj={}
        const newPage=await browser.newPage();
        const userAgentList = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
            'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 Edg/87.0.664.75',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363',
        ]
        // const randomUserAgent=userAgentList[Math.floor(Math.random()*userAgentList.length)];

        const userAgent=randomUserAgent.getRandom(function(ua){
            return ua.browserName ==='Firefox';
        })
        await newPage.setUserAgent(userAgent);
        console.log(userAgent);
        // console.log(link);
        // console.log("URL_BASE"+urlBase)
        // console.log("LINK:"+link)
        if(link.includes("catalogue/")){
            book_url=urlBase+link;
        }
        else{
            book_url=urlBase+"catalogue/"+link;
        }
        await newPage.goto(book_url);
        const html=await newPage.content();
        const $=cheerio.load(html);

        
        dataObj['tituloLibro']=$('.product_main > h1').text();
        // Obtener el precio del libro
        const priceElement=$(".product_main .price_color");
        if(priceElement && priceElement.length>0){
            dataObj['precioLibro']=priceElement.first().text().trim();
        }else{
            dataObj['precioLibro']="";
        }

        const availabilityElement= $('.instock.availability');
        if(availabilityElement && availabilityElement.length > 0){
             dataObj['disponibles']=availabilityElement.text().replace(/(\r\n\t|\n|\r|\t)/gm, "").match(/\((.*?)\)/)[1]
        }else{
            dataObj['disponibles']="No disponibles"
        }
        
        // dataObj['disponibles'] = $('.instock.availability').text().replace(/(\r\n\t|\n|\r|\t)/gm, "").match(/\((.*?)\)/)[1];
        // Obtener la URL de la imagen del libro
        const imageUrl=$('#product_gallery img').attr('src');
        if(imageUrl){
            dataObj['imagenUrl']=imageUrl.trim();
        }else{
            dataObj['imagenUrl']="";
        }
        // dataObj['imagenUrl'] = $('#product_gallery img').attr('src');

        // Obtener la descripción del libro
        const descriptionElement=$('#product_description');
        if(descriptionElement && descriptionElement.next().length > 0){
            dataObj['descripcionLibro']=descriptionElement.next().text().trim();
        }else{
            dataObj['descripcionLibro']="Descripcion no Disponible";
        }
        // dataObj['descripcionLibro'] = $('#product_description').next().text();

        // Obtener el UPC del libro
        // const upcElement=$('.table.table-striped > tbody > tr > td');
        // if(upcElement && upcElement.length > 0){
        //     dataObj['upc']=upcElement.text().trim();
        // }
        // else{
        //     dataObj['upc'] ="UPC no disponible";
        // }
        dataObj['upc'] = $('.table.table-striped > tbody > tr > td').text();
        scrapeData.push(dataObj);
        //llamamos a funcion guardar en base de datos
        // saveBookDatase(dataObj)
        saveBookDataseMysql(dataObj)

        await newPage.close();
    }
    return scrapeData;
}


//funcion para guardar os datos en un archivo JSON
function saveDataJSON(data,name){
    const jsonData=JSON.stringify(data,null,2);
    fs.writeFile(name,jsonData,'utf-8',(err)=>{
        if(err){
            console.error('Error al guardar los datos en el archivo JSON',error);
        }
        else{
            console.log('Datos guardados en el archivo JSON',name);
        }
    })
}
module.exports= scraperObject


//FUNCION PARA GUARDAR EN POSTGRES
async function saveBookDatase(data){
    try {
        const query =`INSERT INTO libros (tituloLibro, precioLibro, disponibles, imagenUrl, descripcionLibro, upc)
        VALUES ($1,$2,$3,$4,$5,$6)`;
        const values =[
            data.tituloLibro,
            data.precioLibro,
            data.disponibles,
            data.imagenUrl,
            data.descripcionLibro,
            data.upc
        ];
        //ejecutar la consulta 
        await pool.query(query,values);
        console.log("Libro guardado en la base de datos.")
    } catch (error) {
        console.error("Error al guardar el libro en la base de datos",error);
    }
}
//FUNCION PARA GUARDAR EN MYSQL
async function saveBookDataseMysql(data){
    try {
        const query =`INSERT INTO libros (tituloLibro, precioLibro, disponibles, imagenUrl, descripcionLibro, upc)
        VALUES (?,?,?,?,?,?)`;
        const values =[
            data.tituloLibro,
            data.precioLibro,
            data.disponibles,
            data.imagenUrl,
            data.descripcionLibro,
            data.upc
        ];

        //ejecutamos el query
        await poolMysql.promise().query(query,values);
        console.log("Libro guardado en la base de datos.")
    } catch (error) {
        console.error("Error al guardar el libro en la base de datos",error);
    }
}
