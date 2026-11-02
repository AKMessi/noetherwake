"use client";
import { useState, useRef } from "react";
import {
  dueAt,
  effective,
  missing,
  routeToReady,
  type Learner,
} from "@noetherwake/engine";
import { catalog, concept } from "@/lib/catalog";
import { evidenceView, shortDate } from "@/lib/presentation";
import { EvidenceMark } from "./ui/WorkingPage";
import { PrerequisiteTrace } from "./LessonConnections";
export default function ConceptDetail({
  id,
  state,
  now,
  onSelect,
  onLesson,
  onPractice,
  onTrace,
  trace,
  onClose,
  mobileSheet = false,
}: {
  id: string | null;
  state: Learner;
  now: number;
  onSelect: (id: string) => void;
  onLesson: (id: string) => void;
  onPractice: (id: string) => void;
  onTrace?: (id: string | null) => void;
  trace?: string | null;
  onClose?: () => void;
  mobileSheet?: boolean;
}) {
  const [expanded, setExpanded] = useState(false),
    start = useRef(0);
  if (!id)
    return (
      <aside className="concept-detail empty-detail">
        <h2>Select a concept</h2>
        <p>Its evidence and prerequisite relationships appear here.</p>
      </aside>
    );
  const c = concept(id),
    e = evidenceView(state, id, now),
    next = catalog.filter((n) => n.prerequisites.includes(id));
  return (
    <aside
      className={`concept-detail ${mobileSheet ? "mobile-detail" : ""} ${expanded || trace ? "expanded" : ""}`}
      aria-label="Concept evidence and prerequisites"
    >
      {mobileSheet && (
        <button
          className="detail-handle"
          onPointerDown={(event) => {
            start.current = event.clientY;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            const dy = event.clientY - start.current;
            if (Math.abs(dy) > 24) setExpanded(dy < 0);
          }}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded || !!trace}
          aria-label={
            expanded ? "Collapse concept details" : "Expand concept details"
          }
        >
          <span />
        </button>
      )}
      <header className="detail-heading">
        <div>
          <h2>{c.title}</h2>
          <EvidenceMark state={state} id={id} now={now} text />
        </div>
        {onClose && (
          <button
            className="quiet detail-close"
            aria-label="Close concept details"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </header>
      <div className="detail-body">
        <p>{c.summary}</p>
        <p className="mono detail-probability">
          {e.k.observations
            ? `${Math.round(effective(e.k, now) * 100)}% estimated mastery`
            : "Prior only · no direct observations"}
          <br />
          Model uncertainty {e.range.map((p) => Math.round(p * 100)).join("–")}%
          <br />
          {e.k.observations} direct observations
        </p>
        {e.k.observations > 0 && (
          <p className="mono caption">
            Last evidence: {shortDate(e.k.last)}
            <br />
            Next retrieval: {shortDate(dueAt(e.k))}
          </p>
        )}
        <h3>Needs</h3>
        {c.prerequisites.length ? (
          c.prerequisites.map((p) => (
            <div className="detail-connection" key={p}>
              <button className="text-button" onClick={() => onSelect(p)}>
                <EvidenceMark state={state} id={p} now={now} />
                {concept(p).title}
              </button>
              <span className="caption">
                {evidenceView(state, p, now).label}
              </span>
            </div>
          ))
        ) : (
          <p className="annotation">No hard prerequisites.</p>
        )}
        <h3>Leads to</h3>
        {next.length ? (
          next.map((n) => (
            <button
              key={n.id}
              className="text-button detail-next"
              onClick={() => onSelect(n.id)}
            >
              {n.title} →
            </button>
          ))
        ) : (
          <p className="annotation">A route destination.</p>
        )}
        {trace === id && (
          <PrerequisiteTrace
            state={state}
            id={id}
            now={now}
            onConcept={onLesson}
            onClear={() => onTrace?.(null)}
          />
        )}
        <div className="detail-actions">
          {e.needs && onTrace && trace !== id ? (
            <button
              className="primary full"
              onClick={() => {
                onTrace(id);
                setExpanded(true);
              }}
            >
              Trace the route here →
            </button>
          ) : (
            <button
              className="primary full"
              onClick={() =>
                onLesson(e.needs ? routeToReady(catalog, state, id, now) : id)
              }
            >
              {e.needs
                ? `Start with ${concept(routeToReady(catalog, state, id, now)).title}`
                : "Open lesson"}{" "}
              →
            </button>
          )}
          {!missing(catalog, state, id, now).length && (
            <button className="secondary" onClick={() => onPractice(id)}>
              Practice
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
