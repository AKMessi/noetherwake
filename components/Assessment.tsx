"use client";
import { useEffect, useRef, useState } from "react";
import { ConfidenceScale } from "./ui/WorkingPage";
import Gap from "./ui/Gap";
import {
  ArrowRight,
  Lightbulb,
  Check,
  CornerDownLeft,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  check,
  arithmetic,
  dimension,
  explainCheck,
  type Concept,
  type Evidence,
  type Item,
  type CheckResult,
} from "@noetherwake/engine";
interface Props {
  item: Item;
  concept: Concept;
  diagnostic?: boolean;
  faded?: boolean;
  onEvidence: (e: Evidence) => void;
  onNext: () => void;
  onSkip?: () => void;
}
export default function Assessment({
  item,
  concept,
  diagnostic = false,
  faded = false,
  onEvidence,
  onNext,
  onSkip,
}: Props) {
  const [answer, setAnswer] = useState(
      item.kind === "simulation"
        ? "20"
        : item.kind === "point"
          ? "0"
          : item.kind === "ordering"
            ? "A,B,C"
            : "",
    ),
    [unit, setUnit] = useState(""),
    [confidence, setConfidence] = useState<number | null>(null),
    [hints, setHints] = useState(faded ? 1 : 0),
    [result, setResult] = useState<CheckResult | null>(null),
    [busy, setBusy] = useState(false),
    [explanation, setExplanation] = useState(""),
    [rubric, setRubric] = useState<boolean | null>(null),
    [keyboard, setKeyboard] = useState(false);
  const start = useRef(Date.now()),
    input = useRef<HTMLInputElement>(null);
  async function submit() {
    if (!answer.trim() || confidence === null || busy || result) return;
    setBusy(true);
    try {
      const graded = await check(item, answer, unit);
      setResult(graded);
      if (!graded.indeterminate)
        onEvidence({
          concept: concept.id,
          item: item.id,
          correct: graded.correct,
          seconds: Math.max(0.1, (Date.now() - start.current) / 1000),
          expectedSeconds: item.expectedSeconds,
          hints,
          attempts: 1,
          confidence,
          difficulty: item.difficulty,
          at: Date.now(),
          diagnostic,
          guess: item.choices ? 1 / item.choices.length : undefined,
          misconception: graded.misconception,
        });
    } finally {
      setBusy(false);
    }
  }
  let gap: { yours: number; correct: number; unit: string } | null = null;
  if (
    result &&
    !result.indeterminate &&
    ["numeric", "point", "simulation"].includes(item.kind)
  ) {
    try {
      const a = dimension(unit),
        b = dimension(item.unit);
      if (a.d.every((v, i) => v === b.d[i]))
        gap = {
          yours: (arithmetic(answer) * a.factor) / b.factor,
          correct: arithmetic(item.answer),
          unit: item.unit,
        };
    } catch {
      /* Invalid syntax and units retain the engine's feedback only. */
    }
  }
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (result) feedbackRef.current?.focus({ preventScroll: true });
  }, [result]);
  const misconception = concept.misconceptions.find(
    (m) => m.id === result?.misconception,
  );
  function insertKey(key: string) {
    const field = input.current;
    const start = field?.selectionStart ?? answer.length;
    const end = field?.selectionEnd ?? start;
    const left = key === "⌫" && start === end ? Math.max(0, start - 1) : start;
    const text = key === "⌫" ? "" : key;
    setAnswer(answer.slice(0, left) + text + answer.slice(end));
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(left + text.length, left + text.length);
    });
  }
  return (
    <section className="assessment" aria-labelledby="question-title">
      <p className="assessment-stage caption">
        {diagnostic
          ? "Placement question"
          : faded
            ? "Supported practice · hint weighting applies"
            : "Independent practice"}
      </p>
      <h2 id="question-title">{item.prompt}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {(item.kind === "simulation" || item.kind === "point") && (
          <div className="item-instrument">
            {item.kind === "simulation" ? (
              <>
                <svg
                  viewBox="0 0 360 210"
                  role="img"
                  aria-label={`Projectile trajectory for launch angle ${answer} degrees. Level-ground range ${(10 * Math.sin((2 * Number(answer) * Math.PI) / 180)).toFixed(2)} metres.`}
                >
                  <path
                    d="M20 180H345M20 180V15"
                    stroke="rgb(var(--ink-3))"
                    fill="none"
                  />
                  {(() => {
                    const angle = (Number(answer) * Math.PI) / 180,
                      vx = 10 * Math.cos(angle),
                      vy = 10 * Math.sin(angle),
                      time = (2 * vy) / 10;
                    const path = Array.from({ length: 60 }, (_, i) => {
                      const t = (i * time) / 59;
                      return `${i ? "L" : "M"}${20 + vx * t * 30},${180 - (vy * t - 5 * t * t) * 30}`;
                    }).join(" ");
                    return (
                      <path
                        d={path}
                        fill="none"
                        stroke="rgb(var(--cobalt))"
                        strokeWidth="2.5"
                      />
                    );
                  })()}
                  <text
                    x="337"
                    y="200"
                    fill="rgb(var(--ink-3))"
                    fontSize="10"
                    textAnchor="end"
                  >
                    horizontal range · m
                  </text>
                </svg>
                <label htmlFor="launch-angle">
                  Launch angle · {answer}° (speed 10 m/s, g=10 m/s²)
                </label>
                <input
                  type="range"
                  id="launch-angle"
                  min="1"
                  max="89"
                  step="1"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={!!result}
                />
                <p>
                  Range:{" "}
                  {(
                    10 * Math.sin((2 * Number(answer) * Math.PI) / 180)
                  ).toFixed(3)}{" "}
                  m
                </p>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 360 100"
                  role="img"
                  aria-label={`Number line from 0 to 20. Placed point at ${answer}.`}
                  onClick={(e) => {
                    if (result) return;
                    const box = e.currentTarget.getBoundingClientRect();
                    setAnswer(
                      String(
                        Math.max(
                          0,
                          Math.min(
                            20,
                            Math.round(
                              (((e.clientX - box.left) / box.width) * 360 -
                                20) /
                                16,
                            ),
                          ),
                        ),
                      ),
                    );
                  }}
                >
                  <path d="M20 50H340" stroke="rgb(var(--ink-3))" />
                  {[0, 5, 10, 15, 20].map((x) => (
                    <g key={x}>
                      <path
                        d={`M${20 + x * 16} 45v10`}
                        stroke="rgb(var(--ink-3))"
                      />
                      <text
                        x={20 + x * 16}
                        y="76"
                        textAnchor="middle"
                        fontSize="11"
                        fill="rgb(var(--ink-3))"
                      >
                        {x}
                      </text>
                    </g>
                  ))}
                  <circle
                    cx={20 + Number(answer) * 16}
                    cy="50"
                    r="7"
                    fill="rgb(var(--cobalt))"
                  />
                </svg>
                <label htmlFor="point-position">
                  Point x-coordinate · {answer}
                </label>
                <input
                  id="point-position"
                  type="range"
                  min="0"
                  max="20"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={!!result}
                />
              </>
            )}
          </div>
        )}
        {item.kind === "ordering" && (
          <div
            className="ordering-control"
            aria-label="Reorder the derivation steps"
          >
            {answer.split(",").map((step, i, steps) => (
              <div key={step}>
                <button
                  type="button"
                  disabled={!!result || i === 0}
                  aria-label={`Move step ${step} earlier`}
                  onClick={() => {
                    [steps[i - 1], steps[i]] = [steps[i], steps[i - 1]];
                    setAnswer(steps.join(","));
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <strong>{step}</strong>
                <button
                  type="button"
                  disabled={!!result || i === steps.length - 1}
                  aria-label={`Move step ${step} later`}
                  onClick={() => {
                    [steps[i + 1], steps[i]] = [steps[i], steps[i + 1]];
                    setAnswer(steps.join(","));
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {item.choices ? (
          <fieldset className="choice-group">
            <legend className="sr-only">Choose your answer</legend>
            {item.choices.map((c, i) => (
              <label
                key={c.text}
                className={answer === c.text ? "choice selected" : "choice"}
              >
                <input
                  type="radio"
                  name="answer"
                  value={c.text}
                  checked={answer === c.text}
                  onChange={() => setAnswer(c.text)}
                  disabled={!!result}
                />
                <span className="choice-number">
                  {String.fromCharCode(65 + i)}
                </span>
                {c.text}
              </label>
            ))}
          </fieldset>
        ) : (
          <>
            <div className="answer-row">
              <div className="answer-field">
                <label htmlFor="answer">
                  {item.kind === "ordering"
                    ? "Step order (e.g. B,A,C)"
                    : "Your answer"}
                </label>
                <input
                  id="answer"
                  ref={input}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  inputMode={item.kind === "numeric" ? "decimal" : "text"}
                  disabled={!!result}
                  placeholder={
                    item.kind === "symbolic"
                      ? "An expression in x"
                      : "Type a value or expression"
                  }
                />
              </div>
              {item.unit && (
                <div className="unit-field">
                  <label htmlFor="unit">Unit</label>
                  <input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder={item.unit}
                    disabled={!!result}
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              className="text-button keyboard-toggle"
              onClick={() => setKeyboard(!keyboard)}
            >
              Math keyboard {keyboard ? "−" : "+"}
            </button>
            {keyboard && (
              <div className="math-keyboard">
                {[
                  "x",
                  "^",
                  "(",
                  ")",
                  "/",
                  "*",
                  "sqrt(",
                  "pi",
                  "-",
                  ".",
                  "⌫",
                ].map((key) => (
                  <button
                    key={key}
                    type="button"
                    disabled={!!result}
                    onClick={() => {
                      insertKey(key);
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {!result && (
          <ConfidenceScale
            value={confidence}
            onChange={setConfidence}
            disabled={busy}
          />
        )}
        {hints > 0 && (
          <div className="hint-box">
            <Lightbulb size={16} />
            <div>
              <b>
                {["", "Nudge", "Partial step", "Full solution"][hints]} ·{" "}
                {hints} of 3
              </b>
              <p>
                {hints === 3
                  ? "Full support: this answer adds no mastery evidence."
                  : "Supported recall receives less mastery credit."}
              </p>
              <p>{item.hints[hints - 1]}</p>
            </div>
          </div>
        )}
        {!result && (
          <div className="assessment-actions">
            <button
              type="submit"
              className="primary"
              disabled={!answer.trim() || confidence === null || busy}
              aria-describedby="answer-requirements"
            >
              {busy ? "Checking…" : "Check answer"}
            </button>
            {onSkip && (
              <button className="quiet" type="button" onClick={onSkip}>
                {diagnostic ? "I don’t know yet" : "Skip"}
              </button>
            )}
            {!diagnostic && hints < 3 && (
              <button
                type="button"
                className="text-button"
                onClick={() => setHints(hints + 1)}
              >
                <Lightbulb size={15} />{" "}
                {hints ? "Another hint" : "A small hint"}
              </button>
            )}
          </div>
        )}
        {!result && (
          <p className="caption" id="answer-requirements">
            {!answer.trim()
              ? "Enter an answer."
              : confidence === null
                ? "Choose a confidence before checking."
                : "Ready to check."}
          </p>
        )}
      </form>
      {result && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className={`feedback ${result.indeterminate ? "indeterminate" : result.correct ? "correct" : "needs-work"}`}
          role="status"
        >
          <div className="feedback-title">
            {result.correct ? <Check size={18} /> : <Lightbulb size={18} />}
            <strong>
              {result.indeterminate
                ? "Let’s check another form."
                : result.correct
                  ? "Correct"
                  : "Compare the reasoning"}
            </strong>
          </div>
          {gap && <Gap {...gap} matches={result.correct} />}
          <p>
            {result.feedback}
            {result.indeterminate
              ? " No mastery evidence was recorded; try another form."
              : ""}
          </p>
          {result.indeterminate && (
            <button
              className="secondary"
              onClick={() => {
                setResult(null);
                requestAnimationFrame(() => input.current?.focus());
              }}
            >
              Try another form
            </button>
          )}
          {misconception && (
            <p>
              <b>{misconception.description}.</b> {misconception.remediation}
            </p>
          )}
          <details>
            <summary>Show the worked solution</summary>
            <p>{item.solution}</p>
            <p className="mono">
              Expected: {item.answer} {item.unit}
            </p>
          </details>
          {!diagnostic && (
            <div className="self-explanation">
              <label htmlFor="explain">{concept.explanation.prompt}</label>
              <textarea
                id="explain"
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
              <button
                className="text-button"
                onClick={() =>
                  setRubric(
                    explainCheck(explanation, concept.explanation.keywords),
                  )
                }
              >
                Check my explanation
              </button>
              {rubric !== null && (
                <p>
                  {rubric
                    ? "Your explanation includes the key mechanisms."
                    : `Try connecting these ideas: ${concept.explanation.keywords.map((g) => g.join(" or ")).join("; ")}.`}{" "}
                  This is a formative keyword check.
                </p>
              )}
            </div>
          )}
          {!result.indeterminate && (
            <button className="primary" onClick={onNext}>
              {diagnostic ? "Next placement question" : "Next problem →"}{" "}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
