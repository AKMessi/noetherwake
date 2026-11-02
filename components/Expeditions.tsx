"use client";
import { useState } from "react";
import {
  ancestors,
  depth,
  missing,
  plan,
  type Learner,
} from "@noetherwake/engine";
import { catalog, concept } from "@/lib/catalog";
import { expeditions } from "@/lib/expeditions";
import { evidenceView } from "@/lib/presentation";
import { EvidenceMark } from "./ui/WorkingPage";
import MathText from "./Math";
export function RouteRuler({
  state,
  now,
  ids,
  onConcept,
  compact = false,
}: {
  state: Learner;
  now: number;
  ids: string[];
  onConcept: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`route-ruler ${compact ? "compact-ruler" : ""}`}
      aria-label="Concept evidence along this route"
    >
      {ids.map((id) => {
        const e = evidenceView(state, id, now);
        return (
          <button
            key={id}
            title={`${concept(id).title}: ${e.label}`}
            aria-label={`${concept(id).title}: ${e.label}`}
            onClick={() => onConcept(id)}
          >
            <span
              className={`ruler-tick ${e.level} ${e.uncertain ? "uncertain" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
export default function Expeditions({
  state,
  now,
  onConcept,
  onDirection,
}: {
  state: Learner;
  now: number;
  onConcept: (id: string) => void;
  onDirection: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    active = expeditions.find((e) => e.id === selected),
    [expanded, setExpanded] = useState<string | null>(null);
  const ids = active
    ? [...ancestors(catalog, active.id).keys()].sort(
        (a, b) => depth(catalog, a) - depth(catalog, b) || a.localeCompare(b),
      )
    : [];
  const recommended = plan(catalog, state, now).find((a) =>
    ids.includes(a.concept),
  );
  return (
    <section className="expeditions" aria-labelledby="expedition-title">
      <div className="index-heading">
        <span className="section-number">§3</span>
        <h2 id="expedition-title">Routes through the atlas</h2>
      </div>
      <p className="caption">
        Each route includes its destination and all hard prerequisites.
      </p>
      <div className="route-index">
        {expeditions.map((e) => {
          const nodes = [...ancestors(catalog, e.id).keys()],
            strong = nodes.filter(
              (id) => evidenceView(state, id, now).level === "strong",
            ).length;
          return (
            <button
              className="route-index-row"
              key={e.id}
              aria-expanded={selected === e.id}
              aria-controls="expedition-detail"
              onClick={() => {
                setSelected(selected === e.id ? null : e.id);
                setExpanded(null);
              }}
            >
              <span className="route-number mono">{e.number}</span>
              <span className="route-index-text">
                <strong>{e.tag[0] + e.tag.slice(1).toLowerCase()}</strong>
                <span>{e.description}</span>
                <span
                  className="concept-thread"
                  aria-label={`${strong} of ${nodes.length} concepts with strong evidence`}
                >
                  {nodes.map((id) => (
                    <EvidenceMark
                      key={id}
                      id={id}
                      state={state}
                      now={now}
                      size={12}
                    />
                  ))}
                </span>
              </span>
              <span className="route-index-count mono">
                {nodes.length} concepts<span>{strong} strong</span>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>
      <div id="expedition-detail">
        {active && (
          <section
            className="route-detail"
            aria-label={`${active.tag.toLowerCase()} route`}
          >
            <header>
              <h2>{active.question}</h2>
              <p className="prose">{active.connection}</p>
              <MathText value={active.formula} display />
              <button
                className="secondary"
                onClick={() => onDirection(active.id)}
                disabled={state.goal === active.id}
              >
                {state.goal === active.id
                  ? "Current route"
                  : "Use this route →"}
              </button>
            </header>
            <RouteRuler
              state={state}
              now={now}
              ids={ids}
              onConcept={onConcept}
            />
            <p className="mono caption">
              {ids.length} concepts in prerequisite order
            </p>
            <ol className="route-stops">
              {ids.map((id) => {
                const gaps = missing(catalog, state, id, now),
                  c = concept(id),
                  next = recommended?.concept === id;
                return (
                  <li className={next ? "route-current" : ""} key={id}>
                    <span className="route-stop-mark">
                      <EvidenceMark state={state} id={id} now={now} />
                    </span>
                    <div>
                      <button
                        className="route-stop-title"
                        onClick={() => onConcept(id)}
                      >
                        {c.title}
                      </button>
                      <p>{c.summary.split(". ")[0]}.</p>
                      <div className="route-stop-state">
                        <EvidenceMark state={state} id={id} now={now} text />
                        {gaps.length > 0 && (
                          <button
                            className="text-button"
                            aria-expanded={expanded === id}
                            onClick={() =>
                              setExpanded(expanded === id ? null : id)
                            }
                          >
                            See prerequisites
                          </button>
                        )}
                      </div>
                      {expanded === id && (
                        <ul className="route-unmet">
                          {gaps.map((p) => (
                            <li key={p}>
                              <button
                                className="text-button"
                                onClick={() => onConcept(p)}
                              >
                                {concept(p).title} →
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {next && (
                        <button
                          className="secondary"
                          onClick={() => onConcept(id)}
                        >
                          Begin here →
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    </section>
  );
}
