/** Display vocabulary only. Decisions about readiness and recommendations stay in the engine. */
import {
  effective,
  getKnowledge,
  interval,
  missing,
  type Knowledge,
  type Learner,
} from "@noetherwake/engine";
import { catalog } from "./catalog";
export type EvidenceLevel = "none" | "emerging" | "moderate" | "strong";
export function evidenceLevel(k: Knowledge, now: number): EvidenceLevel {
  if (!k.observations) return "none";
  const p = effective(k, now);
  return p >= 0.8 ? "strong" : p >= 0.5 ? "moderate" : "emerging";
}
export const levelIndex = {
  none: 0,
  emerging: 1,
  moderate: 2,
  strong: 4,
} as const;
export function evidenceView(state: Learner, id: string, now: number) {
  const k = getKnowledge(state, id, now),
    range = interval(k),
    level = evidenceLevel(k, now);
  const uncertain =
    k.suspicion > 0.14 || (k.observations > 0 && range[1] - range[0] > 0.5);
  const needs = missing(catalog, state, id, now).length;
  const label = `${level === "none" ? "No direct evidence" : `${level[0].toUpperCase() + level.slice(1)} evidence`}${uncertain ? ", uncertain" : ""}${needs ? `, needs ${needs} prerequisite${needs === 1 ? "" : "s"}` : ""}`;
  return { level, uncertain, needs, label, range, k };
}
export function evidenceCounts(state: Learner, now: number) {
  const counts = { none: 0, emerging: 0, moderate: 0, strong: 0, uncertain: 0 };
  for (const c of catalog) {
    const e = evidenceView(state, c.id, now);
    counts[e.level]++;
    if (e.uncertain) counts.uncertain++;
  }
  return counts;
}
export const shortDate = (at: number) =>
  new Date(at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
