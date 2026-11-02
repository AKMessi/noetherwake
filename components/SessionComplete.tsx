"use client";
import {
  dueAt,
  getKnowledge,
  interval,
  type Learner,
  type Knowledge,
  type SessionRecord,
} from "@noetherwake/engine";
import { catalog, concept } from "@/lib/catalog";
import { evidenceView, shortDate } from "@/lib/presentation";
import EvidenceShift from "./ui/EvidenceShift";
import { EvidenceMark, Sheet } from "./ui/WorkingPage";
export default function SessionComplete({
  state,
  record,
  before,
  now,
  reflection,
  onReflection,
  onSave,
  onToday,
  onContinue,
  next,
}: {
  state: Learner;
  record: SessionRecord;
  before: Record<string, Knowledge>;
  now: number;
  reflection: string;
  onReflection: (value: string) => void;
  onSave: () => void;
  onToday: () => void;
  onContinue: () => void;
  next?: string;
}) {
  const uncertain = record.concepts.filter(
    (id) => evidenceView(state, id, now).uncertain,
  );
  return (
    <Sheet
      margin={
        <>
          <h2>What’s still uncertain</h2>
          {uncertain.length ? (
            uncertain.map((id) => (
              <p key={id}>
                <EvidenceMark state={state} id={id} now={now} />{" "}
                {concept(id).title}
                <br />
                <span className="mono">
                  {interval(getKnowledge(state, id, now))
                    .map((v) => Math.round(v * 100))
                    .join("–")}
                  % model interval
                </span>
              </p>
            ))
          ) : (
            <p>
              No additional uncertainty signal is flagged for these concepts.
            </p>
          )}
          <p>
            Evidence remains an estimate. A later independent response can
            change it.
          </p>
        </>
      }
    >
      <section className="session-complete">
        <h1>Session complete</h1>
        <p className="session-total mono">
          {record.total} answered, {record.correct} correct
        </p>
        <h2>What changed</h2>
        <div className="completed-changes">
          {record.concepts.map((id) => {
            const k = getKnowledge(state, id, now),
              delta = record.changes[id];
            return (
              <article key={id}>
                <h3>{concept(id).title}</h3>
                {before[id] && (
                  <EvidenceShift before={before[id]} after={k} at={record.at} />
                )}
                <p className="mono caption">
                  {delta >= 0 ? "+" : ""}
                  {(delta * 100).toFixed(1)} percentage points in estimated
                  mastery
                </p>
                {k.observations > 0 && (
                  <p className="annotation">
                    Next review: {shortDate(dueAt(k))}
                  </p>
                )}
              </article>
            );
          })}
        </div>
        <label className="field-label" htmlFor="reflection">
          What clicked? What still feels uncertain?
        </label>
        <textarea
          id="reflection"
          rows={3}
          value={reflection}
          onChange={(e) => onReflection(e.target.value.slice(0, 4000))}
        />
        <button className="secondary" onClick={onSave}>
          Save reflection
        </button>
        <div className="completion-actions">
          {next && (
            <button className="primary" onClick={onContinue}>
              Continue: {concept(next).title} →
            </button>
          )}
          <button className="secondary" onClick={onToday}>
            Back to Today
          </button>
        </div>
      </section>
    </Sheet>
  );
}
