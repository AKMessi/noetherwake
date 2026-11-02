"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ancestors, missing, type Learner } from "@noetherwake/engine";
import { catalog, concept } from "@/lib/catalog";
import { atlasLayout } from "@/lib/atlas-layout";
import { evidenceView } from "@/lib/presentation";
import { EvidenceGlyph, EvidenceMark } from "./ui/WorkingPage";
interface Props {
  state: Learner;
  onSelect: (id: string) => void;
  selected?: string;
  trace?: string | null;
  onClearTrace?: () => void;
  compact?: boolean;
}
export default function ConceptMap({
  state,
  onSelect,
  selected,
  trace,
  onClearTrace,
  compact = false,
}: Props) {
  const [zoom, setZoom] = useState(1),
    [domain, setDomain] = useState("all"),
    [routeOnly, setRouteOnly] = useState(false),
    [query, setQuery] = useState(""),
    [list, setList] = useState(false);
  const scroll = useRef<HTMLDivElement>(null),
    search = useRef<HTMLInputElement>(null),
    drag = useRef<{
      x: number;
      y: number;
      left: number;
      top: number;
      distance: number;
    } | null>(null),
    pointers = useRef(new Map<number, { x: number; y: number }>()),
    pinch = useRef(0),
    now = Date.now();
  const route = ancestors(catalog, state.goal),
    traced = trace ? ancestors(catalog, trace) : null;
  const nodes = useMemo(
    () =>
      catalog.filter(
        (c) =>
          (domain === "all" || c.domain === domain) &&
          (!routeOnly || route.has(c.id)),
      ),
    [domain, routeOnly, state.goal],
  );
  const layout = useMemo(() => atlasLayout(catalog, nodes), [nodes]),
    results = nodes.filter((c) =>
      `${c.title} ${c.strand}`.toLowerCase().includes(query.toLowerCase()),
    );
  const focus =
    selected && nodes.some((c) => c.id === selected) ? selected : nodes[0]?.id;
  const unmet = new Set(
    traced
      ? [...traced.keys()].flatMap((id) => missing(catalog, state, id, now))
      : [],
  );
  function fit() {
    const el = scroll.current;
    if (el)
      setZoom(
        Math.max(
          0.12,
          Math.min(
            1,
            el.clientWidth / layout.width,
            el.clientHeight / layout.height,
          ),
        ),
      );
  }
  function panTo(id: string) {
    const p = layout.pos.get(id);
    if (!p || !scroll.current) return;
    scroll.current.scrollTo({
      left: Math.max(0, p.x * zoom - scroll.current.clientWidth / 3),
      top: Math.max(0, p.y * zoom - scroll.current.clientHeight / 2),
      behavior: "instant",
    });
  }
  useEffect(() => {
    if (selected && !trace) panTo(selected);
  }, [selected, zoom, nodes, trace]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !(e.target as HTMLElement).closest("input,textarea,select")
      ) {
        e.preventDefault();
        search.current?.focus();
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    const el = scroll.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.max(0.12, Math.min(2, z - e.deltaY * 0.002)));
      }
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [list]);
  useEffect(() => {
    if (!trace || !scroll.current) return;
    const points = [...ancestors(catalog, trace).keys()]
      .map((id) => layout.pos.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p);
    if (!points.length) return;
    const left = Math.min(...points.map((p) => p.x)),
      top = Math.min(...points.map((p) => p.y));
    const width = Math.max(...points.map((p) => p.x)) + 240 - left,
      height = Math.max(...points.map((p) => p.y)) + 64 - top;
    const z = Math.max(
      0.12,
      Math.min(
        1,
        scroll.current.clientWidth / (width + 32),
        scroll.current.clientHeight / (height + 32),
      ),
    );
    setZoom(z);
    requestAnimationFrame(() =>
      scroll.current?.scrollTo({
        left: Math.max(0, left * z - 16),
        top: Math.max(0, top * z - 16),
        behavior: "instant",
      }),
    );
  }, [trace]);
  function spatial(id: string, key: string) {
    const p = layout.pos.get(id)!;
    let candidates = nodes.filter((c) => c.id !== id);
    if (key === "ArrowLeft" || key === "ArrowRight") {
      const linked =
        key === "ArrowLeft"
          ? concept(id).prerequisites
          : catalog
              .filter((c) => c.prerequisites.includes(id))
              .map((c) => c.id);
      const directed = candidates.filter((c) => linked.includes(c.id));
      candidates = directed.length
        ? directed
        : candidates.filter((c) =>
            key === "ArrowLeft"
              ? layout.pos.get(c.id)!.layer < p.layer
              : layout.pos.get(c.id)!.layer > p.layer,
          );
    } else
      candidates = candidates.filter(
        (c) =>
          layout.pos.get(c.id)!.layer === p.layer &&
          (key === "ArrowUp"
            ? layout.pos.get(c.id)!.y < p.y
            : layout.pos.get(c.id)!.y > p.y),
      );
    candidates.sort((a, b) => {
      const x = layout.pos.get(a.id)!,
        y = layout.pos.get(b.id)!;
      return (
        Math.abs(x.y - p.y) +
          Math.abs(x.x - p.x) -
          (Math.abs(y.y - p.y) + Math.abs(y.x - p.x)) ||
        a.id.localeCompare(b.id)
      );
    });
    const next = candidates[0];
    if (next) {
      onSelect(next.id);
      requestAnimationFrame(() =>
        scroll.current
          ?.querySelector<SVGElement>(`[data-concept="${next.id}"]`)
          ?.focus(),
      );
    }
  }
  return (
    <section
      className={`concept-map working-map ${list ? "is-list" : "is-graph"} ${compact ? "compact-map" : ""}`}
      aria-label="Concept atlas"
    >
      <div className="atlas-controls">
        <label className="atlas-search">
          <span className="sr-only">Search atlas</span>
          <input
            ref={search}
            aria-label="Search atlas"
            placeholder="Find a concept · /"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                onSelect(results[0].id);
                panTo(results[0].id);
              }
            }}
          />
        </label>
        <button className="secondary" onClick={() => setList((v) => !v)}>
          {list ? "Map" : "List"}
        </button>
        <div className="atlas-zoom">
          <button
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
          >
            +
          </button>
          <button
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.12, z - 0.15))}
          >
            −
          </button>
          <button onClick={fit}>Fit</button>
        </div>
      </div>
      <div className="atlas-domains segmented">
        {[
          ["all", "Both"],
          ["math", "Mathematics"],
          ["physics", "Physics"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={domain === id}
            onClick={() => {
              setDomain(id);
              onClearTrace?.();
            }}
          >
            {label}
          </button>
        ))}
        <button
          aria-pressed={routeOnly}
          onClick={() => setRouteOnly((v) => !v)}
        >
          My route only
        </button>
      </div>
      {query && !list && (
        <div className="atlas-search-results" aria-live="polite">
          {results.length ? (
            results.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c.id);
                  panTo(c.id);
                  setQuery("");
                }}
              >
                {c.title} →
              </button>
            ))
          ) : (
            <p>Nothing matches ‘{query}’. Try a broader term.</p>
          )}
        </div>
      )}
      {trace && (
        <div className="trace-caption">
          <p className="mono">
            Route to {concept(trace).title}: {traced!.size} concepts,{" "}
            {unmet.size} unmet
          </p>
          <button className="quiet" onClick={onClearTrace}>
            Clear trace
          </button>
        </div>
      )}
      {list ? (
        <div className="atlas-list" aria-label="Accessible atlas list">
          {results.map((c) => (
            <button
              key={c.id}
              aria-pressed={selected === c.id}
              onClick={() => onSelect(c.id)}
            >
              <EvidenceMark state={state} id={c.id} now={now} />
              <span>{c.title}</span>
              <span className="caption">
                {evidenceView(state, c.id, now).needs
                  ? `needs ${evidenceView(state, c.id, now).needs}`
                  : evidenceView(state, c.id, now).level}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div
          ref={scroll}
          className="map-scroll measurement-grid"
          aria-label="Prerequisite map. Use Tab then arrow keys to move between concepts."
          onPointerDown={(e) => {
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pointers.current.size === 2) {
              const [a, b] = [...pointers.current.values()];
              pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
            }
            drag.current = {
              x: e.clientX,
              y: e.clientY,
              left: e.currentTarget.scrollLeft,
              top: e.currentTarget.scrollTop,
              distance: 0,
            };
            if (!(e.target as Element).closest("[data-concept]"))
              e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!pointers.current.has(e.pointerId)) return;
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pointers.current.size === 2) {
              const [a, b] = [...pointers.current.values()],
                d = Math.hypot(a.x - b.x, a.y - b.y);
              if (pinch.current)
                setZoom((z) =>
                  Math.min(2, Math.max(0.12, (z * d) / pinch.current)),
                );
              pinch.current = d;
              return;
            }
            if (drag.current) {
              const dx = e.clientX - drag.current.x,
                dy = e.clientY - drag.current.y;
              drag.current.distance = Math.hypot(dx, dy);
              if (drag.current.distance > 5) {
                e.currentTarget.scrollLeft = drag.current.left - dx;
                e.currentTarget.scrollTop = drag.current.top - dy;
              }
            }
          }}
          onPointerUp={(e) => {
            pointers.current.delete(e.pointerId);
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={(e) => pointers.current.delete(e.pointerId)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onClearTrace?.();
              return;
            }
            if (e.key === "+" || e.key === "=") {
              e.preventDefault();
              setZoom((z) => Math.min(2, z + 0.15));
            }
            if (e.key === "-") {
              e.preventDefault();
              setZoom((z) => Math.max(0.12, z - 0.15));
            }
            if (e.key === "0") {
              e.preventDefault();
              fit();
            }
          }}
        >
          <svg
            width={layout.width * zoom}
            height={layout.height * zoom}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            role="group"
            aria-label={`${nodes.length} concepts, arranged by prerequisite depth and strand`}
          >
            {layout.layers.map((layer) => (
              <text
                className="depth-label"
                key={layer}
                x={48 + layer * 256}
                y="24"
              >
                depth {layer}
              </text>
            ))}
            {layout.lanes.map((l) => (
              <g key={l.title}>
                <path
                  d={`M0 ${l.y - 16}H${layout.width}`}
                  stroke="rgb(var(--rule))"
                />
                <text className="lane-label" x="16" y={l.y + 8}>
                  {l.title
                    .replace("math ·", "Mathematics ·")
                    .replace("physics ·", "Physics ·")}
                </text>
              </g>
            ))}
            {nodes.flatMap((c) =>
              c.prerequisites
                .filter((id) => layout.pos.has(id))
                .map((id) => {
                  const a = layout.pos.get(id)!,
                    b = layout.pos.get(c.id)!,
                    isTrace = traced?.has(id) && traced.has(c.id);
                  return (
                    <path
                      key={`${id}-${c.id}`}
                      className={isTrace ? "trace-edge" : ""}
                      style={{ "--trace-layer": b.layer } as CSSProperties}
                      d={`M${a.x + 216} ${a.y + 24}C${a.x + 240} ${a.y + 24},${b.x - 24} ${b.y + 24},${b.x} ${b.y + 24}`}
                      fill="none"
                      stroke={
                        isTrace
                          ? unmet.has(id)
                            ? "rgb(var(--ochre-ink))"
                            : "rgb(var(--cobalt))"
                          : "rgb(var(--ink-3))"
                      }
                      strokeWidth={isTrace ? 2 : 1}
                      opacity={traced ? (isTrace ? 1 : 0.1) : 0.4}
                    />
                  );
                }),
            )}
            {nodes.map((c) => {
              const p = layout.pos.get(c.id)!,
                e = evidenceView(state, c.id, now),
                active = selected === c.id,
                inTrace = traced?.has(c.id);
              return (
                <g
                  key={c.id}
                  transform={`translate(${p.x},${p.y})`}
                  data-concept={c.id}
                  role="button"
                  tabIndex={focus === c.id ? 0 : -1}
                  className={`working-map-node ${inTrace ? "traced" : ""} ${active ? "selected" : ""} ${unmet.has(c.id) ? "unmet" : ""}`}
                  style={
                    {
                      "--trace-layer": p.layer,
                      opacity: traced && !inTrace ? 0.25 : 1,
                    } as CSSProperties
                  }
                  aria-label={`${c.title}: ${e.label}`}
                  onClick={() => {
                    if ((drag.current?.distance ?? 0) > 5) return;
                    onSelect(c.id);
                  }}
                  onKeyDown={(event) => {
                    if (
                      [
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowDown",
                      ].includes(event.key)
                    ) {
                      event.preventDefault();
                      spatial(c.id, event.key);
                    }
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(c.id);
                    }
                  }}
                >
                  <title>
                    {c.title}: {e.label}
                  </title>
                  <rect
                    width="216"
                    height="48"
                    fill={
                      active ? "rgb(var(--cobalt-tint))" : "rgb(var(--ground))"
                    }
                    fillOpacity={active ? 1 : 0.85}
                  />
                  <svg x="8" y="16" width="16" height="16" viewBox="0 0 24 24">
                    <EvidenceGlyph {...e} size={24} />
                  </svg>
                  <text x="32" y="25" className={e.needs ? "node-locked" : ""}>
                    {c.title.length > 25 ? c.title.slice(0, 23) + "…" : c.title}
                  </text>
                  {e.needs > 0 && (
                    <text className="node-needs" x="32" y="42">
                      needs {e.needs}
                    </text>
                  )}
                  {active && (
                    <path
                      d="M32 30H208"
                      stroke="rgb(var(--cobalt))"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
      <p className="map-instructions caption">
        {nodes.length} concepts shown · {catalog.length} in the atlas. Hollow:
        none · ¼: emerging · ½: moderate · full: strong. Dashed outer ring:
        uncertain.{" "}
        {list
          ? "Select a row to see its evidence."
          : "Drag to pan. Ctrl/⌘ + wheel or pinch to zoom. Arrow keys follow concepts; + / − / 0 zoom and fit."}
      </p>
    </section>
  );
}
