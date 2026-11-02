# Vercel production deployment

Production URL: https://noetherwake.vercel.app

## The Working Page — 3 November 2026

Published from the canonical Linux checkout, `/home/akmessi/noetherwake`, with Vercel CLI 60.1.3:

```bash
vercel deploy --prod --yes
```

- Project: `akmessis-projects/noetherwake`
- Deployed source commit: `e66dbba35aa436fdd87494e72f2e4c37b8a731da`
- Deployment ID: `dpl_3QjCiSZ2YPmvUhwEpyjU5spzuWFH`
- Deployment state: `READY`, target `production`
- Unique deployment: https://noetherwake-oslshzbp6-akmessis-projects.vercel.app
- Inspector: https://vercel.com/akmessis-projects/noetherwake/3QjCiSZ2YPmvUhwEpyjU5spzuWFH

`vercel.json` runs `npm ci` and `npm run build`, then publishes the static `out/` directory. Local environment files, CLI credentials, dependency caches, and QA screenshots are excluded from uploads.

The remote build validated 67 concepts, 201 templates and all 201,000 generated variants, then completed compilation and strict TypeScript checks. The live production alias returned HTTP 200 for the homepage, service worker, both theme manifests, and the wake icon. The worker includes 125 same-origin cached assets and returns `Cache-Control: no-cache, no-store, must-revalidate`.

Fresh, disposable Chromium contexts verified:

- Desktop: the new introduction, onboarding, a correctly graded fractions response, the numeric Gap, session completion, saved evidence, and an offline reload that retained the recorded response.
- Mobile (390×844): the initial primary action remains in view, navigation opens the laboratory, and a 45° prediction computes 14.68 m.
- No browser page errors occurred during those checks. No existing learner profile was used or replaced.

The remote install reported 11 dependency advisories: 4 low, 3 moderate, 2 high and 2 critical. Dependencies were not upgraded as part of this deployment, and no new production-only audit is claimed. Broader local verification and its limits are recorded in [DESIGN_VERIFICATION.md](DESIGN_VERIFICATION.md).

## Earlier production releases

- Curiosity Studio: `dpl_2LSok9ucusF3wsi71u6oKGeZLv1o`, published before this redesign.
- Initial static release, 25 October 2026: source `d598ad5940a67851d7354409707276042d832ab3`, deployment `dpl_DE8sa1AppeD7WxtxvPKEPaqZHPXN`.
