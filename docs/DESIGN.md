# Noetherwake — Launch Lab

The opening question is a projectile experiment. Predict a launch angle, run the model, then compare where the throws land. The companion route is placement. Returning learners land on the planner’s next action, with the reason, prerequisite evidence and reviews nearby.

## Visual system

| Role | Color |
| --- | --- |
| Lavender ground | `#F1EFF9` |
| Chalk surface | `#FCFAFF` |
| Aubergine ink | `#23173E` |
| Violet controls | `#502CC5` |
| Plot glass | `#29204A` |
| Signal lime | `#DFF58D` |

Instrument Sans leads headings and controls. Newsreader is reserved for authored reading and longer explanations. IBM Plex Mono distinguishes measured values and axes. All three are local. Signal lime highlights the reference path and the returning learner’s next action. Coral marks a prediction or uncertainty. Correctness keeps its existing distinct green and red labels.

On desktop the prompt and experiment sit side by side. On phones they stack, with a direct link from the prompt to placement.

```
Desktop   [ navigation ] [ question + prediction | measured plot ]
                         [ experiment settings                  ]
                         [ placement invitation + session length ]
Phone     [ brand / preferences ]
          [ question + prediction ]
          [ measured plot ]
          [ placement and routes ]
          [ bottom navigation ]
```

Left-align the question and reading surfaces. The plot is the visual focus and its grid follows equal increments along both axes. Before testing, the diagram shows direction vectors. After testing, the paths, comparison and measurements come from the engine. Replay is initiated by the learner. Reduced-motion mode presents the final positions immediately.

A progress-led landing was considered first. The launch question took its place because new learners have no recorded progress and can make a meaningful prediction on the first visit. The screenshot review shortened the headline, aligned the controls to the top of the bench so they stay put when the measurements appear, and added a direct jump to placement for small screens.

The same surfaces group the active task in placement, practice, lesson examples, Atlas, Library, notes, completion and Preferences. Lessons link directly to the derivation, experiment and practice. Connections, uncertainty, backup confirmation and offline status retain their functional roles. Startup stays inert while IndexedDB loads.

The Working Page notes below document the prior visual system and the evidence contracts that Launch Lab continues to use.

---

## Historical design — The Working Page

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
