import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync, readFileSync } from "node:fs";
async function skipPlacement(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Skip placement; learn from my practice" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
}
async function firstResponse(page: import("@playwright/test").Page) {
  const title = await page.locator("#question-title").textContent(),
    numbers = [...title!.matchAll(/(\d+)\/4/g)].map((m) => Number(m[1]));
  await page
    .getByLabel("Your answer", { exact: true })
    .fill(String((numbers[0] + numbers[1]) / 4));
  await page.getByLabel("Unit", { exact: true }).fill("m");
  const check = page.getByRole("button", { name: "Check my reasoning" });
  await expect(check).toBeDisabled();
  await page.getByRole("button", { name: "Fairly sure", exact: true }).click();
  await check.click();
  await expect(
    page.getByText("That holds together.", { exact: true }),
  ).toBeVisible();
}
test("full journey: skip placement, retrieve, reflect, retain progress and export", async ({
  page,
}) => {
  await skipPlacement(page);
  await firstResponse(page);
  await page
    .getByRole("button", { name: "Finish this session", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A little clearer than before." }),
  ).toBeVisible();
  await page
    .getByLabel("What clicked? What still feels uncertain?")
    .fill("Equal pieces share a denominator.");
  await page.getByRole("button", { name: "Save reflection" }).click();
  await page.getByRole("button", { name: "Back to my learning space" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Continue learning", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Learning journal", exact: true })
    .click();
  await expect(
    page.getByText("Equal pieces share a denominator."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Preferences", exact: true })
    .first()
    .click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress as JSON" }).click();
  const backup = await download;
  expect(backup.suggestedFilename()).toMatch(/noetherwake-.*\.json/);
  await page.locator("input[type=file]").setInputFiles((await backup.path())!);
  await expect(
    page.getByText(
      "Backup restored. Your route now uses the imported evidence.",
    ),
  ).toBeVisible();
});
test("adaptive placement updates evidence and yields a frontier", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  for (let i = 0; i < 12; i++) {
    if (await page.getByLabel("Your answer", { exact: true }).count()) {
      await page.getByLabel("Your answer", { exact: true }).fill("0");
      if (await page.getByLabel("Unit", { exact: true }).count())
        await page.getByLabel("Unit", { exact: true }).fill("m");
    } else {
      await page.locator(".choice").first().click();
    }
    await page
      .getByRole("button", { name: "Still guessing", exact: true })
      .click();
    await page.getByRole("button", { name: "Check my reasoning" }).click();
    await page.getByRole("button", { name: "Next placement question" }).click();
  }
  await page
    .getByRole("button", { name: "Finish placement", exact: true })
    .click();
  await expect(
    page.getByText("You explored 12 questions.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start my first session" }).click();
  await expect(
    page.getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
});
test("locked concept names prerequisites and reroutes to ready foundation", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "The curriculum", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search concepts" })
    .fill("Electric field:");
  await page.locator(".curriculum-item").first().click();
  await expect(
    page.getByText("A CONNECTION TO BUILD FIRST", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Coulomb law & inverse-square spreading",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Take me to the first ready step" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
});
test("prediction is committed before reveal and interactive responds", async ({
  page,
}) => {
  await skipPlacement(page);
  await expect(
    page.getByRole("button", { name: "Reveal the change" }),
  ).toHaveCount(0);
  await page
    .getByLabel(/What changes when the parameter doubles/)
    .fill("The output doubles at the same input.");
  await page.getByRole("button", { name: "Commit prediction" }).click();
  await page.getByRole("button", { name: "Reveal the change" }).click();
  await expect(page.getByText("f(2) = 1.000")).toBeVisible();
});
test("backup validation is atomic and review scheduling works after a clock change", async ({
  page,
}) => {
  await skipPlacement(page);
  await firstResponse(page);
  await page
    .getByRole("button", { name: "Finish this session", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Preferences", exact: true })
    .first()
    .click();
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(
    page.getByText(/Import did not change your progress/),
  ).toBeVisible();
  await page.clock.install({ time: new Date(Date.now() + 7 * 86400000) });
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "1 idea ready to revisit" }),
  ).toBeVisible();
});
test("production offline cache serves a reload and retains on-device state", async ({
  page,
  context,
}) => {
  await skipPlacement(page);
  await firstResponse(page);
  await page
    .getByRole("button", { name: "Finish this session", exact: true })
    .click();
  await page.getByRole("button", { name: "Back to my learning space" }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.getByText("Offline ready", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Continue learning", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "The curriculum", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search concepts" })
    .fill("Fractions");
  await page.locator(".curriculum-item").first().click();
  await expect(
    page.getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
});
test("desktop home and map meet axe AA checks", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Make the next connection." }),
  ).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page
    .getByRole("button", { name: "Knowledge map", exact: true })
    .click();
  const mapResult = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(mapResult.violations).toEqual([]);
});
test("mobile, dark mode and lesson meet axe AA and avoid horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Make the next connection." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Use dark theme" }).click();
  const home = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(home.violations).toEqual([]);
  await skipPlacement(page);
  const lesson = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(lesson.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("keyboard navigation and reduced motion preserve the primary flow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Find my starting point", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("mobile-emulated LCP and transfer budgets", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "CDP throttling requires Chromium");
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 60,
    downloadThroughput: (1600 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    (window as unknown as { __lcp: number }).__lcp = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        (window as unknown as { __lcp: number }).__lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Find my starting point", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(1500);
  const lcp = await page.evaluate(
    () => (window as unknown as { __lcp: number }).__lcp,
  );
  writeFileSync(
    "docs/perf-results.json",
    JSON.stringify(
      {
        lcpMs: lcp,
        cpuSlowdown: 4,
        latencyMs: 60,
        bandwidthKbps: 1600,
        viewport: "390x844",
        hardware: "synthetic Chromium throttling, not a physical phone",
      },
      null,
      2,
    ) + "\n",
  );
  expect(lcp).toBeGreaterThan(0);
  expect(lcp).toBeLessThan(2000);
});

test("symbolic checking loads and works with the network disabled", async ({
  page,
  context,
}) => {
  const { createLearner, initialKnowledge } = await import(
    "../packages/engine/src"
  );
  const catalog = JSON.parse(
    readFileSync("lib/catalog.generated.json", "utf8"),
  ) as { id: string }[];
  const now = Date.now(),
    s = createLearner(now, "substitution");
  s.onboarded = true;
  for (const c of catalog)
    s.knowledge[c.id] = {
      ...initialKnowledge(now),
      p: 0.9,
      n: 10,
      observations: 2,
    };
  s.knowledge["power-rule"] = { ...initialKnowledge(now), observations: 1 };
  await page.goto("/");
  await page
    .getByRole("button", { name: "Preferences", exact: true })
    .first()
    .click();
  await page.locator("input[type=file]").setInputFiles({
    name: "test-learner.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(
    page.getByText(
      "Backup restored. Your route now uses the imported evidence.",
    ),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "The curriculum", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search concepts" })
    .fill("Power rule");
  await page.locator(".curriculum-item").first().click();
  await page.getByRole("button", { name: "Try the idea", exact: true }).click();
  const prompt = await page.locator("#question-title").textContent();
  const coefficient = Number(prompt!.match(/Differentiate (\d+)x/)![1]);
  await page
    .getByLabel("Your answer", { exact: true })
    .fill(`${2 * coefficient}*x`);
  await page.getByRole("button", { name: "Very sure", exact: true }).click();
  await page.getByRole("button", { name: "Check my reasoning" }).click();
  await expect(
    page.getByText("Equivalent expressions: the structure agrees."),
  ).toBeVisible();
  await context.setOffline(false);
});

test("atlas goal filters, search, keyboard selection and mobile outline preserve dependencies", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Knowledge map", exact: true })
    .click();
  await expect(
    page
      .locator(".map-detail")
      .getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All concepts", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search atlas" })
    .fill("Electric field:");
  await expect(page.locator(".map-scroll [role=button]")).toHaveCount(1);
  const node = page.locator(".map-scroll [role=button]").first();
  await node.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.locator(".map-detail").getByText("Build these first"),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".atlas-outline")).toBeVisible();
  await page
    .getByRole("button", { name: "Take me there", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
});

test("math keyboard inserts at selection and feedback receives focus", async ({
  page,
}) => {
  await skipPlacement(page);
  const answer = page.getByLabel("Your answer", { exact: true });
  await answer.fill("123");
  await answer.evaluate((el: HTMLInputElement) => el.setSelectionRange(1, 2));
  await page
    .getByRole("button", { name: "Math keyboard +", exact: true })
    .click();
  await page
    .locator(".math-keyboard")
    .getByRole("button", { name: "x", exact: true })
    .click();
  await expect(answer).toHaveValue("1x3");
  await answer.fill("unsupported(");
  await page.getByLabel("Unit", { exact: true }).fill("m");
  await page.getByRole("button", { name: "Fairly sure", exact: true }).click();
  await page
    .getByRole("button", { name: "Check my reasoning", exact: true })
    .click();
  // Numeric parse failure is explicit feedback; only checker-indeterminate responses suppress evidence.
  await expect(page.locator(".feedback")).toBeVisible();
  await expect(page.locator(".feedback")).toBeFocused();
});

test("tablet and mobile atlas, diagnostic and completed session stay accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Find my starting point", exact: true })
    .waitFor();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByRole("button", {
      name: "Pause placement and use the evidence so far",
    })
    .click();
  await page.getByRole("button", { name: "Start my first session" }).click();
  await firstResponse(page);
  await page
    .getByRole("button", { name: "Finish this session", exact: true })
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Knowledge map", exact: true })
    .last()
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
