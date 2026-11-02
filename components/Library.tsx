"use client";
import { useState } from "react";
import { missing, type Learner } from "@noetherwake/engine";
import { catalog } from "@/lib/catalog";
import { EvidenceMark } from "./ui/WorkingPage";
import { evidenceView } from "@/lib/presentation";
import ConceptDetail from "./ConceptDetail";
export default function Library({
  state,
  now,
  selected,
  onSelect,
  onLesson,
  onPractice,
  onMap,
}: {
  state: Learner;
  now: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onLesson: (id: string) => void;
  onPractice: (id: string) => void;
  onMap: () => void;
}) {
  const [query, setQuery] = useState(""),
    [domain, setDomain] = useState("all"),
    [strand, setStrand] = useState("all"),
    [readiness, setReadiness] = useState("all"),
    [trace, setTrace] = useState<string | null>(null);
  const nodes = catalog.filter(
    (c) =>
      (domain === "all" || c.domain === domain) &&
      (strand === "all" || c.strand === strand) &&
      (readiness === "all" ||
        (readiness === "ready"
          ? !missing(catalog, state, c.id, now).length
          : readiness === "assessed"
            ? evidenceView(state, c.id, now).k.observations > 0
            : evidenceView(state, c.id, now).level === readiness)) &&
      `${c.title} ${c.strand} ${c.summary}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="library-page">
      <header className="standard-heading">
        <h1>Library</h1>
        <p>
          {catalog.length} concepts in the atlas. Select one to inspect its
          evidence and connections.
        </p>
        <button className="secondary" onClick={onMap}>
          Map view →
        </button>
      </header>
      <div className="library-workspace">
        <div className="library-sheet">
          <div className="library-search-bar">
            <label>
              <span className="sr-only">Search concepts</span>
              <input
                aria-label="Search concepts"
                placeholder="Search concepts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="segmented" aria-label="Filter by domain">
              {[
                ["all", "Both"],
                ["math", "Mathematics"],
                ["physics", "Physics"],
              ].map(([d, label]) => (
                <button
                  key={d}
                  aria-pressed={domain === d}
                  onClick={() => {
                    setDomain(d);
                    setStrand("all");
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="library-filter-row">
            <label>
              Strand
              <select
                aria-label="Filter by strand"
                value={strand}
                onChange={(e) => setStrand(e.target.value)}
              >
                <option value="all">Every strand</option>
                {[
                  ...new Set(
                    catalog
                      .filter((c) => domain === "all" || c.domain === domain)
                      .map((c) => c.strand),
                  ),
                ]
                  .sort()
                  .map((s) => (
                    <option key={s}>{s}</option>
                  ))}
              </select>
            </label>
            <label>
              Evidence
              <select
                aria-label="Filter by readiness"
                value={readiness}
                onChange={(e) => setReadiness(e.target.value)}
              >
                {[
                  ["all", "All states"],
                  ["ready", "Ready to study"],
                  ["assessed", "Direct evidence"],
                  ["strong", "Strong"],
                  ["moderate", "Moderate"],
                  ["emerging", "Emerging"],
                ].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="caption library-count" aria-live="polite">
            {nodes.length} matching concepts
          </p>
          <div className="library-rows">
            {nodes.map((c) => {
              const e = evidenceView(state, c.id, now);
              return (
                <button
                  className="library-row"
                  aria-pressed={selected === c.id}
                  key={c.id}
                  onClick={() => {
                    onSelect(c.id);
                    setTrace(null);
                  }}
                >
                  <EvidenceMark state={state} id={c.id} now={now} />
                  <span className="library-title">{c.title}</span>
                  <span className="library-strand caption">{c.strand}</span>
                  <span className="library-state mono">
                    {e.needs
                      ? `needs ${e.needs}`
                      : e.level === "none"
                        ? "not yet seen"
                        : e.level}
                  </span>
                </button>
              );
            })}
          </div>
          {!nodes.length && (
            <div className="empty-state">
              <h2>Nothing matches ‘{query}’.</h2>
              <p>Try a broader term, or browse by strand.</p>
              <button
                className="secondary"
                onClick={() => {
                  setQuery("");
                  setDomain("all");
                  setStrand("all");
                  setReadiness("all");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
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
          onClose={() => onSelect(null)}
          mobileSheet
        />
      </div>
    </div>
  );
}
