/**
 * Benchmark functions for SDL demo.
 * All functions follow the BO literature conventions.
 */

// ============================================================
// 1D: Forrester function
// ============================================================

export function forrester(x: number): number {
  // f(x) = (6x - 2)^2 * sin(12x - 4)
  // Domain: [0, 1]
  // Global minimum at x ≈ 0.757, f(x) ≈ -6.02
  const t = 6 * x - 2;
  return t * t * Math.sin(12 * x - 4);
}

export const FORRESTER_DOMAIN: [number, number] = [0, 1];

// ============================================================
// 2D: Branin-Hoo function
// ============================================================

export function branin(x1: number, x2: number): number {
  // Standard Branin: 3 global minima at f ≈ 0.398
  // Domain: x1 ∈ [-5, 10], x2 ∈ [0, 15]
  const a = 1;
  const b = 5.1 / (4 * Math.PI * Math.PI);
  const c = 5 / Math.PI;
  const r = 6;
  const s = 10;
  const t = 1 / (8 * Math.PI);
  return a * (x2 - b * x1 * x1 + c * x1 - r) ** 2 + s * (1 - t) * Math.cos(x1) + s;
}

export const BRANIN_DOMAIN: [number, number][] = [
  [-5, 10],
  [0, 15],
];

// ============================================================
// 2D Multi-objective: Branin-Currin
// ============================================================

export function braninCurrinObj1(x1: number, x2: number): number {
  // Branin (same as above) — to minimize
  return branin(x1, x2);
}

export function currin(x1: number, x2: number): number {
  // Currin exponential function — to minimize
  // Domain: x1 ∈ [0, 1], x2 ∈ [0, 1] (we'll scale)
  const scaled_x1 = (x1 + 5) / 15; // map [-5, 10] → [0, 1]
  const scaled_x2 = x2 / 15; // map [0, 15] → [0, 1]
  const a = 1 - Math.exp(-1 / (2 * scaled_x2 + 1e-9));
  const b = (2300 * scaled_x1 ** 3 + 1900 * scaled_x1 ** 2 + 2092 * scaled_x1 + 60) /
    (100 * scaled_x1 ** 3 + 500 * scaled_x1 ** 2 + 4 * scaled_x1 + 20);
  return a * b;
}

export function braninCurrinObj2(x1: number, x2: number): number {
  return currin(x1, x2);
}

export const BRANIN_CURRIN_DOMAIN: [number, number][] = [
  [-5, 10],
  [0, 15],
];

// ============================================================
// Benchmark registry
// ============================================================

export interface BenchmarkDef {
  id: string;
  name: string;
  dims: number;
  objectives: number;
  fn: (x: number[]) => number | number[];
  domain: [number, number][];
  globalOptimum: { x: number[]; f: number | number[] };
}

export const BENCHMARKS: BenchmarkDef[] = [
  {
    id: 'forrester',
    name: 'Forrester (1D)',
    dims: 1,
    objectives: 1,
    fn: (x) => forrester(x[0]),
    domain: [FORRESTER_DOMAIN],
    globalOptimum: { x: [0.757], f: forrester(0.757) },
  },
  {
    id: 'branin',
    name: 'Branin-Hoo (2D)',
    dims: 2,
    objectives: 1,
    fn: (x) => branin(x[0], x[1]),
    domain: BRANIN_DOMAIN,
    globalOptimum: { x: [-Math.PI, 12.275], f: 0.397887 },
  },
  {
    id: 'branin-currin',
    name: 'Branin-Currin (2D, 双目标)',
    dims: 2,
    objectives: 2,
    fn: (x) => [braninCurrinObj1(x[0], x[1]), braninCurrinObj2(x[0], x[1])],
    domain: BRANIN_CURRIN_DOMAIN,
    globalOptimum: { x: [], f: [] }, // multi-objective: no single optimum
  },
];
