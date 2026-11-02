import { expect, type Page } from "@playwright/test";
import {
  ancestors,
  check,
  createLearner,
  depth,
  generate,
  getKnowledge,
  observe,
  type Learner,
} from "../../packages/engine/src/index";
import { readFileSync } from "node:fs";
import type { Concept } from "../../packages/engine/src/types";
const catalog = JSON.parse(
  readFileSync(
    new URL("../../lib/catalog.generated.json", import.meta.url),
    "utf8",
  ),
) as Concept[];
const concept = (id: string) => catalog.find((c) => c.id === id)!;
export const origin = process.env.QA_ORIGIN ?? "http://127.0.0.1:3000";
export async function nav(page: Page, label: string) {
  const width = page.viewportSize()?.width ?? 1440;
  await page
    .getByRole("navigation", {
      name:
        width < 768
          ? "Mobile navigation"
          : width < 1100
            ? "Tablet navigation"
            : "Main navigation",
    })
    .getByRole("button", { name: label, exact: true })
    .click();
  const selectors: Record<string, string> = {
    Today: ".working-today",
    Atlas: ".atlas-page",
    Library: ".library-page",
    Lab: ".working-lab",
    "Field notes": ".field-notes",
  };
  await expect(page.locator(selectors[label])).toBeVisible();
}
export async function preferences(page: Page) {
  const small = (page.viewportSize()?.width ?? 1440) < 1100;
  await page
    .locator(small ? ".topbar" : ".sidebar")
    .getByRole("button", { name: "Preferences", exact: true })
    .click();
  await expect(page.locator(".preferences-page")).toBeVisible();
}
export async function startPractice(page: Page) {
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Find my starting point →", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Skip placement; learn from my practice",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fractions & the whole", exact: true }),
  ).toBeVisible();
}
export async function answerFractions(
  page: Page,
  { correct = true, confidence = "Fairly sure", unit = "m" } = {},
) {
  const title = await page.locator("#question-title").textContent(),
    numbers = [...title!.matchAll(/(\d+)\/4/g)].map((m) => Number(m[1]));
  if (numbers.length !== 2)
    throw Error("Expected the authored first fractions family");
  let answer = correct ? (numbers[0] + numbers[1]) / 4 : 0;
  if (unit === "cm") answer *= 100;
  await page.getByLabel("Your answer", { exact: true }).fill(String(answer));
  await page.getByLabel("Unit", { exact: true }).fill(unit);
  await page.getByRole("radio", { name: confidence, exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".feedback")).toBeVisible();
}
export async function importFixture(page: Page, state: Learner) {
  await preferences(page);
  await page.locator("input[type=file]").setInputFiles({
    name: "working-page-qa-v1.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(state)),
  });
  await expect(
    page.getByRole("heading", { name: "Import preview", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Import and replace", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Backup restored");
}
/** Synthetic QA, never shipped to learners: generated answers are checked, then observed by the real engine. */
export async function learnerFixture(now = Date.now()): Promise<Learner> {
  const at = now - 8 * 60 * 60 * 1000;
  let state = createLearner(at, "conservation-energy");
  state = { ...state, onboarded: true, minutes: 5, theme: "light" };
  const ids = [...ancestors(catalog, "newton-2").keys()].sort(
    (a, b) => depth(catalog, a) - depth(catalog, b) || a.localeCompare(b),
  );
  const before = Object.fromEntries(
    ids.map((id) => [id, getKnowledge(state, id, at).p]),
  );
  let index = 0;
  for (const id of ids)
    for (let i = 0; i < (id === "newton-2" ? 2 : 5); i++) {
      const c = concept(id),
        item = generate(c, c.generators[i % c.generators.length], index + 73);
      const result = await check(item, item.answer, item.unit);
      if (!result.correct) throw Error(`Invalid QA fixture answer: ${id}`);
      state = observe(
        state,
        {
          concept: id,
          item: item.id,
          correct: result.correct,
          seconds: item.expectedSeconds,
          expectedSeconds: item.expectedSeconds,
          hints: 0,
          attempts: 1,
          confidence: i === 0 ? 0.25 : 0.9,
          difficulty: item.difficulty,
          at: at + ++index * 60000,
          guess: item.choices ? 1 / item.choices.length : undefined,
        },
        catalog,
      );
    }
  const c = concept("newton-2"),
    item = generate(c, c.generators[0], 97),
    result = await check(item, "0", item.unit);
  state = observe(
    state,
    {
      concept: c.id,
      item: item.id,
      correct: result.correct,
      seconds: item.expectedSeconds,
      expectedSeconds: item.expectedSeconds,
      hints: 0,
      attempts: 1,
      confidence: 0.9,
      difficulty: item.difficulty,
      at: at + ++index * 60000,
      misconception: result.misconception,
    },
    catalog,
  );
  for (const [id, wantCorrect] of [
    ["charge", false],
    ["integral", true],
    ["power-rule", true],
  ] as const) {
    const c = concept(id),
      item = generate(c, c.generators[0], 100 + index),
      result = await check(item, wantCorrect ? item.answer : "0", item.unit);
    before[id] = getKnowledge(state, id, at).p;
    state = observe(
      state,
      {
        concept: id,
        item: item.id,
        correct: result.correct,
        seconds: item.expectedSeconds,
        expectedSeconds: item.expectedSeconds,
        hints: 0,
        attempts: 1,
        confidence: 0.65,
        difficulty: item.difficulty,
        at: at + ++index * 60000,
      },
      catalog,
    );
    ids.push(id);
  }
  const session = {
    at: at + index * 60000,
    concepts: ids,
    correct: state.history.filter((e) => e.correct).length,
    total: state.history.length,
    minutes: Math.round(state.history.reduce((n, e) => n + e.seconds, 0) / 60),
    reflection:
      "QA fixture: compare the model boundary before choosing a relationship.",
    changes: Object.fromEntries(
      ids.map((id) => [
        id,
        getKnowledge(state, id, at + index * 60000).p - before[id],
      ]),
    ),
  };
  return { ...state, sessions: [session], reflection: session.reflection };
}
export async function openLesson(page: Page, title: string) {
  await nav(page, "Library");
  await page.getByLabel("Search concepts").fill(title);
  await page.locator(".library-row").filter({ hasText: title }).first().click();
  if ((page.viewportSize()?.width ?? 1440) < 1024)
    await page
      .getByRole("button", { name: "Expand concept details", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Open lesson →", exact: true })
    .click();
  await expect(page.locator(".lesson-prose").first()).toBeVisible();
}
export async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
}
