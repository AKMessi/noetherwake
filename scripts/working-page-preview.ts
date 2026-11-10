/** Disposable, engine-generated QA state enters through the real validated import UI. */
import { chromium, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { arithmetic, generate } from "../packages/engine/src/index";
import { concept } from "../lib/catalog";
import {
  nav,
  preferences,
  importFixture,
  learnerFixture,
  openLesson,
  origin,
} from "../tests/support/working-page";
const directory = "docs/images/launch-lab";
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch(),
  fixture = await learnerFixture();
const report: {
  images: { file: string; width: number; height: number; overflow: boolean }[];
  errors: string[];
  externalAssets: string[];
  fixture: string;
} = {
  images: [],
  errors: [],
  externalAssets: [],
  fixture:
    "Disposable version-1 state generated, checked and observed by the unchanged engine; imported through the application preview and confirmation.",
};
async function capture(
  page: Page,
  name: string,
  {
    full = true,
    reset = true,
    selector,
  }: { full?: boolean; reset?: boolean; selector?: string } = {},
) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
  });
  if (reset) await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(resolve)),
  );
  const file = `${directory}/${page.viewportSize()!.width}-${name}.png`;
  if (selector) await page.locator(selector).screenshot({ path: file });
  else await page.screenshot({ path: file, fullPage: full });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  report.images.push({ file, ...page.viewportSize()!, overflow });
  if (overflow) throw Error(`Horizontal overflow: ${file}`);
  console.log(file);
}
async function answer(
  page: Page,
  correct: boolean,
  confidence = "Fairly sure",
) {
  const id = (await page.locator(".assessment").getAttribute("data-item"))!,
    templateId = id.split(":")[0],
    seed = Number(id.split(":")[1]);
  const c = concept(templateId.replace(/-\d+$/, "")),
    template = c.generators.find((t) => t.id === templateId)!;
  const item = generate(c, template, seed);
  if (item.choices)
    await page
      .getByRole("radio", {
        name: correct
          ? item.answer
          : item.choices.find((ch) => ch.text !== item.answer)!.text,
        exact: true,
      })
      .check();
  else
    await page
      .getByLabel("Your answer", { exact: true })
      .fill(
        correct
          ? item.answer
          : String(
              arithmetic(item.answer) +
                Math.max(1, Math.abs(arithmetic(item.answer)) * 0.5),
            ),
      );
  if (item.unit) await page.getByLabel("Unit", { exact: true }).fill(item.unit);
  await page.getByRole("radio", { name: confidence, exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.locator(correct ? ".feedback.correct" : ".feedback.needs-work"),
  ).toBeVisible();
}
try {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
  ]) {
    const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
      }),
      page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(`${width}: ${e.message}`));
    page.on("request", (r) => {
      if (
        ["font", "script"].includes(r.resourceType()) &&
        new URL(r.url()).origin !== new URL(origin).origin
      )
        report.externalAssets.push(r.url());
    });
    await page.goto(origin);
    await expect(
      page.getByRole("button", {
        name: "Find my starting point →",
        exact: true,
      }),
    ).toBeEnabled();
    await capture(page, "first-visit");
    await capture(page, "opening", { full: false });
    await page.locator(".route-index-row").first().click();
    await page.locator(".route-stop-state .text-button").first().click();
    await capture(page, "route-expanded", { selector: ".expeditions" });
    await page
      .getByRole("button", { name: "Find my starting point →", exact: true })
      .click();
    await capture(page, "onboarding", { full: false });
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Find my starting point", exact: true })
      .click();
    await capture(page, "placement-question");
    await page
      .getByRole("button", { name: "I don’t know yet", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Use the evidence so far →", exact: true })
      .click();
    await capture(page, "placement-result");
    await nav(page, "Field notes");
    await capture(page, "notes-empty");
    await nav(page, "Lab");
    await capture(page, "lab-before");
    await page.getByRole("button", { name: "60°", exact: true }).click();
    await capture(page, "lab-prediction");
    await page
      .getByRole("button", { name: "Test my prediction →", exact: true })
      .click();
    await capture(page, "lab-tested");
    await nav(page, "Atlas");
    await capture(page, "atlas-default", { full: false });
    await page.getByLabel("Search atlas").fill("Electric field:");
    await page.keyboard.press("Enter");
    await capture(page, "atlas-selected-peek", { full: false });
    if (width < 1024)
      await page
        .getByRole("button", { name: "Expand concept details", exact: true })
        .click();
    await capture(page, "atlas-selected", { full: false });
    await page
      .getByRole("button", { name: "Trace the route here →", exact: true })
      .click();
    await capture(page, "atlas-trace", { full: false });
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "List", exact: true }).click();
    await capture(page, "atlas-list", { full: false });
    await nav(page, "Library");
    await page.getByLabel("Search concepts").fill("Fractions");
    await capture(page, "library-search");
    await page.getByLabel("Search concepts").fill("no-such-concept");
    await capture(page, "library-empty");
    await preferences(page);
    await capture(page, "preferences");
    await page.locator("input[type=file]").setInputFiles({
      name: "working-page-qa-v1.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(fixture)),
    });
    await capture(page, "import-preview");
    await page
      .getByRole("button", { name: "Import and replace", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Clear local data", exact: true })
      .click();
    await page.getByLabel("Type delete to confirm").fill("delete");
    await capture(page, "clear-confirmation");
    await page
      .locator(".clear-confirmation")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await nav(page, "Today");
    await capture(page, "returning");
    await openLesson(page, "Force, mass & the rate of change");
    await capture(page, "lesson");
    await page.locator(".working-derivation").focus();
    await page.keyboard.press("ArrowRight");
    await capture(page, "derivation", { selector: ".working-derivation" });
    if (width < 768) {
      await page.evaluate(() => {
        const prose = document.querySelector<HTMLElement>(".lesson-reading")!;
        window.scrollTo(
          0,
          scrollY +
            prose.getBoundingClientRect().top +
            prose.offsetHeight * 0.65,
        );
      });
      await capture(page, "lesson-sticky", { reset: false, full: false });
    }
    await page
      .getByRole("button", { name: "Practice this →", exact: true })
      .first()
      .click();
    await capture(page, "practice-unanswered");
    await answer(page, true, "Guessing");
    await capture(page, "practice-correct-low-confidence");
    await page
      .getByRole("button", { name: "End session", exact: true })
      .click();
    await capture(page, "session-complete");
    await page
      .getByLabel("What clicked? What still feels uncertain?")
      .fill("Check units before substituting the given quantities.");
    await page
      .getByRole("button", { name: "Save reflection", exact: true })
      .click();
    await nav(page, "Field notes");
    await capture(page, "notes-populated");
    await openLesson(page, "Force, mass & the rate of change");
    await page
      .getByRole("button", { name: "Practice this →", exact: true })
      .first()
      .click();
    await answer(page, false);
    await capture(page, "practice-incorrect");
    await page
      .getByRole("button", { name: "End session", exact: true })
      .click();
    await preferences(page);
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await nav(page, "Today");
    await capture(page, "dark-today");
    await openLesson(page, "Force, mass & the rate of change");
    await capture(page, "dark-lesson");
    await page
      .getByRole("button", { name: "Practice this →", exact: true })
      .first()
      .click();
    await answer(page, false);
    await capture(page, "dark-practice");
    await page
      .getByRole("button", { name: "End session", exact: true })
      .click();
    await nav(page, "Atlas");
    await capture(page, "dark-atlas", { full: false });
    await context.close();
  }
} finally {
  await browser.close();
  writeFileSync(
    "docs/launch-lab-preview.json",
    JSON.stringify(report, null, 2) + "\n",
  );
}
if (report.errors.length || report.externalAssets.length)
  throw Error(
    JSON.stringify({
      errors: report.errors,
      externalAssets: report.externalAssets,
    }),
  );
