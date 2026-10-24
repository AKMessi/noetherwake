# Noetherwake engine specification — v1

## Objective and boundaries
Choose the next action that increases retained, transferable knowledge per minute while respecting prerequisites and working memory. Deterministic pure functions accept graph, state, time and seeds. No LLM participates in selection or grading. Initial parameters are engineering priors, not validated psychometrics. Use milliseconds at the boundary, days inside forgetting functions.

## Graph
G=(V,E) is a directed acyclic graph; edge u→v means u is a hard prerequisite of v. Soft prerequisites annotate helpful context and never lock; v1 goal distance uses hard edges. Roots are explicitly declared as nodes with zero hard parents. Every node must be reachable, IDs unique, all references resolve, and at least N=3 generators exist. Breadth is expanded through reviewed content, never empty nodes. A node is ready iff each hard parent has effective mastery ≥τ=.8. A mastered concept (≥.93, low forgetting risk) never receives ordinary drills; it can receive a spaced or transfer check.

## Probabilistic learner: extended Bayesian knowledge tracing
We choose BKT rather than fitting 2PL abilities because v1 has no population calibration data. For each concept maintain p=P(K=1), evidence weight n, stability S (days), last timestamp, observations, fluent/effortful counts, failure streak and suspicion. Initial p=.25, n=0, S=1. Uncertainty displayed is an approximate beta interval: α=1+np, β=1+n(1-p), variance=αβ/[(α+β)²(α+β+1)]; display p±1.96√variance clipped to [0,1]. This is a descriptive interval, not an exact BKT posterior credible interval.

Memory retrievability R(t,S)=exp(-ln(2)t/S); S is a half-life. Effective mastery q=p[.35+.65R]. This exponential stability model is a documented alternative to FSRS, not an implementation of FSRS. Next due time solves R=.9: t_due=−S ln(.9)/ln(2).

For item difficulty d in [0,1], slip s=.06+.16d, guess g=.12 for constructed responses or 1/options for choices. P(correct)=q(1−s)+(1−q)g. For correctness c, evidence posterior b=q(1−s)/P(correct) if c=1; b=qs/[qs+(1−q)(1−g)] otherwise. Evidence weight w=clamp((1−.22h)/(1+.18(a−1)),.15,1), h∈{0,1,2,3}, attempts a≥1. Apply damped log odds: logit(p')=logit(q)+w[logit(b)−logit(q)]. A correct response then applies learning transition p''=p'+(1−p')(.025w). A response under .18×expected seconds is discounted by .35; no speed bonus rewards guessing. Fluent correct means h=0,a=1,time≤1.5×expected; effortful otherwise.

Confidence ∈[0,1] is committed before feedback and tracked through Brier error (confidence−c)². It never increases mastery by itself. Overconfident errors increase suspicion and remediation priority. Correct independent recall updates S←S(1.6+.6R); error S←max(.2,.5S); hinted correct S←1.08S. n←n+w. No hidden learning during passive reading.

### Propagation and diagnosis
Independent correct evidence propagates at most .05w(1−p_parent) to direct parents; propagation does not increment independent evidence or recursively unlock an entire chain. Failure adds suspicion .18w to parents (plus .08 for overconfidence), without lowering their mastery. A direct prerequisite probe resolves suspicion: suspicion←.35 suspicion. Thus a physics error raises a math hypothesis; a math probe must confirm it. Planner prioritizes the weakest suspected parent and explains the cross-domain route.

## Adaptive diagnostic
User selects a goal (mechanics, calculus or first E&M); targets include all ancestors. Never locks placement probes, since their purpose is to test existing knowledge. For each candidate compute binary entropy H(p)=−p log₂p−(1−p)log₂(1−p). Expected information gain IG=H(p)−P(c)H(p|c)−(1−P(c))H(p|¬c). Score IG×goal relevance plus midpoint depth/frontier preference, penalize repeats. A coarse diagnostic-only inferred prior uses nearby confirmed success/failure depths; inference does not become mastery until tested. Stop after 12–18 probes or sufficiently narrow frontier. Report evidence counts and uncertainty, not a categorical grade. Skipping leaves broad priors. Diagnostic observations disable the learning transition.

## Action planner
Candidates: learn on ready frontier; review due memory; repair a suspected prerequisite (route through its missing parents); mixed retrieval; independent mastery check; cross-domain transfer. Enumerate deterministically, stable ID tie-breaking. Score

U(a)=[2.8 gain +1.5 relevance +1.8 forgetting +1.6 suspicion +.25 variety −1.2 overload −.7 frustration]/sqrt(minutes).

Relevance=1/(1+.25×shortest ancestor distance to goal), .08 outside goal. Gain=(1−effective mastery)×predicted success. Cognitive load depends on node difficulty, session length and failure streak. Three consecutive failures prefer an easier ready ancestor and visual representation. All recommendations expose a reason based on their dominant signal. Candidate item choice minimizes |predicted success−.78|; if the bank cannot meet .70–.85, report this limitation rather than falsifying success estimates.

Worked→faded→independent progression is based on independent observations, not clicking next. Worked examples and full-step hints yield no assessment credit. Faded completion uses at least a tier-one discount. Independent item responses alone can unlock mastery. Tiered hints reveal a nudge, partial step, full solution; credit decreases monotonically.

Sessions are 5/15/30 minutes, proposed as warm-up retrieval→new material→interleaved practice→reflection. Budget also bounds item count, so slow sessions can finish gracefully. Only ready nodes enter ordinary sessions; diagnostic explicitly differs. At end show Δmastery (with uncertainty), next recommendation and due timestamps. Session expiration never discards an unfinished response. Reflection is stored locally.

## Answer contracts
Numeric answers use relative/absolute tolerances and reject nonfinite values. Physics requires dimensionally compatible units, with conversions to canonical SI. Symbolic checking uses Compute Engine algebraic equivalence; undecidable forms produce an explicit retry message, never a false success. Numeric sampling is limited to domain-safe polynomial expressions and rejects poles/undefined points; it is a fallback heuristic, not a proof. Multiple choice options map to named misconception remediation. Step ordering, error identification, graph point placement, simulation targets and proof-skeleton choices use explicit rubrics, never language-model judgment. Free text self-explanation uses concept-authored keyword groups and is formative, not mastery evidence.

## Evaluation contract
Seeded synthetic learners have independent latent mastery, response noise and learning transitions, plus heterogeneous frontiers. Estimator convergence measures MAE/Brier on static latent students, not against its own outputs. Diagnostic measures normalized frontier-depth error. Policy comparison runs planner, linear and random on identical graphs/seeds, budgets and learning process; compare goal completion and steps, report unfavorable results. Synthetic evidence can expose implementation errors; it cannot establish human efficacy or item validity. docs/EVAL.md is generated from actual runs and documents assumptions.

## Implementation decisions after verification

The v1 graph and instruments use native SVG and a deterministic topological layout instead of D3/Mafs. At 67 nodes this keeps keyboard semantics explicit and avoids a second rendering dependency; there is no essential 3D in this slice. This is the written stack exception. MDX is compiled for validation, and its supported Markdown/math subset is rendered to trusted build-time HTML; custom MDX JSX components are intentionally excluded by the authoring contract.

The first two opportunities use template 1 (worked support) and template 2 (faded support); subsequent selection minimizes distance from .78 success with a .08 penalty per exposure in the last five attempts. This makes the third independent context available instead of repeating the easiest family indefinitely. Selection includes multiple-choice guess probability. A hinted success is capped at .79 when the concept was below .8; only an independent response can cross the readiness threshold. Full-solution hints have zero evidence weight. Stability is capped at 3,650 days to keep long-lived states finite and exportable. Unit mismatches additionally raise a specific units-node hypothesis.

Symbolic checking first asks Compute Engine. When its answer is undecidable, the safe arithmetic grammar can compare 24 deterministic interior checkpoints on [-3,3]. Undefined samples reject the fallback; numerical agreement is explicitly labelled as a heuristic and cannot establish a proof or global domain equivalence. Unsupported/undecidable input records no mastery evidence and offers another form. The v1 proof skeleton is a constrained choice rubric, not free-form theorem proving.

Placement uses a coarse depth frontier and direct prerequisite propagation. It can conservatively ask for foundational confirmation after advanced success; multi-island, per-domain conditional inference remains a measured research priority. Never convert the depth estimate into fabricated independent observations.

Compute Engine v0.30.2 exports a UMD browser entry that does not provide its constructor correctly under this build. `next.config.ts` pins the package's ESM file for Webpack and Turbopack. The portable engine retains its ordinary package import; Node tests, the development checker and offline production grading are verified separately. Bundler/checker infrastructure errors are indeterminate, never negative learning evidence.
