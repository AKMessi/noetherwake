/** WCAG relative luminance against the actual stylesheet tokens, not design estimates. */
import { readFileSync, writeFileSync } from "node:fs";
const css = readFileSync("app/globals.css", "utf8");
const light = css.match(/:root \{([\s\S]*?)\}/)![1],
  dark = css.match(/:root\[data-theme="dark"\] \{([\s\S]*?)\}/)![1];
const parse = (s: string) =>
  Object.fromEntries(
    [...s.matchAll(/--([\w-]+):\s*(\d+) (\d+) (\d+)/g)].map((m) => [
      m[1],
      m.slice(2).map(Number),
    ]),
  );
const lum = (rgb: number[]) =>
  rgb
    .map((v) => v / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a: number[], b: number[]) => {
  const x = lum(a),
    y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const results = [];
let failed = false;
for (const [theme, tokens] of [
  ["light", parse(light)],
  ["dark", parse(dark)],
] as const) {
  for (const bg of [
    "ground",
    "sheet",
    "inset",
    "cobalt-tint",
    "ochre-tint",
    "ok-tint",
    "err-tint",
  ])
    for (const fg of [
      "ink",
      "ink-2",
      "ink-3",
      "cobalt",
      "ochre-ink",
      "ok",
      "err",
    ]) {
      // Correctness text and uncertainty notes use their own tint, not another semantic tint.
      if (
        bg.endsWith("tint") &&
        !["ink", "ink-2", "ink-3"].includes(fg) &&
        bg !== `${fg.replace("-ink", "")}-tint`
      )
        continue;
      const contrast = ratio(tokens[fg], tokens[bg]);
      results.push({
        theme,
        foreground: fg,
        background: bg,
        ratio: +contrast.toFixed(3),
        minimum: 4.5,
        pass: contrast >= 4.5,
      });
      if (contrast < 4.5) failed = true;
    }
  for (const bg of ["ground", "sheet", "inset"])
    for (const fg of ["rule-strong", "focus", "ink", "cobalt", "ochre-ink"]) {
      const contrast = ratio(tokens[fg], tokens[bg]);
      results.push({
        theme,
        foreground: fg,
        background: bg,
        ratio: +contrast.toFixed(3),
        minimum: 3,
        pass: contrast >= 3,
      });
      if (contrast < 3) failed = true;
    }
  const contrast = ratio(tokens["button-text"], tokens.cobalt);
  results.push({
    theme,
    foreground: "button-text",
    background: "cobalt",
    ratio: +contrast.toFixed(3),
    minimum: 4.5,
    pass: contrast >= 4.5,
  });
  if (contrast < 4.5) failed = true;
}
writeFileSync(
  "docs/working-page-contrast.json",
  JSON.stringify(
    {
      method:
        "WCAG sRGB relative luminance; decorative hairlines/grid are not control boundaries.",
      results,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    {
      pairs: results.length,
      minimumText: Math.min(
        ...results.filter((r) => r.minimum === 4.5).map((r) => r.ratio),
      ),
      minimumBoundary: Math.min(
        ...results.filter((r) => r.minimum === 3).map((r) => r.ratio),
      ),
      failures: results.filter((r) => !r.pass),
    },
    null,
    2,
  ),
);
if (failed) process.exitCode = 1;
