'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, ArrowRight } from 'lucide-react';
import { arithmetic, type Concept } from '@noetherwake/engine';
interface Point {
  t: number;
  x: number;
  v: number;
}
export default function Interactive({ concept }: { concept: Concept }) {
  const spec = concept.interactive,
    [a, setA] = useState(spec.initial),
    [prediction, setPrediction] = useState(''),
    [committed, setCommitted] = useState(false),
    [revealed, setRevealed] = useState(false),
    [points, setPoints] = useState<Point[]>([]),
    [frame, setFrame] = useState(0),
    worker = useRef<Worker | null>(null);
  useEffect(() => {
    if (spec.kind !== 'motion') return;
    worker.current = new Worker('/physics-worker.js');
    worker.current.onmessage = (e) => setPoints(e.data);
    return () => worker.current?.terminate();
  }, [spec.kind]);
  useEffect(() => {
    worker.current?.postMessage({ acceleration: a });
  }, [a]);
  useEffect(() => {
    if (!revealed || spec.kind !== 'motion') return;
    let handle = 0,
      start = 0;
    const run = (time: number) => {
      if (!start) start = time;
      setFrame(Math.min(180, Math.floor((time - start) / 17)));
      if (time - start < 3060) handle = requestAnimationFrame(run);
    };
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
      handle = requestAnimationFrame(run);
    else setFrame(180);
    return () => cancelAnimationFrame(handle);
  }, [revealed, a, spec.kind]);
  const curves = useMemo(() => {
    const values = Array.from({ length: 81 }, (_, i) => {
      const x = 0.05 + (i * 4.95) / 80;
      return {
        x,
        y: arithmetic(spec.formula, { x, a: revealed ? a : spec.initial }),
      };
    });
    const old = values.map((p) => ({
      x: p.x,
      y: arithmetic(spec.formula, { x: p.x, a: spec.initial }),
    }));
    const all = [...values, ...old].map((p) => p.y),
      lo = Math.min(0, ...all),
      hi = Math.max(1, ...all);
    const map = (p: { x: number; y: number }) =>
      `${35 + (p.x / 5) * 300},${185 - ((p.y - lo) / (hi - lo)) * 145}`;
    return {
      path: values.map((p, i) => `${i ? 'L' : 'M'}${map(p)}`).join(' '),
      old: old.map((p, i) => `${i ? 'L' : 'M'}${map(p)}`).join(' '),
      lo,
      hi,
      values,
    };
  }, [a, revealed, spec]);
  const last = spec.kind === 'motion' ? points[frame] : undefined;
  return (
    <section className="interactive-card" aria-labelledby="interactive-title">
      <div className="eyebrow">
        <span className="tiny-square" /> LEARNING INSTRUMENT
      </div>
      <h3 id="interactive-title">Predict. Change. Observe.</h3>
      <p>{spec.prompt}</p>
      <svg
        viewBox="0 0 370 225"
        role="img"
        aria-label={`Graph of ${spec.formula}. Parameter a=${revealed ? a : spec.initial}. Vertical range ${curves.lo.toFixed(1)} to ${curves.hi.toFixed(1)}.`}
      >
        <defs>
          <pattern
            id="interactive-grid"
            width="30"
            height="29"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 0H0V29"
              fill="none"
              stroke="var(--border)"
              strokeWidth=".6"
            />
          </pattern>
        </defs>
        <rect
          x="35"
          y="30"
          width="300"
          height="155"
          fill="url(#interactive-grid)"
        />
        <path d="M35 25V185H345" fill="none" stroke="var(--muted)" />
        <path
          d={curves.old}
          stroke="var(--muted)"
          strokeDasharray="4 4"
          fill="none"
          opacity=".45"
        />
        <path
          d={curves.path}
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
        />
        <text
          x="335"
          y="210"
          textAnchor="end"
          fill="var(--muted)"
          fontSize="10"
        >
          {spec.xLabel}
        </text>
        <text x="40" y="20" fill="var(--muted)" fontSize="10">
          {spec.yLabel}
        </text>
        <text x="10" y="40" fill="var(--muted)" fontSize="9">
          {curves.hi.toFixed(0)}
        </text>
        <text x="10" y="185" fill="var(--muted)" fontSize="9">
          {curves.lo.toFixed(0)}
        </text>
      </svg>
      <div className="parameter-head">
        <label htmlFor="parameter">Parameter {spec.parameterLabel}</label>
        <output className="mono">{a.toFixed(1)}</output>
      </div>
      <input
        id="parameter"
        aria-label="Interactive parameter"
        type="range"
        min={spec.min}
        max={spec.max}
        step=".25"
        value={a}
        onChange={(e) => {
          setA(Number(e.target.value));
          setRevealed(false);
        }}
      />
      {!committed ? (
        <>
          <label className="field-label" htmlFor="prediction">
            {spec.prediction}
          </label>
          <textarea
            id="prediction"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            rows={2}
          />
          <button
            className="secondary full"
            disabled={prediction.trim().length < 4}
            onClick={() => setCommitted(true)}
          >
            Commit prediction <ArrowRight size={15} />
          </button>
        </>
      ) : (
        <>
          <p className="prediction">
            <b>Your prediction</b>
            <br />
            {prediction}
          </p>
          <button className="primary full" onClick={() => setRevealed(true)}>
            <Play size={15} /> Reveal the change
          </button>
        </>
      )}
      {revealed && (
        <div className="instrument-result" aria-live="polite">
          <span className="mono">
            f(2) = {arithmetic(spec.formula, { a, x: 2 }).toFixed(3)}
          </span>
          <p>
            Solid curve: a={a}. Dashed curve: a={spec.initial}. Compare a fixed
            input before comparing the whole shape.
          </p>
          {last && (
            <p className="mono">
              RK4 · t={last.t.toFixed(2)} s<br />
              x={last.x.toFixed(2)} m · v={last.v.toFixed(2)} m/s
            </p>
          )}
        </div>
      )}
      {committed && (
        <button
          className="text-button"
          onClick={() => {
            setCommitted(false);
            setRevealed(false);
          }}
        >
          <RotateCcw size={13} /> Revise prediction
        </button>
      )}
    </section>
  );
}
