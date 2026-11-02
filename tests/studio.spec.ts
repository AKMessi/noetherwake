import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  nav,
  preferences,
  importFixture,
  learnerFixture,
  openLesson,
  noOverflow,
  origin,
  startPractice,
  answerFractions,
} from "./support/working-page";

test("projectile prediction, equal-scale SI readouts, gravity and no fabricated mastery", async ({
  page,
}) => {
  await page.goto(origin);
  await nav(page, "Lab");
  await expect(
    page.getByRole("button", { name: "Test my prediction →", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "60°", exact: true }).click();
  await expect(page.locator(".prediction-label")).toContainText(
    "Your prediction: 60°",
  );
  await page
    .getByRole("button", { name: "Test my prediction →", exact: true })
    .click();
  await expect(page.locator(".lab-outcome")).toContainText(
    "45° travelled furthest: 14.68",
  );
  await expect(page.locator(".trajectory-row")).toHaveCount(3);
  await page.getByLabel("Explore launch angle").fill("40");
  await expect(page.getByTestId("lab-range")).toContainText("14.46");
  await page.getByLabel("Gravity setting").selectOption("moon");
  await page.getByRole("button", { name: "45°", exact: true }).click();
  await page
    .getByRole("button", { name: "Test my prediction →", exact: true })
    .click();
  await expect(page.getByTestId("lab-range")).toContainText("88.89");
  await expect(page.locator(".figure-caption").first()).toContainText(
    "Exploration adds no mastery evidence",
  );
  await nav(page, "Field notes");
  await expect(
    page.getByRole("heading", { name: "Nothing recorded yet.", exact: true }),
  ).toBeVisible();
});

test("routes are real prerequisite indexes, expand unmet stops and change the active route", async ({
  page,
}) => {
  await page.goto(origin);
  await page.locator(".route-index-row").nth(1).click();
  await expect(page.locator(".route-stops>li")).toHaveCount(20);
  await page.locator(".route-stop-state .text-button").first().click();
  await expect(page.locator(".route-unmet")).toBeVisible();
  await page
    .getByRole("button", { name: "Use this route →", exact: true })
    .click();
  await page.reload();
  await expect(page.locator(".sidebar .route-label")).toContainText(
    "Build calculus intuition",
  );
});

test("library filters search, readiness and strand, including an honest empty state", async ({
  page,
}) => {
  await page.goto(origin);
  await nav(page, "Library");
  await page.getByRole("button", { name: "Physics", exact: true }).click();
  await page.getByLabel("Filter by readiness").selectOption("ready");
  await page.getByLabel("Search concepts").fill("no-such-concept");
  await expect(
    page.getByRole("heading", { name: "Nothing matches ‘no-such-concept’." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await expect(page.locator(".library-row")).toHaveCount(67);
  await page.getByLabel("Search concepts").fill("Fractions");
  await expect(page.locator(".library-row")).toHaveCount(1);
});

test("atlas spatial keys, search shortcut, fit, trace clearing and accessible list work", async ({
  page,
}) => {
  await page.goto(origin);
  await nav(page, "Atlas");
  const root = page.locator('[data-concept="fractions"]');
  await root.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".working-map-node:focus")).not.toHaveAttribute(
    "data-concept",
    "fractions",
  );
  await page.keyboard.press("/");
  await expect(page.getByLabel("Search atlas")).toBeFocused();
  await page.getByLabel("Search atlas").fill("Electric field:");
  await page.keyboard.press("Enter");
  await page
    .getByRole("button", { name: "Trace the route here →", exact: true })
    .click();
  await expect(page.locator(".trace-caption")).toContainText("unmet");
  await page.keyboard.press("Escape");
  await expect(page.locator(".trace-caption")).toHaveCount(0);
  await page.getByRole("button", { name: "Fit", exact: true }).click();
  await page.getByRole("button", { name: "List", exact: true }).click();
  await expect(page.locator(".atlas-list>button")).toHaveCount(1);
  await page.getByLabel("Search atlas").fill("");
  await expect(page.locator(".atlas-list>button")).toHaveCount(67);
});

test("reduced motion preserves all three signature final states", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startPractice(page);
  await answerFractions(page, { correct: false });
  await expect(page.locator(".gap-correct")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.getByRole("button", { name: "End session", exact: true }).click();
  await expect(page.locator(".evidence-shift .mono")).toBeVisible();
  await nav(page, "Atlas");
  await page.getByLabel("Search atlas").fill("Electric field:");
  await page.keyboard.press("Enter");
  await page
    .getByRole("button", { name: "Trace the route here →", exact: true })
    .click();
  await expect(page.locator(".working-map-node.traced").first()).toHaveCSS(
    "animation-duration",
    "0s",
  );
  await nav(page, "Lab");
  await page.getByRole("button", { name: "30°", exact: true }).click();
  await page
    .getByRole("button", { name: "Test my prediction →", exact: true })
    .click();
  await expect(page.locator(".lab-outcome .gap-figure")).toBeVisible();
});

test("four responsive layouts, dark theme, mobile sheet and sticky lesson action remain usable", async ({
  page,
}) => {
  test.setTimeout(120000);
  const fixture = await learnerFixture();
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin);
    await importFixture(page, fixture);
    await nav(page, "Today");
    await expect(page.locator(".today-next")).toBeVisible();
    await noOverflow(page);
    await openLesson(page, "Force, mass & the rate of change");
    await page.locator(".lesson-practice").scrollIntoViewIfNeeded();
    await noOverflow(page);
    if (width < 768) {
      await expect(page.locator(".lesson-sticky-action")).toHaveCount(0);
      await page.evaluate(() => {
        const prose = document.querySelector<HTMLElement>(".lesson-reading")!;
        window.scrollTo(
          0,
          scrollY +
            prose.getBoundingClientRect().top +
            prose.offsetHeight * 0.65,
        );
      });
      await expect(page.locator(".lesson-sticky-action")).toBeVisible();
    }
    await preferences(page);
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await nav(page, "Atlas");
    await noOverflow(page);
    if (width < 1024) {
      await page
        .getByRole("button", { name: "Expand concept details", exact: true })
        .click();
      await expect(page.locator(".concept-detail")).toHaveClass(/expanded/);
    }
    await preferences(page);
    await page.getByRole("button", { name: "Light", exact: true }).click();
  }
});

test("production fonts and scripts stay on the application origin", async ({
  page,
}) => {
  const outside: string[] = [];
  page.on("request", (request) => {
    if (
      ["font", "script"].includes(request.resourceType()) &&
      new URL(request.url()).origin !== new URL(origin).origin
    )
      outside.push(request.url());
  });
  await page.goto(origin, { waitUntil: "networkidle" });
  await openLesson(page, "Fractions & the whole");
  await page.evaluate(() => document.fonts.ready);
  expect(outside).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check("19px prose"))).toBe(
    true,
  );
});

test("populated evidence, practice feedback, and preferences meet axe AA", async ({
  page,
}) => {
  await page.goto(origin);
  await importFixture(page, await learnerFixture());
  for (const label of ["Today", "Field notes", "Lab"]) {
    await nav(page, label);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  await preferences(page);
  const settings = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(settings.violations).toEqual([]);
});

test("keyboard-only placement, lesson, practice, lab and data controls remain operable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(origin);
  async function tabTo(target: ReturnType<typeof page.locator>) {
    await expect(target).toBeVisible();
    for (let i = 0; i < 180; i++) {
      if (await target.evaluate((el) => el === document.activeElement)) return;
      await page.keyboard.press("Tab");
    }
    throw Error("Control was not reachable with Tab");
  }
  await expect(
    page.getByRole("button", { name: "Find my starting point →", exact: true }),
  ).toBeEnabled();
  await tabTo(
    page.getByRole("button", { name: "Find my starting point →", exact: true }),
  );
  await page.keyboard.press("Enter");
  await tabTo(
    page.getByRole("button", {
      name: "Skip placement; learn from my practice",
      exact: true,
    }),
  );
  await page.keyboard.press("Enter");
  await tabTo(page.getByLabel("Your answer", { exact: true }));
  await page.keyboard.insertText("0");
  await tabTo(page.getByLabel("Unit", { exact: true }));
  await page.keyboard.insertText("m");
  await tabTo(page.getByRole("radio", { name: "Guessing", exact: true }));
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await tabTo(page.getByRole("button", { name: "Check answer", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page.locator(".feedback")).toBeVisible();
  await tabTo(page.getByRole("button", { name: "End session", exact: true }));
  await page.keyboard.press("Enter");
  await tabTo(page.getByRole("button", { name: "Back to Today", exact: true }));
  await page.keyboard.press("Enter");
  await tabTo(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "Library", exact: true }),
  );
  await page.keyboard.press("Enter");
  await tabTo(page.getByLabel("Search concepts"));
  await page.keyboard.insertText("Fractions");
  await tabTo(page.locator(".library-row").first());
  await page.keyboard.press("Enter");
  await tabTo(page.getByRole("button", { name: "Open lesson →", exact: true }));
  await page.keyboard.press("Enter");
  await tabTo(page.locator(".working-derivation"));
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".derivation-lines li:visible")).toHaveCount(2);
  await tabTo(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "Lab", exact: true }),
  );
  await page.keyboard.press("Enter");
  await tabTo(page.getByRole("button", { name: "60°", exact: true }));
  await page.keyboard.press("Enter");
  await tabTo(
    page.getByRole("button", { name: "Test my prediction →", exact: true }),
  );
  await page.keyboard.press("Enter");
  await expect(page.locator(".lab-outcome")).toBeVisible();
  await tabTo(
    page
      .locator(".sidebar")
      .getByRole("button", { name: "Preferences", exact: true }),
  );
  await page.keyboard.press("Enter");
  await tabTo(page.getByRole("button", { name: "Export JSON", exact: true }));
  const download = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  expect((await download).suggestedFilename()).toMatch(/noetherwake-.*\.json/);
  await tabTo(
    page.getByRole("button", { name: "Clear local data", exact: true }),
  );
  await page.keyboard.press("Enter");
  await tabTo(page.getByLabel("Type delete to confirm"));
  await page.keyboard.insertText("delete");
  await expect(
    page.getByRole("button", { name: "Delete local data", exact: true }),
  ).toBeEnabled();
  await tabTo(
    page
      .locator(".clear-confirmation")
      .getByRole("button", { name: "Cancel", exact: true }),
  );
  await page.keyboard.press("Enter");
  await expect(page.locator(".clear-confirmation")).toHaveCount(0);
});

test("touch selection, pointer panning and pinch zoom work on the mobile atlas", async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "CDP touch dispatch uses Chromium");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await page.goto(origin);
    await nav(page, "Atlas");
    await page.locator('[data-concept="fractions"]').tap();
    await expect(page.locator(".detail-heading")).toContainText("Fractions");
    const box = (await page.locator(".map-scroll").boundingBox())!,
      x = box.x + box.width * 0.6,
      y = box.y + box.height * 0.5,
      cdp = await context.newCDPSession(page);
    const before = await page
      .locator(".map-scroll")
      .evaluate((el) => ({ left: el.scrollLeft, top: el.scrollTop }));
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - 60, y: y - 80 }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    const after = await page
      .locator(".map-scroll")
      .evaluate((el) => ({ left: el.scrollLeft, top: el.scrollTop }));
    expect(after.top > before.top || after.left > before.left).toBe(true);
    const width = await page.locator(".map-scroll>svg").getAttribute("width");
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: x - 30, y },
        { x: x + 30, y },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: x - 60, y },
        { x: x + 60, y },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(async () =>
        Number(await page.locator(".map-scroll>svg").getAttribute("width")),
      )
      .toBeGreaterThan(Number(width));
  } finally {
    await context.close();
  }
});
