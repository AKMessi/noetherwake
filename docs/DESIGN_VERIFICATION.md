# The Working Page — verification and delivery

Verified on 3 November 2026 (Asia/Kolkata), in `/home/akmessi/noetherwake`. This is the current presentation release; earlier screenshot directories and engineering reports are historical. The static production export is `out/`. This redesign was committed and pushed to GitHub in working change sets. No new Vercel CLI deployment was run for this redesign.

## Delivered behaviour

The application now uses the sheet-and-margin system, warm paper and blueprint themes, locally hosted Newsreader / Instrument Sans / IBM Plex Mono, a wake wordmark, matching install icons, and unified Today / Atlas / Library / Lab / Field notes navigation. Static content stands freely; measured and operated surfaces carry the few containers. The initial generic introduction renders from HTML; saved learner counts are withheld and controls remain inert while storage is read.

Today exposes actual recommendations, scoped route counts, evidence rulers and retrieval dates. Lessons preserve the authored reading and KaTeX, with numbered sections, equation wrappers, worked-example rules, a marked derivation stepper, margin justifications, connections and mobile practice access. Practice uses native confidence radios, retained in-tab drafts, engine-owned feedback and canonical-unit answer gaps. The atlas uses deterministic longest-path layers and foundation-first strand lanes, keyboard traversal, pointer/touch pan, pinch/controlled zoom, a list equivalent and an ancestor trace. The laboratory draws equal-scale analytic trajectories and computed differences; exploration does not change mastery.

Field notes are a dated ledger with real responses and reflections. Historical marks appear only when replay through the unchanged engine reproduces stored knowledge. Session completion captures exact current-session before/after states. Preferences retains the working settings, previews validated version-1 JSON before replacement, and requires typed confirmation for deletion. Both colour themes update browser chrome and the local manifest. The engine, authored concept source, IndexedDB version and Vercel configuration were preserved.

## Automated verification

| Check | Actual result |
| --- | --- |
| `npm run verify` | Passed strict TypeScript, 28 unit tests, seeded evaluation and production build |
| `npm run build` | Passed after the final UI/asset refinements; static export, offline manifest and budgets valid |
| Content validation | 67 concepts, 201 templates, 201,000 verified variants; DAG, MDX, links, mathematics, units and formulas valid |
| Chromium browser suite | 22 cases passed; subsequent placement/atlas/touch refinements passed 3 focused regressions |
| WebKit browser suite | 20 passed, 2 skipped: Chromium/CDP performance and CDP touch dispatch only |
| Transient-state axe scans | 16 scans, no violations, at 1440×900 and 390×844 |
| Palette verification | 106 intended text/control pairs passed in light and dark |
| Visual matrix | 129 captures; no page overflow, browser exceptions or outside-origin font/script requests |
| Motion | Real-time laboratory, prerequisite trace and session evidence recording; reduced-motion final states passed |

Browser journeys exercise placement response/skip/pause/resume, lessons and marked derivations, practice confidence and feedback, session completion, in-tab draft retention, a version-1 export/import round trip, invalid JSON, typed deletion, missing-prerequisite routing, retrieval evidence, offline reload and offline symbolic equivalence, route selection, filters, map keys and touch, and keyboard-only onboarding/lesson/practice/lab/data actions. Axe checks cover representative populated, light/dark, desktop/tablet/mobile screens; the supplementary scans cover the goal dialog, placement, unanswered/incorrect practice, completion, notes, import preview and deletion confirmation.

The synthetic learner benchmark reproduces estimator MAE 0.0029148693, Brier error 0.0002554159 and normalized diagnostic depth error 0.025. Engine policy was not changed. These results do not establish learning effectiveness in humans.

## Measurements

- Static output: **4,824,159 bytes**, against 12,000,000.
- All gzip JavaScript: **704,202 bytes**, against 2,000,000.
- Largest gzip chunk: **158,939 bytes**, against 700,000.
- Offline cache: **125 same-origin assets**, including fonts, lessons, checker chunks, workers, icons and manifests.
- Latest Chromium 156.0.8078.4 mobile LCP: **688 ms**, against the unchanged **2,000 ms** gate.
- Controls ready after local hydration: **3124 ms** in that same throttled run. This is reported separately from LCP.
- Initial measured resource transfer: **693,124 bytes**. This differs from total build size because secondary screens load separately.
- Performance conditions: 390×844, 4× CPU slowdown, 60 ms latency, 1,600 kbps download bandwidth. This is synthetic desktop-browser throttling, not a physical-phone measurement.
- Minimum measured text contrast: **4.548:1**. Minimum functional-boundary contrast: **3.391:1**. Exact token pairs are in `working-page-contrast.json`. Decorative grid/rule opacity and deliberately dimmed trace context are separate from those text/control pairs; this report does not claim every decorative SVG stroke reaches 3:1.

The first throttled LCP check failed at 4,012 ms. Rendering the truthful static introduction before hydration, retaining inert controls and withholding learner counts resolved it without relaxing the budget. Verification also caught an invalid ARIA label on the placement ticks, a sheet drag followed by an unwanted click, an old mobile canvas CSS rule, and prematurely captured lazy screens. They were corrected and their affected checks rerun. A filtered-list assertion and a supposed incorrect zero answer were also corrected in QA rather than changing correct application behaviour.

## Visual evidence

`working-page-preview.json` lists all captures and the fixture method. The four browser viewports are 1440×900, 1024×768, 768×1024 and 390×844. Captures include full pages and selected instruments, so a PNG's total height or a cropped instrument's width can differ from its viewport dimensions. Every populated context uses disposable version-1 data generated, graded and observed through the actual engine, loaded through the application's import preview and confirmation. No fixture is injected into the shipped interface or an existing learner profile.

Representative images:

- [Desktop opening](images/working-page/1440-opening.png) and [mobile opening](images/working-page/390-opening.png).
- [Returning Today](images/working-page/1440-returning.png).
- [Lesson](images/working-page/1440-lesson.png), [derivation](images/working-page/1440-derivation.png), [mobile sticky action](images/working-page/390-lesson-sticky.png).
- [Numeric feedback](images/working-page/390-practice-incorrect.png) and [low-confidence correct feedback](images/working-page/1440-practice-correct-low-confidence.png).
- [Atlas](images/working-page/1440-atlas-default.png), [trace](images/working-page/1440-atlas-trace.png), [mobile details](images/working-page/390-atlas-selected.png).
- [Tested laboratory](images/working-page/1440-lab-tested.png), [field notes](images/working-page/1440-notes-populated.png), [import preview](images/working-page/390-import-preview.png).
- [Dark lesson](images/working-page/1440-dark-lesson.png) and [dark atlas](images/working-page/390-dark-atlas.png).
- [Signature-moment recording](images/working-page/signature-moments.webm): real-time application interaction, no staged history.

## Verified facts, adaptations and unchecked limits

Repository inspection confirmed KaTeX, Tailwind v4, existing dark mode, version-1 local storage and all three session budgets. The engine exposes probabilities, uncertainty intervals and per-concept confidence error, but no named evidence tiers, population calibration curve or lesson durations. The four display tiers and uncertainty/locked overlays are documented in DESIGN.md; they do not affect readiness or planning. Durations, calibration thresholds and curves were not invented.

Definitions and self-checks currently have concept-level authoring data, so connections are grouped once. Explicit paragraph anchors, reference-aware equation numbering, structured given-quantity lists and colour-marked unknowns need authored metadata. Incomplete retained histories explicitly withhold reconstructed historical marks. Session reflections remain persistent; unfinished drafts survive navigation within the current tab, not a reload. Route rulers wrap to retain 44px controls, and a dense map overview has the full-size List equivalent. These limits and priorities are recorded in ROADMAP.md.

There is no lint script or configured lint tool in this repository, so no lint result is claimed. OS file-picker keyboard operation, physical phones, manual screen-reader mathematics, all browser/OS combinations and human learning outcomes were not certified. Automated axe checks are not a full WCAG conformance claim. GitHub CI completion and a fresh Vercel publication were not asserted from these local checks.

## Reproduction

```sh
npm run verify
npm run test:e2e
TEST_BROWSER=webkit npm run test:e2e
npx tsx scripts/contrast.ts
npm run start
# In a second terminal, against the production preview:
npx tsx scripts/working-page-preview.ts
npx tsx scripts/working-page-a11y.ts
npx tsx scripts/working-page-motion.ts
```

Set `QA_ORIGIN` to another production preview origin when needed. Use `npx tsx scripts/icons.ts` to regenerate install icons from `public/icon.svg` with the existing Chromium dependency.
