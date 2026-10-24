export interface Motion {
  x: number;
  v: number;
}
// Coupled RK4, unit mass: x'=v, v'=acceleration(x,v,t). No DOM or scheduler.
export function rk4(
  s: Motion,
  t: number,
  dt: number,
  acceleration: (x: number, v: number, t: number) => number,
): Motion {
  const f = (x: number, v: number, time: number) => ({
      x: v,
      v: acceleration(x, v, time),
    }),
    a = f(s.x, s.v, t),
    b = f(s.x + (a.x * dt) / 2, s.v + (a.v * dt) / 2, t + dt / 2),
    c = f(s.x + (b.x * dt) / 2, s.v + (b.v * dt) / 2, t + dt / 2),
    d = f(s.x + c.x * dt, s.v + c.v * dt, t + dt);
  return {
    x: s.x + (dt * (a.x + 2 * b.x + 2 * c.x + d.x)) / 6,
    v: s.v + (dt * (a.v + 2 * b.v + 2 * c.v + d.v)) / 6,
  };
}
export function trajectory(acceleration: number, duration = 5, steps = 180) {
  let s = { x: 0, v: 1 };
  const points: { t: number; x: number; v: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    points.push({ t: (i * duration) / steps, ...s });
    s = rk4(s, (i * duration) / steps, duration / steps, () => acceleration);
  }
  return points;
}
