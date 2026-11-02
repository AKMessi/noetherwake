import { describe, it, expect } from "vitest";
import { atlasLayout } from "../../lib/atlas-layout";
import { catalog } from "../../lib/catalog";
import { depth } from "../../packages/engine/src/graph";
describe("atlas presentation layout", () => {
  it("is deterministic and keeps every hard prerequisite in an earlier layer", () => {
    const a = atlasLayout(catalog, catalog),
      b = atlasLayout(catalog, catalog);
    expect([...a.pos]).toEqual([...b.pos]);
    expect(a.pos.size).toBe(catalog.length);
    for (const c of catalog) {
      const p = a.pos.get(c.id)!;
      expect(p.layer).toBe(depth(catalog, c.id));
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThan(a.height);
      for (const id of c.prerequisites)
        expect(a.pos.get(id)!.x).toBeLessThan(p.x);
    }
  });
  it("keeps node hit regions from overlapping in the same column", () => {
    const a = atlasLayout(catalog, catalog);
    for (const [id, p] of a.pos)
      for (const [other, q] of a.pos)
        if (id !== other && p.x === q.x)
          expect(Math.abs(p.y - q.y)).toBeGreaterThanOrEqual(48);
  });
});
