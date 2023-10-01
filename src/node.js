// testing playground 

const puppeteer = require("puppeteer");

const extensionPath = "~/Library/Application Support/Google/Chrome/Profile 2/Extensions/bhhhlbepdkbapadjdnnojkbgioiodbic/1.45.0_0";

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
// reload page
// await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

// close browser
// browser.close();

// click
// await page.mouse.click(50, 35);

// play
const { width, height } = await page.evaluate(() => {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
});
const centerX = width / 2;
const centerY = height / 2;

async function injectClickDisplay(page, x, y) {
  await page.evaluate(
    (x, y) => {
      const marker = document.createElement("div");
      marker.className = "marker";
      marker.style.position = "absolute";
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      marker.style.width = "10px";
      marker.style.height = "10px";
      marker.style.backgroundColor = "red";
      marker.style.borderRadius = "50%";
      document.body.appendChild(marker);
    },
    x,
    y
  );
}

async function clearDisplayInjections(page) {
  await page.evaluate(() => {
    const markers = document.querySelectorAll(".marker");
    markers.forEach((marker) => marker.remove());
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


