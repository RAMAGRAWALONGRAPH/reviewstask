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

//   try {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//      page.setDefaultNavigationTimeout(60000);
//     await page.goto(
//       `https://www.google.com/maps/place/${encodeURIComponent(location)}`
//     );
//     await page.type("#searchboxinput", location);
//     await page.keyboard.press("Enter");

//     await page.waitForNavigation({ waitUntil: "networkidle2" });
//         // const count = await page.evaluate(() => {
//         //   const elementsWithClass = document.querySelectorAll(".jftiEf .MyEned");
//         //   return elementsWithClass.length;
//         // });

//         // console.log(`The number of elements with class is: ${count}`);

//     const reviews = [];

//       try {
//         console.log("Fetching more reviews...");
//         await page.waitForSelector(
//           // "div.m6QErb.Hk4XGb.QoaCgb.KoSBEe.tLjsW button.M77dve",
//           'button.hh2c6[data-tab-index="1"]',
//           { timeout: 5000 }
//         );
//         await page.click('button.hh2c6[data-tab-index="1"]');
//         await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for the new reviews to load

//         // Scroll down to load more reviews
//         // const elementToScroll = document.querySelector(".your-element-class");
//         // elementToScroll.scrollIntoView();

//         await page.evaluate(() => {

//           const elementsToScroll = document.querySelectorAll(".m6QErb");

//           elementsToScroll.forEach((element) => {

//             element.scrollTo(0, 500);

//           });
//         });

//         // await page.keyboard.press("ArrowDown");

//         await new Promise((resolve) => setTimeout(resolve, 5000));

//         const newReviews = await page.evaluate(() => {
//           const reviewElements = document.querySelectorAll(".jftiEf");
//           const reviewsArray = [];

//           reviewElements.forEach((element) => {
//             const reviewText = element.querySelector(".MyEned").textContent;
//             const Author = element.querySelector(".d4r55").textContent;
//             const ratingStars = element
//               .querySelector(".kvMYJc")
//               .getAttribute("aria-label");
//             const reviewTimeElement = element.querySelector(".rsqaWe");
//             const reviewTime = reviewTimeElement
//               ? reviewTimeElement.innerText
//               : "N/A";
//             console.log("reviewtext", reviewText);
//             reviewsArray.push({
//               Author,
//               reviewText,
//               ratingStars,
//               reviewTime,
//             });
//           });

//           return reviewsArray;
//         });

//         reviews.push(...newReviews);
//       } catch (error) {
//         console.log("No more 'More reviews' button found, exiting the loop.");

//       }

//     console.log(reviews);
//     console.log(`Fetched ${reviews.length} reviews in total.`);
//     await browser.close();
//   } catch (error) {
//     console.error("Error while fetching reviews:", error);
//     res.status(500).send("Error while fetching reviews.");
//   }
// });

// app.listen(PORT, () => {
//   console.log("app is listening on port 5000");
// });

  //  const totalReviewsText = await page.evaluate((element) => element.textContent, totalReviewsElement);
  //   const numericValueMatch = totalReviewsText.match(/\d+/); // Use regex to extract numeric value

  //   if (numericValueMatch) {
  //     const totalReviews = parseInt(numericValueMatch[0], 10);

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
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();

    await page.goto(
      `https://www.google.com/maps/place/${encodeURIComponent(location)}`
    );
    await page.type("#searchboxinput", location);
    await page.keyboard.press("Enter");
    page.setDefaultNavigationTimeout(60000);

    await page.waitForNavigation({ waitUntil: "networkidle2" });

    try {
      await page.waitForSelector(
        // "div.m6QErb.Hk4XGb.QoaCgb.KoSBEe.tLjsW button.M77dve",
        'button.hh2c6[data-tab-index="1"]',
        { timeout: 3000 }
      );
      await page.click('button.hh2c6[data-tab-index="1"]');
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for the new reviews to load

      const count = await page.evaluate(() => {
        const elementsWithClass = document.querySelectorAll(
          '.YTkVxc + .fontBodySmall'
        );
        console.log(
          `The number of elements with class is: ${elementsWithClass}` 
        );
        return elementsWithClass.length;
      });
      console.log(`The number of elements with className is: ${count}`);

      const scrapeInfiniteScrollItems = async (page, itemTargetCount) => {
       let reviews = [];

        while (itemTargetCount > reviews.length) {
          reviews = await page.evaluate(() => {
            const reviewElements = document.querySelectorAll(".jftiEf");
            const reviewsArray = []
            reviewElements.forEach((element) => {
              const reviewTextElement = element.querySelector(".MyEned");

              const reviewText = reviewTextElement
                ? reviewTextElement.innerText
                : "N/A";
              const AuthorElement = element.querySelector(".d4r55");
              const Author = AuthorElement ? AuthorElement.textContent : "N/A";

              const ratingStars = element
                .querySelector(".kvMYJc")
                .getAttribute("aria-label");

              const reviewTimeElement = element.querySelector(".rsqaWe");
              const reviewTime = reviewTimeElement
                ? reviewTimeElement.innerText
                : "N/A";

              reviewsArray.push({
                Author,
                reviewText,
                ratingStars,
                reviewTime,
              });
            });
            console.log(reviewsArray);
            return reviewsArray;
          });

           if (reviews.length === 104) {
            break; // No more reviews to fetch
          }
          // reviews.push(...reviewsArray);

          const scrollableElement = await page.$(
            ".m6QErb.DxyBCb.kA9KIf.dS8AEf"
          );
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
              console.log(element.scrollHeight);
              console.log(newHeight);
              return element.scrollHeight > newHeight;
            },
            {},
            previousHeight
          );

          await page.waitForTimeout(1000);
        }
        return reviews;
      };

      const reviews = await scrapeInfiniteScrollItems(page, 110);
      fs.writeFileSync("item.json", JSON.stringify(reviews));
      //  console.log(`Fetched ${reviews.length} reviews in total.`);
    } catch (error) {
      console.log("error", error);
    }
     
   
    await browser.close();
  } catch (error) {
    console.error("Error while fetching reviews:", error);
    res.status(500).send("Error while fetching reviews.");
  }
});

app.listen(PORT, () => {
  console.log("app is listening on port 5000");
});

