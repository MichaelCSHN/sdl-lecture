// ==================== DOE Sampling Methods ====================

export function generateRandom(n: number): number[][] {
  return Array.from({ length: n }, () => [Math.random(), Math.random()]);
}

export function generateLHS(n: number): number[][] {
  // Latin Hypercube Sampling: divide each dimension into n bins
  // Permute so each row/column gets exactly one point
  const dim1 = shuffle(Array.from({ length: n }, (_, i) => i));
  const dim2 = shuffle(Array.from({ length: n }, (_, i) => i));

  return Array.from({ length: n }, (_, i) => [
    (dim1[i] + Math.random()) / n,
    (dim2[i] + Math.random()) / n,
  ]);
}

export function generateSobol(n: number): number[][] {
  // Van der Corput / Sobol-like low-discrepancy sequence
  const points: number[][] = [];
  for (let i = 0; i < n; i++) {
    points.push([vdc(i + 1, 2), vdc(i + 1, 3)]);
  }
  return points;
}

export function generateFullFactorial(n: number): number[][] {
  // sqrt(n) x sqrt(n) grid
  const m = Math.ceil(Math.sqrt(n));
  const points: number[][] = [];
  for (let i = 0; i < m && points.length < n; i++) {
    for (let j = 0; j < m && points.length < n; j++) {
      points.push([(i + 0.5) / m, (j + 0.5) / m]);
    }
  }
  return points;
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Van der Corput sequence (base b)
function vdc(n: number, b: number): number {
  let x = 0;
  let denom = 1;
  while (n > 0) {
    denom *= b;
    x += (n % b) / denom;
    n = Math.floor(n / b);
  }
  return x;
}

// ==================== Convergence Race ====================

import { GaussianProcess, expectedImprovement } from './bo_engine';

export interface RaceResult {
  name: string;
  color: string;
  bestValues: number[]; // cumulative best at each iteration
  finalBest: number;
}

function branin(x1: number, x2: number): number {
  const a = 1, b = 5.1 / (4 * Math.PI * Math.PI), c = 5 / Math.PI;
  const r = 6, s = 10, t = 1 / (8 * Math.PI);
  return -(a * (x2 - b * x1 * x1 + c * x1 - r) ** 2 + s * (1 - t) * Math.cos(x1) + s);
}

export function runRace(strategy: 'bo' | 'random' | 'lhs' | 'sobol', nIter: number): number[] {
  const results: number[] = [];

  if (strategy === 'bo') {
    const X: number[][] = [];
    const y: number[] = [];
    const gp = new GaussianProcess(2.0, 1.0, 0.01);

    for (let i = 0; i < nIter; i++) {
      let x: number[];
      if (i < 3) {
        // Random initial points
        x = [Math.random() * 15 - 5, Math.random() * 15];
      } else {
        // EI acquisition
        let bestEI = -Infinity;
        x = [0, 5];
        for (let s = 0; s < 300; s++) {
          const cx = [Math.random() * 15 - 5, Math.random() * 15];
          const pred = gp.predict(cx);
          const ei = expectedImprovement(pred.mean, pred.std, Math.max(...y));
          if (ei > bestEI) { bestEI = ei; x = cx; }
        }
      }
      const val = branin(x[0], x[1]) + (Math.random() - 0.5) * 0.5;
      X.push(x);
      y.push(val);
      gp.fit(X, y);
      results.push(Math.max(...y));
    }
  } else if (strategy === 'random') {
    for (let i = 0; i < nIter; i++) {
      const x = [Math.random() * 15 - 5, Math.random() * 15];
      const val = branin(x[0], x[1]) + (Math.random() - 0.5) * 0.5;
      results.push(i === 0 ? val : Math.max(results[i - 1], val));
    }
  } else if (strategy === 'lhs') {
    const pts = generateLHS(nIter);
    for (let i = 0; i < nIter; i++) {
      const x = [pts[i][0] * 15 - 5, pts[i][1] * 15];
      const val = branin(x[0], x[1]) + (Math.random() - 0.5) * 0.5;
      results.push(i === 0 ? val : Math.max(results[i - 1], val));
    }
  } else if (strategy === 'sobol') {
    const pts = generateSobol(nIter);
    for (let i = 0; i < nIter; i++) {
      const x = [pts[i][0] * 15 - 5, pts[i][1] * 15];
      const val = branin(x[0], x[1]) + (Math.random() - 0.5) * 0.5;
      results.push(i === 0 ? val : Math.max(results[i - 1], val));
    }
  }

  return results;
}
