import { writeFileSync } from 'node:fs';
import {
  createLearner,
  observe,
  initialKnowledge,
  rng,
  plan,
  diagnosticNext,
  depth,
  estimateFrontier,
  ancestors,
} from '../packages/engine/src/index';
import authored from '../lib/catalog.generated.json';
import type { Concept } from '../packages/engine/src/types';
import { fixture } from '../packages/engine/test/fixtures';
const graph = fixture(),
  now = 1700000000000,
  students = 160;
let error = 0,
  brier = 0,
  total = 0,
  placement = 0;
for (let seed = 1; seed <= students; seed++) {
  const random = rng(seed);
  let state = createLearner(now, 'n7');
  const frontier = seed % 8;
  for (let j = 0; j < 18; j++) {
    const c = diagnosticNext(graph, state, now);
    if (!c) break;
    state = observe(
      state,
      {
        concept: c.id,
        item: 'diagnostic',
        correct: random() < (depth(graph, c.id) <= frontier ? 0.9 : 0.12),
        seconds: 60,
        expectedSeconds: 60,
        hints: 0,
        attempts: 1,
        confidence: 0.7,
        difficulty: c.difficulty,
        at: now,
        diagnostic: true,
      },
      graph,
    );
  }
  placement += Math.abs(estimateFrontier(graph, state).depth - frontier) / 7;
  for (const c of graph) {
    const known = random() < 0.5;
    let s = createLearner(now);
    for (let j = 0; j < 28; j++)
      s = observe(
        s,
        {
          concept: c.id,
          item: 'static',
          correct: random() < (known ? 0.9 : 0.12),
          seconds: 60,
          expectedSeconds: 60,
          hints: 0,
          attempts: 1,
          confidence: 0.7,
          difficulty: c.difficulty,
          at: now,
          diagnostic: true,
        },
        graph,
      );
    const p = s.knowledge[c.id].p;
    error += Math.abs(p - Number(known));
    brier += (p - Number(known)) ** 2;
    total++;
  }
}
function policy(
  kind: 'planner' | 'linear' | 'random',
  syllabus = graph,
  target = 'n23',
  cohort = students,
  cap = 400,
) {
  const graph = syllabus,
    required = [...ancestors(graph, target).keys()];
  let sum = 0,
    reached = 0;
  const lengths: number[] = [];
  for (let seed = 1; seed <= cohort; seed++) {
    const random = rng(seed + 1000),
      latent = Object.fromEntries(
        graph.map((c) => [
          c.id,
          seed % 4 === 0 &&
            (c.id.startsWith('n') && /^n\d+$/.test(c.id)
              ? Number(c.id.slice(1)) % 8 < 2
              : depth(graph, c.id) < 2),
        ]),
      );
    let state = createLearner(now, target),
      step = 0;
    for (; step < cap; step++) {
      const ready = graph.filter((c) =>
        c.prerequisites.every((id) => (state.knowledge[id]?.p ?? 0.25) >= 0.8),
      );
      let id: string | undefined;
      if (kind === 'planner') id = plan(graph, state, now)[0]?.concept;
      if (kind === 'linear')
        id = ready.find((c) => (state.knowledge[c.id]?.p ?? 0.25) < 0.93)?.id;
      if (kind === 'random')
        id = ready[Math.floor(random() * ready.length)]?.id;
      if (!id) break;
      const c = graph.find((c) => c.id === id)!;
      const prepared = c.prerequisites.every((p) => latent[p]);
      if (!latent[id] && random() < (prepared ? 0.38 : 0.015))
        latent[id] = true;
      const correct = random() < (latent[id] ? 0.9 : 0.12);
      state = observe(
        state,
        {
          concept: id,
          item: 'policy',
          correct,
          seconds: 60,
          expectedSeconds: 60,
          hints: 0,
          attempts: 1,
          confidence: 0.7,
          difficulty: c.difficulty,
          at: now,
        },
        graph,
      );
      if (required.every((p) => latent[p])) {
        reached++;
        step++;
        break;
      }
    }
    sum += step;
    lengths.push(step);
  }
  lengths.sort((a, b) => a - b);
  return {
    meanSteps: sum / cohort,
    medianSteps: lengths[Math.floor(cohort / 2)],
    goalRate: reached / cohort,
  };
}
const policies = {
  planner: policy('planner'),
  linear: policy('linear'),
  random: policy('random'),
};
const curriculum = (authored as unknown as Concept[]).sort(
  (a, b) =>
    (a.domain === 'math' ? 0 : 1) - (b.domain === 'math' ? 0 : 1) ||
    depth(authored as unknown as Concept[], a.id) -
      depth(authored as unknown as Concept[], b.id) ||
    a.id.localeCompare(b.id),
);
const authoredPolicies = Object.fromEntries(
  ['conservation-energy', 'substitution', 'capacitance'].map((goal) => [
    goal,
    Object.fromEntries(
      (['planner', 'linear', 'random'] as const).map((kind) => [
        kind,
        policy(kind, curriculum, goal, 24, 1000),
      ]),
    ),
  ]),
);
const metrics = {
  authoredPolicies,
  seedRange: [1, students],
  students,
  estimatorMAE: error / total,
  estimatorBrier: brier / total,
  diagnosticNormalizedDepthMAE: placement / students,
  policies,
};
console.log(JSON.stringify(metrics, null, 2));
writeFileSync(
  'docs/eval-results.json',
  JSON.stringify(metrics, null, 2) + '\n',
);
writeFileSync(
  'docs/EVAL.md',
  `# Synthetic evaluation\n\nReproduce: \`npm run eval\`. Fixed seeds 1–${students}; ${students} synthetic students. These are simulations, not people or evidence of classroom efficacy.\n\n| Measure | Result |\n| --- | ---: |\n| Estimator absolute error after 28 probes | ${(error / total).toFixed(4)} |\n| Estimator Brier error | ${(brier / total).toFixed(4)} |\n| Diagnostic frontier depth MAE / max depth (18 probes) | ${(placement / students).toFixed(4)} |\n| Planner mean / median actions | ${policies.planner.meanSteps.toFixed(1)} / ${policies.planner.medianSteps} |\n| Linear syllabus mean / median actions | ${policies.linear.meanSteps.toFixed(1)} / ${policies.linear.medianSteps} |\n| Random ready-node mean / median actions | ${policies.random.meanSteps.toFixed(1)} / ${policies.random.medianSteps} |\n| Goal completion: planner / linear / random | ${Object.values(
    policies,
  )
    .map((p) => (100 * p.goalRate).toFixed(1) + '%')
    .join(
      ' / ',
    )} |\n\n## Protocol and limitations\n\nThe benchmark graph has three disjoint eight-node chains. The target is the last chain. The linear baseline follows all chains in syllabus order; random samples unlocked concepts; the planner knows the goal. All share the same mastery gate, transition probability, response noise, seeds and 400-action cap. Baselines are deliberately simple and do not represent a modern adaptive competitor. Goal relevance gives a structural advantage here; this is an implementation sanity check, not a general theorem about speed.\n\nHidden mastery is binary. Prepared students learn with probability .38 per opportunity, unprepared .015; mastered correctness .90, unmastered .12. One quarter start knowing two concepts per chain. Policy metrics include capped failures. Static estimator tests use independent Bernoulli responses with no learning transition; 3,840 concept/student pairs. Diagnostic tests use hidden frontier depths 0–7, with .90/.12 response noise; the MLE frontier is compared against the true frontier. The estimator is deliberately tested under slight slip-model mismatch.\n\nThe graph is smaller and simpler than the authored curriculum. No benchmark models human fatigue, partial knowledge, hint seeking, transfer or differential item functioning. Content parameters require real calibration. Timing/LCP and accessibility results are recorded in docs/VERIFICATION.md after browser checks.\n`,
);
writeFileSync(
  'docs/EVAL.md',
  (await import('node:fs')).readFileSync('docs/EVAL.md', 'utf8') +
    '\n## Authored curriculum stress test\n\n24 matched seeds per goal, all 67 authored nodes, 1,000-action cap. Linear order takes mathematics before physics and then orders by depth; the planner and random baseline share all readiness gates. Mean action counts include capped failures.\n\n| Goal | Planner mean / completion | Linear mean / completion | Random mean / completion |\n| --- | --- | --- | --- |\n' +
    Object.entries(authoredPolicies)
      .map(
        ([goal, p]) =>
          '| ' +
          goal +
          ' | ' +
          (['planner', 'linear', 'random'] as const)
            .map(
              (k) =>
                p[k].meanSteps.toFixed(1) +
                ' / ' +
                (p[k].goalRate * 100).toFixed(1) +
                '%',
            )
            .join(' | ') +
          ' |',
      )
      .join('\n') +
    '\n\nThese results use the same simplified learning law and are not human outcomes. Different target placement and graph branching materially affect policy comparisons.\n',
);
if (
  Object.values(authoredPolicies).some(
    (p) =>
      p.planner.meanSteps >= p.linear.meanSteps ||
      p.planner.meanSteps >= p.random.meanSteps ||
      p.planner.goalRate < p.linear.goalRate,
  )
)
  throw Error('Authored curriculum policy regression');
if (
  error / total > 0.18 ||
  placement / students > 0.24 ||
  policies.planner.meanSteps >= policies.linear.meanSteps ||
  policies.planner.meanSteps >= policies.random.meanSteps ||
  policies.planner.goalRate < 0.9
)
  throw Error('Simulation acceptance threshold failed; inspect results.');
