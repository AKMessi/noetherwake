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
