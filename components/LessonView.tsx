"use client";
import { useEffect, useRef, useState } from "react";
import {
  dueAt,
  effective,
  getKnowledge,
  missing,
  routeToReady,
  type Learner,
} from "@noetherwake/engine";
import { catalog, concept } from "@/lib/catalog";
import { evidenceView } from "@/lib/presentation";
import { EvidenceMark, Sheet } from "./ui/WorkingPage";
import LessonReading from "./LessonReading";
import LessonConnections, { PrerequisiteTrace } from "./LessonConnections";
import Derivation from "./Derivation";
import Interactive from "./Interactive";
export default function LessonView({
  id,
  state,
  now,
  onConcept,
  onPractice,
  onToday,
}: {
  id: string;
  state: Learner;
  now: number;
  onConcept: (id: string) => void;
  onPractice: (id: string) => void;
  onToday: () => void;
}) {
  const lesson = concept(id),
    gaps = missing(catalog, state, id, now),
    e = evidenceView(state, id, now);
  const [progress, setProgress] = useState(0),
    [endVisible, setEndVisible] = useState(false),
    end = useRef<HTMLElement>(null),
    reading = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      if (!reading.current) return;
      const prose =
        reading.current.querySelector<HTMLElement>(".lesson-reading") ??
        reading.current;
      const r = prose.getBoundingClientRect();
      setProgress(Math.max(0, Math.min(1, -r.top / Math.max(1, r.height))));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [id]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) =>
      setEndVisible(entries[0].isIntersecting),
    );
    if (end.current) observer.observe(end.current);
    return () => observer.disconnect();
  }, [id]);
  const strong =
    effective(getKnowledge(state, id, now), now) > 0.93 &&
    dueAt(getKnowledge(state, id, now)) > now;
  return (
    <div className="lesson-page" ref={reading} key={id}>
      <div
        className="reading-progress"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${progress * 100}%` }} />
      </div>
      <button className="text-button back-button" onClick={onToday}>
        ← Back to Today
      </button>
      <Sheet
        className="reading-frame"
        margin={
          <LessonConnections
            key={id}
            lesson={lesson}
            state={state}
            now={now}
            onConcept={onConcept}
          />
        }
      >
        <header className="lesson-heading">
          <p className="mono caption">
            {lesson.domain === "math" ? "Mathematics" : "Physics"} ·{" "}
            {lesson.strand}
          </p>
          <h1>{lesson.title}</h1>
          <p className="lesson-summary">{lesson.summary}</p>
          <div className="lesson-meta">
            <EvidenceMark state={state} id={id} now={now} />
            <span className="mono">{e.label}</span>
          </div>
          {!gaps.length && (
            <nav className="lesson-jumps" aria-label="In this lesson">
              <a href="#derivation-title">Derivation</a>
              <a href="#interactive-title">Experiment</a>
              <a href="#lesson-practice">Practice</a>
            </nav>
          )}
        </header>
        {gaps.length ? (
          <section className="locked-lesson">
            <h2>Prerequisites to work on first</h2>
            <p>
              This concept depends on the following evidence. Follow the route
              to a ready foundation.
            </p>
            <PrerequisiteTrace
              state={state}
              id={id}
              now={now}
              onConcept={onConcept}
            />
            <button
              className="primary"
              onClick={() => onConcept(routeToReady(catalog, state, id, now))}
            >
              Begin with a ready foundation →
            </button>
          </section>
        ) : (
          <LessonReading html={lesson.html ?? ""} onConcept={onConcept} />
        )}
      </Sheet>
      {!gaps.length && (
        <>
          <Derivation key={id} lesson={lesson} onConcept={onConcept} />
          <Interactive key={id} concept={lesson} />
          <Sheet className="lesson-ending">
            <section className="lesson-boundary">
              <h2>Model boundary</h2>
              <p className="prose">{lesson.boundary}</p>
            </section>
            <section ref={end} className="lesson-practice" id="lesson-practice">
              <h2>Practice this concept</h2>
              <p className="prose">
                Reconstruct the reasoning without the worked example.
              </p>
              {strong ? (
                <p className="annotation">
                  The evidence is strong. The scheduler will recommend a return
                  when retrieval is due.
                </p>
              ) : (
                <button className="primary" onClick={() => onPractice(id)}>
                  Practice this →
                </button>
              )}
            </section>
          </Sheet>
        </>
      )}
      {!gaps.length && !strong && progress > 0.6 && !endVisible && (
        <div className="lesson-sticky-action">
          <button className="primary full" onClick={() => onPractice(id)}>
            Practice this →
          </button>
        </div>
      )}
    </div>
  );
}
