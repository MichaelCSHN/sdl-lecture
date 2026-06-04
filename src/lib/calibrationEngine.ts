/**
 * 多通道 LED 校准光源 — 前向模型、评价引擎与 SDL 优化器。
 *
 * V2: 分层 GP + 强化候选生成 + 严格序贯状态。
 * 课程级 emulator，不是工程级高保真仿真器。
 */

import { WAVELENGTH_GRID, N_WAVELENGTHS } from '@/data/targetSpectra';
import type { LedChannel } from '@/data/ledLibrary';

// ============================================================
// Forward model
// ============================================================

export function computeMixSpd(channels: LedChannel[], enabled: boolean[], weights: number[]): number[] {
  const spd = new Array(N_WAVELENGTHS).fill(0);
  for (let i = 0; i < channels.length; i++) {
    if (!enabled[i] || weights[i] < 1e-6) continue;
    for (let j = 0; j < N_WAVELENGTHS; j++) spd[j] += weights[i] * channels[i].spd[j];
  }
  return spd;
}

// ============================================================
// Spectral error metrics
// ============================================================

export function rmse(a: number[], b: number[]): number {
  let sum = 0; for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum / a.length);
}
export function l1Distance(a: number[], b: number[]): number {
  let sum = 0; for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}
export function sam(a: number[], b: number[]): number {
  let dot = 0, nA = 0, nB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; nA += a[i] ** 2; nB += b[i] ** 2; }
  return Math.acos(Math.min(1, Math.max(-1, dot / (Math.sqrt(nA) * Math.sqrt(nB) + 1e-12))));
}

// ============================================================
// Band-response model
// ============================================================

export interface SensorBand { name: string; range_nm: [number, number]; }
export const SENSOR_BANDS: SensorBand[] = [
  { name: 'Coastal', range_nm: [430, 450] },
  { name: 'Blue', range_nm: [450, 510] },
  { name: 'Green', range_nm: [530, 590] },
  { name: 'Red', range_nm: [640, 670] },
  { name: 'NIR', range_nm: [850, 880] },
];

export function bandIntegral(spd: number[], range: [number, number]): number {
  let sum = 0, n = 0;
  for (let i = 0; i < WAVELENGTH_GRID.length; i++) {
    if (WAVELENGTH_GRID[i] >= range[0] && WAVELENGTH_GRID[i] <= range[1]) { sum += spd[i]; n++; }
  }
  return n > 0 ? sum / n : 0;
}
export function bandResponses(spd: number[]): number[] {
  return SENSOR_BANDS.map((b) => bandIntegral(spd, b.range_nm));
}

// ============================================================
// Objective function — mode-aware
// ============================================================

export type MatchMode = 'spectral' | 'band';

export interface ObjectiveResult {
  value: number;     // lower = better
  label: string;     // for UI display
  mode: MatchMode;
}

export function evaluateObjective(
  channels: LedChannel[], enabled: boolean[], weights: number[],
  targetRefl: number[], mode: MatchMode,
): ObjectiveResult {
  const mixSpd = computeMixSpd(channels, enabled, weights);
  const tMax = Math.max(...targetRefl);
  const sMax = Math.max(...mixSpd) || 1;
  const scale = tMax / sMax;
  const scaled = mixSpd.map((v) => v * scale);

  if (mode === 'band') {
    const tBands = bandResponses(targetRefl.map((v) => v)); // target ref directly
    const sBands = bandResponses(scaled);
    const bandRMSE = rmse(sBands, tBands);
    return { value: bandRMSE, label: `Band RMSE`, mode };
  }
  // spectral
  const specRMSE = rmse(scaled, targetRefl);
  return { value: specRMSE, label: `RMSE`, mode };
}

// ============================================================
// Engineering metrics
// ============================================================

export interface SolutionMetrics {
  rmse: number; l1: number; samVal: number;
  totalCost: number; totalPower: number; worstLifetime: number;
  channelCount: number;
  enabledChannels: boolean[]; weights: number[]; mixSpd: number[];
  /** The primary optimization objective value (mode-dependent) */
  objectiveValue: number;
  objectiveLabel: string;
}

export function computeMetrics(
  channels: LedChannel[], enabled: boolean[], weights: number[],
  targetRefl: number[], mode: MatchMode,
): SolutionMetrics {
  const mixSpd = computeMixSpd(channels, enabled, weights);
  const tMax = Math.max(...targetRefl);
  const sMax = Math.max(...mixSpd) || 1;
  const scale = tMax / sMax;
  const scaledSpd = mixSpd.map((v) => v * scale);

  const rmseVal = rmse(scaledSpd, targetRefl);
  const obj = evaluateObjective(channels, enabled, weights, targetRefl, mode);

  let totalCost = 0, totalPower = 0, worstLifetime = Infinity, channelCount = 0;
  for (let i = 0; i < channels.length; i++) {
    if (enabled[i] && weights[i] > 1e-6) {
      totalCost += channels[i].price;
      totalPower += weights[i] * channels[i].power_max_w;
      worstLifetime = Math.min(worstLifetime, channels[i].lifetime_hours);
      channelCount++;
    }
  }
  if (worstLifetime === Infinity) worstLifetime = 0;

  return {
    rmse: rmseVal, l1: l1Distance(scaledSpd, targetRefl), samVal: sam(scaledSpd, targetRefl),
    totalCost, totalPower, worstLifetime, channelCount,
    enabledChannels: [...enabled], weights: weights.map((w) => w * scale), mixSpd: scaledSpd,
    objectiveValue: obj.value, objectiveLabel: obj.label,
  };
}

// ============================================================
// RNG
// ============================================================

export function mulberry32Rng(seed: number): () => number {
  let s = seed | 0;
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ============================================================
// Candidate encoding for GP (low-dimensional structural features)
// ============================================================

function channelFingerprint(channels: LedChannel[], enabled: boolean[], weights: number[]): number[] {
  const n = channels.length;
  let chCount = 0, pcCount = 0, nirCount = 0;
  let sumW = 0, cost = 0;
  for (let i = 0; i < n; i++) {
    if (!enabled[i] || weights[i] < 1e-6) continue;
    chCount++; sumW += weights[i]; cost += channels[i].price;
    if (channels[i].isPhosphor) pcCount++;
    if (channels[i].peak_nm >= 730) nirCount++;
  }
  return [
    chCount / n,                         // 0-1 scaled channel count
    pcCount / Math.max(1, chCount),      // phosphor ratio
    nirCount / Math.max(1, chCount),     // NIR ratio
    cost / 200,                          // scaled cost
    sumW / Math.max(1, chCount),         // avg weight
  ];
}

// ============================================================
// Stronger candidate generation
// ============================================================

function generateCandidates(
  channels: LedChannel[], enabled: boolean[], weights: number[],
  rng: () => number, nCandidates: number,
): { enabled: boolean[]; weights: number[] }[] {
  const n = channels.length;
  const candidates: { enabled: boolean[]; weights: number[] }[] = [];

  // Helper: perturb enabled+weights
  const ops = [
    // toggle 1
    () => {
      const e = [...enabled]; const w = [...weights];
      const i = Math.floor(rng() * n); e[i] = !e[i];
      if (e[i] && w[i] < 1e-6) w[i] = rng() * 0.5 + 0.3;
      if (!e[i]) w[i] = 0;
      return { enabled: e, weights: w };
    },
    // toggle 2
    () => {
      const e = [...enabled]; const w = [...weights];
      for (let t = 0; t < 2; t++) {
        const i = Math.floor(rng() * n); e[i] = !e[i];
        if (e[i] && w[i] < 1e-6) w[i] = rng() * 0.5 + 0.3;
        if (!e[i]) w[i] = 0;
      }
      return { enabled: e, weights: w };
    },
    // swap narrow↔phosphor
    () => {
      const e = [...enabled]; const w = [...weights];
      const narrows = channels.map((c, i) => (!c.isPhosphor && e[i]) ? i : -1).filter((i) => i >= 0);
      const pcs = channels.map((c, i) => (c.isPhosphor && e[i]) ? i : -1).filter((i) => i >= 0);
      if (narrows.length > 0 && pcs.length > 0) {
        const ni = narrows[Math.floor(rng() * narrows.length)];
        const pi = pcs[Math.floor(rng() * pcs.length)];
        e[ni] = false; w[ni] = 0;
        e[pi] = true; w[pi] = rng() * 0.5 + 0.3;
      }
      return { enabled: e, weights: w };
    },
    // weight tweak on 1 channel
    () => {
      const e = [...enabled]; const w = [...weights];
      const onIdx = channels.map((_, i) => e[i] ? i : -1).filter((i) => i >= 0);
      if (onIdx.length > 0) {
        const i = onIdx[Math.floor(rng() * onIdx.length)];
        w[i] = Math.max(0.05, Math.min(2.0, w[i] * (0.5 + rng() * 1.0)));
      }
      return { enabled: e, weights: w };
    },
    // broader reweight over all enabled channels
    () => {
      const e = [...enabled]; const w = [...weights];
      for (let i = 0; i < n; i++) {
        if (e[i]) w[i] = Math.max(0.05, Math.min(2.0, w[i] * (0.3 + rng() * 1.4)));
      }
      return { enabled: e, weights: w };
    },
    // toggle + add NIR channel
    () => {
      const e = [...enabled]; const w = [...weights];
      const nirIdx = channels.map((c, i) => (c.peak_nm >= 730 && !e[i]) ? i : -1).filter((i) => i >= 0);
      if (nirIdx.length > 0) {
        const i = nirIdx[Math.floor(rng() * nirIdx.length)];
        e[i] = true; w[i] = rng() * 0.4 + 0.2;
      }
      return { enabled: e, weights: w };
    },
  ];

  for (let c = 0; c < nCandidates; c++) {
    candidates.push(ops[Math.floor(rng() * ops.length)]());
  }
  return candidates;
}

// ============================================================
// Pure optimization step (no React state dependency)
// ============================================================

export interface OptState {
  channels: LedChannel[];
  enabled: boolean[];
  weights: number[];
  targetRefl: number[];
  mode: MatchMode;
  gpX: number[][]; // fingerprint history
  gpY: number[];   // objective value history
  seed: number;
}

export function randomInitState(
  channels: LedChannel[], targetRefl: number[], mode: MatchMode, seed: number,
): OptState {
  const rng = mulberry32Rng(seed);
  const n = channels.length;
  const en: boolean[] = []; const w: number[] = [];
  for (let i = 0; i < n; i++) {
    const isOn = rng() > 0.4; en.push(isOn);
    w.push(isOn ? rng() * 0.8 + 0.2 : 0);
  }
  const m = computeMetrics(channels, en, w, targetRefl, mode);
  return {
    channels, enabled: en, weights: w, targetRefl, mode,
    gpX: [channelFingerprint(channels, en, w)],
    gpY: [m.objectiveValue],
    seed,
  };
}

export function optimizationStep(
  state: OptState, rng: () => number, acqFn: string, ucbBeta: number,
): { state: OptState; metrics: SolutionMetrics; reason: string } {
  const { channels, enabled, weights, targetRefl, mode } = state;
  const nCandidates = 300;

  // Generate diverse candidates
  const cands = generateCandidates(channels, enabled, weights, rng, nCandidates);

  // Fit a simple 5-dim GP on fingerprints
  // We use a lightweight GP: predict candidate RMSE from fingerprint
  // For Random baseline, skip GP entirely
  const useGP = acqFn !== 'Random' && state.gpX.length >= 2;

  let bestCand = cands[0];
  let bestAcq = -Infinity;
  const yBest = Math.min(...state.gpY);

  // Simple GP-like prediction using k-NN weighted average
  // (avoids the 2N-dim curse; fits the 5-dim fingerprint space)
  for (const cand of cands) {
    const fp = channelFingerprint(channels, cand.enabled, cand.weights);
    let predMean = 0, predStd = 0;

    if (useGP) {
      // Weighted k-NN regression on fingerprints
      const k = Math.min(10, state.gpX.length);
      const distances: { idx: number; dist: number }[] = [];
      for (let i = 0; i < state.gpX.length; i++) {
        let d = 0;
        for (let j = 0; j < fp.length; j++) d += (fp[j] - state.gpX[i][j]) ** 2;
        distances.push({ idx: i, dist: Math.sqrt(d) });
      }
      distances.sort((a, b) => a.dist - b.dist);
      let wSum = 0, wYSum = 0, wY2Sum = 0;
      for (let i = 0; i < k; i++) {
        const wgt = 1 / (distances[i].dist + 0.01);
        wSum += wgt; wYSum += wgt * state.gpY[distances[i].idx];
        wY2Sum += wgt * state.gpY[distances[i].idx] ** 2;
      }
      predMean = wYSum / wSum;
      predStd = Math.sqrt(Math.max(0, wY2Sum / wSum - predMean ** 2));
    } else {
      predMean = rng() * 2;
      predStd = 0.5;
    }

    // Acquisition
    let av: number;
    switch (acqFn) {
      case 'EI': {
        const z = predStd < 1e-6 ? 0 : (yBest - predMean) / predStd;
        const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
        const erfApprox = (x: number) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); return (1 - (0.254829592 * t - 0.284496736 * t ** 2 + 1.421413741 * t ** 3 - 1.453152027 * t ** 4 + 1.061405429 * t ** 5) * Math.exp(-x * x)) * (x >= 0 ? 1 : -1); };
        const cdf = 0.5 * (1 + erfApprox(z / Math.SQRT2));
        av = (yBest - predMean) * cdf + predStd * phi;  // minimization EI
        break;
      }
      case 'UCB': av = -(predMean - ucbBeta * predStd); break; // minimization UCB
      case 'PI': {
        if (predStd < 1e-6) { av = 0; break; }
        const z2 = (yBest - predMean) / predStd;
        const erf2 = (x: number) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); return (1 - (0.254829592 * t - 0.284496736 * t ** 2 + 1.421413741 * t ** 3 - 1.453152027 * t ** 4 + 1.061405429 * t ** 5) * Math.exp(-x * x)) * (x >= 0 ? 1 : -1); };
        av = 0.5 * (1 + erf2(z2 / Math.SQRT2));
        break;
      }
      default: av = rng(); break;
    }
    if (av > bestAcq) { bestAcq = av; bestCand = cand; }
  }

  // Evaluate best candidate
  const metrics = computeMetrics(channels, bestCand.enabled, bestCand.weights, targetRefl, mode);
  const fp = channelFingerprint(channels, bestCand.enabled, bestCand.weights);

  // Update state
  const newState: OptState = {
    ...state,
    enabled: bestCand.enabled, weights: bestCand.weights,
    gpX: [...state.gpX, fp],
    gpY: [...state.gpY, metrics.objectiveValue],
  };

  const improved = metrics.objectiveValue < yBest;
  const reason = improved
    ? `[改进] ${acqFn} 推荐: ${metrics.channelCount} 通道, ${metrics.objectiveLabel}=${metrics.objectiveValue.toFixed(4)} (↓${(yBest - metrics.objectiveValue).toFixed(4)}), ¥${metrics.totalCost.toFixed(0)}`
    : `[探索] ${acqFn} 探索: ${metrics.channelCount} 通道, ${metrics.objectiveLabel}=${metrics.objectiveValue.toFixed(4)}, ¥${metrics.totalCost.toFixed(0)}`;

  return { state: newState, metrics, reason };
}

// ============================================================
// Disclaimer text
// ============================================================

export const OPTIMIZER_NOTE =
  '采用 k-NN 加权回归代理模型（5 维结构指纹）+ 强化候选生成（6 类操作：' +
  'toggle 1/2 channels, swap narrow↔PC, weight tweak, reweight, NIR fill）。' +
  'EI/UCB/PI 采集函数在候选池上选择。课程级教学优化器，不是研究级 BO 求解器。' +
  'Random Forest 暂未支持（仅 GP/Random）。多目标目前为历史 Pareto 教学图展示。';
