"use client";
import {
  ancestors,
  depth,
  dueAt,
  getKnowledge,
  plan,
  type Learner,
} from "@noetherwake/engine";
import { catalog, concept, goals } from "@/lib/catalog";
import { evidenceCounts, evidenceView, shortDate } from "@/lib/presentation";
import { EvidenceMark, Readout, Sheet } from "./ui/WorkingPage";
import Expeditions, { RouteRuler } from "./Expeditions";
import ProjectileLab from "./ProjectileLab";
interface Props {
  state: Learner;
  now: number;
  onStart: () => void;
  onMap: () => void;
  onLibrary: () => void;
  onJournal: () => void;
  onConcept: (id: string) => void;
  onMinutes: (minutes: 5 | 15 | 30) => void;
  onDirection: (id: string) => void;
  onLab: () => void;
  onResume?: () => void;
  onResumePlacement?: () => void;
}
export default function StudioHome({
  state,
  now,
  onStart,
  onMap,
  onConcept,
  onMinutes,
  onDirection,
  onLab,
  onResume,
  onResumePlacement,
}: Props) {
  const target = ancestors(catalog, state.goal),
    ids = [...target.keys()].sort(
      (a, b) => depth(catalog, a) - depth(catalog, b) || a.localeCompare(b),
    ),
    recommendations = plan(catalog, state, now),
    next = recommendations[0],
    counts = evidenceCounts(state, now),
    strong = ids.filter(
      (id) => evidenceView(state, id, now).level === "strong",
    ).length;
  const due = catalog.filter((c) => {
      const k = getKnowledge(state, c.id, now);
      return k.observations > 0 && dueAt(k) <= now;
    }),
    last = state.sessions.at(-1);
  const route =
    goals.find((g) => g.id === state.goal)?.title ?? concept(state.goal).title;
  const along = next
    ? [
        next.concept,
        ...ids.filter(
          (id) =>
            id !== next.concept &&
            depth(catalog, id) >= depth(catalog, next.concept),
        ),
      ].slice(0, 5)
    : [];
  const margin = state.onboarded ? (
    <>
      <h2>Evidence now</h2>
      <div className="readouts">
        <Readout label="Strong evidence · atlas" value={counts.strong} />
        <Readout label="Moderate evidence · atlas" value={counts.moderate} />
        <Readout
          label="Uncertain · assessed concepts"
          value={counts.uncertain}
        />
      </div>
      <p className="mono">{catalog.length} concepts in the atlas</p>
      {last && (
        <p>
          Last session: {shortDate(last.at)}, {last.total} answered.
        </p>
      )}
      <p>
        Evidence is a model estimate. Dashed ochre rings keep uncertainty
        visible.
      </p>
    </>
  ) : (
    <>
      <h2>Your working page</h2>
      <p>
        Stored on this device. No account, no tracking. You can export
        everything.
      </p>
      <p className="mono">{catalog.length} concepts in the atlas</p>
      <p>
        Mathematics and physics share the same foundations. Each route includes
        the prerequisites its destination needs.
      </p>
    </>
  );
  return (
    <div className={`working-today ${!state.onboarded ? "first-visit" : ""}`}>
      <Sheet margin={margin}>
        <header className="today-header">
          <time dateTime={new Date(now).toISOString()}>{shortDate(now)}</time>
          <span className="section-number">§1</span>
        </header>
        {!state.onboarded ? (
          <section className="first-working-page">
            <h1 className="display">
              Mathematics and physics, in the order they depend on each other.
            </h1>
            <p className="today-introduction">
              Answer a few questions and the atlas marks what you know, what
              you’re unsure of, and the next idea worth learning.
            </p>
            <fieldset className="time-choice">
              <legend>Time for today</legend>
              <div className="segmented">
                {([5, 15, 30] as const).map((m) => (
                  <button
                    key={m}
                    aria-pressed={state.minutes === m}
                    onClick={() => onMinutes(m)}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="actions">
              <button className="primary" onClick={onStart}>
                Find my starting point →
              </button>
              <button
                className="secondary"
                onClick={() =>
                  document.getElementById("today-prediction")?.scrollIntoView({
                    behavior: matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                      ? "instant"
                      : "smooth",
                  })
                }
              >
                Try a prediction first
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="today-route">
              <p className="mono">Route: {route}</p>
              <RouteRuler
                state={state}
                now={now}
                ids={ids}
                onConcept={onConcept}
              />
              <p className="mono caption">
                {strong} of {ids.length} concepts on this route have strong
                evidence
              </p>
            </section>
            {onResumePlacement && (
              <div className="resume-placement">
                <h2>Placement in progress</h2>
                <p>
                  {state.history.filter((e) => e.diagnostic).length} recorded
                  responses.
                </p>
                <div className="actions">
                  <button className="secondary" onClick={onResumePlacement}>
                    Continue placement →
                  </button>
                  <button className="quiet" onClick={onStart}>
                    Start over
                  </button>
                </div>
              </div>
            )}
            <section className="today-next">
              <span className="section-number">Next step</span>
              <h1 className="display">
                {next
                  ? concept(next.concept).title
                  : "Strong evidence along this route"}
              </h1>
              <p className="prose">
                {next?.why ??
                  "The atlas keeps your evidence visible. Return when retrieval is due, or choose another route."}
              </p>
              <div className="actions">
                {onResume ? (
                  <>
                    <button className="primary" onClick={onResume}>
                      Resume practice →
                    </button>
                    <button
                      className="secondary"
                      onClick={() => next && onConcept(next.concept)}
                    >
                      Begin next lesson
                    </button>
                  </>
                ) : next ? (
                  <button
                    className="primary"
                    onClick={() => onConcept(next.concept)}
                  >
                    Begin →
                  </button>
                ) : null}
                <button className="secondary" onClick={onMap}>
                  Where this sits in the atlas
                </button>
              </div>
            </section>
            {along.length > 0 && (
              <section className="along-route">
                <h2>Along the route</h2>
                <ol>
                  {along.map((id) => (
                    <li
                      key={id}
                      className={next?.concept === id ? "recommended" : ""}
                    >
                      <button onClick={() => onConcept(id)}>
                        <EvidenceMark state={state} id={id} now={now} />
                        <span>{concept(id).title}</span>
                        <span className="caption">
                          {evidenceView(state, id, now).needs
                            ? `needs ${evidenceView(state, id, now).needs}`
                            : ""}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {due.length > 0 && (
              <section className="due-retrieval">
                <h2>Due for retrieval</h2>
                {due.map((c) => (
                  <div className="retrieval-row" key={c.id}>
                    <EvidenceMark state={state} id={c.id} now={now} />
                    <span>
                      {c.title}
                      <small className="mono">
                        Last practised{" "}
                        {shortDate(getKnowledge(state, c.id, now).last)}
                      </small>
                    </span>
                    <button
                      className="secondary"
                      onClick={() => onConcept(c.id)}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </section>
            )}
            <section className="open-question">
              <h2>An open question</h2>
              <button className="secondary" onClick={onLab}>
                Which launch angle gives the longest throw on level ground? →
              </button>
            </section>
          </>
        )}
      </Sheet>
      {!state.onboarded && (
        <section id="today-prediction" className="today-prediction">
          <div className="index-heading">
            <span className="section-number">§2</span>
            <h2>Try a prediction</h2>
          </div>
          <ProjectileLab onConcept={onConcept} />
        </section>
      )}
      <Expeditions
        state={state}
        now={now}
        onConcept={onConcept}
        onDirection={onDirection}
      />
    </div>
  );
}
