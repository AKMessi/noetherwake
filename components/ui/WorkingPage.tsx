"use client";
import {
  useEffect,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import type { Learner } from "@noetherwake/engine";
import {
  evidenceView,
  levelIndex,
  type EvidenceLevel,
} from "@/lib/presentation";
export function Sheet({
  children,
  margin,
  className = "",
}: {
  children: ReactNode;
  margin?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`sheet-frame ${className}`}>
      <div className="sheet">{children}</div>
      {margin && <aside className="margin">{margin}</aside>}
    </div>
  );
}
export function Rule() {
  return <hr className="rule" />;
}
export function Readout({
  label,
  value,
  unit,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
}) {
  return (
    <dl className="readout">
      <dt>{label}</dt>
      <dd>
        {value}
        {unit && <span className="unit"> {unit}</span>}
      </dd>
    </dl>
  );
}
export function Button({
  variant = "primary",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
}) {
  return (
    <button {...props} className={`${variant} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}
export function Field({
  label,
  unit,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; unit?: string }) {
  return (
    <label className="working-field">
      <span>{label}</span>
      <span className="field-line">
        <input {...props} />
        {unit && <span className="unit"> {unit}</span>}
      </span>
    </label>
  );
}
export function EvidenceGlyph({
  level,
  uncertain = false,
  needs = 0,
  label,
  size = 12,
  quarters,
}: {
  level: EvidenceLevel;
  uncertain?: boolean;
  needs?: number;
  label: string;
  size?: number;
  quarters?: 0 | 1 | 2 | 3 | 4;
}) {
  const fill = quarters ?? levelIndex[level];
  return (
    <svg
      className={`evidence-mark ${level}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={needs ? "2 2" : undefined}
      />
      {fill > 0 && (
        <path
          d={
            fill === 1
              ? "M12 12V4A8 8 0 0 1 20 12Z"
              : fill === 2
                ? "M12 4A8 8 0 0 1 12 20Z"
                : fill === 3
                  ? "M12 12V4A8 8 0 1 1 4 12Z"
                  : "M12 4A8 8 0 1 1 11.999 4Z"
          }
          fill="currentColor"
        />
      )}
      {uncertain && (
        <circle
          cx="12"
          cy="12"
          r="11"
          fill="none"
          stroke="rgb(var(--ochre-ink))"
          strokeWidth="1.25"
          strokeDasharray="2 2"
        />
      )}
    </svg>
  );
}
export function EvidenceMark({
  state,
  id,
  now,
  size = 16,
  text = false,
}: {
  state: Learner;
  id: string;
  now: number;
  size?: number;
  text?: boolean;
}) {
  const e = evidenceView(state, id, now);
  return (
    <span className="evidence-state">
      <EvidenceGlyph {...e} size={size} />
      {text && (
        <span>
          {e.needs
            ? `needs ${e.needs}`
            : e.level === "none"
              ? "not yet seen"
              : `${e.level} evidence`}
          {e.uncertain ? " · uncertain" : ""}
        </span>
      )}
    </span>
  );
}
export function ConfidenceScale({
  value,
  onChange,
  disabled = false,
}: {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="confidence-scale">
      <legend>How sure are you?</legend>
      <div>
        {[
          { label: "Guessing", value: 0.25 },
          { label: "Leaning", value: 0.5 },
          { label: "Fairly sure", value: 0.65 },
          { label: "Certain", value: 0.9 },
        ].map((c) => (
          <label key={c.value} className={value === c.value ? "selected" : ""}>
            <input
              type="radio"
              name="confidence"
              checked={value === c.value}
              value={c.value}
              disabled={disabled}
              onChange={() => onChange(c.value)}
            />
            <span className="confidence-tick" />
            <span>{c.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function Figure({
  children,
  caption,
  className = "",
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="measured-figure measurement-grid">{children}</div>
      {caption && <figcaption className="figure-caption">{caption}</figcaption>}
    </figure>
  );
}
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(m.matches);
    change();
    m.addEventListener("change", change);
    return () => m.removeEventListener("change", change);
  }, []);
  return reduced;
}
