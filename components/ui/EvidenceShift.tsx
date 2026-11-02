"use client";
import { useEffect, useState } from "react";
import { interval, type Knowledge } from "@noetherwake/engine";
import { evidenceLevel, levelIndex } from "@/lib/presentation";
import { EvidenceGlyph, useReducedMotion } from "./WorkingPage";
export default function EvidenceShift({
  before,
  after,
  at,
}: {
  before: Knowledge;
  after: Knowledge;
  at: number;
}) {
  const from = evidenceLevel(before, at),
    to = evidenceLevel(after, at),
    a = levelIndex[from],
    b = levelIndex[to],
    reduced = useReducedMotion();
  const [quarter, setQuarter] = useState<number>(a);
  useEffect(() => {
    if (reduced || a === b) {
      setQuarter(b);
      return;
    }
    setQuarter(a);
    let timer: ReturnType<typeof setTimeout>;
    let current: number = a;
    const tick = () => {
      current += b > a ? 1 : -1;
      setQuarter(current);
      if (current !== b) timer = setTimeout(tick, 600 / Math.abs(b - a));
    };
    timer = setTimeout(tick, 250 + 600 / Math.abs(b - a));
    return () => clearTimeout(timer);
  }, [a, b, reduced]);
  const range = interval(after),
    uncertain =
      after.suspicion > 0.14 ||
      (after.observations > 0 && range[1] - range[0] > 0.5);
  return (
    <span className="evidence-shift">
      <EvidenceGlyph level={from} label={`${from} evidence before`} size={16} />
      <span aria-hidden="true">→</span>
      <EvidenceGlyph
        level={to}
        quarters={quarter as 0 | 1 | 2 | 3 | 4}
        uncertain={uncertain}
        label={`${to} evidence after${uncertain ? ", uncertain" : ""}`}
        size={16}
      />
      <span className="mono">
        {from} → {to}
        {uncertain ? " · uncertain" : ""}
      </span>
    </span>
  );
}
