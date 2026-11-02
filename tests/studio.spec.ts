import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("laboratory requires a prediction, reports SI measurements and never fabricates learning evidence", async ({
  page,
}) => {
  await page.goto("/");
  const reveal = page.getByRole("button", {
    name: "Test my prediction",
    exact: true,
  });
  await expect(reveal).toBeDisabled();
  await expect(page.getByTestId("lab-range")).toHaveText("— m");
  await page.getByRole("button", { name: "30°", exact: true }).click();
  await reveal.click();
  await expect(page.getByTestId("lab-range")).toHaveText("12.71 m");
  await expect(
    page.getByText("45° gives the greatest range.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Explore the launch angle").fill("45");
  await expect(page.getByTestId("lab-range")).toHaveText("14.68 m");
  await page.getByLabel("Try another world").selectOption("moon");
  await expect(page.getByTestId("lab-range")).toHaveText("88.89 m");
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page
    .getByRole("button", { name: "Learning journal", exact: true })
    .click();
  await expect(page.locator(".journal-stats strong").first()).toHaveText("0");
  await expect(
    page.getByText("Your story starts with a question.", { exact: true }),
  ).toBeVisible();
});

test("expeditions expose real prerequisites and persist an explicit learning direction", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".expedition-card").nth(1).click();
  await expect(page.locator(".landmark-list li")).toHaveCount(5);
  await expect(
    page
      .locator(".landmark-list")
      .getByText("Build foundations", { exact: true })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Make this my direction", exact: true })
    .click();
  await expect(page.locator(".sidebar-goal")).toContainText(
    "Build calculus intuition",
  );
  await page
    .getByRole("button", { name: "Your current direction", exact: true })
    .waitFor();
  await page.reload();
  await expect(page.locator(".sidebar-goal")).toContainText(
    "Build calculus intuition",
  );
  await page.locator(".expedition-card").nth(1).click();
  await page.locator(".landmark-list button").nth(2).click();
  await expect(
    page.getByText("A CONNECTION TO BUILD FIRST", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Take me to the first ready step",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
});

test("library combines strand, readiness and search with a useful reset", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "The curriculum", exact: true })
    .click();
  await page
    .locator(".strand-filters")
    .getByRole("button", { name: "Calculus", exact: true })
    .click();
  for (const label of await page
    .locator(".curriculum-item .eyebrow")
    .allTextContents())
    expect(label).toBe("Calculus");
  await page
    .getByLabel("Filter by readiness", { exact: true })
    .selectOption("ready");
  await expect(
    page.getByText("No ideas in this view yet.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Show all ideas", exact: true })
    .click();
  await expect(page.locator(".curriculum-item")).toHaveCount(67);
  await page
    .getByRole("textbox", { name: "Search concepts" })
    .fill("Fractions & the whole");
  await expect(page.locator(".curriculum-item")).toHaveCount(1);
  await page.locator(".curriculum-item").click();
  await expect(page.locator(".lesson-big-idea")).toBeVisible();
  await expect(
    page.getByText("Where this idea takes you", { exact: true }),
  ).toBeVisible();
});

test("an incorrect response becomes a concrete journal review opportunity", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Skip placement; learn from my practice",
      exact: true,
    })
    .click();
  await page.getByLabel("Your answer", { exact: true }).fill("0");
  await page.getByLabel("Unit", { exact: true }).fill("m");
  await page.getByRole("button", { name: "Fairly sure", exact: true }).click();
  await page
    .getByRole("button", { name: "Check my reasoning", exact: true })
    .click();
  await expect(page.locator(".feedback.needs-work")).toBeVisible();
  await page
    .getByRole("button", { name: "Finish this session", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Learning journal", exact: true })
    .click();
  await expect(page.locator(".review-opportunities article")).toHaveCount(1);
  await expect(page.locator(".review-opportunities")).toContainText(
    "Fractions & the whole",
  );
  await page
    .getByRole("button", { name: "Revisit the idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
});

test("the mobile opening keeps a working primary action inside the first viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const start = page.getByRole("button", {
    name: "Find your starting point",
    exact: true,
  });
  await expect(start).toBeInViewport();
  await start.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
