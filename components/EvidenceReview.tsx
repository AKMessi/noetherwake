"use client";
import type { Learner } from "@noetherwake/engine";
import { concept } from "@/lib/catalog";
export default function EvidenceReview({
  state,
  onConcept,
}: {
  state: Learner;
  onConcept: (id: string) => void;
}) {
  const seen = new Set<string>();
  const opportunities = [...state.history]
    .reverse()
    .filter((e) => {
      if (seen.has(e.concept)) return false;
      seen.add(e.concept);
      return !e.correct || e.hints > 0;
    })
    .slice(0, 6);
  if (!opportunities.length) return null;
  return (
    <section className="evidence-review">
      <h2>Worth another pass</h2>
      <p className="caption">
        Concepts whose latest recorded response was incorrect or used support.
      </p>
      <div>
        {opportunities.map((e) => {
          const c = concept(e.concept),
            cause = c.misconceptions.find((m) => m.id === e.misconception);
          return (
            <div className="review-row" key={c.id}>
              <div>
                <h3>{c.title}</h3>
                <p>
                  {cause
                    ? cause.remediation
                    : e.correct
                      ? "The last response used support. Try independent recall."
                      : "Compare the worked reasoning with your response."}
                </p>
              </div>
              <button className="secondary" onClick={() => onConcept(c.id)}>
                Revisit the idea →
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
