const browserObject=require('./browser');
const scraperController=require('./pageController');

//iniciar el navegador y crear la instancia
let browserInstance=browserObject.startBrowser();

scraperController(browserInstance);