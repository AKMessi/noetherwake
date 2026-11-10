# Noetherwake

Live: [noetherwake.vercel.app](https://noetherwake.vercel.app). Deployment details: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

A local-first learning studio for mathematics and physics. One evidence-based next step, a prerequisite map, retrieval with confidence calibration, and a scheduler that brings ideas back.

```bash
npm i
npm run dev
```

Use Node 22+ (npm 10+ recommended by Compute Engine). Open http://localhost:3000. No account, backend, API key, external fonts, or analytics. Every learning decision and grade works offline without a language model.

The 67-concept vertical slice links fractions, algebra, functions, calculus, mechanics and initial electricity/circuits. Each concept has authored MDX, three deterministic generators, a prediction-first linked instrument, worked reasoning and misconception remediation. This is a substantial prototype with measured checks, not a claim of validated human learning efficacy or a complete undergraduate curriculum.

```bash
npm run verify       # strict TS, unit tests, synthetic eval, full content fuzzing, production build + budgets
npm run build        # 201,000 generated variants validated; static files go to out/
npm run start        # serve the production build on port 3000
npx playwright install chromium
npm run test:e2e     # full browser journeys, offline reload, axe and throttled LCP gate
```

Deploy `out/` to any HTTPS static host, or deploy the repository to Vercel with `npm run build` and output directory `out`. Static export configuration follows the [Next.js documentation](https://nextjs.org/docs/app/guides/static-exports). The production build generates a versioned service-worker cache of all app assets, lessons and math fonts. Offline availability starts once installation finishes; look for “Offline ready”. Development mode does not install a worker. Reviews are in-app reminders when opened, not push notifications.

Progress lives in Dexie/IndexedDB. Preferences offers validated JSON import/export; an import replaces local state. Clearing browser data removes progress, so keep a backup. No learner data is uploaded. The engine package is portable TypeScript; see [the mathematical specification](docs/ENGINE.md), [content authoring contract](docs/CONTENT_SCHEMA.md), [measured synthetic evaluation](docs/EVAL.md), [verification report](docs/VERIFICATION.md) and [ranked roadmap](docs/ROADMAP.md).

## Workspace storage incident

The original `/run/media/.../math and physics self learning engine` NTFS mount stalled in kernel `ntfs_look_free_mft` during dependency installation. The durable, complete repository is `/home/akmessi/noetherwake`; verification ran from `/tmp/noetherwake-source` with dependencies outside NTFS. The first documentation commit exists in the original workspace; subsequent commits are preserved in the durable repository. Do not install this dependency tree on the stalled mount. This is a storage-location exception, not a stack substitution.

## Vercel CLI deployment

The Vercel project uses the static export from `npm run build`; `vercel.json` explicitly selects `out/` so the generated offline worker is deployed with the app. From the linked Linux checkout run `vercel deploy --prod --yes`. `.vercelignore` excludes dependency/build caches, other hosting metadata, and local environment files. Project linkage and CLI credentials remain untracked.

The current presentation is **Launch Lab**. First-time learners can predict a projectile path and test it immediately. Returning learners see the planner’s next step and the evidence behind it. Lessons link directly to derivation, experiment and practice. See [the design contract](docs/DESIGN.md), [verification](docs/DESIGN_VERIFICATION.md), and [the roadmap](docs/ROADMAP.md).

Reproduce the four-viewport screenshot matrix against the production preview with `npx tsx scripts/working-page-preview.ts`. It uses disposable data generated and graded by the real engine, loaded through the application’s import flow. Run `npx tsx scripts/contrast.ts` for measured palette pairs. Representative screenshots live in `docs/images/launch-lab/`. Production publication remains a separate Vercel CLI action.
