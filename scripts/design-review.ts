/** Isolated browser contexts. Captures contain test practice, never production learner data. */
import { webkit, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
const directory = "docs/images/field-atlas";
mkdirSync(directory, { recursive: true });
const browser = await webkit.launch();
async function capture(page: Page, name: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
  });
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
}
for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
] as const) {
  const context = await browser.newContext({ viewport: { width, height } }),
    page = await context.newPage();
  await page.goto("http://127.0.0.1:3000");
  await page
    .getByRole("button", { name: "Find my starting point", exact: true })
    .waitFor();
  await capture(page, `${name}-home`);
  if (name === "mobile") {
    await page.getByRole("button", { name: "Use dark theme" }).click();
    await capture(page, "mobile-dark");
    await page.getByRole("button", { name: "Use light theme" }).click();
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page
    .getByRole("button", { name: "Knowledge map", exact: true })
    .first()
    .click();
  await capture(page, `${name}-atlas`);
  if (name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page
    .getByRole("button", { name: "Today", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Skip placement; learn from my practice" })
    .click();
  await page.getByRole("button", { name: "Commit prediction" }).waitFor();
  await capture(page, `${name}-lesson`);
  await page.getByLabel("Your answer", { exact: true }).fill("0");
  await page.getByLabel("Unit", { exact: true }).fill("m");
  await page.getByRole("button", { name: "Fairly sure", exact: true }).click();
  await page
    .getByRole("button", { name: "Check my reasoning", exact: true })
    .click();
  await capture(page, `${name}-feedback`);
  await page
    .getByRole("button", { name: "Finish this session", exact: true })
    .click();
  await capture(page, `${name}-summary`);
  await page.getByRole("button", { name: "Back to my learning space" }).click();
  await capture(page, `${name}-returning`);
  await page.clock.install({ time: new Date(Date.now() + 7 * 86400000) });
  await page.reload();
  await page
    .getByRole("button", { name: "Continue learning", exact: true })
    .waitFor();
  await capture(page, `${name}-review-due`);
  await context.close();
}
const extra = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await extra.newPage();
await page.goto("http://127.0.0.1:3000");
await page
  .getByRole("button", { name: "Find my starting point", exact: true })
  .click();
await page
  .getByRole("dialog")
  .getByRole("button", { name: "Find my starting point", exact: true })
  .click();
await capture(page, "desktop-diagnostic");
await page.getByRole("button", { name: "The curriculum", exact: true }).click();
await page
  .getByRole("textbox", { name: "Search concepts" })
  .fill("Electric field:");
await page.locator(".curriculum-item").first().click();
await capture(page, "desktop-locked");
await extra.close();
await browser.close();
