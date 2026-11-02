import { describe, expect, it } from "vitest";
import { projectile } from "../src";

describe("ideal projectile model", () => {
  it("lands at the analytic equal-height range with a symmetric apex", () => {
    const flight = projectile(10, 45, 10);
    expect(flight.range).toBeCloseTo(10, 10);
    expect(flight.height).toBeCloseTo(2.5, 10);
    expect(flight.points[0]).toEqual({ t: 0, x: 0, y: 0 });
    expect(flight.points.at(-1)!.y).toBe(0);
    expect(flight.points.at(-1)!.x).toBeCloseTo(flight.range, 10);
    expect(flight.points[40].y).toBeCloseTo(flight.height, 10);
  });
  it("preserves complementary-angle range and inverse-gravity scaling", () => {
    for (const angle of [10, 20, 30, 40]) {
      const earth = projectile(12, angle);
      expect(earth.range).toBeCloseTo(projectile(12, 90 - angle).range, 10);
      const halfGravity = projectile(12, angle, 9.81 / 2);
      expect(halfGravity.range).toBeCloseTo(earth.range * 2, 10);
      expect(halfGravity.duration).toBeCloseTo(earth.duration * 2, 10);
      expect(halfGravity.height).toBeCloseTo(earth.height * 2, 10);
    }
  });
  it("rejects nonphysical and nonfinite parameters", () => {
    for (const args of [
      [0, 45],
      [-1, 45],
      [10, 0],
      [10, 90],
      [NaN, 45],
      [10, Infinity],
      [10, 45, 0],
    ])
      expect(() => projectile(args[0], args[1], args[2])).toThrow(RangeError);
  });
});
