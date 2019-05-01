export declare type Vec2 = [number, number];

/** Create a vec2 */
export function create(x: number, y: number): Vec2 {
  const result = new Float32Array(2);
  result[0] = x;
  result[1] = y;
  return result as any as Vec2;
}

/** Clone a vec2 */
export function clone(v: Vec2): Vec2 {
  const result = new Float32Array(2);
  result[0] = v[0];
  result[1] = v[1];
  return result as any as Vec2;
}

/** Compute the magnitude of a vector. */
export function length(v: Vec2): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

/** Scale a vector by a scalar number. */
export function scale(v: Vec2, m: number): Vec2 {
  v[0] *= m;
  v[1] *= m;
  return v;
}

/** Normalize a vector. */
export function norm(v: Vec2): Vec2 {
  const d = 1.0 / length(v);
  v[0] *= d;
  v[1] *= d;
  return v;
}

/** Subtract one vector from another. */
export function subtract(v0: Vec2, v1: Vec2): Vec2 {
  v0[0] -= v1[0];
  v0[1] -= v1[1];
  return v0;
}
