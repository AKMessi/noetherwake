"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, FlaskConical, Play, RotateCcw } from "lucide-react";
import { projectile } from "@noetherwake/engine";

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
    [run, setRun] = useState(0);
  const gravity = planet === "earth" ? 9.81 : 1.62,
    speed = 12;
  const flight = useMemo(
    () => projectile(speed, angle, gravity),
    [angle, gravity],
  );
  const comparison = useMemo(
    () =>
      [30, 45, 60].map((a) => ({ angle: a, ...projectile(speed, a, gravity) })),
    [gravity],
  );
  const extent = (speed * speed) / gravity;
  const toPoint = (p: { x: number; y: number }) =>
    `${48 + (p.x / extent) * 490},${242 - (p.y / (extent / 2)) * 190}`;
  const path = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i ? "L" : "M"}${toPoint(p)}`).join(" ");
  const ball = flight.points[Math.min(80, Math.floor(progress * 80))];
  useEffect(() => {
    if (!revealed) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    let frame = 0,
      start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / 1600);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    setProgress(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [revealed, run, angle, planet]);
  return (
    <section className="projectile-lab" aria-labelledby="lab-title">
      <div className="lab-visual">
        <div className="lab-caption">
          <span>
            <i /> EXPERIMENT 001
          </span>
          <span>THE PERFECT THROW</span>
        </div>
        <svg
          viewBox="0 0 580 290"
          role="img"
          aria-label={
            revealed
              ? `Projectile at ${angle} degrees. Range ${flight.range.toFixed(2)} metres on ${planet}. Dashed lines compare 30, 45 and 60 degree launches.`
              : "Three possible projectile paths. Make a prediction to reveal their measured ranges."
          }
        >
          <defs>
            <pattern
              id="lab-grid"
              width="35"
              height="35"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M35 0H0V35"
                fill="none"
                stroke="currentColor"
                strokeWidth=".5"
                opacity=".12"
              />
            </pattern>
          </defs>
          <rect x="48" y="27" width="490" height="215" fill="url(#lab-grid)" />
          <path
            d="M48 22V242H552"
            fill="none"
            stroke="currentColor"
            opacity=".35"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <path
                d={`M${48 + p * 490} 242v5`}
                stroke="currentColor"
                opacity=".5"
              />
              <text x={48 + p * 490} y="266" textAnchor="middle">
                {revealed
                  ? (p * extent).toFixed(1)
                  : ["0", "", "", "", "?"][p * 4]}
              </text>
            </g>
          ))}
          <text x="542" y="286" textAnchor="end">
            distance / m
          </text>
          <text x="17" y="30" transform="rotate(-90 17 30)" textAnchor="end">
            height / m
          </text>
          {comparison.map((f) => (
            <g key={f.angle}>
              <path
                d={path(f.points)}
                fill="none"
                stroke="currentColor"
                opacity={revealed ? 0.3 : 0.19}
                strokeDasharray="5 6"
                strokeWidth="1.3"
              />
              <text
                x={48 + (f.range / extent) * 490}
                y={f.angle === 60 ? 212 : 229}
                textAnchor="middle"
              >
                {f.angle}°
              </text>
            </g>
          ))}
          {revealed && (
            <>
              <path
                d={path(flight.points)}
                className="flight-path"
                fill="none"
                strokeWidth="3"
              />
              <circle
                cx={toPoint(ball).split(",")[0]}
                cy={toPoint(ball).split(",")[1]}
                r="7"
                className="flight-ball"
              />
              <circle cx="48" cy="242" r="5" fill="currentColor" />
              <path
                d={`M48 242l${36 * Math.cos((angle * Math.PI) / 180)} ${-36 * Math.sin((angle * Math.PI) / 180)}`}
                stroke="currentColor"
                strokeWidth="2"
              />
            </>
          )}
          {!revealed && (
            <g className="lab-question">
              <circle cx="290" cy="115" r="33" />
              <text x="290" y="128" textAnchor="middle">
                ?
              </text>
            </g>
          )}
        </svg>
        <div className="lab-measurements" aria-live="polite">
          <div>
            <span>HORIZONTAL RANGE</span>
            <output data-testid="lab-range">
              {revealed ? flight.range.toFixed(2) : "—"}
              <small> m</small>
            </output>
          </div>
          <div>
            <span>MAXIMUM HEIGHT</span>
            <output>
              {revealed ? flight.height.toFixed(2) : "—"}
              <small> m</small>
            </output>
          </div>
          <div>
            <span>TIME IN FLIGHT</span>
            <output>
              {revealed ? flight.duration.toFixed(2) : "—"}
              <small> s</small>
            </output>
          </div>
        </div>
      </div>
      <div className="lab-controls">
        <span className="eyebrow">
          <FlaskConical size={14} /> THE CURIOSITY LAB
        </span>
        <h2 id="lab-title">
          A better throw starts
          <br />
          with a better question.
        </h2>
        {!revealed ? (
          <>
            <p>
              Same speed. Different angles. Which throw travels furthest on
              level ground?
            </p>
            <fieldset className="lab-predictions">
              <legend>Your prediction</legend>
              {[30, 45, 60].map((a) => (
                <button
                  key={a}
                  aria-pressed={prediction === a}
                  onClick={() => setPrediction(a)}
                >
                  {a}°<ArrowUpRight size={16} />
                </button>
              ))}
            </fieldset>
            <button
              className="primary"
              disabled={prediction === null}
              onClick={() => {
                setAngle(prediction!);
                setRevealed(true);
              }}
            >
              <Play size={15} /> Test my prediction
            </button>
            <p className="lab-note">
              Make a guess. Surprises are where understanding begins.
            </p>
          </>
        ) : (
          <>
            <p className="lab-insight" role="status">
              {prediction === 45
                ? "Your prediction holds: "
                : "Here’s the surprise: "}
              <b>45° gives the greatest range.</b> At 30° and 60°, the ranges
              match: more airtime balances less horizontal speed.
            </p>
            <label className="lab-angle" htmlFor="lab-angle">
              Explore the launch angle <output>{angle}°</output>
            </label>
            <input
              id="lab-angle"
              type="range"
              min="10"
              max="80"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
            />
            <div className="lab-planet">
              <label htmlFor="lab-gravity">Try another world</label>
              <select
                id="lab-gravity"
                value={planet}
                onChange={(e) => setPlanet(e.target.value)}
              >
                <option value="earth">Earth · 9.81 m/s²</option>
                <option value="moon">Moon · 1.62 m/s²</option>
              </select>
            </div>
            <button className="text-button" onClick={() => setRun(run + 1)}>
              <RotateCcw size={14} /> Replay this throw
            </button>
            <button
              className="text-button"
              onClick={() => onConcept("projectile")}
            >
              Explore the reasoning <ArrowUpRight size={14} />
            </button>
          </>
        )}
        <div className="lab-assumptions">
          MODEL NOTES · Launch speed 12 m/s. Constant gravity, no air
          resistance, equal launch and landing heights. Exploration adds no
          mastery evidence.
        </div>
      </div>
    </section>
  );
}
