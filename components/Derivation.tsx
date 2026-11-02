"use client";
import { useState } from "react";
import type { Concept } from "@noetherwake/engine";
import MathText from "./Math";
import { concept } from "@/lib/catalog";
export default function Derivation({
  lesson,
  onConcept,
}: {
  lesson: Concept;
  onConcept: (id: string) => void;
}) {
  const [visible, setVisible] = useState(1),
    total = lesson.derivation.length;
  return (
    <section
      className="derivation working-derivation"
      aria-labelledby="derivation-title"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          setVisible((v) => Math.min(total, v + 1));
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setVisible((v) => Math.max(1, v - 1));
        }
      }}
    >
      <h2 id="derivation-title">Working through the steps</h2>
      <p className="caption">
        {visible} of {total} lines · Focus this section and use → to reveal, ←
        to hide.
      </p>
      <ol className="derivation-lines">
        {lesson.derivation.map((d, i) => (
          <li key={i} hidden={i >= visible}>
            <span className="section-number">{i + 1}</span>
            <div className="derivation-expression">
              <MathText value={d.expression} />
            </div>
            <aside className="annotation">
              {d.rule}
              <button
                className="text-button"
                onClick={() => onConcept(d.concept)}
              >
                {concept(d.concept).title}
              </button>
            </aside>
          </li>
        ))}
      </ol>
      <div className="actions">
        <button
          className="secondary"
          disabled={visible === total}
          onClick={() => setVisible((v) => Math.min(total, v + 1))}
        >
          Reveal next line →
        </button>
        <button
          className="quiet"
          disabled={visible === total}
          onClick={() => setVisible(total)}
        >
          Show all
        </button>
        {visible > 1 && (
          <button className="quiet" onClick={() => setVisible((v) => v - 1)}>
            Hide last line
          </button>
        )}
      </div>
    </section>
  );
}
