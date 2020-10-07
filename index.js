var fs = require("fs");
const prompt = require("prompt-sync")();
const puppetter = require("puppeteer");
const $ = require("cheerio");
const { resolve } = require("path");

const baseUrlNepali = "https://www.hamropatro.com/calendar/";
const baseUrlEnglish = "https://english.hamropatro.com/calendar/";
let baseUrl = "";

grabByYear = () =>
  (async () => {
    // statting to load page to get the total years
    try {
      coreJsonData = {
        year: "",
        coreData: [],
      };
      console.log("Loading browser...");
      const browser = await puppetter.launch();

      // asking to enter desired year
      let year = prompt("Enter year: ");
      coreJsonData.year = year;
      //base url for year
      console.log("Loading new page...");
      const page = await browser.newPage();

      for (let k = 0; k <= 1; k++) {
        let language = "";
        if (k == 0) {
          language = "english";
          console.log("Grabbing English...");
        } else {
          language = "nepali";
          console.log("Grabbing Nepali...");
        }

        let jsonData = {
          language: language,
          data: [],
        };

        for (let j = 1; j <= 12; j++) {
          tempMonthData = {
            month: j,
            monthName: "",
            monthData: [],
          };

          if (k == 0) baseUrl = baseUrlEnglish;
          else baseUrl = baseUrlNepali;

          // getting data
          let urlForYear = `${baseUrl}${year}/${j}`;

          console.log(
            `Generating data for year ${year} month ${j} (${language}) ...`
          );
          await page.goto(urlForYear);

          console.log(
            `Processing page for year ${year} month ${j} (${language}) ...`
          );
          const html = await page.content();

          // get month name
          console.log("Grabbing month name...");
          let monthContent = $("select#selectMonth option", html);
          monthContent.each((i, el) => {
            if (i == j - 1) {
              tempMonthData.monthName = $(el).text().trim();
            }
          });

          console.log(
            `Grabbing data from content for year ${year} month ${j} (${language}) ...`
          );
          let content = $(".calendar .dates li", html);
          content.each((i, el) => {
            let index;
            // calculating week index
            if (i >= 0 && i < 7) {
              index = i;
            } else if (i > 6 && i < 14) {
              index = i - 7;
            } else if (i >= 13 && i < 21) {
              index = i - 14;
            } else if (i >= 20 && i < 28) {
              index = i - 21;
            } else if (i >= 27 && i < 35) {
              index = i - 28;
            } else {
              index = i - 35;
            }
            // function to calculate week
            weekCalculator = (n) => {
              if (n == 0) return "sunday";
              else if (n == 1) return "monday";
              else if (n == 2) return "tuesday";
              else if (n == 3) return "wednesday";
              else if (n == 4) return "thursday";
              else if (n == 5) return "friday";
              else return "saturday";
            };

            if (!$(el).hasClass("disable")) {
              let holiday = false;
              if ($(el).hasClass("holiday")) holiday = true;
              let dayEvent = $(
                ".daydetailsPopOverWrapper .daydetailsPopOver .eventPopupWrapper a",
                el
              )
                .text()
                .trim();
              tempMonthData.monthData.push({
                index: i,
                nepali: $(".nep", el).text().trim(),
                english: $(".eng", el).text().trim(),
                tithi: $(".tithi", el).text().trimEnd(),
                day: weekCalculator(index),
                englishData: $(el).attr("id").trim(),
                event: dayEvent,
                holiday: holiday,
              });
            }
          });
          jsonData.data.push(tempMonthData);
          console.log(`Year ${year} Month ${j} data extraction complete`);
        }
        console.log(`Year ${year}  (${language}) complete`);
        coreJsonData.coreData.push(jsonData);
      }
      coreJsonData = JSON.stringify(coreJsonData);
      console.log("Writting to JSON file...");
      fs.writeFile(
        `./docs/data/years/${year}.json`,
        coreJsonData,
        "utf8",
        () => {}
      );
      console.log("Finishing up...");
      console.log("Closing browser...");
      await browser.close();
      console.log("Completing..");
      console.log(`Successfully grabbed for year ${year}`);
      let answer = prompt("Do you want to grab another year? (y/n): ");
      if (answer == "Y" || answer == "y") grabByYear();
    } catch (e) {
      console.log(e.toString());
    }
  })();

grabAll = () =>
  (async () => {
    // statting to load page to get the total years
    try {
      console.log("Loading browser...");
      const browser = await puppetter.launch();
      //base url for year
      console.log("Loading new page...");
      const page = await browser.newPage();
      let minYear = prompt("Enter first year: ");
      let maxYear = prompt("Enter last Year: ");
      for (let year = minYear; year <= maxYear; year++) {
        coreJsonData = {
          year: year,
          coreData: [],
        };

        for (let k = 0; k <= 1; k++) {
          let language = "";
          if (k == 0) {
            language = "english";
            console.log("Grabbing English...");
          } else {
            language = "nepali";
            console.log("Grabbing Nepali...");
          }

          let jsonData = {
            language: language,
            data: [],
          };

          for (let j = 1; j <= 12; j++) {
            tempMonthData = {
              month: j,
              monthName: "",
              monthData: [],
            };

            if (k == 0) baseUrl = baseUrlEnglish;
            else baseUrl = baseUrlNepali;

            // getting data
            let urlForYear = `${baseUrl}${year}/${j}`;

            console.log(`Grabbing for year ${year} month ${j} (${language})`);

            console.log(
              `Generating data for year ${year} month ${j} (${language}) ...`
            );
            await page.goto(urlForYear);

            console.log(
              `Processing page for year ${year} month ${j} (${language}) ...`
            );
            const html = await page.content();

            // get month name
            console.log("Grabbing month name...");
            let monthContent = $("select#selectMonth option", html);
            monthContent.each((i, el) => {
              if (i == j - 1) {
                tempMonthData.monthName = $(el).text().trim();
              }
            });

            console.log(
              `Grabbing data from content for year ${year} month ${j} (${language}) ...`
            );
            let content = $(".calendar .dates li", html);
            content.each((i, el) => {
              let index;
              // calculating week index
              if (i >= 0 && i < 7) {
                index = i;
              } else if (i > 6 && i < 14) {
                index = i - 7;
              } else if (i >= 13 && i < 21) {
                index = i - 14;
              } else if (i >= 20 && i < 28) {
                index = i - 21;
              } else if (i >= 27 && i < 35) {
                index = i - 28;
              } else {
                index = i - 35;
              }
              // function to calculate week
              weekCalculator = (n) => {
                if (n == 0) return "sunday";
                else if (n == 1) return "monday";
                else if (n == 2) return "tuesday";
                else if (n == 3) return "wednesday";
                else if (n == 4) return "thursday";
                else if (n == 5) return "friday";
                else return "saturday";
              };

              if (!$(el).hasClass("disable")) {
                let holiday = false;
                if ($(el).hasClass("holiday")) holiday = true;
                let dayEvent = $(
                  ".daydetailsPopOverWrapper .daydetailsPopOver .eventPopupWrapper a",
                  el
                )
                  .text()
                  .trim();
                tempMonthData.monthData.push({
                  index: i,
                  nepali: $(".nep", el).text().trim(),
                  english: $(".eng", el).text().trim(),
                  tithi: $(".tithi", el).text().trimEnd(),
                  day: weekCalculator(index),
                  englishData: $(el).attr("id").trim(),
                  event: dayEvent,
                  holiday: holiday,
                });
              }
            });
            jsonData.data.push(tempMonthData);
            console.log(`Year ${year} Month ${j} data extraction complete`);
          }
          console.log(`Year ${year}  (${language}) complete`);
          coreJsonData.coreData.push(jsonData);
        }
        coreJsonData = JSON.stringify(coreJsonData);
        console.log(`Writting year ${year} to JSON file...`);
        fs.writeFile(
          `./docs/data/years/${year}.json`,
          coreJsonData,
          "utf8",
          () => {}
        );
        console.log(`Finishing up for year ${year} ...`);
        console.log(`Successfully grabbed for year ${year}`);
      }
      console.log("Closing browser...");
      console.log("Completed grabbing all years");
      await browser.close();
    } catch (e) {
      console.log(e.toString());
    }
  })();

mergeYears = () => {
  console.log("Reading directory...");
  fs.readdir("./docs/data/years", {}, (err, files) => {
    let index = 1;
    let totalFiles = files.length;
    let allYears = [];
    console.log("Merging files...");
    console.log(`Total files: ${totalFiles}`);
    files.forEach((file) => {
      console.log(`Merging ${index} / ${totalFiles}`);
      let content = fs.readFileSync(
        `./docs/data/years/${file.toString()}`,
        "utf8"
      );
      content = JSON.parse(content);
      allYears.push(content);
      index++;
    });
    console.log("Merging complete");
    console.log("Saving Merged file...");
    fs.writeFile(
      "./docs/data/data.json",
      JSON.stringify(allYears),
      "utf8",
      () => {}
    );
    console.log("Merging and saving complete");
  });
};

console.log("Hello!");
console.log("Options:");
console.log("1. Grab all");
console.log("2. Grab specific year");
console.log("3. Merge all years");
console.log("4. Exit");
answer = prompt("Select from option above: ");
if (answer == 1) {
  grabAll();
} else if (answer == 2) {
  grabByYear();
} else if (answer == 3) {
  mergeYears();
}
