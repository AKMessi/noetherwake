"use client";
import { useReducedMotion } from "./WorkingPage";
import { useEffect, useState } from "react";
/** Numeric geometry only; the engine supplies correctness and canonical-unit values. */
export default function Gap({
  yours,
  correct,
  matches,
  unit = "",
  caption = true,
}: {
  yours: number;
  correct: number;
  matches: boolean;
  unit?: string;
  caption?: boolean;
}) {
  const reduced = useReducedMotion(),
    [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const delta = yours - correct,
    span = Math.max(Math.abs(delta) * 1.8, Math.abs(correct) * 0.3, 1e-6),
    mid = (yours + correct) / 2;
  const x = (v: number) => 48 + ((v - (mid - span / 2)) / span) * 464;
  const a = x(yours),
    b = x(matches ? yours : correct),
    same = Math.abs(a - b) < 2;
  const format = (v: number) =>
    Number(v.toPrecision(5)).toLocaleString(undefined, {
      maximumFractionDigits: 5,
    });
  return (
    <figure
      className={`gap-figure ${matches ? "matches" : "differs"}`}
      aria-label={
        matches
          ? "Your answer matches within tolerance"
          : `Your answer ${format(yours)} ${unit}; correct ${format(correct)} ${unit}; difference ${format(delta)} ${unit}`
      }
    >
      <div className="measurement-grid">
        <svg
          viewBox="0 0 560 120"
          role="img"
          aria-label="Answer comparison number line"
        >
          <path d="M32 66H528" stroke="rgb(var(--rule-strong))" />
          <g style={{ transform: `translateX(${a}px)` }}>
            <path d="M0 56V80" stroke="rgb(var(--ochre-ink))" strokeWidth="2" />
            <text x="0" y="102" textAnchor="middle" className="gap-yours">
              Yours {format(yours)}
            </text>
          </g>
          <g
            className="gap-correct"
            style={{ transform: `translateX(${reduced || ready ? b : a}px)` }}
          >
            <path d="M0 44V72" stroke="rgb(var(--cobalt))" strokeWidth="2" />
            <text x="0" y="32" textAnchor="middle">
              {same ? "Correct · " : "Correct "}
              {format(correct)}
            </text>
          </g>
          {!same && (
            <path
              className="gap-bracket"
              d={`M${Math.min(a, b)} 48V40H${Math.max(a, b)}V48`}
              pathLength="1"
              fill="none"
              stroke="rgb(var(--err))"
            />
          )}
        </svg>
      </div>
      {caption && (
        <figcaption className="figure-caption mono">
          {matches ? (
            "Matches within tolerance"
          ) : (
            <>
              Difference:{" "}
              <span className="error-value">
                {delta > 0 ? "+" : ""}
                {format(delta)}
                {unit && ` ${unit}`}
              </span>
              {correct !== 0 && (
                <>
                  {" "}
                  · relative error {format(Math.abs(delta / correct) * 100)}%
                </>
              )}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
