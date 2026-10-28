# Field Atlas redesign verification

The redesign uses a scientific-atlas direction: self-hosted Source Serif 4, IBM Plex Sans and IBM Plex Mono, paper/blue/copper surfaces, and separately authored dark tokens. The recommendation, goal and commitment share one learning desk. A searchable atlas distinguishes mathematical and physical nodes, cross-domain prerequisites, readiness and observations. Instruments link a proposed parameter to a baseline, observed curve and movable numerical probe. Mobile reading follows intuition, instrument, formal explanation, derivation and practice.

## Behavior and compatibility
No pure-engine policies or learner-state formats changed. IndexedDB v1, validated backups, confidence-before-feedback, hint penalties, prerequisite rerouting, offline symbolic checking and mastered-concept guardrails remain active. Checker uncertainty has its own feedback treatment. The math keyboard replaces selected text or inserts at the caret, including deletion. Recent observations come directly from local history; screenshot practice uses disposable contexts.

## Checks
- TypeScript strict check passes.
- 21 engine unit tests pass. Seeded evaluation reproduces the documented estimator MAE 0.002915 and normalized placement error 0.025; authored-goal planner comparisons are unchanged. These synthetic results do not establish effectiveness with humans.
- Content build validates 67 nodes, 201 templates and 201,000 answerable variants, with DAG, links, MDX, math and unit checks.
- Production static export and asset budgets pass. Latest sizes are recorded in `build-metrics.json`.
- Browser journeys use Playwright WebKit in this environment, including axe AA rules, mobile overflow, keyboard/reduced motion, placement, sessions, review due dates, atomic backups, atlas filtering/rerouting, caret insertion, feedback focus and offline symbolic grading.
- Rendered screen captures use 1440×900, 768×1024 and 390×844. `npx tsx scripts/design-review.ts` reproduces them against `npm run start` in isolated browser contexts. Images are under `images/field-atlas`.

## Specific limits
Chromium and its headless shell download stalled at 0% in this environment. The Chromium-only CDP mobile LCP test is therefore skipped on WebKit; the older `perf-results.json` is historical and is not a measurement of Field Atlas. CI retains the default Chromium performance gate. No fresh physical-phone frame-rate, iOS installation, manual screen-reader or browser-zoom certification is claimed.

The atlas uses stable prerequisite-depth columns and domain bands with parent-position ordering; it is not a globally optimized graph drawing. Dense paths require zoom, scroll or neighborhood filtering. Mobile uses a dependency outline and an inline evidence inspector, with automatic focus/scroll on explicit selection. Rich pinch/drag navigation and an inspector drawer remain potential refinements. Existing generic relationship instruments and authored content depth are unchanged; the redesign does not establish new pedagogical validity.

## Delivery
Canonical source: `/home/akmessi/noetherwake`. Local preview: http://localhost:3000. Existing Vercel configuration is preserved; this redesign has not been deployed. Font licenses ship beside the local font assets.

Final browser run: **13 passed, 1 skipped** in 44.8 seconds (WebKit). The skipped test is exclusively the Chromium/CDP performance measurement. Axe checks reported no violations on home, atlas, mobile dark lesson, diagnostic and completed-session screens. Static output: **4,009,876 bytes**, combined gzip JavaScript: **670,484 bytes**, largest gzip chunk: **158,939 bytes**. All three configured size budgets pass. Twenty-four isolated-state screenshots were captured successfully.
