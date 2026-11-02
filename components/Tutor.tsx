"use client";
import LessonReading from "./LessonReading";
import LessonView from "./LessonView";
import StudioHome from "./StudioHome";
import LessonConnections from "./LessonConnections";
import EvidenceReview from "./EvidenceReview";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  Focus,
  Home,
  LockKeyhole,
  Map,
  Menu,
  Monitor,
  Moon,
  NotebookPen,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Target,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import {
  ancestors,
  createLearner,
  diagnosticNext,
  dueAt,
  effective,
  estimateFrontier,
  generate,
  getKnowledge,
  interval,
  missing,
  observe,
  plan,
  routeToReady,
  selectTemplate,
  sessionPlan,
  stage,
  type Evidence,
  type Item,
  type Learner,
  type SessionRecord,
} from "@noetherwake/engine";
import { catalog, concept, goals } from "@/lib/catalog";
import { learnerSchema, parseImport, readState, saveState } from "@/lib/store";
import ConceptMap from "./ConceptMap";
import Assessment from "./Assessment";
import MathText from "./Math";
import ProjectileLab from "./ProjectileLab";
const Interactive = dynamic(() => import("./Interactive"), {
  loading: () => (
    <div className="interactive-card">Preparing the learning instrument…</div>
  ),
});
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
  { id: "today", label: "Today" },
  { id: "map", label: "Atlas" },
  { id: "curriculum", label: "Library" },
  { id: "lab", label: "Lab" },
  { id: "journal", label: "Field notes" },
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
      <span className="eyebrow">A PATH THAT STARTS WITH YOU</span>
      <h2 id="goal-title">
        Where would you
        <br />
        like to go?
      </h2>
      <p>
        Your goal gives the engine a direction. A few questions will find your
        starting point.
      </p>
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
              <span className="eyebrow">{g.label}</span>
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
    [mobileNav, setMobileNav] = useState(false),
    [notice, setNotice] = useState(""),
    [storageError, setStorageError] = useState(""),
    [search, setSearch] = useState(""),
    [domain, setDomain] = useState("all"),
    [strand, setStrand] = useState("all"),
    [readiness, setReadiness] = useState("all"),
    [reflection, setReflection] = useState(""),
    [lastSession, setLastSession] = useState<SessionRecord | null>(null),
    [online, setOnline] = useState(true),
    [offlineReady, setOfflineReady] = useState(false);
  const itemSequence = useRef(0);
  const hydrated = useRef(false),
    session = useRef<{
      start: number;
      initial: Record<string, number>;
      events: Evidence[];
      minutes: 5 | 15 | 30;
    } | null>(null),
    main = useRef<HTMLElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
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
    setOnline(navigator.onLine);
    const on = () => setOnline(true),
      off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => {
          navigator.serviceWorker.addEventListener("message", (e) => {
            if (e.data === "OFFLINE_READY") setOfflineReady(true);
          });
          setOfflineReady(!!navigator.serviceWorker.controller);
        })
        .catch(() =>
          setNotice(
            "Offline installation did not finish. Reopen online to retry.",
          ),
        );
    }
    return () => {
      live = false;
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
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
  function navigate(next: View) {
    if (next === "map" && !selected && state)
      setSelected(plan(catalog, state, Date.now())[0]?.concept ?? state.goal);
    setView(next);
    setMobileNav(false);
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
        <p>Opening your learning observatory…</p>
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
    ready = catalog.filter(
      (c) =>
        missing(catalog, state, c.id, now).length === 0 &&
        effective(getKnowledge(state, c.id, now), now) < 0.8,
    ),
    lesson = concept(lessonId),
    gaps = missing(catalog, state, lessonId, now),
    frontier = estimateFrontier(catalog, state);
  const visibleConcepts = catalog.filter(
    (c) =>
      (domain === "all" || c.domain === domain) &&
      (strand === "all" || c.strand === strand) &&
      (readiness === "all" ||
        (readiness === "ready"
          ? missing(catalog, state, c.id, now).length === 0
          : getKnowledge(state, c.id, now).observations > 0)) &&
      `${c.title} ${c.strand} ${c.summary}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
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
    if (!s.onboarded) {
      setOnboarding(true);
      return;
    }
    session.current = {
      start: Date.now(),
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
  async function importState(file?: File) {
    if (!file) return;
    try {
      const s = parseImport(
        await file.text(),
        new Set(catalog.map((c) => c.id)),
      );
      await saveState(s);
      setState(s);
      setNotice("Backup restored. Your route now uses the imported evidence.");
    } catch (e) {
      setNotice(
        `Import did not change your progress: ${e instanceof Error ? e.message : "Invalid file"}`,
      );
    }
    if (fileInput.current) fileInput.current.value = "";
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
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${activeView === n.id ? "active" : ""}`}
              aria-current={activeView === n.id ? "page" : undefined}
              onClick={() => navigate(n.id)}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p className="route-label mono">
            Route: {goals.find((g) => g.id === state.goal)?.title ?? goal.title}
            <br />
            <span>
              {strong.filter((c) => target.has(c.id)).length} of {target.size}{" "}
              with strong evidence
            </span>
          </p>
          <button
            className="nav-item"
            aria-current={view === "settings" ? "page" : undefined}
            onClick={() => navigate("settings")}
          >
            Preferences
          </button>
          <p className="local-note">
            Stored on this device
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
          {view === "today" && (
            <StudioHome
              state={state}
              now={now}
              onStart={() =>
                state.onboarded ? startSession() : setOnboarding(true)
              }
              onMap={() => navigate("map")}
              onLibrary={() => navigate("curriculum")}
              onJournal={() => navigate("journal")}
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
          {view === "lab" && <ProjectileLab onConcept={openLesson} />}
          {view === "map" && (
            <>
              <div className="standard-heading">
                <span className="eyebrow">
                  WHERE YOU ARE. WHERE YOU CAN GO.
                </span>
                <h1>The connections matter.</h1>
                <p>
                  Follow the highlighted dependencies toward{" "}
                  {goal.title.toLowerCase()}. Dashed rings mean uncertainty;
                  double rings mark your frontier.
                </p>
              </div>
              <div className="map-page-layout">
                <section className="full-map-card">
                  <div className="panel-heading">
                    <h2>Your knowledge, connected</h2>
                    <span className="pill light">
                      {catalog.length} ideas ·{" "}
                      {catalog.filter((c) => c.domain === "physics").length}{" "}
                      physics
                    </span>
                  </div>
                  <ConceptMap
                    state={state}
                    selected={selected ?? undefined}
                    onSelect={(id) => {
                      setSelected(id);
                      if (window.innerWidth <= 760)
                        requestAnimationFrame(() => {
                          const panel =
                            document.querySelector<HTMLElement>(".map-detail");
                          panel?.focus();
                          panel?.scrollIntoView({
                            block: "start",
                            behavior: "instant",
                          });
                        });
                    }}
                  />
                </section>
                <aside
                  className="map-detail"
                  tabIndex={-1}
                  aria-label="Concept evidence and prerequisites"
                >
                  {selected ? (
                    (() => {
                      const c = concept(selected),
                        k = getKnowledge(state, selected, now),
                        gap = missing(catalog, state, selected, now),
                        range = interval(k);
                      return (
                        <>
                          <span className="eyebrow">
                            {c.domain} / {c.strand}
                          </span>
                          <h2>{c.title}</h2>
                          <p>{c.summary}</p>
                          {c.domain === "physics" &&
                            c.prerequisites.some(
                              (id) => concept(id).domain === "math",
                            ) && (
                              <div className="math-foundation">
                                <span className="eyebrow">
                                  MATHEMATICS USED HERE
                                </span>
                                {c.prerequisites
                                  .filter((id) => concept(id).domain === "math")
                                  .map((id) => (
                                    <button
                                      key={id}
                                      className="prerequisite-link"
                                      onClick={() => setSelected(id)}
                                    >
                                      {concept(id).title}
                                      <ArrowUpRight size={14} />
                                    </button>
                                  ))}
                              </div>
                            )}
                          {k.observations > 0 && (
                            <p className="evidence-timestamp">
                              Last evidence:{" "}
                              {new Date(k.last).toLocaleDateString()}
                              <br />
                              Next retrieval:{" "}
                              {new Date(dueAt(k)).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                          <div className="mastery-detail">
                            <span>
                              {k.observations
                                ? "Estimated mastery"
                                : "Prior · not yet assessed"}
                            </span>
                            <strong className="mono">
                              {Math.round(effective(k, now) * 100)}
                              <small>%</small>
                            </strong>
                            <div className="probability-track">
                              <span
                                style={{ width: `${effective(k, now) * 100}%` }}
                              />
                            </div>
                            <p>
                              {k.observations} direct observations · {k.fluent}{" "}
                              fluent responses
                            </p>
                            <p className="mono">
                              Model uncertainty: {Math.round(range[0] * 100)}–
                              {Math.round(range[1] * 100)}%
                            </p>
                          </div>
                          {gap.length ? (
                            <>
                              <h3>
                                <LockKeyhole size={14} /> Build these first
                              </h3>
                              {gap.map((id) => (
                                <button
                                  className="prerequisite-link"
                                  key={id}
                                  onClick={() => setSelected(id)}
                                >
                                  {concept(id).title}
                                  <ChevronRight size={14} />
                                </button>
                              ))}
                              <button
                                className="primary full"
                                onClick={() =>
                                  openLesson(
                                    routeToReady(catalog, state, selected, now),
                                  )
                                }
                              >
                                Take me there <ArrowRight size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="primary full"
                              onClick={() => openLesson(selected)}
                            >
                              Explore this idea <ArrowRight size={15} />
                            </button>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <Compass size={32} />
                      <h2>
                        Choose an idea.
                        <br />
                        See the path.
                      </h2>
                      <p>
                        Select any node to see its evidence, prerequisites and
                        connections.
                      </p>
                      <div className="map-facts">
                        <span>
                          <b>{ready.length}</b> ready to explore
                        </span>
                        <span>
                          <b>{assessed.length}</b> assessed so far
                        </span>
                        <span>
                          <b>{strong.length}</b> with strong evidence
                        </span>
                      </div>
                    </>
                  )}
                </aside>
              </div>
            </>
          )}
          {view === "curriculum" && (
            <>
              <div className="standard-heading">
                <span className="eyebrow">
                  CONCRETE FIRST. ABSTRACT SECOND.
                </span>
                <h1>A universe of ideas.</h1>
                <p>
                  {catalog.length} lessons. Worked reasoning, interactive
                  experiments and three problem families per idea. Follow a
                  thread, or find the connection you need.
                </p>
              </div>
              <div className="library-toolbar">
                <label className="search-field">
                  <Search size={17} />
                  <input
                    aria-label="Search concepts"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Find an idea, not a chapter…"
                  />
                </label>
                <div className="segmented">
                  {["all", "math", "physics"].map((d) => (
                    <button
                      key={d}
                      className={domain === d ? "selected" : ""}
                      aria-pressed={domain === d}
                      onClick={() => {
                        setDomain(d);
                        setStrand("all");
                      }}
                    >
                      {d === "all"
                        ? "All ideas"
                        : d === "math"
                          ? "Mathematics"
                          : "Physics"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="library-filters">
                <div className="strand-filters" aria-label="Filter by strand">
                  {[
                    "all",
                    ...new Set(
                      catalog
                        .filter((c) => domain === "all" || c.domain === domain)
                        .map((c) => c.strand),
                    ),
                  ].map((s) => (
                    <button
                      key={s}
                      aria-pressed={strand === s}
                      onClick={() => setStrand(s)}
                    >
                      {s === "all" ? "Every strand" : s}
                    </button>
                  ))}
                </div>
                <label className="readiness-filter">
                  Show
                  <select
                    aria-label="Filter by readiness"
                    value={readiness}
                    onChange={(e) => setReadiness(e.target.value)}
                  >
                    <option value="all">All readiness levels</option>
                    <option value="ready">Ready to explore</option>
                    <option value="assessed">Evidence collected</option>
                  </select>
                </label>
              </div>
              <div className="curriculum-list">
                {visibleConcepts.map((c) => {
                  const gap = missing(catalog, state, c.id, now),
                    k = getKnowledge(state, c.id, now);
                  return (
                    <button
                      className="curriculum-item"
                      key={c.id}
                      onClick={() => openLesson(c.id)}
                    >
                      <span className={`domain-icon ${c.domain}`}>
                        {c.domain === "math" ? <span>ƒ</span> : <span>φ</span>}
                      </span>
                      <div>
                        <span className="eyebrow">{c.strand}</span>
                        <h2>{c.title}</h2>
                        <p>{c.summary.split(". ")[0]}.</p>
                      </div>
                      <span className="curriculum-status">
                        {gap.length ? (
                          <>
                            <LockKeyhole size={13} />
                            {gap.length} prerequisite
                            {gap.length === 1 ? "" : "s"}
                          </>
                        ) : k.observations ? (
                          `${Math.round(k.p * 100)}% · estimated`
                        ) : (
                          "Ready to explore"
                        )}
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  );
                })}
              </div>
              {visibleConcepts.length === 0 && (
                <div className="empty-state">
                  <Search size={30} />
                  <h2>No ideas in this view yet.</h2>
                  <p>Try another phrase or open up the filters.</p>
                  <button
                    className="secondary"
                    onClick={() => {
                      setSearch("");
                      setDomain("all");
                      setStrand("all");
                      setReadiness("all");
                    }}
                  >
                    Show all ideas
                  </button>
                </div>
              )}
            </>
          )}
          {view === "journal" && (
            <>
              <div className="standard-heading">
                <span className="eyebrow">
                  EVIDENCE, NOT EXPERIENCE POINTS.
                </span>
                <h1>Watch understanding grow.</h1>
                <p>
                  Your locally stored sessions, reflections and confidence
                  calibration.
                </p>
              </div>
              <div className="journal-stats">
                <div>
                  <span>Ideas assessed</span>
                  <strong className="mono">{assessed.length}</strong>
                </div>
                <div>
                  <span>Independent fluent responses</span>
                  <strong className="mono">
                    {Object.values(state.knowledge).reduce(
                      (n, k) => n + k.fluent,
                      0,
                    )}
                  </strong>
                </div>
                <div>
                  <span>Confidence Brier error · lower is better</span>
                  <strong className="mono">
                    {state.history.length
                      ? (
                          state.history.reduce(
                            (n, e) =>
                              n + (e.confidence - Number(e.correct)) ** 2,
                            0,
                          ) / state.history.length
                        ).toFixed(3)
                      : "—"}
                  </strong>
                </div>
              </div>
              <EvidenceReview state={state} onConcept={openLesson} />
              {state.sessions.length ? (
                <div className="journal-list">
                  {[...state.sessions].reverse().map((s, i) => (
                    <article className="journal-entry" key={`${s.at}-${i}`}>
                      <span className="eyebrow">
                        {new Date(s.at).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        · {s.minutes} MINUTES
                      </span>
                      <h2>
                        {s.concepts.map((id) => concept(id).title).join(" · ")}
                      </h2>
                      <p>
                        {s.correct} of {s.total} responses correct.{" "}
                        {s.reflection || "No reflection recorded."}
                      </p>
                      {Object.entries(s.changes).map(([id, d]) => (
                        <span className="delta-chip" key={id}>
                          {concept(id).title}: {d >= 0 ? "+" : ""}
                          {(d * 100).toFixed(1)} percentage points
                        </span>
                      ))}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <NotebookPen size={34} />
                  <h2>Your story starts with a question.</h2>
                  <p>
                    Complete a session to record what changed, what felt
                    difficult and what deserves another look.
                  </p>
                  <button className="primary" onClick={() => startSession()}>
                    Begin a session <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === "settings" && (
            <>
              <div className="standard-heading">
                <span className="eyebrow">A TOOL THAT ADAPTS TO YOU.</span>
                <h1>Make space for learning.</h1>
                <p>Your preferences and your progress stay on this device.</p>
              </div>
              <div className="settings-grid">
                <section className="settings-card">
                  <h2>
                    <SlidersHorizontal size={19} /> Your environment
                  </h2>
                  <fieldset>
                    <legend>Appearance</legend>
                    <div className="setting-options">
                      {[
                        { id: "system", label: "System", icon: Monitor },
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                      ].map((t) => (
                        <button
                          key={t.id}
                          className={state.theme === t.id ? "selected" : ""}
                          onClick={() =>
                            setState({
                              ...state,
                              theme: t.id as Learner["theme"],
                            })
                          }
                          aria-pressed={state.theme === t.id}
                        >
                          <t.icon size={18} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="toggle-row">
                    <div>
                      <strong>Accessible reading font</strong>
                      <span>
                        Clear sans serif, wider spacing and generous lines.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={state.accessibleFont}
                      onChange={(e) =>
                        setState({ ...state, accessibleFont: e.target.checked })
                      }
                    />
                  </label>
                  <label className="field-label" htmlFor="session-length">
                    Time for a typical session
                  </label>
                  <select
                    id="session-length"
                    value={state.minutes}
                    onChange={(e) =>
                      setState({
                        ...state,
                        minutes: Number(e.target.value) as 5 | 15 | 30,
                      })
                    }
                  >
                    <option value="5">5 minutes · a small foothold</option>
                    <option value="15">15 minutes · one good connection</option>
                    <option value="30">30 minutes · room to go deeper</option>
                  </select>
                  <label className="field-label" htmlFor="goal-setting">
                    Your learning direction
                  </label>
                  <select
                    id="goal-setting"
                    value={state.goal}
                    onChange={(e) =>
                      setState({ ...state, goal: e.target.value })
                    }
                  >
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                  <button
                    className="text-button"
                    onClick={() => setOnboarding(true)}
                  >
                    Revisit placement <ArrowUpRight size={14} />
                  </button>
                </section>
                <section className="settings-card">
                  <h2>
                    <ShieldCheck size={19} /> Your data belongs to you
                  </h2>
                  <p>
                    All answers, mastery estimates and reflections live in
                    IndexedDB in this browser. Clearing browser storage removes
                    them. A backup lets you restore or move to another device.
                  </p>
                  <button className="secondary full" onClick={exportState}>
                    <Download size={17} /> Export progress as JSON
                  </button>
                  <label className="import-label">
                    <Upload size={17} />
                    <span>Import a progress backup</span>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="application/json,.json"
                      onChange={(e) => void importState(e.target.files?.[0])}
                    />
                  </label>
                  <p className="fine-print">
                    A valid import replaces the local learner state. Invalid
                    files leave your progress unchanged.
                  </p>
                  <div className="privacy-note">
                    <WifiOff size={18} />
                    <div>
                      <strong>Fully deterministic. No AI required.</strong>
                      <p>
                        No API keys, analytics, remote grading or hidden
                        uploads. Offline lessons are available after the
                        production cache finishes installing.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </>
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
                    concept={lesson}
                    faded={stage(state, lesson.id, now) !== "independent"}
                    onEvidence={evidence}
                    onNext={nextQuestion}
                    onSkip={nextQuestion}
                  />
                </div>
                <aside className="margin">
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
              <div className="diagnostic-heading">
                <span className="eyebrow">FINDING YOUR FRONTIER</span>
                <div>
                  <h1>
                    Let’s find the edges
                    <br />
                    of what you know.
                  </h1>
                  <span className="mono">
                    {state.diagnostic.length + 1}
                    <small> / 18</small>
                  </span>
                </div>
                <p>
                  This isn’t a grade. Uncertain answers are useful evidence,
                  too.
                </p>
                <div className="diagnostic-progress">
                  <span
                    style={{
                      width: `${(state.diagnostic.length / 18) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="diagnostic-body">
                <span className="pill light">
                  {lesson.strand} · {lesson.title}
                </span>
                <Assessment
                  key={item.id}
                  item={item}
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
                    if (c && s.diagnostic.length < 18) itemFor(c.id, s, true);
                    else navigate("placement");
                  }}
                />
                <button
                  className="text-button"
                  onClick={() => navigate("placement")}
                >
                  {state.diagnostic.length >= 12
                    ? "Finish placement"
                    : "Pause placement and use the evidence so far"}{" "}
                  <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}
          {view === "placement" && (
            <section className="result-page">
              <span className="result-icon">
                <Focus size={29} />
              </span>
              <span className="eyebrow">A STARTING POINT, NOT A LABEL.</span>
              <h1>Here’s where we begin.</h1>
              <p>
                You explored {state.diagnostic.length} questions.{" "}
                {frontier.uncertain
                  ? "There is still broad uncertainty, so the engine will be careful about the first steps."
                  : `The diagnostic places your frontier near depth ${frontier.depth} of ${frontier.max}. This is a noisy estimate; individual prerequisite checks guide your route.`}
              </p>
              <div className="placement-evidence">
                {state.history
                  .filter((e) => e.diagnostic)
                  .map((e, i) => (
                    <div key={i}>
                      <span>{concept(e.concept).title}</span>
                      <span
                        className={e.correct ? "evidence-yes" : "evidence-no"}
                      >
                        {e.correct
                          ? "Supporting evidence"
                          : "Worth a closer look"}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="summary-next">
                <span className="eyebrow">YOUR NEXT CONNECTION</span>
                <h2>{nextConcept?.title ?? "Spaced review"}</h2>
                <p>{next?.why}</p>
                <button className="primary" onClick={() => startSession()}>
                  Start my first session <ArrowRight size={16} />
                </button>
                <button className="text-button" onClick={() => navigate("map")}>
                  See my frontier map <ArrowUpRight size={14} />
                </button>
              </div>
            </section>
          )}
          {view === "summary" && lastSession && (
            <section className="result-page">
              <span className="result-icon">
                <Check size={30} />
              </span>
              <span className="eyebrow">THAT’S A GOOD PLACE TO PAUSE.</span>
              <h1>
                A little clearer
                <br />
                than before.
              </h1>
              <p>
                {lastSession.total} responses. {lastSession.concepts.length}{" "}
                connected idea{lastSession.concepts.length === 1 ? "" : "s"}.
                Evidence collected, with room for uncertainty.
              </p>
              <div className="session-changes">
                {Object.entries(lastSession.changes).map(([id, d]) => {
                  const k = getKnowledge(state, id, now);
                  return (
                    <div key={id}>
                      <div>
                        <h3>{concept(id).title}</h3>
                        <p>
                          Current model uncertainty:{" "}
                          {interval(k)
                            .map((v) => Math.round(v * 100))
                            .join("–")}
                          %
                        </p>
                        <p>
                          Next recall:{" "}
                          {new Date(dueAt(k)).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className="mono">
                        {d >= 0 ? "+" : ""}
                        {(d * 100).toFixed(1)} pp
                        <small>estimated mastery</small>
                      </span>
                    </div>
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
                onChange={(e) => setReflection(e.target.value.slice(0, 4000))}
              />
              <button
                className="secondary"
                onClick={() => {
                  setState({
                    ...state,
                    sessions: state.sessions.map((s) =>
                      s.at === lastSession.at ? { ...s, reflection } : s,
                    ),
                    reflection,
                  });
                  setNotice("Reflection saved on this device.");
                }}
              >
                Save reflection <NotebookPen size={14} />
              </button>
              <div className="summary-next">
                <span className="eyebrow">WHEN YOU RETURN</span>
                <h2>{nextConcept?.title ?? "A well-timed review"}</h2>
                <p>
                  {next?.why ??
                    "The next review will appear when memory needs a return."}
                </p>
                <button className="primary" onClick={() => navigate("today")}>
                  Back to my learning space <ArrowRight size={15} />
                </button>
              </div>
            </section>
          )}
        </main>
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              aria-current={activeView === n.id ? "page" : undefined}
            >
              {n.label}
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
