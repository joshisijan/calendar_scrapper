const prompt = require("prompt-sync")();
const puppetter = require("puppeteer");
const $ = require("cheerio");

const baseUrl = 'https://www.hamropatro.com/calendar/';

(async () => {
  // statting to load page to get the total years
  try {
    console.log("Loading browser...");
    const browser = await puppetter.launch();

    // asking to enter desired year
    let year = prompt("Enter year: ");

    //base url for year
    console.log("Loading new page...");
    const page = await browser.newPage();

    // getting data
    let urlForYear = `${baseUrl}${year}/1`;

    console.log("Generating data...");
    await page.goto(urlForYear);

    console.log("Getting page content...");
    const html = await page.content();

    console.log('Grabbing data from content...');
    let jsonData = {
      data: []
    };
    let content = $('.calendar .dates li', html);
    content.each((i, el) => {
      let index;
      // calculating week index
      if(i > 0 && i < 8){
        index = i;
      }else if(i > 7 && i < 15){
        index = i - 7;
      }else if(i > 14 && i < 22){
        index = i - 14;
      }else if(i > 21 && i < 29){
        index = i - 21;
      }else  if(i > 28 && i < 36){
        index = i - 28;
      }else{
        index = i - 35;
      }

      if(!$(el).hasClass('disable')){
        jsonData.data.add({
          id: i,
          nepali: $('.nep', el).text(),
          english: $('.eng', el).first.text(),
          tithi: $('.tithi', el).first.text(),
          englishData: $(el).attr('id'),
        });
      }

    });

    console.log('Closing browser...');
    await browser.close();
  } catch (e) {
    console.log(e.toString());
  }
})();
