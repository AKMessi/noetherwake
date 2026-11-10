"use client";
import { HardDrive } from "lucide-react";
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
  ready?: boolean;
  state: Learner;
  now: number;
  onStart: () => void;
  onMap: () => void;
  onConcept: (id: string) => void;
  onMinutes: (minutes: 5 | 15 | 30) => void;
  onDirection: (id: string) => void;
  onLab: () => void;
  onResume?: () => void;
  onResumePlacement?: () => void;
}
export default function StudioHome({
  ready = true,
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
  const margin = (
    <>
      <h2>What you’ve tested</h2>
      <div className="readouts">
        <Readout label="Strong evidence · atlas" value={counts.strong} />
        <Readout label="Moderate evidence · atlas" value={counts.moderate} />
        <Readout
          label="Uncertain among tested concepts"
          value={counts.uncertain}
        />
      </div>
      {last && (
        <p>
          Last session: {shortDate(last.at)}, {last.total} answered.
        </p>
      )}
      <p>Dashed rings mark where the evidence is still uncertain.</p>
    </>
  );
  return (
    <div className={`working-today ${!state.onboarded ? "first-visit" : ""}`}>
      {!state.onboarded ? (
        <>
          <div id="today-prediction">
            <ProjectileLab onConcept={onConcept} />
          </div>
          <section
            className="placement-invitation"
            aria-labelledby="placement-invitation"
          >
            <div>
              <h2 id="placement-invitation">Find where to begin.</h2>
              <p>
                Choose a goal in mathematics or physics. A short placement finds
                a lesson that fits what you know.
              </p>
              <p className="local-promise">
                <HardDrive size={15} aria-hidden="true" /> Your work stays on
                this device.
              </p>
            </div>
            {ready ? (
              <div className="placement-actions">
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
                <button className="primary" onClick={onStart}>
                  Find my starting point →
                </button>
              </div>
            ) : (
              <div className="home-loading" role="status">
                <p>Reading from this device</p>
              </div>
            )}
          </section>
        </>
      ) : (
        <Sheet margin={ready ? margin : <p>Reading from this device.</p>}>
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
            <span className="next-label">{route} / Next step</span>
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
                  {next && (
                    <button
                      className="secondary"
                      onClick={() => onConcept(next.concept)}
                    >
                      Begin next lesson
                    </button>
                  )}
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
          <section className="today-route">
            <h2>Your route so far</h2>
            <RouteRuler
              state={state}
              now={now}
              ids={ids}
              onConcept={onConcept}
            />
            <p className="caption">
              {strong} of {ids.length} concepts on this route have strong
              evidence
            </p>
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
                  <button className="secondary" onClick={() => onConcept(c.id)}>
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
        </Sheet>
      )}
      {ready && (
        <Expeditions
          state={state}
          now={now}
          onConcept={onConcept}
          onDirection={onDirection}
        />
      )}
    </div>
  );
}
