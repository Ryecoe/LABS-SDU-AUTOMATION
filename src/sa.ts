import puppeteer, { Page } from "puppeteer";
import PlayGame from "./play";
import { alertPage, sleep} from "./utils";

//NEED TO CHANGE THESE TWO LINES FOR THE BOT TO WORK
/***************************************************************************************************************************************************/
const paused = false
const extensionPath = "C:\\Users\\colto\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\bhhhlbepdkbapadjdnnojkbgioiodbic\\1.52.0_0";
/***************************************************************************************************************************************************/

(async () => {
  // Set the path to your Chrome extension folder
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser in action
    userDataDir: "./user_data",
    defaultViewport: null,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });

  // Open a new page and navigate to a website
  const page = await browser.newPage();
  await page.goto("https://labs.staratlas.com", {
    waitUntil: "networkidle2",
  });

  const allPages = await browser.pages();
  const secondTab = allPages[1];
  await secondTab.bringToFront(); // This line is optional, as Puppeteer interacts with the page object regardless of the visual focus

  // put an alert confirm popup
  await alertPage(page, "Setup your wallet and Press Ok");

  const { width, height } = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
  });

  while (true) {
    await sleep(5000);
    if(!paused){
      await initializeGame(page);
    }
    await sleep(10000);
    console.log("Starting to play the game");
    let start_time = new Date().getTime();
    try {
      const playGame = new PlayGame(page, width, height);
      while (true) {
        if(!paused){
          await playGame.startPlaying();
        }
       
      }
    } catch (e) {
      console.log(e);
      console.log("GOT ERRROR");
      // Close the browser when you're done
      await browser.close();
    }
  }
})();

async function initializeGame(page: Page) {
  // Get the dimensions of the viewport
  const { width, height } = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
  });

  // Calculate the center coordinates
  const centerX = width / 2;
  const centerY = height / 2;

  //Launch Game
  await page.mouse.click(centerX, centerY + 210);
  await sleep(2000);
 
  //Select Wallet Button
  await page.mouse.click(centerX, centerY + 100);
  await sleep(5000);

  //Select Solflare Wallet
  await page.mouse.click(centerX, centerY - 50);
  await sleep(5000);

  //Connect button
  await page.mouse.click(centerX, centerY + 210);
  await sleep(8000);

  //Play Game
  await page.mouse.click(centerX, centerY + 100);
  await sleep(4000);
}