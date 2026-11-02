import { describe, it, expect } from "vitest";
import {
  createLearner,
  observe,
  type Evidence,
} from "../../packages/engine/src/index";
import { catalog } from "../../lib/catalog";
import { evidenceLedger } from "../../lib/evidence-ledger";
const response = (at: number, correct = true): Evidence => ({
  concept: "fractions",
  item: "fractions-test",
  correct,
  seconds: 40,
  expectedSeconds: 40,
  hints: 0,
  attempts: 1,
  confidence: 0.65,
  difficulty: 0.3,
  at,
});
describe("historical evidence display", () => {
  it("reproduces real before/after states by calling the unchanged engine", () => {
    const first = observe(createLearner(1000), response(1000), catalog),
      second = observe(first, response(2000, false), catalog);
    const entries = evidenceLedger(second);
    expect(entries.every((e) => e.reproducible)).toBe(true);
    expect(entries[1].before).toEqual(first.knowledge.fractions);
    expect(entries[1].after).toEqual(second.knowledge.fractions);
  });
  it("withholds marks when retained history cannot reproduce stored knowledge", () => {
    let state = observe(createLearner(1000), response(1000), catalog);
    state = observe(state, response(2000), catalog);
    state = { ...state, history: state.history.slice(1) };
    expect(evidenceLedger(state)[0].reproducible).toBe(false);
  });
});
