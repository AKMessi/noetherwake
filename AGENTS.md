# Noetherwake

A local-first, deterministic tutor for mathematics and physics. Read docs/ENGINE.md and docs/CONTENT_SCHEMA.md before changing behavior.

## Architecture
- `packages/engine/src`: pure TypeScript graph, Bayesian learner, memory, diagnostic, planner, generators and answer checking. No React, DOM, persistence, network, or wall-clock reads. Callers supply time and seeded randomness.
- `content/concepts/*.mdx`: authored lessons and YAML metadata. Build validation produces `lib/catalog.generated.json`. This is a derived artifact, never the source of truth.
- `app`, `components`: Next.js App Router, strict TS, Tailwind. Presentation calls engine functions; never reimplements scoring or unlock rules.
- `lib/store.ts`: versioned Dexie persistence. Learner data never leaves the device. JSON import is validated before replacing state.
- `public`: manifest, offline worker and icons. Production build generates a complete asset manifest.
- `scripts`: deterministic content validation, simulated learner evaluations, build budgets.

## Conventions
Use explicit units, bounded probabilities, stable IDs and seeded generators. Preserve uncertainty in all UI. Failure is evidence, never a moral judgment. Explanations identify the prerequisite or memory signal used. No XP, fabricated learner history, hidden telemetry, placeholder lessons, or external fonts. Use semantic controls, visible focus and reduced-motion styles. Any unimplemented request belongs in docs/ROADMAP.md, not a pretend control.

## Milestones (commit in order)
1. Architecture and mathematical/content contracts.
2. Pure engine, tests and simulated-learner harness; run before writing UI.
3. At least 60 connected, validated lessons, three generators each and interactive specifications.
4. Responsive, accessible, local-first app: onboarding, adaptive diagnostic, next action, lessons, map, session, settings, export/import, offline.
5. Full verification, measured evaluation, release notes and ranked roadmap.

## Commands
`npm i`; `npm run dev`. `npm run typecheck`; `npm test`; `npm run eval`; `npm run content:check` (1,000 variants/template); `npm run build` (static `out/`); `npm run test:e2e` (build first; Playwright Chromium required); `npm run verify` for all non-browser gates. CI runs these and browser accessibility/performance checks.

## Definition of done
A milestone needs working behavior, appropriate automated checks, documentation and a commit. Engine changes include reproducible synthetic evidence and limitations. Every concept has valid hard/soft links, three answerable templates, an intuition/formalism/boundary lesson, worked derivation, misconceptions and a teaching interactive. Production build must fail on invalid content. User state survives reload; offline navigation and export/import work. UI tests cover diagnostic, session, missing-prerequisite reroute and review. Never claim synthetic results prove learning effectiveness in humans. Record actual failures and unverified budgets.

## Current delivery state
All five milestones have implementations and reproducible verification. See docs/FINAL_REPORT.md and docs/VERIFICATION.md for measured checks and limitations. Keep the 67-node source and generated catalog in sync with the content command. Root fractions and Newton-law hints have item-specific nudge/setup/full steps; all generated answers are rechecked by the deterministic grader during content validation.

The original NTFS workspace stalled in kernel MFT allocation during dependency installation. Canonical durable checkout: `/home/akmessi/noetherwake`. Use Linux storage for dependencies/builds; do not repeat package installation on the stalled mount. The stack remains the requested Next.js/local-first stack; the SVG layout exception is justified in ENGINE.md.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Field Atlas presentation
See docs/DESIGN.md for the authored design system and redesign verification contract. Blue ink, warm paper and copper annotations use semantic theme tokens. Fonts are bundled under public/fonts. The atlas layout is presentation-only; preserve engine readiness and evidence semantics, IndexedDB v1 and the Vercel static/offline setup.

Field Atlas verification: `TEST_BROWSER=webkit npm run test:e2e` selects the installed alternative browser; default remains Chromium in CI. Only the Chromium/CDP LCP check skips on WebKit. `npx tsx scripts/design-review.ts` captures disposable local practice at three viewport sizes against the production preview. See docs/DESIGN_VERIFICATION.md for actual results; do not reuse historical performance measurements as redesigned-build measurements.

## Curiosity Studio presentation
The current design contract is docs/DESIGN.md. Carbon, warm paper and chartreuse supersede the historical Field Atlas colors. `components/StudioHome.tsx`, `ProjectileLab.tsx`, `Expeditions.tsx`, `LessonConnections.tsx` and `EvidenceReview.tsx` compose the presentation while the pure engine owns all learner decisions. Expedition landmarks in `lib/expeditions.ts` are validated against the source catalog during content builds. Run `npx tsx scripts/studio-preview.ts` against a production preview for isolated screenshots at 1440×900, 768×1024 and 390×844. The shell remains inert until local learner storage is hydrated so early controls cannot overwrite saved evidence.

## Working Page presentation

The active design contract is now **The Working Page** in `docs/DESIGN.md`; earlier Field Atlas and Curiosity Studio sections are historical. The pure engine and IndexedDB v1 remain unchanged. Shared primitives live in `components/ui/WorkingPage.tsx`, with evidence display labels in `lib/presentation.ts`, deterministic graph geometry in `lib/atlas-layout.ts`, and guarded historical replay in `lib/evidence-ledger.ts`. `LessonView`, `AtlasView`, `Library`, `FieldNotes`, `SessionComplete` and `Preferences` implement the interior screens. All fonts are local `next/font/local` assets with OFL licenses under `app/fonts`.

Run `npx tsx scripts/working-page-preview.ts` against `npm run start` for the 1440×900, 1024×768, 768×1024 and 390×844 capture matrix. QA state is generated and checked by the engine and imported through the real UI. `npx tsx scripts/contrast.ts` measures token contrast. Existing `npm run test:e2e` defaults to Chromium; WebKit remains supported through `TEST_BROWSER=webkit`. Keep the 2-second Chromium LCP gate and record control readiness separately. Do not render invented learner counts while hydration is pending. Commit and push completed change sets to GitHub as requested by the user.
