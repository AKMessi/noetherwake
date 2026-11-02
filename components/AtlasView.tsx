"use client";
import { useEffect, useState } from "react";
import type { Learner } from "@noetherwake/engine";
import { catalog } from "@/lib/catalog";
import ConceptMap from "./ConceptMap";
import ConceptDetail from "./ConceptDetail";
export default function AtlasView({
  state,
  now,
  selected,
  onSelect,
  onLesson,
  onPractice,
  onList,
}: {
  state: Learner;
  now: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onLesson: (id: string) => void;
  onPractice: (id: string) => void;
  onList: () => void;
}) {
  const [trace, setTrace] = useState<string | null>(null);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (trace) setTrace(null);
        else onSelect(null);
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [trace, onSelect]);
  return (
    <div className="atlas-page">
      <header className="atlas-page-header">
        <h1>Atlas</h1>
        <p className="mono caption">
          {catalog.length} concepts · hard prerequisites
        </p>
        <button className="secondary" onClick={onList}>
          Library view
        </button>
      </header>
      <div className="atlas-workspace">
        <ConceptMap
          state={state}
          selected={selected ?? undefined}
          onSelect={onSelect}
          trace={trace}
          onClearTrace={() => setTrace(null)}
        />
        <ConceptDetail
          key={selected}
          id={selected}
          state={state}
          now={now}
          onSelect={onSelect}
          onLesson={onLesson}
          onPractice={onPractice}
          onTrace={setTrace}
          trace={trace}
          onClose={() => {
            onSelect(null);
            setTrace(null);
          }}
          mobileSheet
        />
      </div>
    </div>
  );
}
