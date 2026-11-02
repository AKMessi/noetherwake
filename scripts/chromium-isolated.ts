/** Some desktop Chromium variants exit after their final context closes. Keep the same
 * assertions, but run each case in a fresh process. Standard CI uses playwright.config.ts. */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const files = ["tests/journey.spec.ts", "tests/studio.spec.ts"];
const cases = files.flatMap((file) =>
  [...readFileSync(file, "utf8").matchAll(/test\(\s*"([^"]+)"/g)].map((m) => ({
    file,
    title: m[1],
  })),
);
if (!process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH)
  throw new Error(
    "Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to the installed compatible browser.",
  );
const results: { title: string; passed: boolean }[] = [];
for (const [index, c] of cases.entries()) {
  const pattern = c.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const result = spawnSync(
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      c.file,
      "--grep",
      pattern,
      "--output",
      `test-results/chromium-isolated/${index}`,
      "--reporter=line",
    ],
    { env: { ...process.env, TEST_BROWSER: "chromium" }, encoding: "utf8" },
  );
  const passed = result.status === 0;
  results.push({ title: c.title, passed });
  console.log(
    `${passed ? "PASS" : "FAIL"} ${index + 1}/${cases.length} ${c.title}`,
  );
  if (!passed) console.error(result.stdout, result.stderr);
}
const summary = {
  mode: "One fresh Chromium process per existing Playwright test; assertions unchanged",
  passed: results.filter((r) => r.passed).length,
  failed: results.filter((r) => !r.passed).length,
  results,
};
writeFileSync(
  "docs/chromium-isolated-results.json",
  JSON.stringify(summary, null, 2) + "\n",
);
console.log(JSON.stringify({ passed: summary.passed, failed: summary.failed }));
if (summary.failed) process.exitCode = 1;
