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

let fetchedReviews = [];
let responseSent = false; // flag to check if the response has been sent
app.post("/fetchReviews", async (req, res) => {
  //   const { lastReviewsCount } = req.body;
  let lastReviewsCount = 0;
  // const { location } = req.body;

  // if (!location) {
  //   return res.status(400).json({ error: "Location is required" });
  // }

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(
      `https://www.google.com/maps/place/`
    );
    await page.type(
      "#searchboxinput",
      "OnGraph Technologies Pvt. Ltd., Gopalpura Bypass Road, Rajiv Vihar Colony, Jaipur, Rajasthan"
    );
    await page.keyboard.press("Enter");
    page.setDefaultNavigationTimeout(60000);
     await page.waitForNavigation({ waitUntil: "networkidle2" });
       const count = await page.evaluate(() => {
         const elementsWithClass = document.querySelectorAll(
           // "div.Nv2PK.THOPZb div.bfdHYd.Ppzolf.OFBs3e div.UaQhfb.fontBodyMedium div.W4Efsd"
           //  "div.Nv2PK.THOPZb .hfpxzc"
           "div.Nv2PK.THOPZb .bfdHYd.Ppzolf.OFBs3e .W4Efsd"
         );
         console.log(
           `The number of elements with class is: ${elementsWithClass}`
         );
         return elementsWithClass.length;
       });
       console.log(`The number of elements with className is: ${count}`);

    try {
      await page.waitForSelector(
        // "div.m6QErb.Hk4XGb.QoaCgb.KoSBEe.tLjsW button.M77dve",
        'button.hh2c6[data-tab-index="1"]',
        { timeout: 3000 }
      );
      await page.click('button.hh2c6[data-tab-index="1"]');
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for the new reviews to load

    

      const sendReviewsToUser = (reviews) => {
        // Filter out already fetched reviews
        const newReviews = reviews.filter(
          (review) =>
            !fetchedReviews.some(
              (fetchedReview) => fetchedReview.reviewText === review.reviewText
            )
        );

        // Send newReviews to the user
        if (newReviews.length > 0 && !responseSent) {
          fetchedReviews = [...fetchedReviews, ...newReviews]; // Update fetched reviews list
          // res.json({ message: "Fetched reviews:", reviews: newReviews });
          fs.writeFileSync("item.json", JSON.stringify(newReviews));
          responseSent = true;
        }
      };

      const scrapeInfiniteScrollItems = async (page) => {
        let totalReviewsCount = 0;
        const totalReviewsElement = await page.$(".YTkVxc + .fontBodySmall");
        console.log(totalReviewsElement);
        if (totalReviewsElement) {
          const totalReviewsText = await page.evaluate(
            (element) => element.textContent,
            totalReviewsElement
          );
          const numericValueMatch = totalReviewsText.match(/\d+/);
          console.log(numericValueMatch);

          if (numericValueMatch) {
            totalReviewsCount = parseInt(numericValueMatch[0], 10);
          }
        }

        let reviews = [];
        console.log(totalReviewsCount);
        console.log(reviews.length);
        while (true) {
          reviews = await page.evaluate(() => {
            const reviewElements = document.querySelectorAll(".jftiEf");
            const reviewsArray = [];
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
            // console.log(reviewsArray);
            return reviewsArray;
          });

          // if (reviews.length > 0) {
          //   // Send the fetched reviews to the user
          //   sendReviewsToUser(reviews);
          //   break;
          // }
          if (reviews.length > lastReviewsCount + 500) {
            console.log("hii");
            const newReviews = reviews.slice(lastReviewsCount);
            lastReviewsCount = reviews.length;
            sendReviewsToUser(newReviews);
            break;
          }

          if (reviews.length === totalReviewsCount) {
            console.log("hlw");
            const newReviews = reviews.slice(lastReviewsCount);
            lastReviewsCount = reviews.length;
            sendReviewsToUser(newReviews);
            break; // No more reviews to fetch
          }

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

              return element.scrollHeight > newHeight;
            },
            {},
            previousHeight
          );

          await page.waitForTimeout(1000);
          console.log(reviews.length, "reviews");
        }
        return reviews;
      };

      const reviews = await scrapeInfiniteScrollItems(page);
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

// let fetchedReviews = [];
// let responseSent = false; // flag to check if the response has been sent
// app.post("/screenshot", async (req, res) => {
//   //   const { lastReviewsCount } = req.body;
//   let lastReviewsCount = 0;
//   // const { location } = req.body;

//   // if (!location) {
//   //   return res.status(400).json({ error: "Location is required" });
//   // }

//   try {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     await page.goto(`https://www.google.com/maps/place/`);
//     await page.type("#searchboxinput", "ongraph");
//     await page.keyboard.press("Enter");
//     page.setDefaultNavigationTimeout(60000);
//     await page.waitForNavigation({ waitUntil: "networkidle2" });
//     const count = await page.evaluate(() => {
//       const elementsWithClass = document.querySelectorAll(
//         // "div.Nv2PK.THOPZb div.bfdHYd.Ppzolf.OFBs3e div.UaQhfb.fontBodyMedium div.W4Efsd"
//         //  "div.Nv2PK.THOPZb a.hfpxzc"
//          "div.Nv2PK.THOPZb"

//         // "div.Nv2PK.THOPZb .bfdHYd.Ppzolf.OFBs3e .W4Efsd > .W4Efsd"
//       );
//       console.log(`The number of elements with class is: ${elementsWithClass}`);
//       return elementsWithClass.length;
//     });
//     console.log(`The number of elements with className is: ${count}`);

//      locationSuggestions = await page.evaluate(() => {
//        const suggestionElements = document.querySelectorAll("div.Nv2PK.THOPZb");
//        if (suggestionElements.length > 0) {
//          const suggestions = [];
//          suggestionElements.forEach((element) => {
        
//           //  const suggestionText = element.innerText;
//             const link = element
//               .querySelector("a.hfpxzc")
//               .getAttribute("href");
//               const addressText = element.querySelectorAll[0](
//                 ".bfdHYd.Ppzolf.OFBs3e .W4Efsd > .W4Efsd"
//               ).textContent;
//               const ariaLabel = element
//                 .querySelector("a.hfpxzc")
//                 .getAttribute("aria-label");
//               suggestions.push({
//                 link, 
//                 ariaLabel,
//                 addressText
//                });
//          });
//          console.log(suggestions)
//          return suggestions;
//        }
//       return [];
//     });
    
//     // try {
//     //   await page.waitForSelector(
//     //     // "div.m6QErb.Hk4XGb.QoaCgb.KoSBEe.tLjsW button.M77dve",
//     //     'button.hh2c6[data-tab-index="1"]',
//     //     { timeout: 3000 }
//     //   );
//     //   await page.click('button.hh2c6[data-tab-index="1"]');
//     //   await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for the new reviews to load

//     //   const sendReviewsToUser = (reviews) => {
//     //     // Filter out already fetched reviews
//     //     const newReviews = reviews.filter(
//     //       (review) =>
//     //         !fetchedReviews.some(
//     //           (fetchedReview) => fetchedReview.reviewText === review.reviewText
//     //         )
//     //     );

//     //     // Send newReviews to the user
//     //     if (newReviews.length > 0 && !responseSent) {
//     //       fetchedReviews = [...fetchedReviews, ...newReviews]; // Update fetched reviews list
//     //       // res.json({ message: "Fetched reviews:", reviews: newReviews });
//     //       fs.writeFileSync("item.json", JSON.stringify(newReviews));
//     //       responseSent = true;
//     //     }
//     //   };

//     //   const scrapeInfiniteScrollItems = async (page) => {
//     //     let totalReviewsCount = 0;
//     //     const totalReviewsElement = await page.$(".YTkVxc + .fontBodySmall");
//     //     console.log(totalReviewsElement);
//     //     if (totalReviewsElement) {
//     //       const totalReviewsText = await page.evaluate(
//     //         (element) => element.textContent,
//     //         totalReviewsElement
//     //       );
//     //       const numericValueMatch = totalReviewsText.match(/\d+/);
//     //       console.log(numericValueMatch);

//     //       if (numericValueMatch) {
//     //         totalReviewsCount = parseInt(numericValueMatch[0], 10);
//     //       }
//     //     }

//     //     let reviews = [];
//     //     console.log(totalReviewsCount);
//     //     console.log(reviews.length);
//     //     while (true) {
//     //       reviews = await page.evaluate(() => {
//     //         const reviewElements = document.querySelectorAll(".jftiEf");
//     //         const reviewsArray = [];
//     //         reviewElements.forEach((element) => {
//     //           const reviewTextElement = element.querySelector(".MyEned");

//     //           const reviewText = reviewTextElement
//     //             ? reviewTextElement.innerText
//     //             : "N/A";
//     //           const AuthorElement = element.querySelector(".d4r55");
//     //           const Author = AuthorElement ? AuthorElement.textContent : "N/A";

//     //           const ratingStars = element
//     //             .querySelector(".kvMYJc")
//     //             .getAttribute("aria-label");

//     //           const reviewTimeElement = element.querySelector(".rsqaWe");
//     //           const reviewTime = reviewTimeElement
//     //             ? reviewTimeElement.innerText
//     //             : "N/A";

//     //           reviewsArray.push({
//     //             Author,
//     //             reviewText,
//     //             ratingStars,
//     //             reviewTime,
//     //           });
//     //         });
//     //         // console.log(reviewsArray);
//     //         return reviewsArray;
//     //       });

//     //       // if (reviews.length > 0) {
//     //       //   // Send the fetched reviews to the user
//     //       //   sendReviewsToUser(reviews);
//     //       //   break;
//     //       // }
//     //       if (reviews.length > lastReviewsCount + 500) {
//     //         console.log("hii");
//     //         const newReviews = reviews.slice(lastReviewsCount);
//     //         lastReviewsCount = reviews.length;
//     //         sendReviewsToUser(newReviews);
//     //         break;
//     //       }

//     //       if (reviews.length === totalReviewsCount) {
//     //         console.log("hlw");
//     //         const newReviews = reviews.slice(lastReviewsCount);
//     //         lastReviewsCount = reviews.length;
//     //         sendReviewsToUser(newReviews);
//     //         break; // No more reviews to fetch
//     //       }

//     //       const scrollableElement = await page.$(
//     //         ".m6QErb.DxyBCb.kA9KIf.dS8AEf"
//     //       );
//     //       const previousHeight = await page.evaluate((element) => {
//     //         return element ? element.scrollHeight : 0;
//     //       }, scrollableElement);

//     //       await page.evaluate((element) => {
//     //         element.scrollBy(0, element.scrollHeight);
//     //       }, scrollableElement);

//     //       await page.waitForFunction(
//     //         (newHeight) => {
//     //           const element = document.querySelector(
//     //             ".m6QErb.DxyBCb.kA9KIf.dS8AEf"
//     //           );

//     //           return element.scrollHeight > newHeight;
//     //         },
//     //         {},
//     //         previousHeight
//     //       );

//     //       await page.waitForTimeout(1000);
//     //       console.log(reviews.length, "reviews");
//     //     }
//     //     return reviews;
//     //   };

//     //   const reviews = await scrapeInfiniteScrollItems(page);
//     //   fs.writeFileSync("item.json", JSON.stringify(reviews));
//     //   //  console.log(`Fetched ${reviews.length} reviews in total.`);
//     // } catch (error) {
//     //   console.log("error", error);
//     // }

//     // await browser.close();
//   } catch (error) {
//     console.error("Error while fetching reviews:", error);
//     res.status(500).send("Error while fetching reviews.");
//   }
// });

// app.listen(PORT, () => {
//   console.log("app is listening on port 5000");
// });