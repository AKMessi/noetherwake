"use client";
import { ArrowRight, Lightbulb } from "lucide-react";
import type { Learner } from "@noetherwake/engine";
import { concept } from "@/lib/catalog";

export default function EvidenceReview({
  state,
  onConcept,
}: {
  state: Learner;
  onConcept: (id: string) => void;
}) {
  // Only the latest observation per idea determines whether it belongs in this review.
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
    <section className="evidence-review" aria-labelledby="review-title">
      <div className="studio-section-heading">
        <div>
          <span className="eyebrow">MISTAKES ARE INFORMATION</span>
          <h2 id="review-title">A second look can change everything.</h2>
          <p>
            Ideas whose latest recorded response was incorrect or used support.
          </p>
        </div>
      </div>
      <div className="review-opportunities">
        {opportunities.map((e) => {
          const c = concept(e.concept),
            cause = c.misconceptions.find((m) => m.id === e.misconception);
          return (
            <article key={e.concept}>
              <span className="eyebrow">
                <Lightbulb size={13} />{" "}
                {e.correct
                  ? "RECALLED WITH SUPPORT"
                  : "A CONNECTION TO REVISIT"}
              </span>
              <h3>{c.title}</h3>
              <p>
                {cause
                  ? cause.remediation
                  : e.correct
                    ? "You reached the answer with a hint. Revisit the reasoning before trying independent recall."
                    : "Reconstruct the worked example, then compare your reasoning with the model’s boundary."}
              </p>
              <button className="text-button" onClick={() => onConcept(c.id)}>
                Revisit the idea <ArrowRight size={14} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
