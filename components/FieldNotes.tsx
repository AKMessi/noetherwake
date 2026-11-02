"use client";
import { useMemo, useState } from "react";
import type { Learner } from "@noetherwake/engine";
import { concept } from "@/lib/catalog";
import { evidenceCounts, shortDate } from "@/lib/presentation";
import { evidenceLedger } from "@/lib/evidence-ledger";
import { Readout } from "./ui/WorkingPage";
import EvidenceShift from "./ui/EvidenceShift";
import EvidenceReview from "./EvidenceReview";
export default function FieldNotes({
  state,
  now,
  onConcept,
}: {
  state: Learner;
  now: number;
  onConcept: (id: string) => void;
}) {
  const [selected, setSelected] = useState("all"),
    [result, setResult] = useState("all"),
    counts = evidenceCounts(state, now),
    entries = useMemo(() => evidenceLedger(state), [state]),
    ids = [...new Set(state.history.map((e) => e.concept))];
  const filtered = entries
    .filter(
      ({ e }) =>
        (selected === "all" || e.concept === selected) &&
        (result === "all" || e.correct === (result === "correct")),
    )
    .reverse();
  const days = [...new Set(filtered.map(({ e }) => shortDate(e.at)))];
  return (
    <div className="field-notes">
      <header className="standard-heading">
        <h1>Field notes</h1>
        <p>Your answers, confidence, and reflections, stored on this device.</p>
      </header>
      <section className="evidence-overview">
        <h2>What the evidence says now</h2>
        <div className="readouts">
          <Readout label="No direct evidence" value={counts.none} />
          <Readout label="Emerging" value={counts.emerging} />
          <Readout label="Moderate" value={counts.moderate} />
          <Readout label="Strong" value={counts.strong} />
        </div>
        <p className="caption">
          Counts cover the whole atlas. {counts.uncertain} assessed concepts
          retain broad uncertainty or a prerequisite suspicion.
        </p>
      </section>
      {!state.history.length ? (
        <section className="empty-state">
          <h2>Nothing recorded yet.</h2>
          <p>
            Evidence is added when you answer practice or placement questions.
            Reading lessons and using the lab don’t change it.
          </p>
        </section>
      ) : (
        <>
          <div className="ledger-filters">
            <label>
              Concept
              <select
                value={selected}
                aria-label="Filter notes by concept"
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="all">All concepts</option>
                {ids.map((id) => (
                  <option key={id} value={id}>
                    {concept(id).title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Result
              <select
                value={result}
                aria-label="Filter notes by result"
                onChange={(e) => setResult(e.target.value)}
              >
                <option value="all">All responses</option>
                <option value="correct">Correct</option>
                <option value="incorrect">Incorrect</option>
              </select>
            </label>
          </div>
          <div className="evidence-ledger">
            {days.map((day) => (
              <section className="ledger-day" key={day}>
                <h2 className="mono">{day}</h2>
                <div>
                  {filtered
                    .filter(({ e }) => shortDate(e.at) === day)
                    .map(({ e, before, after, reproducible }, i) => (
                      <article
                        className="ledger-entry"
                        key={`${e.at}-${e.item}-${i}`}
                      >
                        <div className="ledger-event">
                          <button
                            className="ledger-concept"
                            onClick={() => onConcept(e.concept)}
                          >
                            {concept(e.concept).title}
                          </button>
                          <p className="ledger-verdict">
                            <span
                              className={
                                e.correct ? "correct-text" : "incorrect-text"
                              }
                            >
                              {e.correct ? "Correct" : "Incorrect"}
                            </span>
                            <span className="mono">
                              {Math.round(e.confidence * 100)}% confidence
                            </span>
                          </p>
                          <p className="caption">
                            {e.diagnostic ? "Placement" : "Practice"} ·{" "}
                            {e.hints
                              ? `${e.hints} hint${e.hints === 1 ? "" : "s"}`
                              : "Independent response"}
                            {e.hints >= 3 ? " · no mastery credit" : ""}
                          </p>
                          {e.misconception && (
                            <p className="annotation">
                              {concept(e.concept).misconceptions.find(
                                (m) => m.id === e.misconception,
                              )?.remediation ??
                                (e.misconception === "units"
                                  ? "Check that the unit matches the quantity."
                                  : "")}
                            </p>
                          )}
                        </div>
                        <aside className="ledger-effect">
                          {reproducible ? (
                            <EvidenceShift
                              before={before}
                              after={after}
                              at={e.at}
                            />
                          ) : (
                            <p className="annotation">
                              Historical evidence marks are unavailable for this
                              retained response.
                            </p>
                          )}
                        </aside>
                      </article>
                    ))}
                </div>
              </section>
            ))}
          </div>
          {!filtered.length && (
            <p className="empty-state">
              No recorded responses match these filters.
            </p>
          )}
          <EvidenceReview state={state} onConcept={onConcept} />
        </>
      )}
      {state.sessions.length > 0 && (
        <section className="session-ledger">
          <h2>Session reflections</h2>
          {[...state.sessions].reverse().map((session, i) => (
            <article key={`${session.at}-${i}`}>
              <time>{shortDate(session.at)}</time>
              <div>
                <h3>
                  {session.total} answered, {session.correct} correct
                </h3>
                <p className="prose">
                  {session.reflection || "No reflection recorded."}
                </p>
                <p className="caption">
                  {session.minutes} min ·{" "}
                  {session.concepts.map((id) => concept(id).title).join(" · ")}
                </p>
                {Object.entries(session.changes).map(([id, delta]) => (
                  <p className="mono caption" key={id}>
                    {concept(id).title}: {delta >= 0 ? "+" : ""}
                    {(delta * 100).toFixed(1)} percentage points in estimated
                    mastery
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
