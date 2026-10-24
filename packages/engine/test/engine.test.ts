import { describe, it, expect } from 'vitest';
import {
  createLearner,
  observe,
  initialKnowledge,
  effective,
  DAY,
  retrievability,
  interval,
  plan,
  missing,
  routeToReady,
  validateGraph,
  diagnosticNext,
  generate,
  check,
  rk4,
  dimension,
  arithmetic,
  selectTemplate,
  sampleFunctions,
  sessionStreak,
} from '../src';
import { fixture } from './fixtures';
const graph = fixture(),
  now = 1_700_000_000_000;
const event = (correct = true, hints = 0) => ({
  concept: 'n0',
  item: 'test',
  correct,
  seconds: 60,
  expectedSeconds: 60,
  hints,
  attempts: 1,
  confidence: 0.8,
  difficulty: 0.3,
  at: now,
});
describe('Bayesian evidence and memory', () => {
  it('converges on independent successes and failures', () => {
    let a = createLearner(now),
      b = createLearner(now);
    for (let i = 0; i < 12; i++) {
      a = observe(a, event(), graph);
      b = observe(b, event(false), graph);
    }
    expect(a.knowledge.n0.p).toBeGreaterThan(0.95);
    expect(b.knowledge.n0.p).toBeLessThan(0.1);
    expect(
      interval(a.knowledge.n0)[1] - interval(a.knowledge.n0)[0],
    ).toBeLessThan(0.5);
  });
  it('discounts hint credit monotonically and gives none for solution', () => {
    const base = createLearner(now),
      values = [0, 1, 2, 3].map(
        (h) => observe(base, event(true, h), graph).knowledge.n0.p,
      );
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(values[3]).toBeCloseTo(0.25);
  });
  it('models half-life and never invents evidence', () => {
    const k = initialKnowledge(now);
    expect(retrievability(k, now + DAY)).toBeCloseTo(0.5);
    expect(effective(k, now + DAY)).toBeLessThan(k.p);
  });
  it('suspects rather than convicts prerequisites', () => {
    const s = observe(
      createLearner(now),
      { ...event(false), concept: 'n1' },
      graph,
    );
    expect(s.knowledge.n0.p).toBe(0.25);
    expect(s.knowledge.n0.suspicion).toBeGreaterThan(0);
  });
});
describe('graph and planning', () => {
  it('rejects cycles and missing references', () => {
    const g = fixture(3);
    g[0].prerequisites = ['n2'];
    expect(validateGraph(g).join()).toContain('Cycle');
  });
  it('never recommends locked or mastered ordinary drills', () => {
    const s = createLearner(now, 'n7');
    for (const action of plan(graph, s, now))
      expect(missing(graph, s, action.concept, now)).toEqual([]);
    s.knowledge.n0 = {
      ...initialKnowledge(now),
      p: 0.99,
      n: 20,
      observations: 10,
    };
    expect(plan(graph, s, now).find((a) => a.concept === 'n0')).toBeUndefined();
    expect(routeToReady(graph, s, 'n7', now)).toBe('n1');
  });
  it('begins placement away from roots', () => {
    const s = createLearner(now, 'n7');
    expect(diagnosticNext(graph, s, now)?.id).not.toBe('n0');
  });
  it('targets available challenge without claiming artificial 78% success', () => {
    const s = createLearner(now);
    expect(selectTemplate(graph[0], s, now)).toBeDefined();
  });
});
describe('grading and simulation', () => {
  it('produces deterministic variants and finite answers', () => {
    const item = generate(graph[0], graph[0].generators[0], 42);
    expect(item).toEqual(generate(graph[0], graph[0].generators[0], 42));
    expect(arithmetic(item.answer)).toBeGreaterThan(0);
  });
  it('accepts converted SI units and rejects wrong dimensions', async () => {
    const item = {
      ...generate(graph[0], graph[0].generators[0], 42),
      answer: '1',
      unit: 'm',
    };
    expect((await check(item, '100', 'cm')).correct).toBe(true);
    expect((await check(item, '1', 's')).correct).toBe(false);
    expect(dimension('kg*m/s^2').d).toEqual(dimension('N').d);
  });
  it('accepts symbolic equivalence', async () => {
    const item = {
      ...generate(graph[0], graph[0].generators[0], 42),
      kind: 'symbolic' as const,
      answer: '2*x+2',
    };
    expect((await check(item, '2(x+1)')).correct).toBe(true);
    expect((await check(item, '2*x+3')).correct).toBe(false);
  });
  it('integrates constant acceleration and conserves oscillator energy', () => {
    let s = { x: 1, v: 0 };
    for (let i = 0; i < 1000; i++) s = rk4(s, i * 0.01, 0.01, (x) => -x);
    expect(s.x ** 2 + s.v ** 2).toBeCloseTo(1, 7);
    let p = { x: 0, v: 1 };
    for (let i = 0; i < 100; i++) p = rk4(p, i * 0.01, 0.01, () => 2);
    expect(p.x).toBeCloseTo(2, 8);
  });
  it('rejects unsafe and nonfinite expressions', () => {
    expect(() => arithmetic('process.exit()')).toThrow();
    expect(() => arithmetic('1/0')).toThrow();
  });
});

describe('assessment and graph invariants', () => {
  it('keeps hinted completion below the unlock threshold', () => {
    let s = createLearner(now);
    for (let i = 0; i < 30; i++) s = observe(s, event(true, 1), graph);
    expect(s.knowledge.n0.p).toBeLessThan(0.8);
    expect(missing(graph, s, 'n1', now)).toContain('n0');
    s = observe(s, event(true, 0), graph);
    expect(s.knowledge.n0.p).toBeGreaterThan(0.8);
  });
  it('parses unary powers and unit products consistently', () => {
    expect(arithmetic('-2^2')).toBe(-4);
    expect(arithmetic('(-2)^2')).toBe(4);
    expect(arithmetic('2^-2')).toBe(0.25);
    expect(dimension('m/s*kg').d).toEqual(dimension('kg*m/s').d);
  });
  it('bounds stability and probabilities over long sequences', () => {
    let s = createLearner(now);
    for (let i = 0; i < 2000; i++) s = observe(s, event(), graph);
    expect(s.knowledge.n0.stability).toBeLessThanOrEqual(3650);
    expect(s.knowledge.n0.p).toBeLessThan(1);
    expect(s.history.length).toBeLessThanOrEqual(3000);
  });
  it('rejects an isolated orphan while allowing connected roots', () => {
    const g = fixture(3);
    g[2].prerequisites = [];
    expect(validateGraph(g).join()).toContain('Orphan');
  });
});

describe('transfer and numerical fallback boundaries', () => {
  it('samples equivalent functions and rejects sign/domain errors', () => {
    expect(sampleFunctions('sin(x)^2+cos(x)^2', '1')).toBe(true);
    expect(sampleFunctions('sqrt(x^2)', 'x')).toBe(false);
    expect(sampleFunctions('ln(x)', 'ln(x)')).toBeUndefined();
  });
  it('counts local calendar days without requiring today', () => {
    expect(
      sessionStreak([{ at: now - DAY }, { at: now - 2 * DAY }], now, 0),
    ).toBe(2);
    expect(sessionStreak([], now, 330)).toBe(0);
  });
  it('routes dimension errors to the units hypothesis', () => {
    const g = fixture(3);
    g[0].id = 'units';
    g[1].prerequisites = ['units'];
    let s = observe(
      createLearner(now, 'n2'),
      { ...event(false), concept: 'n1', misconception: 'units' },
      g,
    );
    expect(s.knowledge.units.suspicion).toBeGreaterThan(0.3);
    expect(plan(g, s, now)[0].concept).toBe('units');
  });
  it('fades across examples before independent transfer', () => {
    const c = graph[0];
    let s = createLearner(now);
    expect(selectTemplate(c, s, now).id).toBe(c.generators[0].id);
    s = observe(s, event(), graph);
    expect(selectTemplate(c, s, now).id).toBe(c.generators[1].id);
  });
});
