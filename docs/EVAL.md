# Synthetic evaluation

Reproduce: `npm run eval`. Fixed seeds 1–160; 160 synthetic students. These are simulations, not people or evidence of classroom efficacy.

| Measure | Result |
| --- | ---: |
| Estimator absolute error after 28 probes | 0.0029 |
| Estimator Brier error | 0.0003 |
| Diagnostic frontier depth MAE / max depth (18 probes) | 0.0250 |
| Planner mean / median actions | 51.8 / 51 |
| Linear syllabus mean / median actions | 125.8 / 117 |
| Random ready-node mean / median actions | 359.6 / 400 |
| Goal completion: planner / linear / random | 100.0% / 93.8% / 38.8% |

## Protocol and limitations

The benchmark graph has three disjoint eight-node chains. The target is the last chain. The linear baseline follows all chains in syllabus order; random samples unlocked concepts; the planner knows the goal. All share the same mastery gate, transition probability, response noise, seeds and 400-action cap. Baselines are deliberately simple and do not represent a modern adaptive competitor. Goal relevance gives a structural advantage here; this is an implementation sanity check, not a general theorem about speed.

Hidden mastery is binary. Prepared students learn with probability .38 per opportunity, unprepared .015; mastered correctness .90, unmastered .12. One quarter start knowing two concepts per chain. Policy metrics include capped failures. Static estimator tests use independent Bernoulli responses with no learning transition; 3,840 concept/student pairs. Diagnostic tests use hidden frontier depths 0–7, with .90/.12 response noise; the MLE frontier is compared against the true frontier. The estimator is deliberately tested under slight slip-model mismatch.

The graph is smaller and simpler than the authored curriculum. No benchmark models human fatigue, partial knowledge, hint seeking, transfer or differential item functioning. Content parameters require real calibration. Timing/LCP and accessibility results are recorded in docs/VERIFICATION.md after browser checks.

## Authored curriculum stress test

24 matched seeds per goal, all 67 authored nodes, 1,000-action cap. Linear order takes mathematics before physics and then orders by depth; the planner and random baseline share all readiness gates. Mean action counts include capped failures.

| Goal | Planner mean / completion | Linear mean / completion | Random mean / completion |
| --- | --- | --- | --- |
| conservation-energy | 295.6 / 100.0% | 343.8 / 91.7% | 1000.0 / 0.0% |
| substitution | 190.8 / 95.8% | 213.1 / 91.7% | 966.3 / 33.3% |
| capacitance | 301.6 / 100.0% | 357.6 / 95.8% | 1000.0 / 0.0% |

These results use the same simplified learning law and are not human outcomes. Different target placement and graph branching materially affect policy comparisons.
