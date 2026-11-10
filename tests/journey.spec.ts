import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, writeFile } from "node:fs/promises";
import {
  startPractice,
  answerFractions,
  nav,
  preferences,
  importFixture,
  learnerFixture,
  openLesson,
  noOverflow,
  origin,
} from "./support/working-page";

test("practice, exact evidence shift, reflection and a version-one export/import round trip", async ({
  page,
}) => {
  await startPractice(page);
  await answerFractions(page);
  await expect(page.locator(".gap-figure")).toContainText(
    "Matches within tolerance",
  );
  await page.getByRole("button", { name: "End session", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Session complete", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".evidence-shift")).toHaveCount(1);
  await page
    .getByLabel("What clicked? What still feels uncertain?")
    .fill("Keep the pieces equal.");
  await page
    .getByRole("button", { name: "Save reflection", exact: true })
    .click();
  await nav(page, "Field notes");
  await expect(page.locator(".session-ledger")).toContainText(
    "Keep the pieces equal.",
  );
  await expect(page.locator(".ledger-effect .evidence-shift")).toHaveCount(1);
  await preferences(page);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const file = await downloaded;
  const before = JSON.parse(await readFile((await file.path())!, "utf8"));
  await page.locator("input[type=file]").setInputFiles((await file.path())!);
  await expect(
    page.getByRole("heading", { name: "Import preview" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Import and replace" }).click();
  await expect(page.getByRole("status")).toContainText("Backup restored");
  const again = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const after = JSON.parse(
    await readFile((await (await again).path())!, "utf8"),
  );
  expect(after).toEqual(before);
  await page.reload();
  await nav(page, "Field notes");
  await expect(page.locator(".session-ledger")).toContainText(
    "Keep the pieces equal.",
  );
});

test("placement skips without fabricated evidence, pauses and resumes after reload", async ({
  page,
}) => {
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Find my starting point →", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  const placementAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(placementAudit.violations).toEqual([]);
  await page
    .getByRole("button", { name: "I don’t know yet", exact: true })
    .click();
  await expect(page.locator(".diagnostic-heading")).toContainText("question 2");
  await page
    .getByRole("button", { name: "Pause placement", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("button", { name: "Continue placement →", exact: true })
    .click();
  await expect(page.locator(".diagnostic-heading")).toContainText("question 2");
  await page
    .getByRole("button", { name: "Use the evidence so far →", exact: true })
    .click();
  await expect(page.locator(".placement-result")).toContainText(
    "0 recorded answers",
  );
  await page.getByRole("button", { name: /^Begin:/ }).click();
  await expect(page.locator(".lesson-prose").first()).toBeVisible();
});

test("placement records an actual graded response and exposes a real frontier", async ({
  page,
}) => {
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Find my starting point →", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Find my starting point", exact: true })
    .click();
  await page.getByLabel("Your answer", { exact: true }).fill("0");
  await page.getByRole("radio", { name: "Guessing", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Next placement question", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Use the evidence so far →", exact: true })
    .click();
  await expect(page.locator(".placement-result")).toContainText(
    "1 recorded answers",
  );
  await expect(page.locator(".placement-excerpt>button")).toHaveCount(1);
});

test("locked concepts expose a trace and route to an engine-ready lesson", async ({
  page,
}) => {
  await page.goto(origin);
  await nav(page, "Library");
  await page.getByLabel("Search concepts").fill("Electric field:");
  await page.locator(".library-row").first().click();
  await page
    .getByRole("button", { name: "Trace the route here →", exact: true })
    .click();
  await expect(page.locator(".prerequisite-trace")).toContainText("unmet");
  await page.locator(".detail-actions .primary").click();
  await expect(page.locator(".lesson-prose").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Prerequisites to work on first" }),
  ).toHaveCount(0);
});

test("numeric feedback uses canonical units and confidence is a native radio group", async ({
  page,
}) => {
  await startPractice(page);
  const radios = page.getByRole("radio", { name: "Guessing", exact: true });
  await radios.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "Leaning", exact: true }),
  ).toBeChecked();
  await answerFractions(page, { unit: "cm", confidence: "Guessing" });
  await expect(page.locator(".gap-figure")).toContainText(
    "Matches within tolerance",
  );
  await expect(page.locator(".feedback-title")).toContainText("Correct");
});

test("incorrect feedback identifies the measured gap and persists a review opportunity", async ({
  page,
}) => {
  await startPractice(page);
  await answerFractions(page, { correct: false, confidence: "Certain" });
  await expect(page.locator(".gap-figure")).toContainText(
    "relative error 100%",
  );
  await page.getByRole("button", { name: "End session", exact: true }).click();
  await nav(page, "Field notes");
  await expect(page.locator(".ledger-verdict")).toContainText("Incorrect");
  await page
    .getByRole("button", { name: "Revisit the idea →", exact: true })
    .click();
  await expect(page.locator(".lesson-prose").first()).toBeVisible();
});

test("validated import is atomic and typed deletion is explicit", async ({
  page,
}) => {
  await page.goto(origin);
  await importFixture(page, await learnerFixture());
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect(page.locator(".data-error")).toContainText(
    "Import did not change",
  );
  await nav(page, "Field notes");
  await expect(page.locator(".ledger-entry")).not.toHaveCount(0);
  await preferences(page);
  await page
    .getByRole("button", { name: "Clear local data", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Delete local data", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Type delete to confirm").fill("delete");
  await page
    .getByRole("button", { name: "Delete local data", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Local learner data cleared." }),
  ).toBeVisible();
  await page.reload();
  await nav(page, "Field notes");
  await expect(
    page.getByRole("heading", { name: "Nothing recorded yet.", exact: true }),
  ).toBeVisible();
});

test("production offline reload preserves on-device evidence and symbolic grading", async ({
  page,
  context,
}) => {
  await startPractice(page);
  await answerFractions(page);
  await page.getByRole("button", { name: "End session", exact: true }).click();
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) throw Error("Worker did not activate");
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await nav(page, "Field notes");
  await expect(page.locator(".ledger-entry")).toHaveCount(1);
  await openLesson(page, "Fractions & the whole");
  await expect(page.locator(".lesson-prose")).toHaveCount(4);
  await context.setOffline(false);
});

test("keyboard derivation reveal, math keyboard insertion, and practice resumption", async ({
  page,
}) => {
  await startPractice(page);
  await page.getByRole("button", { name: /Math keyboard/ }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("12");
  await page
    .getByLabel("Your answer", { exact: true })
    .evaluate((input: HTMLInputElement) => input.setSelectionRange(1, 1));
  await page.getByRole("button", { name: "^", exact: true }).click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "1^2",
  );
  await nav(page, "Today");
  await page
    .getByRole("button", { name: "Resume practice →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "1^2",
  );
  await nav(page, "Library");
  await page.getByLabel("Search concepts").fill("Fractions");
  await page.locator(".library-row").first().click();
  await page
    .getByRole("button", { name: "Open lesson →", exact: true })
    .click();
  await page.locator(".working-derivation").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".derivation-lines li:visible")).toHaveCount(2);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".derivation-lines li:visible")).toHaveCount(1);
});

test("desktop, tablet and mobile key screens meet automated axe AA checks in both themes", async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin);
    await noOverflow(page);
    let results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await preferences(page);
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await nav(page, "Atlas");
    await noOverflow(page);
    results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await nav(page, "Library");
    await page.getByLabel("Search concepts").fill("Fractions");
    await page.locator(".library-row").first().click();
    if (width < 1024)
      await page
        .getByRole("button", { name: "Expand concept details", exact: true })
        .click();
    await page
      .getByRole("button", { name: "Open lesson →", exact: true })
      .click();
    await noOverflow(page);
    results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});

test("mobile emulated loading meets measured LCP and transfer budgets", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "CDP throttling requires Chromium");
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 60,
    downloadThroughput: (1600 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const w = window as Window & { qaReady?: number };
    new MutationObserver(() => {
      const shell = document.querySelector(".app-shell");
      if (shell && !shell.hasAttribute("inert") && w.qaReady === undefined)
        w.qaReady = performance.now();
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["inert"],
    });
    new PerformanceObserver((list) => {
      const entry = list.getEntries().at(-1);
      if (entry)
        (window as Window & { qaLcp?: number }).qaLcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto(origin, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => ({
    lcp: (window as Window & { qaLcp?: number }).qaLcp ?? 0,
    controlsReadyMs: (window as Window & { qaReady?: number }).qaReady ?? null,
    bytes: performance
      .getEntriesByType("resource")
      .reduce((n, e) => n + (e as PerformanceResourceTiming).transferSize, 0),
  }));
  console.log("Working Page mobile metrics", metrics);
  await writeFile(
    "docs/perf-results.json",
    JSON.stringify(
      {
        ...metrics,
        cpuSlowdown: 4,
        latencyMs: 60,
        bandwidthKbps: 1600,
        viewport: "390x844",
        hardware: "Synthetic Chromium throttling; not a physical phone",
        browserVersion: page.context().browser()?.version(),
        lcpBudgetMs: 2000,
      },
      null,
      2,
    ) + "\n",
  );
  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.lcp).toBeLessThan(2000);
  expect(metrics.bytes).toBeLessThan(3000000);
});

test("symbolic equivalence works after the application goes offline", async ({
  page,
  context,
}) => {
  await page.goto(origin);
  await importFixture(page, await learnerFixture());
  await openLesson(page, "Power rule & local scaling");
  await page
    .getByRole("button", { name: "Practice this →", exact: true })
    .first()
    .click();
  await expect(page.locator("#question-title")).toContainText("Differentiate");
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  // Reload keeps evidence; start another engine-selected symbolic item from the imported one-observation state.
  await openLesson(page, "Power rule & local scaling");
  await page
    .getByRole("button", { name: "Practice this →", exact: true })
    .first()
    .click();
  const title = await page.locator("#question-title").textContent(),
    coefficient = Number(title!.match(/Differentiate (\d+)x/)![1]);
  await context.setOffline(true);
  await page
    .getByLabel("Your answer", { exact: true })
    .fill(`${coefficient}*x+${coefficient}*x`);
  await page.getByRole("radio", { name: "Fairly sure", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".feedback-title")).toContainText("Correct");
  await context.setOffline(false);
});
