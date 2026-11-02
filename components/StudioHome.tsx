"use client";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Compass,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import {
  ancestors,
  dueAt,
  effective,
  getKnowledge,
  plan,
  type Learner,
} from "@noetherwake/engine";
import { catalog, concept, goals } from "@/lib/catalog";
import ProjectileLab from "./ProjectileLab";
import Expeditions from "./Expeditions";

function UniverseArt() {
  return (
    <svg viewBox="0 0 390 340" className="universe-art" aria-hidden="true">
      <defs>
        <pattern
          id="universe-grid"
          width="26"
          height="26"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M26 0H0V26"
            fill="none"
            stroke="currentColor"
            strokeWidth=".5"
            opacity=".15"
          />
        </pattern>
        <radialGradient id="planet-shade" cx=".3" cy=".2">
          <stop stopColor="#e8f5a8" />
          <stop offset="1" stopColor="#8eaa3b" />
        </radialGradient>
      </defs>
      <circle cx="205" cy="160" r="135" fill="url(#universe-grid)" />
      <g fill="none" stroke="currentColor">
        <ellipse
          cx="205"
          cy="160"
          rx="170"
          ry="54"
          transform="rotate(-35 205 160)"
          strokeWidth="1"
          opacity=".85"
        />
        <ellipse
          cx="205"
          cy="160"
          rx="138"
          ry="83"
          transform="rotate(42 205 160)"
          strokeDasharray="3 6"
          opacity=".35"
        />
        <circle cx="205" cy="160" r="101" opacity=".2" />
        <path d="M205 10v300M25 160h350" strokeDasharray="2 7" opacity=".25" />
        <circle
          cx="205"
          cy="160"
          r="58"
          fill="url(#planet-shade)"
          stroke="none"
        />
        <ellipse
          cx="205"
          cy="160"
          rx="58"
          ry="21"
          transform="rotate(-35 205 160)"
          stroke="#33412b"
          opacity=".4"
        />
        <ellipse
          cx="205"
          cy="160"
          rx="22"
          ry="58"
          transform="rotate(-35 205 160)"
          stroke="#33412b"
          opacity=".4"
        />
        <path d="M159 194l91-66" stroke="#33412b" opacity=".4" />
        <circle cx="335" cy="69" r="9" fill="#eea27a" stroke="none" />
        <circle cx="335" cy="69" r="17" opacity=".4" />
        <circle cx="96" cy="88" r="5" fill="currentColor" />
        <path d="M80 248h20m-10-10v20M305 253h12m-6-6v12" opacity=".8" />
        <path d="M218 40h48l18-18M77 215l-31 10" opacity=".5" />
      </g>
      <text x="270" y="32">
        f(x) → understanding
      </text>
      <text x="22" y="245">
        FIG. 01
      </text>
      <text x="248" y="303">
        EVERYTHING IS CONNECTED.
      </text>
    </svg>
  );
}
export default function StudioHome({
  state,
  now,
  onStart,
  onMap,
  onLibrary,
  onJournal,
  onConcept,
  onMinutes,
  onDirection,
}: {
  state: Learner;
  now: number;
  onStart: () => void;
  onMap: () => void;
  onLibrary: () => void;
  onJournal: () => void;
  onConcept: (id: string) => void;
  onMinutes: (minutes: 5 | 15 | 30) => void;
  onDirection: (id: string) => void;
}) {
  const actions = plan(catalog, state, now),
    next = actions[0],
    nextConcept = next ? concept(next.concept) : null;
  const assessed = catalog.filter(
    (c) => getKnowledge(state, c.id, now).observations > 0,
  );
  const due = assessed.filter(
    (c) => dueAt(getKnowledge(state, c.id, now)) < now,
  );
  const target = ancestors(catalog, state.goal);
  target.set(state.goal, 0);
  const strong = assessed.filter(
    (c) =>
      target.has(c.id) && effective(getKnowledge(state, c.id, now), now) >= 0.8,
  );
  return (
    <>
      <div className="studio-heading">
        <div>
          <span className="eyebrow">
            <span className="tiny-square" /> YOUR PERSONAL LEARNING STUDIO
          </span>
          <h1>
            Follow your <em>curiosity.</em>
          </h1>
          <p>Make sense of the math. See the physics. Connect the dots.</p>
        </div>
        <div className="studio-date">
          <span className="mono" suppressHydrationWarning>
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }).format(now)}
          </span>
          <span>A little further, a little clearer.</span>
        </div>
      </div>
      <div className="studio-hero-grid">
        <section className="universe-card">
          <div className="universe-copy">
            <span className="eyebrow">
              <Sparkles size={13} /> BIG IDEAS START SMALL
            </span>
            <h2>
              Learn to see
              <br />
              the world
              <br />
              <em>differently.</em>
            </h2>
            <p>
              From the shape of a curve to the arc of a planet. Build
              understanding that goes beyond the answer.
            </p>
            <button className="universe-atlas-link" onClick={onMap}>
              Explore the knowledge atlas <ArrowUpRight size={17} />
            </button>
            <button className="universe-start" onClick={onStart}>
              {state.onboarded
                ? "Continue your path"
                : "Find your starting point"}
              <ArrowRight size={17} />
            </button>
          </div>
          <UniverseArt />
          <div className="universe-foot">
            <span>MATHEMATICS ↔ PHYSICS</span>
            <span>ONE CONNECTED UNIVERSE</span>
          </div>
        </section>
        <section
          className="recommendation-card"
          aria-labelledby="next-step-title"
        >
          <div className="recommendation-top">
            <span className="eyebrow">
              <i />{" "}
              {state.onboarded
                ? "CHOSEN FROM YOUR EVIDENCE"
                : "A PATH THAT STARTS WITH YOU"}
            </span>
            <Compass size={21} />
          </div>
          <span className="recommendation-label">
            {state.onboarded
              ? `${nextConcept?.strand ?? "Memory"} / Your next connection`
              : "01 / Find your footing"}
          </span>
          <h2 id="next-step-title">
            {state.onboarded ? (
              (nextConcept?.title ?? "Let it settle.")
            ) : (
              <>
                Your mind.
                <br />
                Your starting point.
              </>
            )}
          </h2>
          <p>
            {state.onboarded
              ? (nextConcept?.summary ??
                "Your next review will appear when it is useful.")
              : "A few thoughtful questions help us find what you know, what’s uncertain, and the best place to begin."}
          </p>
          <button className="primary" onClick={onStart}>
            {state.onboarded ? "Continue learning" : "Find my starting point"}
            <ArrowRight size={17} />
          </button>
          <div className="recommendation-why">
            <Lightbulb size={15} />
            <p>
              {state.onboarded
                ? (next?.why ??
                  "Choose another direction or return for a scheduled review.")
                : "No grades. No pressure. A useful path begins with honest evidence."}
            </p>
          </div>
          <div className="session-duration">
            <span>
              <Clock3 size={13} /> Make a little space
            </span>
            <div aria-label="Session length">
              {([5, 15, 30] as const).map((m) => (
                <button
                  key={m}
                  aria-pressed={state.minutes === m}
                  className={state.minutes === m ? "selected" : ""}
                  onClick={() => onMinutes(m)}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="studio-metrics">
        <button onClick={onLibrary}>
          <BookOpen size={20} />
          <div>
            <strong>
              {catalog.length}
              <span>connected ideas</span>
            </strong>
            <small>Foundations to fields</small>
          </div>
          <ArrowUpRight size={15} />
        </button>
        <button onClick={onMap}>
          <Target size={20} />
          <div>
            <strong>
              {state.onboarded
                ? `${strong.length}/${target.size}`
                : "Your own pace"}
              <span>
                {state.onboarded
                  ? "with strong evidence"
                  : "one useful step at a time"}
              </span>
            </strong>
            <small>{goals.find((g) => g.id === state.goal)?.title}</small>
          </div>
          <ArrowUpRight size={15} />
        </button>
        <button onClick={due.length ? onStart : onJournal}>
          <Clock3 size={20} />
          <div>
            <strong>
              {due.length ? due.length : "Room to grow"}
              <span>
                {due.length
                  ? `${due.length === 1 ? "idea" : "ideas"} ready to revisit`
                  : assessed.length
                    ? "memory needs a little space"
                    : "your evidence starts with practice"}
              </span>
            </strong>
            <small>
              {due.length
                ? "Your next session includes retrieval"
                : "A fresh page, without a backlog"}
            </small>
          </div>
          <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="studio-section-heading lab-heading">
        <div>
          <span className="eyebrow">LESS SCROLLING. MORE DISCOVERING.</span>
          <h2>What happens if…</h2>
        </div>
        <span className="section-aside">
          <span className="experiment-dot" /> A LIVE THOUGHT EXPERIMENT
        </span>
      </div>
      <ProjectileLab onConcept={onConcept} />
      <Expeditions
        state={state}
        now={now}
        onConcept={onConcept}
        onDirection={onDirection}
      />
      {state.history.length > 0 && (
        <section className="recent-evidence">
          <div className="studio-section-heading">
            <div>
              <span className="eyebrow">PICK UP A THREAD</span>
              <h2>Fresh from your field notes.</h2>
            </div>
            <button className="text-button" onClick={onJournal}>
              Open your journal <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="evidence-grid">
            {state.history
              .slice(-3)
              .reverse()
              .map((e, i) => (
                <button
                  key={`${e.at}-${i}`}
                  onClick={() => onConcept(e.concept)}
                >
                  <span className="eyebrow">
                    {e.diagnostic ? "PLACEMENT" : "PRACTICE"} /{" "}
                    {e.correct
                      ? e.hints
                        ? "WITH SUPPORT"
                        : "INDEPENDENT RECALL"
                      : "WORTH ANOTHER LOOK"}
                  </span>
                  <h3>{concept(e.concept).title}</h3>
                  <ArrowUpRight size={17} />
                </button>
              ))}
          </div>
        </section>
      )}
      <section className="learning-principles">
        <div>
          <span className="eyebrow">UNDERSTANDING HAS A RHYTHM</span>
          <h2>
            Meet an idea.
            <br />
            <em>Make it yours.</em>
          </h2>
        </div>
        <ol>
          {[
            {
              title: "Start with intuition",
              text: "See the idea before meeting its notation.",
            },
            {
              title: "Put it to the test",
              text: "Predict, experiment and explain what changed.",
            },
            {
              title: "Come back at the right time",
              text: "Use retrieval to keep an idea within reach.",
            },
          ].map((p, i) => (
            <li key={p.title}>
              <span className="mono">0{i + 1}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <footer className="studio-footer">
        <span>
          <ShieldCheck size={14} /> Your curiosity. Your data. Your device.
        </span>
        <span>BUILT FOR UNDERSTANDING, NOT POINTS.</span>
      </footer>
    </>
  );
}
