import { Page } from "puppeteer";

export async function injectClickDisplay(page: Page, x: number, y: number) {
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
export async function clearDisplayInjections(page: Page) {
  await page.evaluate(() => {
    const markers = document.querySelectorAll(".marker");
    markers.forEach((marker) => marker.remove());
  });
}

export async function alertPage(page: Page, message: string) {
  await page.evaluate((message) => {
    // alert(message);
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
