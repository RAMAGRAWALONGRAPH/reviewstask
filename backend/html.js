const express = require("express");
const cors = require("cors");
require("./db");
const User = require("./models/user");
const app = express();
const puppeteer = require("puppeteer");
const fs = require("fs");
const PORT = 5000;
app.use(express.json());
app.use(cors());

app.post("/screenshot", async (req, res) => {
  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();

    await page.goto(
      `https://www.google.com/maps/place/${encodeURIComponent(location)}`
    );
    await page.type("#searchboxinput", location);
    await page.keyboard.press("Enter");
    page.setDefaultNavigationTimeout(60000);

    await page.waitForNavigation({ waitUntil: "networkidle2" });

  const reviews = [];

    try {

      await page.waitForSelector(
        // "div.m6QErb.Hk4XGb.QoaCgb.KoSBEe.tLjsW button.M77dve",
        'button.hh2c6[data-tab-index="1"]',
        { timeout: 5000 }
      );
      await page.click('button.hh2c6[data-tab-index="1"]');
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for the new reviews to load

        const count = await page.evaluate(() => {
          const elementsWithClass = document.querySelectorAll(
            ".m6QErb.DxyBCb.kA9KIf.dS8AEf"
          );
          console.log(
            `The number of elements with class is: ${elementsWithClass}`
          );
          return elementsWithClass.length;
        });
        console.log(`The number of elements with className is: ${count}`);

  const scrapeInfiniteScrollItems = async (page, itemTargetCount) => {
    let items = [];

    while (itemTargetCount > items.length) {
      items = await page.evaluate(() => {
        const itemElements = document.querySelectorAll(".jftiEf");
        const itemTexts = [];
        itemElements.forEach((item) => itemTexts.push(item.innerText));
        return itemTexts;
      });

      const scrollableElement = await page.$(".m6QErb.DxyBCb.kA9KIf.dS8AEf");
      const previousHeight = await page.evaluate((element) => {
        return element ? element.scrollHeight : 0;
      }, scrollableElement);

      await page.evaluate((element) => {
        element.scrollBy(0, element.scrollHeight);
      }, scrollableElement);

      await page.waitForFunction(
        (newHeight) => {
          const element = document.querySelector(
            ".m6QErb.DxyBCb.kA9KIf.dS8AEf"
          );
          return element.scrollHeight > newHeight;
        },
        {},
        previousHeight
      );

      await page.waitForTimeout(1000);
    }
     return items;
  };

       const items = await scrapeInfiniteScrollItems(page, 10);
       fs.writeFileSync("items.json", JSON.stringify(items))

    } catch (error) {
      console.log("error", error);
    }

    // console.log(`Fetched ${items.length} reviews in total.`);
    await browser.close();
  } catch (error) {
    console.error("Error while fetching reviews:", error);
    res.status(500).send("Error while fetching reviews.");
  }
});

app.listen(PORT, () => {
  console.log("app is listening on port 5000");
});

// giving time error bt scroll
// const express = require("express");
// const cors = require("cors");
// require("./db");
// const User = require("./models/user");
// const app = express();
// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const PORT = 5000;
// app.use(express.json());
// app.use(cors());

// app.post("/screenshot", async (req, res) => {
//   const { location } = req.body;

//   if (!location) {
//     return res.status(400).json({ error: "Location is required" });
//   }

//   let items = []; // Declare items here

//   try {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//       page.setDefaultNavigationTimeout(120000);
//     await page.goto(
//       `https://www.google.com/maps/place/${encodeURIComponent(location)}`
//     );
//     await page.type("#searchboxinput", location);
//     await page.keyboard.press("Enter");
    

//     await page.waitForNavigation({ waitUntil: "networkidle2" });

//     try {
//       await page.waitForSelector('button.hh2c6[data-tab-index="1"]', {
//         timeout: 3000,
//       });
//       await page.click('button.hh2c6[data-tab-index="1"]');
//       await new Promise((resolve) => setTimeout(resolve, 3000));

//       const scrapeInfiniteScrollItems = async (page) => {
//         while (true) {
//           const itemElements = await page.$$(".jftiEf");
//           const itemTexts = [];
//           itemElements.forEach((item) => itemTexts.push(item.innerText));
//            if (itemTexts.length === 0) {
//             break; // No more reviews to fetch
//          }
//           items.push(...itemTexts);

//           const scrollableElement = await page.$(
//             ".m6QErb.DxyBCb.kA9KIf.dS8AEf"
//           );
//           const previousHeight = await page.evaluate((element) => {
//             return element ? element.scrollHeight : 0;
//           }, scrollableElement);

//           await page.evaluate((element) => {
//             element.scrollBy(0, element.scrollHeight);
//           }, scrollableElement);

//           await page.waitForFunction(
//             (newHeight) => {
//               const element = document.querySelector(
//                 ".m6QErb.DxyBCb.kA9KIf.dS8AEf"
//               );
//               return element.scrollHeight > newHeight;
//             },
//             {},
//             previousHeight
//           );

//           await page.waitForTimeout(2000);
//         }
//       };

//       // Usage
//       await scrapeInfiniteScrollItems(page);
//       fs.writeFileSync("items.json", JSON.stringify(items));
//       console.log(items.length)
//     } catch (error) {
//       console.log("error", error);
//     }

//     await browser.close();
//   } catch (error) {
//     console.error("Error while fetching reviews:", error);
//     res.status(500).send("Error while fetching reviews.");
//   }
// });

// app.listen(PORT, () => {
//   console.log("app is listening on port 5000");
// });