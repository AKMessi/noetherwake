/** Production QA in isolated contexts. All captured practice is disposable test evidence. */
import { webkit, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
const directory = "docs/images/curiosity-studio";
mkdirSync(directory, { recursive: true });
const browser = await webkit.launch();
async function capture(page: Page, name: string, selector?: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
  });
  if (selector)
    await page
      .locator(selector)
      .screenshot({ path: `${directory}/${name}.png` });
  else
    await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  if (dimensions.scrollWidth > dimensions.width)
    throw new Error(`${name}: horizontal overflow`);
  console.log(name, dimensions);
}
async function navigate(page: Page, name: string) {
  const menu = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
}
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
  ] as const) {
    const context = await browser.newContext({ viewport: { width, height } }),
      page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:3000");
    await page
      .getByRole("heading", { name: "Follow your curiosity." })
      .waitFor();
    await page.evaluate(() => document.fonts.ready);
    await capture(page, `${name}-home`);
    await page.screenshot({ path: `${directory}/${name}-opening.png` });
    await page.getByRole("button", { name: "45°", exact: true }).click();
    await page
      .getByRole("button", { name: "Test my prediction", exact: true })
      .click();
    await page.getByTestId("lab-range").filter({ hasText: "14.68" }).waitFor();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await capture(page, `${name}-experiment`, ".projectile-lab");
    await page.locator(".expedition-card").nth(1).click();
    await capture(page, `${name}-expeditions`, ".expeditions");
    if (name === "mobile") {
      await page
        .getByRole("button", { name: "Use dark theme", exact: true })
        .click();
      await capture(page, "mobile-dark-home");
      await page
        .getByRole("button", { name: "Use light theme", exact: true })
        .click();
    }
    await navigate(page, "Knowledge map");
    await capture(page, `${name}-atlas`);
    await navigate(page, "The curriculum");
    await capture(page, `${name}-library`);
    await page
      .getByRole("textbox", { name: "Search concepts" })
      .fill("Electric field:");
    await page.locator(".curriculum-item").first().click();
    await capture(page, `${name}-locked`);
    await navigate(page, "Today");
    await page
      .getByRole("button", { name: "Find my starting point", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Skip placement; learn from my practice",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Commit prediction", exact: true })
      .waitFor();
    await capture(page, `${name}-lesson`);
    await page.getByLabel("Your answer", { exact: true }).fill("0");
    await page.getByLabel("Unit", { exact: true }).fill("m");
    await page
      .getByRole("button", { name: "Fairly sure", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Check my reasoning", exact: true })
      .click();
    await capture(page, `${name}-feedback`, ".assessment");
    await page
      .getByRole("button", { name: "Finish this session", exact: true })
      .click();
    await capture(page, `${name}-summary`);
    await navigate(page, "Learning journal");
    await capture(page, `${name}-journal`);
    await navigate(page, "Today");
    await capture(page, `${name}-returning`);
    await page.clock.install({ time: new Date(Date.now() + 7 * 86400000) });
    await page.reload();
    await page
      .getByRole("button", { name: "Continue learning", exact: true })
      .waitFor();
    await capture(page, `${name}-review-due`);
    if (errors.length) throw new Error(`${name}: ${errors.join("; ")}`);
    await context.close();
  }
} finally {
  await browser.close();
}
