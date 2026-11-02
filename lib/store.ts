import Dexie, { type EntityTable } from "dexie";
import { z } from "zod";
import type { Learner } from "@noetherwake/engine";
const finite = z.number().finite(),
  prob = finite.min(0).max(1);
const knowledge = z.object({
  p: prob,
  n: finite.nonnegative(),
  stability: finite.positive().max(1e9),
  last: finite.nonnegative(),
  observations: finite.int().nonnegative(),
  fluent: finite.int().nonnegative(),
  effortful: finite.int().nonnegative(),
  failures: finite.int().nonnegative(),
  suspicion: prob,
  confidenceError: prob,
});
const evidence = z.object({
  concept: z.string(),
  item: z.string(),
  correct: z.boolean(),
  seconds: finite.nonnegative(),
  expectedSeconds: finite.positive(),
  hints: finite.int().min(0).max(3),
  attempts: finite.int().positive(),
  confidence: prob,
  difficulty: prob,
  at: finite.nonnegative(),
  diagnostic: z.boolean().optional(),
  guess: prob.optional(),
  misconception: z.string().optional(),
});
export const learnerSchema = z.object({
  version: z.literal(1),
  goal: z.string(),
  minutes: z.union([z.literal(5), z.literal(15), z.literal(30)]),
  knowledge: z.record(z.string(), knowledge),
  history: z.array(evidence).max(3000),
  diagnostic: z.array(z.string()).max(1000),
  onboarded: z.boolean(),
  theme: z.enum(["system", "dark", "light"]),
  accessibleFont: z.boolean(),
  sessions: z
    .array(
      z.object({
        at: finite,
        concepts: z.array(z.string()),
        correct: finite,
        total: finite,
        minutes: finite,
        reflection: z.string().max(4000),
        changes: z.record(z.string(), finite),
      }),
    )
    .max(1000),
  reflection: z.string().max(4000),
});
export const db = new Dexie("noetherwake") as Dexie & {
  learners: EntityTable<{ id: string; state: Learner }, "id">;
};
db.version(1).stores({ learners: "id" });
export async function readState() {
  return (await db.learners.get("local"))?.state;
}
export async function saveState(state: Learner) {
  await db.learners.put({ id: "local", state });
}
export function parseImport(text: string, ids: Set<string>): Learner {
  if (text.length > 8_000_000) throw Error("Import must be smaller than 8 MB.");
  const state = learnerSchema.parse(JSON.parse(text));
  if (
    !ids.has(state.goal) ||
    [
      ...Object.keys(state.knowledge),
      ...state.history.map((e) => e.concept),
      ...state.diagnostic,
      ...state.sessions.flatMap((s) => [
        ...s.concepts,
        ...Object.keys(s.changes),
      ]),
    ].some((id) => !ids.has(id))
  )
    throw Error("This file references concepts from another curriculum.");
  return state;
}
