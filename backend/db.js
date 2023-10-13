const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://ramag:rammongouser%401234@cluster0.ejydhnp.mongodb.net/task").then(()=>
  {console.log("connection successfull")
}).catch((err)=>{
    console.log(err)
})
// const express = require("express");
// const cors = require("cors");
// require("./db");
// const User = require("./models/user");
// const app = express();
// const puppeteer = require("puppeteer");
// const PORT = 5000;
// app.use(express.json());
// app.use(cors());

// app.get("/screenshot", async (req, res) => {
//   try {
//     // Launch the browser and open a new blank page
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     // await page.goto("https://developer.chrome.com/");
//     await page.goto(
//       "https://www.google.com/maps/place/OnGraph+Technologies+Pvt.+Ltd./@26.8798435,75.753467,17z/data=!4m8!3m7!1s0x146c6f3057c2e071:0xea11916fb33a1586!8m2!3d26.8798435!4d75.7560419!9m1!1b1!16s%2Fg%2F11h1ltv96?entry=ttu"
//     );
//     // await page.screenshot({ path: "mywebsite.png" });
//     const grabParagraph = await page.evaluate(async () => {
//       const pgTag = document.querySelectorAll(".jftiEf");
//       let technologies = [];
//       pgTag.forEach((tag) => {
//         technologies.push(tag.innerText);
//       });
//       return technologies;
//     });
//     console.log(grabParagraph);
//     await browser.close();

//     res.status(200).send("Screenshot taken successfully.");
//   } catch (error) {
//     console.error("Error taking screenshot:", error);
//     res.status(500).send("Error taking screenshot.");
//   }
// });

// app.listen(PORT, () => {
//   console.log("app is listen on port 5000");
// });
