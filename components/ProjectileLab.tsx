"use client";
import { useEffect, useMemo, useState } from "react";
import { projectile } from "@noetherwake/engine";
import { Readout, useReducedMotion } from "./ui/WorkingPage";
import Gap from "./ui/Gap";
export default function ProjectileLab({
  onConcept,
}: {
  onConcept: (id: string) => void;
}) {
  const [angle, setAngle] = useState(45),
    [planet, setPlanet] = useState("earth"),
    [prediction, setPrediction] = useState<number | null>(null),
    [revealed, setRevealed] = useState(false),
    [progress, setProgress] = useState(1),
    [run, setRun] = useState(0),
    reduced = useReducedMotion();
  const speed = 12,
    gravity = planet === "earth" ? 9.81 : 1.62;
  const comparison = useMemo(
      () =>
        [30, 45, 60].map((a) => ({
          angle: a,
          ...projectile(speed, a, gravity),
        })),
      [gravity],
    ),
    flight = useMemo(() => projectile(speed, angle, gravity), [angle, gravity]);
  const winner = comparison.reduce((a, b) => (a.range > b.range ? a : b)),
    predicted = comparison.find((f) => f.angle === prediction),
    extent = winner.range * 1.05,
    scale = 620 / extent,
    maxDuration = Math.max(
      ...comparison.map((f) => f.duration),
      flight.duration,
    );
  const point = (p: { x: number; y: number }) =>
    `${64 + p.x * scale},${340 - p.y * scale}`;
  const path = (
    points: { t: number; x: number; y: number }[],
    animated: boolean,
  ) =>
    points
      .filter((p) => !animated || p.t <= progress * maxDuration)
      .map((p, i) => `${i ? "L" : "M"}${point(p)}`)
      .join(" ");
  useEffect(() => {
    if (!revealed || reduced) {
      setProgress(1);
      return;
    }
    let handle = 0,
      start = 0;
    const duration = Math.min(2400, maxDuration * 1000);
    const tick = (time: number) => {
      if (!start) start = time;
      const p = Math.min(1, (time - start) / duration);
      setProgress(p);
      if (p < 1) handle = requestAnimationFrame(tick);
    };
    setProgress(0);
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [revealed, reduced, run, angle, planet, maxDuration]);
  const trajectories =
    angle === 30 || angle === 45 || angle === 60
      ? comparison
      : [...comparison, { angle, ...flight }];
  return (
    <section className="projectile-lab working-lab" aria-labelledby="lab-title">
      <header className="lab-heading">
        <span className="section-number">Experiment 1</span>
        <h2 id="lab-title">Projectile range</h2>
        <p>
          Same speed, different angles. Predict, then compare the measured
          paths.
        </p>
      </header>
      <div className="lab-bench">
        <div className="lab-sheet">
          <figure>
            <div className="lab-plot measured-figure measurement-grid">
              <svg
                viewBox="0 0 720 400"
                role="img"
                aria-label={
                  revealed
                    ? `Equal-scale trajectory plot on ${planet}. ${angle} degrees: range ${flight.range.toFixed(2)} metres.`
                    : "Equal-scale axes for a projectile prediction. Measurements appear after testing."
                }
              >
                <path
                  d="M64 30V340H696"
                  fill="none"
                  stroke="rgb(var(--rule-strong))"
                />
                <path
                  d="M64 340H696"
                  stroke="rgb(var(--ink))"
                  strokeWidth="2"
                />
                {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                  <g key={p}>
                    <path
                      d={`M${64 + p * 620} 340v8`}
                      stroke="rgb(var(--rule-strong))"
                    />
                    <text x={64 + p * 620} y="370" textAnchor="middle">
                      {(p * extent).toFixed(1)}
                    </text>
                  </g>
                ))}
                {[0.125, 0.25, 0.375, 0.5].map((p) => (
                  <g key={p}>
                    <path
                      d={`M56 ${340 - p * 620}h8`}
                      stroke="rgb(var(--rule-strong))"
                    />
                    <text x="48" y={344 - p * 620} textAnchor="end">
                      {(p * extent).toFixed(1)}
                    </text>
                  </g>
                ))}
                <text x="684" y="394" textAnchor="end">
                  range / m
                </text>
                <text x="64" y="20">
                  height / m
                </text>
                <circle cx="64" cy="340" r="4" fill="rgb(var(--ink))" />
                {!revealed && (
                  <>
                    <path
                      d="M64 340l40 -24M64 340l32 -32M64 340l24 -40"
                      fill="none"
                      stroke="rgb(var(--ink-3))"
                      strokeDasharray="4 4"
                    />
                    {predicted && (
                      <g>
                        <path
                          d={`M${64 + predicted.range * scale} 326v28`}
                          stroke="rgb(var(--ochre-ink))"
                          strokeWidth="2"
                        />
                        <text
                          x={Math.min(580, 64 + predicted.range * scale)}
                          y="308"
                          textAnchor="end"
                          className="prediction-label"
                        >
                          Your prediction: {prediction}°
                        </text>
                      </g>
                    )}
                  </>
                )}
                {revealed &&
                  trajectories.map((f) => {
                    const chosen = f.angle === prediction,
                      color =
                        f.angle === winner.angle
                          ? "rgb(var(--cobalt))"
                          : chosen
                            ? "rgb(var(--ochre-ink))"
                            : "rgb(var(--ink))",
                      landed = progress * maxDuration >= f.duration,
                      ball =
                        f.points[
                          Math.min(
                            80,
                            Math.floor(
                              Math.min(
                                1,
                                (progress * maxDuration) / f.duration,
                              ) * 80,
                            ),
                          )
                        ];
                    return (
                      <g key={f.angle}>
                        <path
                          d={path(f.points, true)}
                          fill="none"
                          stroke={color}
                          strokeWidth={f.angle === angle ? 2.5 : 1.5}
                          strokeDasharray={f.angle === 60 ? "6 4" : undefined}
                        />
                        {!landed && (
                          <circle
                            cx={64 + ball.x * scale}
                            cy={340 - ball.y * scale}
                            r="4"
                            fill={color}
                          />
                        )}
                        <text
                          x={64 + f.range * 0.5 * scale}
                          y={324 - f.height * scale - (f.angle === 60 ? 8 : 0)}
                          textAnchor="middle"
                          style={{ fill: color }}
                        >
                          {f.angle}°{chosen ? " · yours" : ""}
                        </text>
                        {landed && (
                          <path
                            d={`M${64 + f.range * scale} 332v16`}
                            stroke={color}
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  })}
              </svg>
            </div>
            <figcaption className="figure-caption">
              Fig. 1. Equal distances on both axes represent equal lengths.
              Launch speed {speed} m/s; constant gravity {gravity} m/s². No air
              resistance, equal launch and landing heights. Exploration adds no
              mastery evidence.
            </figcaption>
          </figure>
          {revealed && predicted && (
            <div className="lab-outcome" aria-live="polite">
              <p>
                {winner.angle}° travelled furthest: {winner.range.toFixed(2)} m.
                You predicted {prediction}°, which travelled{" "}
                {predicted.range.toFixed(2)} m.
              </p>
              {(reduced || progress >= 1) && (
                <Gap
                  yours={predicted.range}
                  correct={winner.range}
                  unit="m"
                  matches={prediction === winner.angle}
                />
              )}
            </div>
          )}
          {revealed && (
            <div className="trajectory-ledger">
              <h3>Measured trajectories</h3>
              {trajectories.map((f) => (
                <div
                  className={`trajectory-row ${f.angle === winner.angle ? "model-winner" : f.angle === prediction ? "your-trajectory" : ""}`}
                  key={f.angle}
                >
                  <span className="mono trajectory-angle">
                    {f.angle}°{f.angle === prediction && <small>yours</small>}
                  </span>
                  <div className="readouts">
                    <Readout
                      label="Range"
                      value={
                        <span
                          data-testid={
                            f.angle === angle ? "lab-range" : undefined
                          }
                        >
                          {f.range.toFixed(2)}
                        </span>
                      }
                      unit="m"
                    />
                    <Readout
                      label="Maximum height"
                      value={f.height.toFixed(2)}
                      unit="m"
                    />
                    <Readout
                      label="Time of flight"
                      value={f.duration.toFixed(2)}
                      unit="s"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <aside className="lab-margin">
          <h3>Setup</h3>
          <dl className="setup-values">
            <div>
              <dt>Launch speed</dt>
              <dd>
                12 <span>m/s</span>
              </dd>
            </div>
            <div>
              <dt>Gravity</dt>
              <dd>
                {gravity} <span>m/s²</span>
              </dd>
            </div>
            <div>
              <dt>Landing height</dt>
              <dd>
                0 <span>m</span>
              </dd>
            </div>
          </dl>
          <h3>Predict</h3>
          <p className="lab-question-text">
            Which angle travels furthest on level ground?
          </p>
          <fieldset className="lab-predictions">
            <legend>Your prediction</legend>
            {[30, 45, 60].map((a) => (
              <button
                key={a}
                aria-pressed={prediction === a}
                disabled={revealed}
                onClick={() => setPrediction(a)}
              >
                <span className="prediction-square" aria-hidden="true" />
                {a}°
              </button>
            ))}
          </fieldset>
          {!revealed ? (
            <button
              className="primary lab-test"
              disabled={prediction === null}
              onClick={() => {
                setAngle(prediction!);
                setRevealed(true);
              }}
            >
              Test my prediction →
            </button>
          ) : (
            <>
              <h3>Explore</h3>
              <label className="lab-angle" htmlFor="lab-angle">
                Launch angle<output>{angle}°</output>
              </label>
              <input
                id="lab-angle"
                aria-label="Explore launch angle"
                type="range"
                min="10"
                max="80"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
              />
              <button
                className="secondary"
                onClick={() => setRun((r) => r + 1)}
              >
                Replay the model
              </button>
            </>
          )}
          <label className="field-label" htmlFor="lab-gravity">
            Gravity setting
          </label>
          <select
            id="lab-gravity"
            value={planet}
            onChange={(e) => {
              setPlanet(e.target.value);
              setRevealed(false);
              setPrediction(null);
            }}
          >
            <option value="earth">Earth · 9.81 m/s²</option>
            <option value="moon">Moon · 1.62 m/s²</option>
          </select>
          <div className="lab-margin-actions">
            <button
              className="secondary"
              onClick={() => {
                setRevealed(false);
                setPrediction(null);
                setAngle(45);
              }}
            >
              Reset
            </button>
            <button
              className="secondary"
              onClick={() => onConcept("projectile")}
            >
              Read the reasoning →
            </button>
          </div>
          <p className="annotation">
            The model computes every value. Changing the experiment does not
            update your learning evidence.
          </p>
          {revealed && maxDuration > 2.4 && (
            <p className="annotation">
              Playback is compressed to 2.4 seconds. Flight times above are
              model time.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
