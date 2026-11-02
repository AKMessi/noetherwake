"use client";
import { useState, type CSSProperties } from "react";
import {
  ancestors,
  depth,
  missing,
  routeToReady,
  type Concept,
  type Learner,
} from "@noetherwake/engine";
import { catalog, concept } from "@/lib/catalog";
import { EvidenceMark } from "./ui/WorkingPage";
export function PrerequisiteTrace({
  state,
  id,
  now,
  onConcept,
  onClear,
}: {
  state: Learner;
  id: string;
  now: number;
  onConcept: (id: string) => void;
  onClear?: () => void;
}) {
  const nodes = [...ancestors(catalog, id).keys()].sort(
    (a, b) => depth(catalog, a) - depth(catalog, b) || a.localeCompare(b),
  );
  const unmet = new Set(nodes.flatMap((n) => missing(catalog, state, n, now))),
    first = routeToReady(catalog, state, id, now);
  return (
    <section
      className="prerequisite-trace"
      aria-label={`Route to ${concept(id).title}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClear?.();
      }}
    >
      <p className="mono">
        Route to {concept(id).title}: {nodes.length} concepts, {unmet.size}{" "}
        unmet
      </p>
      <ol>
        {nodes.map((n) => (
          <li
            key={n}
            style={{ "--trace-layer": depth(catalog, n) } as CSSProperties}
            className={unmet.has(n) ? "unmet" : ""}
          >
            <span className="section-number">depth {depth(catalog, n)}</span>
            <button className="text-button" onClick={() => onConcept(n)}>
              <EvidenceMark state={state} id={n} now={now} />
              {concept(n).title}
            </button>
          </li>
        ))}
      </ol>
      <button className="secondary" onClick={() => onConcept(first)}>
        Start with {concept(first).title} →
      </button>
      {onClear && (
        <button className="quiet" onClick={onClear}>
          Clear trace
        </button>
      )}
    </section>
  );
}
export default function LessonConnections({
  lesson,
  state,
  now,
  onConcept,
}: {
  lesson: Concept;
  state: Learner;
  now: number;
  onConcept: (id: string) => void;
}) {
  const [trace, setTrace] = useState<string | null>(null),
    next = catalog.filter((c) => c.prerequisites.includes(lesson.id));
  return (
    <section className="lesson-connections" aria-label="Connections">
      <h2>Connections</h2>
      <div>
        <h3>Needs</h3>
        {lesson.prerequisites.length ? (
          lesson.prerequisites.map((id) => (
            <div className="connection-row" key={id}>
              <EvidenceMark state={state} id={id} now={now} text />
              <button className="text-button" onClick={() => setTrace(id)}>
                {concept(id).title}
              </button>
            </div>
          ))
        ) : (
          <p>This concept has no hard prerequisites.</p>
        )}
      </div>
      {trace && (
        <PrerequisiteTrace
          state={state}
          id={trace}
          now={now}
          onConcept={onConcept}
          onClear={() => setTrace(null)}
        />
      )}
      <div>
        <h3>Check</h3>
        <details>
          <summary>Think, then reveal</summary>
          <p>
            {lesson.misconceptions[0].description}.{" "}
            {lesson.misconceptions[0].remediation}
          </p>
        </details>
      </div>
      <div>
        <h3>Leads to</h3>
        {next.length ? (
          next.map((c) => (
            <div className="connection-row" key={c.id}>
              <button className="text-button" onClick={() => onConcept(c.id)}>
                <EvidenceMark state={state} id={c.id} now={now} />
                {c.title}
              </button>
            </div>
          ))
        ) : (
          <p>This is a route destination.</p>
        )}
      </div>
    </section>
  );
}
