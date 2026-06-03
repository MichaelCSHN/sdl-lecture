// ==================== Seeded PRNG ====================

export function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ==================== DOE Sampling Methods ====================

export function generateRandom(n: number, dims: number, seed = 42): number[][] {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, () =>
    Array.from({ length: dims }, () => rng())
  );
}

export function generateLHS(n: number, dims: number, seed = 42): number[][] {
  const rng = mulberry32(seed);
  const result: number[][] = [];
  const perms = Array.from({ length: dims }, () => {
    const arr = Array.from({ length: n }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  for (let i = 0; i < n; i++) {
    result.push(perms.map((perm) => (perm[i] + rng()) / n));
  }
  return result;
}

export function generateSobol(n: number, dims: number): number[][] {
  // Van der Corput sequence for each dimension with different bases
  const bases = [2, 3, 5, 7, 11, 13];
  function vanDerCorput(index: number, base: number): number {
    let result = 0, denom = 1;
    let i = index;
    while (i > 0) {
      denom *= base;
      result += (i % base) / denom;
      i = Math.floor(i / base);
    }
    return result;
  }
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: dims }, (_, d) => vanDerCorput(i + 1, bases[d % bases.length]))
  );
}

export function generateFullFactorial(n: number, dims: number): number[][] {
  const perSide = Math.max(2, Math.round(Math.pow(n, 1 / dims)));
  const points: number[][] = [];
  function recurse(current: number[], d: number) {
    if (d === dims) { points.push([...current]); return; }
    for (let i = 0; i < perSide; i++) {
      current[d] = i / (perSide - 1);
      recurse(current, d + 1);
    }
  }
  recurse([], 0);
  return points.slice(0, n);
}

// ==================== Convergence Race ====================

import { GaussianProcess, expectedImprovement } from './bo_engine';

export interface RaceResult {
  name: string;
  color: string;
  bestValues: number[];
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
        // Random initial points in Branin domain
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
    const pts = generateLHS(nIter, 2);
    for (let i = 0; i < nIter; i++) {
      const x = [pts[i][0] * 15 - 5, pts[i][1] * 15];
      const val = branin(x[0], x[1]) + (Math.random() - 0.5) * 0.5;
      results.push(i === 0 ? val : Math.max(results[i - 1], val));
    }
  } else if (strategy === 'sobol') {
    const pts = generateSobol(nIter, 2);
    for (let i = 0; i < nIter; i++) {
      const x = [pts[i][0] * 15 - 5, pts[i][1] * 15];
      const val = branin(x[0], x[1]) + (Math.random() - 0.5) * 0.5;
      results.push(i === 0 ? val : Math.max(results[i - 1], val));
    }
  }

  return results;
}
