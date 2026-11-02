/** Supplementary AA scans for transient states, using only actual learner responses. */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "node:fs";
import {
  origin,
  startPractice,
  answerFractions,
  preferences,
  nav,
} from "../tests/support/working-page";
const browser = await chromium.launch(),
  results: { width: number; state: string; violations: unknown[] }[] = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
      }),
      page = await context.newPage();
    const scan = async (state: string) => {
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      results.push({ width, state, violations: audit.violations });
      console.log(width, state, audit.violations.length);
    };
    await page.goto(origin);
    await page
      .getByRole("button", { name: "Find my starting point →", exact: true })
      .click();
    await scan("goal-dialog");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Find my starting point", exact: true })
      .click();
    await scan("placement-question");
    await page
      .getByRole("button", { name: "Use the evidence so far →", exact: true })
      .click();
    await nav(page, "Today");
    await preferences(page);
    await page
      .getByRole("button", { name: "Clear local data", exact: true })
      .click();
    await page.getByLabel("Type delete to confirm").fill("delete");
    await page
      .getByRole("button", { name: "Delete local data", exact: true })
      .click();
    await startPractice(page);
    await scan("practice-unanswered");
    await answerFractions(page, { correct: false, confidence: "Certain" });
    await scan("practice-incorrect");
    await page
      .getByRole("button", { name: "End session", exact: true })
      .click();
    await scan("session-complete");
    await nav(page, "Field notes");
    await scan("field-notes");
    await preferences(page);
    const downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export JSON", exact: true })
      .click();
    const file = await downloaded;
    await page.locator("input[type=file]").setInputFiles((await file.path())!);
    await scan("import-preview");
    await page
      .locator(".import-preview")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Clear local data", exact: true })
      .click();
    await page.getByLabel("Type delete to confirm").fill("delete");
    await scan("clear-confirmation");
    await context.close();
  }
} finally {
  await browser.close();
  writeFileSync(
    "docs/working-page-a11y.json",
    JSON.stringify(
      {
        standard:
          "axe WCAG 2 A/AA and WCAG 2.1 AA; automated checks are not a full conformance certification",
        results,
      },
      null,
      2,
    ) + "\n",
  );
}
if (results.some((r) => r.violations.length))
  throw Error("AA violations recorded in docs/working-page-a11y.json");
