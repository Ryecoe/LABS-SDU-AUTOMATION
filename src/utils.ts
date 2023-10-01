import { Page } from "puppeteer";

export async function alertPage(page: Page, message: string) {
  await page.evaluate((message) => {
    // alert(message);
  }, message);
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

