// testing playground 

const puppeteer = require("puppeteer");

const extensionPath = "~/Library/Application Support/Google/Chrome/Profile 2/Extensions/bhhhlbepdkbapadjdnnojkbgioiodbic/1.43.2_0";

const browser = await puppeteer.launch({
  headless: false, // Set to false to see the browser in action
  userDataDir: "./user_data",
  defaultViewport: null,
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
});

// open page
const page = await browser.newPage();
await page.goto("https://labs.staratlas.com", {
  waitUntil: "networkidle2",
});

// play
const { width, height } = await page.evaluate(() => {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
});
const centerX = width / 2;
const centerY = height / 2;

