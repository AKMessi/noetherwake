/** Real-time QA recording, not staged learner evidence. */
import { chromium, expect } from "@playwright/test";
import { mkdirSync, renameSync } from "node:fs";
import {
  origin,
  nav,
  startPractice,
  answerFractions,
} from "../tests/support/working-page";
const directory = "docs/images/working-page";
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch(),
  context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: directory, size: { width: 1440, height: 900 } },
    reducedMotion: "no-preference",
  }),
  page = await context.newPage();
const video = page.video()!;
try {
  await page.goto(origin);
  await nav(page, "Lab");
  await page.getByRole("button", { name: "60°", exact: true }).click();
  await page
    .getByRole("button", { name: "Test my prediction →", exact: true })
    .click();
  await expect(page.locator(".lab-outcome .gap-figure")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.getAnimations().every((a) => a.playState !== "running"),
      ),
    )
    .toBe(true);
  await nav(page, "Atlas");
  await page.getByLabel("Search atlas").fill("Electric field:");
  await page.keyboard.press("Enter");
  await page
    .getByRole("button", { name: "Trace the route here →", exact: true })
    .click();
  await expect(page.locator(".trace-caption")).toContainText("unmet");
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.getAnimations().every((a) => a.playState !== "running"),
      ),
    )
    .toBe(true);
  await startPractice(page);
  await answerFractions(page);
  await page.getByRole("button", { name: "End session", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Session complete", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(1100);
} finally {
  await context.close();
  await browser.close();
  renameSync(await video.path(), `${directory}/signature-moments.webm`);
}
console.log(`${directory}/signature-moments.webm`);
