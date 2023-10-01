import { Page } from "puppeteer";

export async function alertPage(page: Page, message: string) {
  await page.evaluate((message) => {
    alert(message);
  }, message);
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function positionOffset(i: number) {
  switch (i) {
    case 5:
    case 6:
    case 7:
      return 2;
    case 17:
    case 18:
    case 19:
      return -2;
    default:
      return 0;
  }
}
