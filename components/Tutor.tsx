"use client";
import StudioHome from "./StudioHome";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  FlaskConical,
  House,
  Network,
  NotebookPen,
  Settings2,
  X,
} from "lucide-react";
import {
  ancestors,
  createLearner,
  diagnosticNext,
  effective,
  estimateFrontier,
  generate,
  getKnowledge,
  missing,
  observe,
  plan,
  routeToReady,
  selectTemplate,
  sessionPlan,
  stage,
  type Evidence,
  type Knowledge,
  type Item,
  type Learner,
  type SessionRecord,
} from "@noetherwake/engine";
import { catalog, concept, goals } from "@/lib/catalog";
import { learnerSchema, readState, saveState } from "@/lib/store";
import Assessment, { type AssessmentDraft } from "./Assessment";
import ProjectileLab from "./ProjectileLab";
import { EvidenceMark } from "./ui/WorkingPage";
const loading = () => (
  <p className="caption" role="status">
    Opening the working page…
  </p>
);
const LessonView = dynamic(() => import("./LessonView"), { loading });
const FieldNotes = dynamic(() => import("./FieldNotes"), { loading });
const SessionComplete = dynamic(() => import("./SessionComplete"), { loading });
const Preferences = dynamic(() => import("./Preferences"), { loading });
const AtlasView = dynamic(() => import("./AtlasView"), { loading });
const Library = dynamic(() => import("./Library"), { loading });
type View =
  | "today"
  | "map"
  | "curriculum"
  | "journal"
  | "settings"
  | "lesson"
  | "diagnostic"
  | "session"
  | "summary"
  | "placement"
  | "lab";
const nav = [
  { id: "today", label: "Today", icon: House },
  { id: "map", label: "Atlas", icon: Network },
  { id: "curriculum", label: "Library", icon: BookOpen },
  { id: "lab", label: "Lab", icon: FlaskConical },
  { id: "journal", label: "Field notes", icon: NotebookPen },
] as const;
function Brand() {
  return (
    <span className="brand">
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="20" cy="14" r="4" fill="currentColor" />
        <path
          d="M14 7C5 7 5 21 14 21"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 3C-3 5-3 23 9 25"
          fill="none"
          stroke="currentColor"
          strokeWidth=".75"
        />
      </svg>
      Noetherwake
    </span>
  );
}
function GoalDialog({
  state,
  onClose,
  onStart,
  onSkip,
}: {
  state: Learner;
  onClose: () => void;
  onStart: (goal: string) => void;
  onSkip: (goal: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    [goal, setGoal] = useState(state.goal);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="goal-dialog"
      aria-labelledby="goal-title"
      onCancel={onClose}
    >
      <button
        className="icon-button dialog-close"
        onClick={onClose}
        aria-label="Close goal selection"
      >
        <X size={20} />
      </button>
      <span className="section-number">Placement</span>
      <h2 id="goal-title">Choose a route</h2>
      <p>The route determines which prerequisites placement asks about.</p>
      <fieldset className="goal-options">
        <legend className="sr-only">Choose a learning goal</legend>
        {goals.map((g) => (
          <label
            className={`goal-option ${goal === g.id ? "selected" : ""}`}
            key={g.id}
          >
            <input
              type="radio"
              name="goal"
              value={g.id}
              checked={goal === g.id}
              onChange={() => setGoal(g.id)}
            />
            <div>
              <strong>{g.title}</strong>
              <p>{g.description}</p>
            </div>
            <span className="radio-circle">
              {goal === g.id && <Check size={12} />}
            </span>
          </label>
        ))}
      </fieldset>
      <button className="primary full" onClick={() => onStart(goal)}>
        Find my starting point <ArrowRight size={17} />
      </button>
      <span className="dialog-note">
        <Clock3 size={13} /> 12–18 adaptive questions · roughly 10–20 minutes
      </span>
      <button className="text-button centered" onClick={() => onSkip(goal)}>
        Skip placement; learn from my practice
      </button>
      <p className="fine-print">
        Skipping keeps uncertainty high. The engine will start at the
        foundations and adjust from your responses.
      </p>
    </dialog>
  );
}
export default function Tutor() {
  const [state, setState] = useState<Learner | null>(() =>
      createLearner(0, "conservation-energy"),
    ),
    [view, setView] = useState<View>("today"),
    [selected, setSelected] = useState<string | null>(null),
    [lessonId, setLessonId] = useState("fractions"),
    [item, setItem] = useState<Item | null>(null),
    [onboarding, setOnboarding] = useState(false),
    [notice, setNotice] = useState(""),
    [storageError, setStorageError] = useState(""),
    [reflection, setReflection] = useState(""),
    [lastSession, setLastSession] = useState<SessionRecord | null>(null),
    [offlineReady, setOfflineReady] = useState(false),
    [placementPending, setPlacementPending] = useState(false);
  const [completedBefore, setCompletedBefore] = useState<
    Record<string, Knowledge>
  >({});
  const itemSequence = useRef(0);
  const drafts = useRef(new Map<string, AssessmentDraft>());
  const hydrated = useRef(false),
    session = useRef<{
      start: number;
      initial: Record<string, number>;
      knowledgeBefore: Record<string, Knowledge>;
      events: Evidence[];
      minutes: 5 | 15 | 30;
    } | null>(null),
    main = useRef<HTMLElement>(null);
  useEffect(() => {
    let live = true;
    readState()
      .then((s) => {
        if (live) {
          setState(
            s
              ? learnerSchema.parse(s)
              : createLearner(Date.now(), "conservation-energy"),
          );
          try {
            setPlacementPending(
              localStorage.getItem("noetherwake-placement") === "active",
            );
          } catch {}
          hydrated.current = true;
        }
      })
      .catch(() => {
        if (live) {
          setState(createLearner(Date.now(), "conservation-energy"));
          setStorageError(
            "Device storage is unavailable. Export your progress before closing this tab.",
          );
          hydrated.current = true;
        }
      });
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => {
          navigator.serviceWorker.addEventListener("message", (e) => {
            if (e.data === "OFFLINE_READY") setOfflineReady(true);
          });
          setOfflineReady(!!registration.active);
        })
        .catch(() =>
          setNotice(
            "Offline installation did not finish. Reopen online to retry.",
          ),
        );
    }
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (!state || !hydrated.current) return;
    saveState(state).catch(() =>
      setStorageError(
        "Progress could not be saved. Export a backup before closing.",
      ),
    );
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.dataset.reading = state.accessibleFont
      ? "accessible"
      : "standard";
  }, [state]);
  useEffect(() => {
    if (!state) return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const channels = getComputedStyle(document.documentElement)
        .getPropertyValue("--ground")
        .trim()
        .split(/\s+/)
        .map(Number);
      const color =
        "#" + channels.map((c) => c.toString(16).padStart(2, "0")).join("");
      const dark =
        state.theme === "dark" || (state.theme === "system" && media.matches);
      document
        .querySelector('link[rel="manifest"]')
        ?.setAttribute(
          "href",
          dark ? "/manifest-dark.webmanifest" : "/manifest.webmanifest",
        );
      document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((meta) => meta.setAttribute("content", color));
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [state?.theme]);
  function navigate(next: View) {
    if (next === "placement") {
      setPlacementPending(false);
      try {
        localStorage.removeItem("noetherwake-placement");
      } catch {}
    }
    if (next === "map" && !selected && state)
      setSelected(plan(catalog, state, Date.now())[0]?.concept ?? state.goal);
    setView(next);
    setNotice("");
    requestAnimationFrame(() => {
      main.current?.focus();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  if (!state)
    return (
      <div className="loading-screen">
        <Brand />
        <p>Reading from this device</p>
      </div>
    );
  const now = Date.now(),
    recommendations = plan(catalog, state, now),
    next = recommendations[0],
    nextConcept = next ? concept(next.concept) : null,
    goal = concept(state.goal),
    target = ancestors(catalog, state.goal),
    assessed = catalog.filter(
      (c) => getKnowledge(state, c.id, now).observations > 0,
    ),
    strong = assessed.filter(
      (c) => effective(getKnowledge(state, c.id, now), now) >= 0.8,
    ),
    lesson = concept(lessonId),
    frontier = estimateFrontier(catalog, state);
  function itemFor(id: string, s: Learner, diagnostic = false) {
    const c = concept(id);
    const template = diagnostic
      ? c.generators[0]
      : selectTemplate(c, s, Date.now());
    setLessonId(id);
    setItem(
      generate(
        c,
        template,
        ((s.history.length + 1) * 7919 +
          ++itemSequence.current * 17 +
          ((s.history.at(-1)?.at ?? 0) % 10_000_000) * 101 +
          catalog.indexOf(c) * 101) >>>
          0,
      ),
    );
  }
  function startSession(id?: string, s = state!) {
    if (session.current && item && (!id || item.concept === id)) {
      navigate("session");
      return;
    }
    if (session.current?.events.length) finishSession();
    if (!s.onboarded) {
      setOnboarding(true);
      return;
    }
    session.current = {
      start: Date.now(),
      knowledgeBefore: Object.fromEntries(
        catalog.map((c) => [c.id, { ...getKnowledge(s, c.id, Date.now()) }]),
      ),
      initial: Object.fromEntries(
        catalog.map((c) => [c.id, getKnowledge(s, c.id, Date.now()).p]),
      ),
      events: [],
      minutes: s.minutes,
    };
    const action =
      id ??
      sessionPlan(catalog, s, Date.now())[0]?.concept ??
      plan(catalog, s, Date.now())[0]?.concept;
    if (!action) {
      setNotice(
        "Your current evidence is strong. Return when a review is due or choose a new goal in settings.",
      );
      return;
    }
    const routed = routeToReady(catalog, s, action, Date.now());
    itemFor(routed, s);
    navigate("session");
  }
  function openLesson(id: string) {
    setLessonId(id);
    navigate("lesson");
  }
  function beginDiagnostic(goalId: string) {
    setPlacementPending(true);
    try {
      localStorage.setItem("noetherwake-placement", "active");
    } catch {}
    const s = {
      ...state!,
      goal: goalId,
      onboarded: true,
      diagnostic: [],
      history: state!.history.filter((e) => !e.diagnostic),
    };
    setState(s);
    setOnboarding(false);
    const c = diagnosticNext(catalog, s, Date.now());
    if (c) {
      itemFor(c.id, s, true);
      navigate("diagnostic");
    }
  }
  function skipDiagnostic(goalId: string) {
    setPlacementPending(false);
    try {
      localStorage.removeItem("noetherwake-placement");
    } catch {}
    const s = { ...state!, goal: goalId, onboarded: true };
    setState(s);
    setOnboarding(false);
    startSession(undefined, s);
  }
  function evidence(e: Evidence) {
    setState((s) => (s ? observe(s, e, catalog) : s));
    if (!e.diagnostic) session.current?.events.push(e);
  }
  function finishSession() {
    const run = session.current;
    if (!run) return;
    if (!run.events.length) {
      navigate("today");
      setNotice(
        "No responses were recorded. Come back when you have a little time.",
      );
      return;
    }
    const record: SessionRecord = {
      at: Date.now(),
      concepts: [...new Set(run.events.map((e) => e.concept))],
      correct: run.events.filter((e) => e.correct).length,
      total: run.events.length,
      minutes: Math.max(1, Math.round((Date.now() - run.start) / 60000)),
      reflection: "",
      changes: Object.fromEntries(
        [...new Set(run.events.map((e) => e.concept))].map((id) => [
          id,
          getKnowledge(state!, id, Date.now()).p - (run.initial[id] ?? 0.25),
        ]),
      ),
    };
    setCompletedBefore(run.knowledgeBefore);
    session.current = null;
    setLastSession(record);
    setReflection("");
    setState((s) =>
      s ? { ...s, sessions: [...s.sessions, record].slice(-1000) } : s,
    );
    navigate("summary");
  }
  function nextQuestion() {
    if (view === "diagnostic") {
      if (state!.diagnostic.length >= 18) {
        navigate("placement");
        return;
      }
      const c = diagnosticNext(catalog, state!, Date.now());
      if (c) itemFor(c.id, state!, true);
      else navigate("placement");
      return;
    }
    const run = session.current;
    if (
      run &&
      (run.events.length >= Math.max(3, Math.floor(run.minutes / 1.5)) ||
        Date.now() - run.start > run.minutes * 60000)
    ) {
      finishSession();
      return;
    }
    const a = plan(catalog, state!, Date.now())[0];
    if (a) itemFor(a.concept, state!);
    else finishSession();
  }
  function exportState() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `noetherwake-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Your progress was exported. Keep the JSON file somewhere safe.");
  }
  async function importState(s: Learner) {
    await saveState(s);
    session.current = null;
    setItem(null);
    setSelected(null);
    setCompletedBefore({});
    setLastSession(null);
    setState(s);
    setNotice("Backup restored. Your route now uses the imported evidence.");
  }
  async function clearState() {
    const s = createLearner(Date.now(), "conservation-energy");
    await saveState(s);
    session.current = null;
    setItem(null);
    setSelected(null);
    setCompletedBefore({});
    setLastSession(null);
    setPlacementPending(false);
    try {
      localStorage.removeItem("noetherwake-placement");
    } catch {}
    setState(s);
    setNotice("Local learner data cleared.");
  }
  const activeView = [
    "lesson",
    "session",
    "diagnostic",
    "placement",
    "summary",
  ].includes(view)
    ? "today"
    : view;
  return (
    <div
      className={`app-shell ${view === "session" || view === "diagnostic" ? "active-practice" : ""}`}
      inert={!hydrated.current}
      aria-busy={!hydrated.current}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <a
          className="brand-link"
          href="#today"
          onClick={(e) => {
            e.preventDefault();
            navigate("today");
          }}
          aria-label="Noetherwake home"
        >
          <Brand />
        </a>
        <p className="brand-discipline">Mathematics &amp; physics</p>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${activeView === n.id ? "active" : ""}`}
              aria-current={activeView === n.id ? "page" : undefined}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={19} aria-hidden="true" /> {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {hydrated.current ? (
            <p className="route-label">
              Route:{" "}
              {goals.find((g) => g.id === state.goal)?.title ?? goal.title}
              <br />
              {state.onboarded && (
                <span>
                  {strong.filter((c) => target.has(c.id)).length} of{" "}
                  {target.size} with strong evidence
                </span>
              )}
            </p>
          ) : (
            <p className="caption">Reading from this device</p>
          )}
          <button
            className="nav-item"
            aria-current={view === "settings" ? "page" : undefined}
            onClick={() => navigate("settings")}
          >
            <Settings2 size={19} aria-hidden="true" /> Preferences
          </button>
          <p className="local-note">
            {hydrated.current
              ? storageError
                ? "Storage unavailable"
                : "Stored on this device"
              : ""}
            {offlineReady && (
              <>
                <br />
                Offline copy ready
              </>
            )}
          </p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <a
            href="#today"
            className="brand-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("today");
            }}
          >
            <Brand />
          </a>
          <nav aria-label="Tablet navigation">
            {nav.map((n) => (
              <button
                key={n.id}
                className={activeView === n.id ? "active" : ""}
                aria-current={activeView === n.id ? "page" : undefined}
                onClick={() => navigate(n.id)}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <button className="text-button" onClick={() => navigate("settings")}>
            Preferences
          </button>
        </header>
        <main
          id="main-content"
          ref={main}
          tabIndex={-1}
          className={`main-content view-${view}`}
        >
          {hydrated.current && (
            <>
              {(notice || storageError) && (
                <div className="notice" role="status">
                  {storageError || notice}
                  <button
                    className="icon-button"
                    aria-label="Dismiss notice"
                    onClick={() => {
                      setNotice("");
                      if (!storageError) setStorageError("");
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === "today" && (
            <StudioHome
              ready={hydrated.current}
              state={state}
              now={now}
              onStart={() => setOnboarding(true)}
              onMap={() => navigate("map")}
              onLab={() => navigate("lab")}
              onResumePlacement={
                placementPending
                  ? () => {
                      const c = diagnosticNext(catalog, state, Date.now());
                      if (c && state.diagnostic.length < 18) {
                        itemFor(c.id, state, true);
                        navigate("diagnostic");
                      } else navigate("placement");
                    }
                  : undefined
              }
              onResume={
                session.current && item ? () => navigate("session") : undefined
              }
              onConcept={openLesson}
              onMinutes={(minutes) => setState({ ...state, minutes })}
              onDirection={(goalId) => {
                setState({ ...state, goal: goalId });
                setNotice(
                  "Your direction is set. The next step now follows this goal and your existing evidence.",
                );
              }}
            />
          )}
          {hydrated.current && (
            <>
              {view === "lab" && <ProjectileLab onConcept={openLesson} />}
              {view === "map" && (
                <AtlasView
                  state={state}
                  now={now}
                  selected={selected}
                  onSelect={setSelected}
                  onLesson={openLesson}
                  onPractice={startSession}
                  onList={() => navigate("curriculum")}
                />
              )}
              {view === "curriculum" && (
                <Library
                  state={state}
                  now={now}
                  selected={selected}
                  onSelect={setSelected}
                  onLesson={openLesson}
                  onPractice={startSession}
                  onMap={() => navigate("map")}
                />
              )}
              {view === "journal" && (
                <FieldNotes state={state} now={now} onConcept={openLesson} />
              )}
              {view === "settings" && (
                <Preferences
                  state={state}
                  onChange={setState}
                  onExport={exportState}
                  onImport={importState}
                  onClear={clearState}
                  onPlacement={() => setOnboarding(true)}
                  offlineReady={offlineReady}
                  storageError={storageError}
                />
              )}
              {view === "lesson" && (
                <LessonView
                  key={lessonId}
                  id={lessonId}
                  state={state}
                  now={now}
                  onConcept={openLesson}
                  onPractice={startSession}
                  onToday={() => navigate("today")}
                />
              )}
              {view === "session" && item && (
                <>
                  <header className="practice-header">
                    <div>
                      <p className="caption">Practice</p>
                      <h1>{lesson.title}</h1>
                    </div>
                    <div className="practice-session-meta">
                      <span className="mono">
                        {session.current?.events.length ?? 0} answered
                      </span>
                      <button className="text-button" onClick={finishSession}>
                        End session
                      </button>
                    </div>
                  </header>
                  <div className="sheet-frame">
                    <div className="sheet">
                      <Assessment
                        key={item.id}
                        item={item}
                        confidenceError={
                          state.knowledge[lesson.id]?.observations
                            ? getKnowledge(state, lesson.id, now)
                                .confidenceError
                            : undefined
                        }
                        draft={drafts.current.get(item.id)}
                        onDraft={(draft) => drafts.current.set(item.id, draft)}
                        concept={lesson}
                        faded={stage(state, lesson.id, now) !== "independent"}
                        onEvidence={evidence}
                        onNext={nextQuestion}
                        onSkip={nextQuestion}
                      />
                    </div>
                    <aside className="margin">
                      <div id="practice-hint-margin" />
                      <h2>Related lesson</h2>
                      <button
                        className="text-button"
                        onClick={() => openLesson(lesson.id)}
                      >
                        {lesson.title}
                      </button>
                      <p>
                        {
                          plan(catalog, state, now).find(
                            (a) => a.concept === lesson.id,
                          )?.why
                        }
                      </p>
                      <h2>Model boundary</h2>
                      <p>{lesson.boundary}</p>
                    </aside>
                  </div>
                </>
              )}
              {view === "diagnostic" && item && (
                <>
                  <header className="diagnostic-heading">
                    <p className="mono caption">
                      Placement · question {state.diagnostic.length + 1} · up to
                      18
                    </p>
                    <h1>Finding a starting point</h1>
                    <p>
                      You can skip a question without adding mastery evidence.
                    </p>
                    <div
                      className="placement-ticks"
                      role="img"
                      aria-label={`${state.diagnostic.length} questions visited`}
                    >
                      {state.diagnostic.map((id, i) => (
                        <span key={`${id}-${i}`} />
                      ))}
                    </div>
                  </header>
                  <div className="diagnostic-body">
                    <span className="caption">
                      {lesson.strand} · {lesson.title}
                    </span>
                    <Assessment
                      key={item.id}
                      item={item}
                      confidenceError={
                        state.knowledge[lesson.id]?.observations
                          ? getKnowledge(state, lesson.id, now).confidenceError
                          : undefined
                      }
                      draft={drafts.current.get(item.id)}
                      onDraft={(draft) => drafts.current.set(item.id, draft)}
                      concept={lesson}
                      diagnostic
                      onEvidence={evidence}
                      onNext={nextQuestion}
                      onSkip={() => {
                        const s = {
                          ...state,
                          diagnostic: [...state.diagnostic, lesson.id],
                        };
                        setState(s);
                        const c = diagnosticNext(catalog, s, Date.now());
                        if (c && s.diagnostic.length < 18)
                          itemFor(c.id, s, true);
                        else navigate("placement");
                      }}
                    />
                    <button
                      className="text-button"
                      onClick={() => navigate("placement")}
                    >
                      {state.diagnostic.length >= 12
                        ? "Finish placement"
                        : "Use the evidence so far"}{" "}
                      →
                    </button>
                    <button className="quiet" onClick={() => navigate("today")}>
                      Pause placement
                    </button>
                  </div>
                </>
              )}
              {view === "placement" && (
                <section className="placement-result">
                  <h1>Your starting point</h1>
                  <p className="prose">
                    {state.history.filter((e) => e.diagnostic).length} recorded
                    answers across {new Set(state.diagnostic).size} concepts.{" "}
                    {frontier.uncertain
                      ? "The evidence is still broad. Prerequisite checks will guide the next steps."
                      : `The estimated frontier is depth ${frontier.depth} of ${frontier.max}. Individual prerequisite checks remain necessary.`}
                  </p>
                  <div
                    className="placement-excerpt"
                    aria-label="Concepts touched by placement"
                  >
                    {[...new Set(state.diagnostic)].map((id) => (
                      <button key={id} onClick={() => openLesson(id)}>
                        <EvidenceMark state={state} id={id} now={now} />
                        <span>{concept(id).title}</span>
                        <EvidenceMark state={state} id={id} now={now} text />
                      </button>
                    ))}
                  </div>
                  {next && (
                    <div className="placement-next">
                      <h2>{nextConcept?.title}</h2>
                      <p className="prose">{next.why}</p>
                      <div className="actions">
                        <button
                          className="primary"
                          onClick={() => openLesson(next.concept)}
                        >
                          Begin: {nextConcept?.title} →
                        </button>
                        <button
                          className="secondary"
                          onClick={() => navigate("map")}
                        >
                          See the whole atlas
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
              {view === "summary" && lastSession && (
                <SessionComplete
                  state={state}
                  record={lastSession}
                  before={completedBefore}
                  now={now}
                  reflection={reflection}
                  onReflection={setReflection}
                  next={next?.concept}
                  onContinue={() => next && openLesson(next.concept)}
                  onToday={() => navigate("today")}
                  onSave={() => {
                    setState({
                      ...state,
                      sessions: state.sessions.map((s) =>
                        s.at === lastSession.at ? { ...s, reflection } : s,
                      ),
                      reflection,
                    });
                    setNotice("Reflection saved on this device.");
                  }}
                />
              )}{" "}
            </>
          )}
        </main>
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              aria-current={activeView === n.id ? "page" : undefined}
            >
              <n.icon size={18} aria-hidden="true" /> {n.label}
            </button>
          ))}
        </nav>
      </div>
      {onboarding && (
        <GoalDialog
          state={state}
          onClose={() => setOnboarding(false)}
          onStart={beginDiagnostic}
          onSkip={skipDiagnostic}
        />
      )}
    </div>
  );
}
