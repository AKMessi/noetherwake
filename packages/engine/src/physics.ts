export interface Motion {
  x: number;
  v: number;
}

/** Ideal ballistic flight: SI units, constant gravity, equal launch/landing height, no drag. */
export function projectile(
  speed: number,
  angleDegrees: number,
  gravity = 9.81,
) {
  if (
    !Number.isFinite(speed) ||
    speed <= 0 ||
    !Number.isFinite(angleDegrees) ||
    angleDegrees <= 0 ||
    angleDegrees >= 90 ||
    !Number.isFinite(gravity) ||
    gravity <= 0
  )
    throw new RangeError(
      "Use positive finite speed and gravity, and an angle between 0 and 90 degrees.",
    );
  const angle = (angleDegrees * Math.PI) / 180;
  const vx = speed * Math.cos(angle),
    vy = speed * Math.sin(angle);
  const duration = (2 * vy) / gravity;
  const range = vx * duration,
    height = (vy * vy) / (2 * gravity);
  return {
    duration,
    range,
    height,
    vx,
    vy,
    points: Array.from({ length: 81 }, (_, i) => {
      const t = (duration * i) / 80;
      return { t, x: vx * t, y: i === 80 ? 0 : vy * t - (gravity * t * t) / 2 };
    }),
  };
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
