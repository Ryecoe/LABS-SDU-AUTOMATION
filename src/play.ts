import { Page } from "puppeteer";
import {sleep} from "./utils";

export default class PlayGame {
  page: Page;
  width: number;
  height: number;
  centerX: number;
  centerY: number;

  numberOfFleets: number;

  //firstScanX: number;
  //firstScanY: number;

  bottomScanX: number;
  bottomScanY: number;

  sectorScanX: number;
  sectorScanY: number;

  constructor(page: Page, width: number, height: number) {
    this.page = page;
    this.width = width;
    this.height = height;

    this.numberOfFleets = 6;

    // Calculate the center coordinates
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.sectorScanX = this.centerX + 500;
    this.sectorScanY = this.centerY + 320;

    //this.firstScanX = this.centerX + 550;
    //this.firstScanY = this.centerY +  340;

    this.bottomScanX = this.centerX + 550;
    this.bottomScanY = this.centerY +  380;
  }

  async startPlaying(){
    await this.page.mouse.wheel({deltaY: 200})
    await sleep(1000);
    await this.page.mouse.click(this.sectorScanX, this.sectorScanY)
    await sleep(1000)

    await sleep(1000);
      for( let i = 0; i < 30; i++){
        await this.scan(this.page);
    }
    await this.page.mouse.wheel({deltaY: -200})
    await sleep(1000)
  }

  private async scan(page: Page) {
    await this.page.mouse.click(this.centerX + 520,this.centerY + 370)
    await sleep(121000);

  }
}
