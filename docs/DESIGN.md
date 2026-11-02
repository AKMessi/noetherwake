# Noetherwake — The Working Page

The presentation is a printed physics monograph that computes: a working sheet, a ruled margin, and measured figures. Newsreader carries prose, Instrument Sans carries controls, IBM Plex Mono carries measurements. Font files and their OFL licenses live in `app/fonts`; `next/font/local` self-hosts Latin and Latin Extended subsets. KaTeX remains the mathematics renderer with its bundled fonts.

## Shared system

`app/globals.css` is the single RGB-channel token source, extended through Tailwind v4 `@theme inline`. Light warm paper and dark blueprint palettes share semantic roles. Ink means given; cobalt means derived or selected; ochre means predicted or uncertain. Green/red are correctness only. The reference palette is adjusted for measured contrast: light `ink-3` is #5C6270, light `rule-strong` is #827965, dark `ink-3` is #979DAC, dark `rule-strong` is #6B758A. Decorative rules and measurement grids are deliberately quieter; functional boundaries use `rule-strong`. Run `npx tsx scripts/contrast.ts` for the exact 106-pair report in `working-page-contrast.json`.

Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Square regions, 2px controls, no decorative shadows or card grids. Containers are reserved for interactive surfaces, answer fields, the map, popovers, and import previews. One cobalt-filled action per task. Focus uses a 2px cobalt outline with a 4px ground halo. Targets are at least 44px. Prose stays at 66ch, with Newsreader 19/31 desktop and 17.5/29 mobile. Equations scroll within their own wrapper.

Desktop navigation is a 208px fixed spine; below 1100px it becomes a 56px bar; below 768px five text tabs occupy the bottom safe area. Vocabulary is Today, Atlas, Library, Lab, Field notes; Preferences is separate. Sheets use a 640px working column and a 280px margin with a 56px gutter. Marginal content becomes inline below 1024px. No marketing slogans, all-caps labels, decorative icons, pills, gamification, or invented evidence.

## Evidence contract

The engine has probabilities, direct observation counts, descriptive uncertainty intervals, and suspicion; it does not define named evidence tiers. `lib/presentation.ts` supplies display labels only: no observations → none; otherwise effective mastery below .5 → emerging; [.5,.8) → moderate; ≥.8 → strong (the existing UI threshold). Glyph fills are hollow, quarter, half, full. Unmet prerequisite readiness always comes from engine `missing`; a dashed ring plus “needs n” identifies it. A descriptive interval wider than .5, or engine suspicion above .14, adds a dashed ochre ring; the tooltip names uncertainty explicitly. These labels never determine readiness, grading, recommendations, or scheduling.

The catalogue has 67 concepts. Each route count includes its goal and all hard ancestors. Counts must name that scope. No duration, item total, confidence threshold, or calibration curve is invented: the model has no lesson durations or calibrated population curve. Existing session budgets and actual observed confidence errors may be shown with their meaning stated.

## Screens and motion

The first-visit Today is a working page with placement, a real projectile prediction, and a typographic route index. Returning Today presents the engine recommendation, route evidence ruler, due retrieval, and actual evidence counts. Lessons pair authored prose and equations with prerequisite notes, derivation steps, model boundaries, and a teaching instrument. Practice focuses on the problem, confidence radio scale, answer and engine feedback. Numeric feedback compares canonical values only when units are valid.

Atlas uses deterministic longest-path layers, strand lanes, evidence glyphs, a shared detail margin, an accessible list, and an ancestor trace. Library uses rule-separated rows and the same details. The lab plots equal-scale SI trajectories, compares the real prediction to the computed winner, and states model assumptions. Field notes are a chronological record, session completion reports actual changes, and Preferences exposes existing settings, atomic validated import, export, and explicit typed deletion.

Motion is restricted to: trace 180ms/layer with 80ms stagger; trace clearing 120ms; numeric gap 420ms; lab physical trajectories at 1× capped at 2400ms; evidence shift 600ms after 250ms; derivation reveal 140ms; mobile sheet 220ms. Reduced motion shows final states immediately. No ambient or scroll animation.

## Compatibility and verification

Engine policy, content contracts, IndexedDB v1, old JSON backups, static export, Vercel configuration, and offline worker remain compatible. Screenshots and seeded browser state are disposable QA artifacts, never learner data embedded in the interface. See `DESIGN_VERIFICATION.md` for the current verification report and `ROADMAP.md` for unsupported requests. Every implementation change set is committed and pushed to GitHub.

## Loading, icons, and practical adaptations

The static introduction is meaningful HTML while IndexedDB is read. Learner counts and preferences are withheld, and controls remain inert until hydration completes. This keeps a returning learner's saved state safe without delaying the generic first paint. Font preloading avoids forcing every italic/monospace file onto the first-paint path; all subsets remain locally hosted and precached. Light/dark manifests, browser theme colour, the favicon and offline icons use the same paper/blueprint and wake-mark system.

Route rulers wrap to retain 44px targets instead of squeezing 31 interactive ticks into a phone-width row. The map's normal zoom uses full-size targets; its zoomed overview has the full-size List alternative. Per-paragraph definitions and reference-aware equation numbering require authoring metadata; current connections are grouped once, and marked derivation justifications occupy their actual margin. There is no fabricated calibration curve or lesson-duration estimate. These contract limits are recorded in ROADMAP.md.
