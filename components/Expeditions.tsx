"use client";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, LockKeyhole } from "lucide-react";
import {
  ancestors,
  getKnowledge,
  missing,
  type Learner,
} from "@noetherwake/engine";
import { catalog, concept } from "@/lib/catalog";
import { expeditions } from "@/lib/expeditions";
import MathText from "./Math";

export function ExpeditionArt({ kind }: { kind: string }) {
  return (
    <svg
      viewBox="0 0 240 120"
      aria-hidden="true"
      className={`expedition-art art-${kind}`}
    >
      {kind === "orbit" ? (
        <g fill="none" stroke="currentColor">
          <ellipse
            cx="120"
            cy="62"
            rx="88"
            ry="32"
            transform="rotate(-22 120 62)"
          />
          <ellipse
            cx="120"
            cy="62"
            rx="60"
            ry="45"
            transform="rotate(35 120 62)"
            opacity=".4"
          />
          <path d="M120 12v100M40 62h160" strokeDasharray="2 5" opacity=".4" />
          <circle cx="120" cy="62" r="16" fill="currentColor" />
          <circle
            cx="191"
            cy="36"
            r="6"
            fill="rgb(var(--sheet))"
            strokeWidth="2"
          />
        </g>
      ) : kind === "curve" ? (
        <g fill="none" stroke="currentColor">
          <path d="M35 15v90h170" opacity=".5" />
          <path d="M40 97C70 97 74 30 116 30s50 63 85 12" strokeWidth="2" />
          {[70, 85, 100, 115, 130, 145, 160].map((x, i) => (
            <path
              key={x}
              d={`M${x} 103v${-[38, 57, 70, 73, 67, 53, 43][i]}`}
              strokeWidth="9"
              opacity=".2"
            />
          ))}
          <path d="M90 57l74 -36" strokeDasharray="4 4" />
          <circle cx="117" cy="30" r="4" fill="currentColor" />
        </g>
      ) : (
        <g fill="none" stroke="currentColor">
          {[-2, -1, 0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M45 ${60 + i * 11}C95 ${60 + i * 40} 145 ${60 + i * 40} 195 ${60 + i * 11}`}
              opacity={i === 0 ? 1 : 0.5}
            />
          ))}
          <circle cx="42" cy="60" r="16" fill="rgb(var(--sheet))" />
          <circle cx="198" cy="60" r="16" fill="rgb(var(--sheet))" />
          <path
            d="M36 60h12m-6-6v12M192 60h12M119 55l7 5-7 5"
            strokeWidth="1.5"
          />
        </g>
      )}
    </svg>
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
  const [selected, setSelected] = useState<string | null>(null);
  const active = expeditions.find((e) => e.id === selected);
  return (
    <section className="expeditions" aria-labelledby="expedition-title">
      <div className="studio-section-heading">
        <div>
          <span className="eyebrow">FOLLOW A THREAD</span>
          <h2 id="expedition-title">Small ideas. Extraordinary places.</h2>
        </div>
        <span className="section-aside">THREE WAYS INTO THE SAME UNIVERSE</span>
      </div>
      <div className="expedition-grid">
        {expeditions.map((e) => {
          const nodes = ancestors(catalog, e.id);
          nodes.set(e.id, 0);
          const observed = [...nodes.keys()].filter(
            (id) => getKnowledge(state, id, now).observations > 0,
          ).length;
          return (
            <button
              key={e.id}
              className={`expedition-card expedition-${e.art}`}
              aria-expanded={selected === e.id}
              aria-controls="expedition-detail"
              onClick={() => setSelected(selected === e.id ? null : e.id)}
            >
              <span className="expedition-card-top">
                <span className="mono">EXPEDITION {e.number}</span>
                <ArrowUpRight size={20} />
              </span>
              <ExpeditionArt kind={e.art} />
              <span className="eyebrow">{e.tag}</span>
              <h3>{e.title}</h3>
              <p>{e.description}</p>
              <span className="expedition-meta">
                {nodes.size} connected lessons{" "}
                <span>
                  {observed ? `${observed} assessed` : "Open the route"}{" "}
                  <ArrowRight size={13} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div id="expedition-detail">
        {active && (
          <div className="expedition-detail">
            <div>
              <span className="eyebrow">A QUESTION TO CARRY WITH YOU</span>
              <h3>{active.question}</h3>
              <p>{active.connection}</p>
              <MathText value={active.formula} />
            </div>
            <div>
              <span className="eyebrow">
                FIVE LANDMARKS · YOUR ROUTE INCLUDES THEIR FOUNDATIONS
              </span>
              <ol className="landmark-list">
                {active.landmarks.map((id) => {
                  const gaps = missing(catalog, state, id, now),
                    observed = getKnowledge(state, id, now).observations;
                  return (
                    <li key={id}>
                      <button onClick={() => onConcept(id)}>
                        <span>{concept(id).title}</span>
                        <small>
                          {gaps.length ? (
                            <>
                              <LockKeyhole size={12} /> Build foundations
                            </>
                          ) : observed ? (
                            "Evidence collected"
                          ) : (
                            "Ready to explore"
                          )}
                        </small>
                        <ArrowRight size={14} />
                      </button>
                    </li>
                  );
                })}
              </ol>
              <button
                className="primary"
                onClick={() => onDirection(active.id)}
              >
                {state.goal === active.id ? (
                  <>
                    <Check size={15} /> Your current direction
                  </>
                ) : (
                  <>
                    Make this my direction <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
