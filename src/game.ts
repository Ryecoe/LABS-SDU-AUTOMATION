import puppeteer, { Browser, Page } from "puppeteer";
import { extensionPath } from "./sa";
import { alertPage, sleep } from "./utils";
import PlayGame from "./play";
import * as fs from "fs";

export default class GamePage {
  page: Page | null;
  browser: Browser | null;
  CURRENT_STARTING_POSITION: number;
  CURRENT_MOVING_DIRECTION: "up" | "down";

  constructor() {
    this.page = null;
    this.browser = null;
    if (fs.existsSync("./data.json")) {
      try {
        const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
        this.CURRENT_STARTING_POSITION = data.currentPosition;
        this.CURRENT_MOVING_DIRECTION = data.currentMovingDirection;
      } catch (error) {
        console.error("Error reading data from JSON file:", error);
        this.CURRENT_STARTING_POSITION = 50;
        this.CURRENT_MOVING_DIRECTION = "up";
        // Initialize the CURRENT_STARTING_POSITION and CURRENT_MOVING_DIRECTION with default values if needed
      }
    }
  }

  async initialize() {
    if (this.browser && this.page) {
      return;
    }
    this.browser = await puppeteer.launch({
      headless: false, // Set to false to see the browser in action
      userDataDir: "./user_data",
      defaultViewport: null,
      protocolTimeout: 0,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });

    this.page = await this.browser.newPage();
    // More initialization code here...
    await this.page.goto("https://sage.staratlas.com");

    const allPages = await this.browser.pages();
    for (const page of allPages) {
      const url = page.url();
      // want to keep solflare wallet open to check balance
      if (url === "about:blank") {
        await page.close();
      }
    }
    // put an alert confirm popup to start the bot
    // await alertPage(this.page, "Setup your wallet and Press Ok");
  }

  async deleteCookiesOnPage() {
    const client = await this.page.target().createCDPSession();

    // Clear cache
    await client.send("Network.clearBrowserCache");

    // Clear cookies
    await client.send("Network.clearBrowserCookies");

    // Clear localStorage
    await this.page.evaluate(() => {
      localStorage.clear();
    });

    // Clear sessionStorage
    await this.page.evaluate(() => {
      sessionStorage.clear();
    });

    // Clear indexedDB
    // Note: This will only clear databases for the currently active origin.
    await this.page.evaluate(() => {
      indexedDB.deleteDatabase("_puppeteer_");
      for (let i = 0; i < window.indexedDB.databases.length; i++) {
        indexedDB.deleteDatabase(window.indexedDB.databases[i].name);
      }
    });
  }

  async hardReloadPage() {
    console.log("hard reloading page...");
    await this.deleteCookiesOnPage();
    await this.page.reload({ waitUntil: "networkidle2", timeout: 60000 });
    await sleep(5000); // menu to fade in...
  }

  async runGameLoop() {
    const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
    this.CURRENT_STARTING_POSITION = data.currentPosition;
    this.CURRENT_MOVING_DIRECTION = data.currentMovingDirection;

    await sleep(5000); // stupid menu animation takes time to fade in

    // random time from 15 to 30 min in milliseconds
    const PLAY_FOR_BEFORE_REFRESH = Math.floor(Math.random() * 15 * 60 * 1000) + 15 * 60 * 1000;

    try {
      // Your game loop here, using this.page...
      await this.connectWallet();

      // console.log("waiting to start playing the game...");
      // await readyTheGame(page);
      await sleep(1000);
      let start_time = new Date().getTime();

      const { width, height } = await this.page.evaluate(() => {
        return {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        };
      });

      const playGame = new PlayGame(this.page, width, height, this.CURRENT_STARTING_POSITION, this.CURRENT_MOVING_DIRECTION);
      while (true) {
        // if been playing for more than 1 hour refresh page
        if (new Date().getTime() - start_time > PLAY_FOR_BEFORE_REFRESH) {
          console.log("!!!TIME TO RELOAD PAGE!!!");
          await sleep(2500); // waiting 2.5s for existing transactions to finish
          throw new Error("TIME TO RELOAD PAGE");
        }
        await playGame.startPlaying();
        // console log time before reload
        console.log("time before reload: ", Math.floor((PLAY_FOR_BEFORE_REFRESH - (new Date().getTime() - start_time)) / 1000), " seconds");
      }
    } catch (e) {
      // read data from file and update the current position and direction for next round
      const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
      this.CURRENT_STARTING_POSITION = data.currentPosition;
      this.CURRENT_MOVING_DIRECTION = data.currentMovingDirection;
      console.error("UNKNOWN ERROR while playing game, ", e);
      throw e;
    }
  }

  async connectWallet() {
    await sleep(15000); // stupid menu animation takes time to fade in
    console.log("starting to connect wallet...");
    // Get the dimensions of the viewport
    const { width, height } = await this.page.evaluate(() => {
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      };
    });

    const FIRST_LOAD = true;

    // Calculate the center coordinates
    const centerX = width / 2;
    const centerY = height / 2;

    // Acknowledge start - only first time
    if (FIRST_LOAD) {
      await this.page.mouse.click(centerX, centerY + 40);
      await sleep(2000);
    }

    // connect wallet
    await this.page.mouse.click(centerX, centerY + 0.07 * height);
    await sleep(2000);

    // disclaimer - only first time
    if (FIRST_LOAD) {
      await this.page.mouse.click(centerX, centerY + 100);
      await sleep(2000);
    }

    // select wallet
    await this.page.mouse.click(centerX, centerY + 0.035 * height);
    await sleep(5000); // solflare animation on first connect
    // have to approve on solflare wallet

    // Function to handle console events
    const logHandler = (msg) => {
      //   ignore LOG: Event is not trusted
      if (msg.text().includes("Event is not trusted")) {
        return;
      }
      console.log("LOG:", msg.text());
      if (msg.text().includes("Error during WebSocket handshake")) {
        throw new Error("WebSocket CRASHED - need hard reload!");
      }
      if (msg.text().includes("Received a broken close frame containing a reserved status code.")) {
        throw new Error("PAGE CRASHED - need hard reload!");
      }
      if (msg.text().includes("caught (in promise) TypeError: Cannot read properties of undefined (reading 'onError')")) {
        throw new Error("FFAAAAAAK what is this shit!!! - delete cookies");
      }
      if (msg.text().includes("Received a broken close frame containing a reserved status code.")) {
        throw new Error("PAGE CRASHED - need hard reload!");
      }
    };
    // Start listening for console events
    const logsListener = this.page.on("console", logHandler);

    // click Play on Main Menu
    await this.page.mouse.click(centerX, centerY);

    console.log("waiting for network calls to be made...");
    await this.page.waitForResponse((response) => {
      return response.url() === "https://starcomm.staratlas.com/matchmake/joinOrCreate/Player_Data_Room";
    });

    console.log("READY TO START GAME, waiting for all network calls to finish");
    await this.page.waitForNetworkIdle({ idleTime: 5000, timeout: 60000 });

    console.log("ALL NETWORK CALLS MADE, starting game");
  }
}
