# Vercel production deployment

Production URL: https://noetherwake.vercel.app

Deployed with Vercel CLI 60.1.3 using `vercel deploy --prod --yes --logs` from `/home/akmessi/noetherwake` on 25 October 2026.

- Project: `akmessis-projects/noetherwake`
- Source commit: `d598ad5940a67851d7354409707276042d832ab3`
- Deployment ID: `dpl_DE8sa1AppeD7WxtxvPKEPaqZHPXN`
- Deployment state: `READY`
- Unique deployment URL: https://noetherwake-3xvfgt7tn-akmessis-projects.vercel.app

`vercel.json` selects static hosting, runs `npm ci` and `npm run build`, and publishes `out/`. This preserves the generated offline worker after Next.js exports the app. The worker has explicit no-cache headers and root scope. Local environment files and project credentials are excluded from Git and uploads.

The remote build validated all 201,000 generated variants and completed strict TypeScript compilation. Verification against the production alias returned HTTP 200 for the home page, service worker and PWA manifest. A fresh Chromium context completed goal selection, opened the fractions lesson and its instrument, retained learner state, then reloaded successfully with the network disabled.

For subsequent production deployments from this linked checkout:

```bash
vercel deploy --prod --yes
```

The npm audit output includes build-tool advisories. The production-only audit reports four low-severity entries in the trusted math-rendering dependency chain; no breaking automatic dependency upgrades were applied during deployment.
