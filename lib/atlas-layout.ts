import { depth, type Concept } from "@noetherwake/engine";
export interface AtlasPosition {
  x: number;
  y: number;
  layer: number;
}
/** Stable longest-path layers and strand lanes. Layout has no learner or policy decisions. */
export function atlasLayout(graph: Concept[], nodes: Concept[]) {
  const pos = new Map<string, AtlasPosition>(),
    memo = new Map<string, number>();
  const firstDepth = (strand: string) =>
    Math.min(
      ...nodes
        .filter((c) => `${c.domain}:${c.strand}` === strand)
        .map((c) => depth(graph, c.id, memo)),
    );
  const strands = [
      ...new Set(nodes.map((c) => `${c.domain}:${c.strand}`)),
    ].sort(
      (a, b) =>
        a.split(":")[0].localeCompare(b.split(":")[0]) ||
        firstDepth(a) - firstDepth(b) ||
        a.localeCompare(b),
    ),
    lanes: { title: string; y: number }[] = [];
  const layers = [...new Set(nodes.map((c) => depth(graph, c.id, memo)))].sort(
    (a, b) => a - b,
  );
  let y = 64;
  for (const strand of strands) {
    const group = nodes.filter((c) => `${c.domain}:${c.strand}` === strand);
    lanes.push({ title: strand.replace(":", " · "), y });
    let rows = 1;
    for (const layer of layers) {
      const items = group.filter((c) => depth(graph, c.id, memo) === layer);
      const center = (c: Concept) => {
        const ys = c.prerequisites
          .map((p) => pos.get(p)?.y)
          .filter((v): v is number => v !== undefined);
        return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : y;
      };
      items.sort((a, b) => center(a) - center(b) || a.id.localeCompare(b.id));
      rows = Math.max(rows, items.length);
      items.forEach((c, i) =>
        pos.set(c.id, { x: 48 + layer * 256, y: y + 32 + i * 64, layer }),
      );
    }
    y += rows * 64 + 64;
  }
  return {
    pos,
    lanes,
    layers,
    width: Math.max(560, (Math.max(...layers, 0) + 1) * 256 + 64),
    height: Math.max(480, y),
  };
}
