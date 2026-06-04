/**
 * Multi-objective optimization utilities:
 * - Pareto front computation
 * - Hypervolume indicator
 * - Scalarization (for BO acquisition)
 *
 * For the lecture demo, we use a scalarization approach (ParEGO-style):
 * randomly weight the objectives into a single scalar, then run
 * single-objective BO on the scalarized value. This is the most
 * lecture-friendly approach because students can trace the logic
 * from single-objective BO.
 */

// ============================================================
// Pareto front
// ============================================================

export interface ParetoPoint {
  x: number[];
  objectives: number[];
}

/** Check if point a dominates point b (minimization). */
export function dominates(a: number[], b: number[]): boolean {
  // assumes minimization
  let atLeastOneBetter = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) return false;
    if (a[i] < b[i]) atLeastOneBetter = true;
  }
  return atLeastOneBetter;
}

/** Compute non-dominated front from a set of objective vectors. */
export function paretoFront(points: ParetoPoint[]): ParetoPoint[] {
  const front: ParetoPoint[] = [];
  for (const p of points) {
    let isDominated = false;
    for (let i = front.length - 1; i >= 0; i--) {
      if (dominates(front[i].objectives, p.objectives)) {
        isDominated = true;
        break;
      }
      if (dominates(p.objectives, front[i].objectives)) {
        front.splice(i, 1);
      }
    }
    if (!isDominated) front.push(p);
  }
  return front;
}

// ============================================================
// Hypervolume (2-objective only, for simplicity)
// ============================================================

export function hypervolume2D(
  points: number[][],
  refPoint: [number, number]
): number {
  if (points.length === 0) return 0;
  // Sort by first objective ascending
  const sorted = [...points].sort((a, b) => a[0] - b[0]);
  // Filter to non-dominated only
  const nondom: number[][] = [];
  let minY = Infinity;
  for (const p of sorted) {
    if (p[1] < minY) {
      nondom.push(p);
      minY = p[1];
    }
  }
  if (nondom.length === 0) return 0;

  let hv = 0;
  // First rectangle
  hv += (refPoint[0] - nondom[0][0]) * (refPoint[1] - nondom[0][1]);
  // Remaining rectangles
  for (let i = 1; i < nondom.length; i++) {
    hv += (refPoint[0] - nondom[i][0]) * (nondom[i - 1][1] - nondom[i][1]);
  }
  return Math.max(0, hv);
}

// ============================================================
// Scalarization for multi-objective BO
// ============================================================

/**
 * ParEGO-style: random scalarization weights.
 * Minimization is assumed.
 */
export function scalarizeRandom(
  objectives: number[],
  seed: number
): { scalarized: number; weights: number[] } {
  // Generate deterministic random weights from seed
  const weights = randomWeightVector(objectives.length, seed);
  const rho = 0.05; // ParEGO rho parameter

  // Augmented Tchebycheff scalarization
  let maxTerm = -Infinity;
  const sumTerm = objectives.reduce((s, o, i) => s + rho * weights[i] * o, 0);

  for (let i = 0; i < objectives.length; i++) {
    const term = weights[i] * objectives[i];
    if (term > maxTerm) maxTerm = term;
  }

  return { scalarized: maxTerm + sumTerm, weights };
}

function randomWeightVector(n: number, seed: number): number[] {
  // Mulberry32-inspired deterministic uniform RNG
  let s = seed | 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const raw: number[] = [];
  for (let i = 0; i < n; i++) raw.push(rand());
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((r) => r / sum);
}
