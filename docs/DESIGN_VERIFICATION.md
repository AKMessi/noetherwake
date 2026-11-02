# Curiosity Studio — verification and delivery

Verified on 2 November 2026 from the canonical Linux checkout, `/home/akmessi/noetherwake`. The static production build is in `out/`. This redesign has not been deployed to the existing public Vercel site.

## What changed

The studio replaces the previous visual system with warm paper, carbon panels, chartreuse actions, original vector illustrations and bundled local typography. The desktop sidebar and compact mobile navigation frame a new learning home. The primary mobile action remains inside the first 390×844 viewport.

The home includes a prediction-first projectile laboratory with Earth/Moon gravity, SI measurements, angle exploration and an analytic trajectory. Exploration adds no learner evidence. Three curated expeditions expose real curriculum landmarks, prerequisite states and an explicit choice of direction. The library combines domain, strand, readiness and text filters with a working reset. Lessons display their central idea, model boundary, linked foundations, downstream applications and an authored misconception. A sticky reading navigator connects explanation, experiment and practice. The journal surfaces latest incorrect or supported responses and stored reflections without inventing a diagnosis.

Eight authored lesson bodies were expanded: fractions, units, vectors, derivatives, integrals, Newton’s second law, conservation of energy and electric fields. They now contain concrete mechanisms, worked calculations, scale/unit checks and model limitations. The other 59 lessons retain their existing authored content and parameter instruments. All 67 remain validated; no empty curriculum nodes were added.

## Automated results

- Strict TypeScript check passes.
- **24 engine unit tests pass**, including three analytic projectile-model tests covering symmetry, gravity scaling, endpoint/apex consistency and invalid input.
- The deterministic synthetic evaluation passes and reproduces estimator MAE **0.0029148693**, Brier error **0.0002554159** and normalized diagnostic depth error **0.025**. Learning policies were preserved. These simulations do not establish human learning effectiveness.
- **67 concepts, 201 templates and 201,000 generated variants pass** source schema, DAG, link, MDX, KaTeX, unit and answer validation. Expedition IDs and formulas also pass build-time validation.
- **WebKit: 18 passed, one skipped** in the final complete run. The only skip is its inapplicable Chromium/CDP performance test. Journeys cover placement, sessions, missing prerequisites, prediction/reveal, due reviews, validated backups, reload persistence, offline navigation, offline symbolic grading, keyboard use, reduced motion, filters, route selection, evidence review and the first-screen mobile action.
- **Chromium-compatible browser: all 19 cases pass in isolated processes**, with unchanged Playwright assertions. The installed browser is Helium 0.16.5.1 / Chromium **152.0.7977.82**. Details are in `chromium-isolated-results.json`.
- Axe AA checks pass on the exercised home, atlas, dark mobile lesson, diagnostic, summary and revealed-laboratory states.

The production build generates **108 same-origin cached assets**. Measured output is **4,257,304 bytes**; combined gzip JavaScript is **694,279 bytes**; the largest gzip JavaScript chunk is **158,939 bytes**. All three configured size budgets pass. These are total build sizes, not a claim that every chunk transfers on initial navigation.

The final Chromium/CDP mobile measurement is **876 ms LCP** at 390×844, 4× CPU slowdown, 60 ms latency and 1,600 kbps download bandwidth. The existing 2,000 ms gate passes. This is a synthetic desktop-browser measurement, not a physical-phone result. Exact conditions and browser provenance are recorded in `perf-results.json`.

## Rendered review

`npx tsx scripts/studio-preview.ts` captures isolated disposable learner contexts against `npm run start`. **40 screenshots** under `images/curiosity-studio/` cover opening/home, experiment, expeditions, atlas, library, locked lesson, lesson reading, feedback, summary, journal, returning learner and due-review states at **1440×900**, **768×1024** and **390×844**, plus mobile dark home. The script checks horizontal overflow for every captured state and records browser runtime exceptions. None were detected. Captured answers and history are test practice, not production learner data.

Useful review images:

- [Desktop opening](images/curiosity-studio/desktop-opening.png)
- [Mobile opening](images/curiosity-studio/mobile-opening.png)
- [Projectile laboratory](images/curiosity-studio/desktop-experiment.png)
- [Expedition landmarks](images/curiosity-studio/desktop-expeditions.png)
- [Lesson reading](images/curiosity-studio/tablet-lesson.png)
- [Review journal](images/curiosity-studio/mobile-journal.png)

## Failures found and resolved

Early browser trials found interactions could be attempted before learner storage had hydrated. The shell is now inert and marked busy until the local state is ready. Dark-lesson checks found insufficient contrast in a highlighted navigation number and links distinguished only by color; the final styles use explicit contrasting text and underlines. A readiness-filter test exposed an ambiguous accessible label; it now has an explicit name. Visual review also moved a working start action into the first mobile viewport.

One concurrent browser trial collided in Playwright’s shared trace directory and failed teardown with ENOENT. Final suites use separate artifact directories and run sequentially. The installed Helium build exits when its last context closes: a normal reused-browser run passed 10 cases and could not create contexts for the other nine. `scripts/chromium-isolated.ts` resolves this environment limitation by running every original case in a fresh process. It changes no assertions, retries or skips. Standard Chromium CI remains unchanged.

## Compatibility and limits

IndexedDB v1 and JSON backups remain compatible. Readiness, scoring, confidence-before-feedback, hint penalties, memory scheduling and uncertainty remain engine-owned. No account, telemetry, remote font, server-side learner storage or new runtime dependency was introduced.

Manual screen-reader certification, browser-zoom certification, physical-device frame-rate checks and human learning studies remain unverified. The shared lesson instruments are still general parameter plots for many topics; the new bespoke laboratory covers ideal projectile motion. Curated landmarks are a narrative view, not the complete prerequisite graph. The ranked roadmap records the remaining subject-review and instrument work.

To reproduce Chromium checks with an installed compatible browser:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/browser npx tsx scripts/chromium-isolated.ts
```

Use `npm run test:e2e` with standard Playwright Chromium in CI, or `TEST_BROWSER=webkit npm run test:e2e` for the installed WebKit alternative.
