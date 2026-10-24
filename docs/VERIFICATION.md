# Verification record

Verified 25 October 2026 with Node 22.22.1, npm 9.2.0, Next.js 16.4.3, Vitest 3.2.7 and Playwright 1.64.1. npm installation succeeded; Compute Engine recommends npm >=10.5 and emitted a nonfatal engine warning.

| Gate | Observed result |
| --- | --- |
| Strict TypeScript | Pass |
| Engine unit tests | 21 passed |
| Simulated learners | All convergence, frontier and policy regression thresholds pass |
| Content | 67 concepts, 201 templates, 201,000 variants verified |
| Production static build | Pass; out/ includes versioned offline worker |
| Browser journeys | 11 passed |
| Axe AA checks | Zero violations in tested desktop home/map and mobile dark home/lesson |
| Mobile-emulated LCP | 564 ms (budget <2,000 ms) |
| Static output | 3,926,126 bytes (budget 12 MB) |
| All JS gzip | 668,205 bytes (budget 2 MB) |
| Largest JS chunk gzip | 158,939 bytes (budget 700 KB) |
| Durable checkout npm install / dev | Pass; HTTP 200, development symbolic grade verified |

## Browser coverage

The suite covers goal choice, 12-question adaptive placement, skipped placement, first retrieval, confidence before correctness, named prerequisite reroute, committed prediction before reveal, session completion/reflection, reload persistence, valid export/import, atomic rejection of malformed backups, seven-day review scheduling, full offline reload, offline curriculum navigation, and deferred symbolic checking with the network disabled. Keyboard skip navigation, modal Escape, reduced motion and 390px overflow checks pass. The symbolic regression caught a UMD browser-export problem invisible to Node tests; both Webpack and Turbopack now resolve the package ESM build. Checker infrastructure failures record no learner evidence.

LCP uses Chromium with 4× CPU slowdown, 60 ms latency and 1.6 Mbps downstream, at 390×844. This is a repeatable emulation, not a physical mid-tier phone measurement. All declared asset budgets and the LCP/axe gates run in CI. Browser executable here was the existing Chromium cache via PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; CI installs the matching Playwright browser.

## Visual inspection and remaining verification

Desktop, mobile, map and lesson renders are saved in [images/](images/). Visual inspection was performed on these generated screenshots. The user-facing browser connector had no available browser, so a visible preview tab could not be opened; Playwright supplied the requested browser verification. Real assistive-technology testing, iOS installation and sustained 60 fps on physical phones remain unverified. Axe does not establish complete WCAG conformance. Mathematical fuzzing cannot substitute for independent subject-matter review.

## Reproduction

Run npm i, npm run verify, npx playwright install chromium, then npm run test:e2e. The durable repository is /home/akmessi/noetherwake. Verification used /tmp/noetherwake-source because kernel NTFS operations blocked in the original workspace. The same source, milestone Git history, dependencies and static artifact are preserved in the durable checkout. No system mount or user data was modified to recover the stalled filesystem.
