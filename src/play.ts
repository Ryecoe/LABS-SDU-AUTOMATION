import { Page } from "puppeteer";
import { sleep} from "./utils";

export default class PlayGame {
  page: Page;
  width: number;
  height: number;
  centerX: number;
  centerY: number;

  firstFleetShipX: number;
  firstFleetShipY: number;

  manageFleetX: number;
  manageFleetY: number;

  SectorScanX: number;
  SectorScanY: number;

  scanButtonX: number;
  scanButtonY: number;

  constructor(page: Page, width: number, height: number) {
    this.page = page;
    this.width = width;
    this.height = height;

    // Calculate the center coordinates
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.firstFleetShipX = this.centerX + 600;
    this.firstFleetShipY = this.centerY +  390;

    this.manageFleetX = this.centerX + 550;
    this.manageFleetY = this.centerY + 300;

    this.SectorScanX = this.centerX + 400;
    this.SectorScanY = this.centerY - 5;

    this.scanButtonX = this.centerX - 330;
    this.scanButtonY = this.centerY + 210;
  }

  async startPlaying(){
    await this.page.mouse.wheel({deltaY: 225})
    await sleep(1000);
    await this.page.mouse.click(this.firstFleetShipX -50, this.firstFleetShipY);
    await sleep(9000);
    await this.page.mouse.click(this.manageFleetX, this.manageFleetY);
    await sleep(2000);
    await this.page.mouse.click(this.SectorScanX, this.SectorScanY);
    await sleep(1500);
      for( let i = 0; i < 30; i++){
        await this.scan(this.page, this.firstFleetShipY);
    }
  }

  private async scan(page: Page, y) {
    await page.mouse.click(this.scanButtonX, this.scanButtonY);
    await sleep(116000);
  }
}