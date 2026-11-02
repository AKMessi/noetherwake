/** Replay retained responses with the engine. Never invent a historical learner state. */
import {
  createLearner,
  getKnowledge,
  observe,
  type Knowledge,
  type Learner,
} from "@noetherwake/engine";
import { catalog } from "./catalog";
export function evidenceLedger(state: Learner) {
  let replay = createLearner(state.history[0]?.at ?? 0, state.goal);
  const snapshots = state.history.map((e) => {
    const before = { ...getKnowledge(replay, e.concept, e.at) };
    replay = observe(replay, e, catalog);
    return { e, before, after: { ...getKnowledge(replay, e.concept, e.at) } };
  });
  const valid = new Set(
    catalog
      .filter((c) => {
        const a = replay.knowledge[c.id],
          b = state.knowledge[c.id];
        return (
          a &&
          b &&
          (
            [
              "p",
              "n",
              "stability",
              "observations",
              "suspicion",
              "last",
              "confidenceError",
            ] as (keyof Knowledge)[]
          ).every((key) => Math.abs(a[key] - b[key]) < 1e-8)
        );
      })
      .map((c) => c.id),
  );
  return snapshots.map((entry) => ({
    ...entry,
    reproducible: valid.has(entry.e.concept),
  }));
}
