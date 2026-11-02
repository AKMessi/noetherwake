/** Rasterize the source wake mark with the existing browser, without a new dependency. */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const source = readFileSync("public/icon.svg", "utf8"),
  browser = await chromium.launch();
try {
  for (const size of [192, 512]) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<html><body style="margin:0">${source.replace('width="192" height="192"', `width="${size}" height="${size}"`)}</body></html>`,
    );
    await page.screenshot({ path: `public/icon-${size}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
