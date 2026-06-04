/**
 * 多通道 LED 校准光源 — 前向模型与评价引擎。
 *
 * 这是课程级 emulator，不是工程级高保真电光热联合仿真器。
 * 采用纯 LED 通道线性叠加模型 + 简化工程指标。
 */

import { WAVELENGTH_GRID, N_WAVELENGTHS } from '@/data/targetSpectra';
import type { LedChannel } from '@/data/ledLibrary';

// ============================================================
// Forward model
// ============================================================

/** LED 线性叠加：SPD_mix(lambda) = sum_i w_i * SPD_i(lambda) */
export function computeMixSpd(
  channels: LedChannel[],
  enabled: boolean[],
  weights: number[],
): number[] {
  const spd = new Array(N_WAVELENGTHS).fill(0);
  for (let i = 0; i < channels.length; i++) {
    if (!enabled[i]) continue;
    for (let j = 0; j < N_WAVELENGTHS; j++) {
      spd[j] += weights[i] * channels[i].spd[j];
    }
  }
  return spd;
}

// ============================================================
// Spectral error metrics
// ============================================================

export function rmse(predicted: number[], target: number[]): number {
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    sum += (predicted[i] - target[i]) ** 2;
  }
  return Math.sqrt(sum / predicted.length);
}

export function l1Distance(predicted: number[], target: number[]): number {
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    sum += Math.abs(predicted[i] - target[i]);
  }
  return sum / predicted.length;
}

/** Spectral Angle Mapper (SAM) — 角度越小越好 (0–π/2) */
export function sam(predicted: number[], target: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < predicted.length; i++) {
    dot += predicted[i] * target[i];
    normA += predicted[i] ** 2;
    normB += target[i] ** 2;
  }
  const cosVal = dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-12);
  return Math.acos(Math.min(1, Math.max(-1, cosVal)));
}

// ============================================================
// Band-response model
// ============================================================

export interface SensorBand {
  name: string;
  range_nm: [number, number];
  /** 矩形响应（V1 简化假设） */
}

/** 简化 Landsat-8 OLI-like 波段（仅 VNIR 部分） */
export const SENSOR_BANDS: SensorBand[] = [
  { name: 'Coastal/Aerosol', range_nm: [430, 450] },
  { name: 'Blue', range_nm: [450, 510] },
  { name: 'Green', range_nm: [530, 590] },
  { name: 'Red', range_nm: [640, 670] },
  { name: 'NIR', range_nm: [850, 880] },
];

/** 在波段范围内积分 SPD */
export function bandIntegral(
  spd: number[],
  bandRange: [number, number],
): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < WAVELENGTH_GRID.length; i++) {
    const w = WAVELENGTH_GRID[i];
    if (w >= bandRange[0] && w <= bandRange[1]) {
      sum += spd[i];
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

/** 计算全部 band 的响应向量 */
export function bandResponses(spd: number[]): number[] {
  return SENSOR_BANDS.map((b) => bandIntegral(spd, b.range_nm));
}

/** Band-response RMSE */
export function bandRmse(predicted: number[], target: number[]): number {
  return rmse(predicted, target);
}

// ============================================================
// Engineering metrics
// ============================================================

export interface SolutionMetrics {
  rmse: number;
  l1: number;
  samVal: number;
  totalCost: number;
  totalPower: number;
  worstLifetime: number;
  channelCount: number;
  enabledChannels: boolean[];
  weights: number[];
  mixSpd: number[];
}

export function computeMetrics(
  channels: LedChannel[],
  enabled: boolean[],
  weights: number[],
  targetRefl: number[],
): SolutionMetrics {
  const mixSpd = computeMixSpd(channels, enabled, weights);

  // Scale SPD to match target reflectance magnitude
  const targetMax = Math.max(...targetRefl);
  const spdMax = Math.max(...mixSpd) || 1;
  const scale = targetMax / spdMax;
  const scaledSpd = mixSpd.map((v) => v * scale);
  const scaledWeights = weights.map((w) => w * scale);

  const rmseVal = rmse(scaledSpd, targetRefl);
  const l1Val = l1Distance(scaledSpd, targetRefl);
  const samVal = sam(scaledSpd, targetRefl);

  let totalCost = 0, totalPower = 0, worstLifetime = Infinity, channelCount = 0;
  for (let i = 0; i < channels.length; i++) {
    if (enabled[i] && weights[i] > 1e-6) {
      totalCost += channels[i].price;
      totalPower += scaledWeights[i] * channels[i].power_max_w;
      worstLifetime = Math.min(worstLifetime, channels[i].lifetime_hours);
      channelCount++;
    }
  }
  if (worstLifetime === Infinity) worstLifetime = 0;

  return {
    rmse: rmseVal, l1: l1Val, samVal,
    totalCost, totalPower, worstLifetime, channelCount,
    enabledChannels: [...enabled],
    weights: scaledWeights,
    mixSpd: scaledSpd,
  };
}

// ============================================================
// Simplified optimizer — for lecture demo
// ============================================================

/**
 * One-step improvement: try mutating one LED's weight or toggling one channel.
 * Returns the best found solution and its metrics.
 * This is a simple greedy approach — not a proper BO/mixed-integer solver.
 * Honest note shown in UI.
 */
export interface OptimizerState {
  channels: LedChannel[];
  enabled: boolean[];
  weights: number[];
  seed: number;
}

export function mulberry32Rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Initialize a random channel configuration */
export function randomInit(channels: LedChannel[], seed: number): OptimizerState {
  const rng = mulberry32Rng(seed);
  const n = channels.length;
  const enabled: boolean[] = [];
  const weights: number[] = [];
  for (let i = 0; i < n; i++) {
    const isOn = rng() > 0.4; // ~60% initially enabled
    enabled.push(isOn);
    weights.push(isOn ? rng() * 0.8 + 0.2 : 0); // 0.2–1.0
  }
  return { channels, enabled, weights, seed };
}

/** Greedy improvement step */
export function improveStep(
  state: OptimizerState,
  targetRefl: number[],
  rng: () => number,
): { metrics: SolutionMetrics; reason: string } {
  const n = state.channels.length;
  let bestMetrics = computeMetrics(state.channels, state.enabled, state.weights, targetRefl);
  let bestReason = '保持当前配置';

  // Try toggling each channel
  for (let i = 0; i < n; i++) {
    const saved = state.enabled[i];
    state.enabled[i] = !saved;
    if (!state.enabled[i]) state.weights[i] = 0;
    else if (state.weights[i] < 1e-6) state.weights[i] = rng() * 0.5 + 0.3;

    const m = computeMetrics(state.channels, state.enabled, state.weights, targetRefl);
    if (m.rmse < bestMetrics.rmse) {
      bestMetrics = m;
      bestReason = `${state.enabled[i] ? '开启' : '关闭'} ${state.channels[i].name}（${state.channels[i].peak_nm} nm），RMSE ${bestMetrics.rmse.toFixed(4)}`;
    }
    state.enabled[i] = saved; // restore
  }

  // Try adjusting weights (±20% for 3 random channels)
  for (let t = 0; t < 3; t++) {
    const i = Math.floor(rng() * n);
    if (!state.enabled[i]) continue;
    const saved = state.weights[i];
    state.weights[i] = Math.max(0.05, Math.min(1.5, saved * (0.7 + rng() * 0.6)));
    const m = computeMetrics(state.channels, state.enabled, state.weights, targetRefl);
    if (m.rmse < bestMetrics.rmse) {
      bestMetrics = m;
      bestReason = `调整 ${state.channels[i].name} 权重 ${saved.toFixed(2)}→${state.weights[i].toFixed(2)}，RMSE ${bestMetrics.rmse.toFixed(4)}`;
    }
    state.weights[i] = saved; // restore
  }

  // Apply best
  if (bestMetrics.rmse < computeMetrics(state.channels, state.enabled, state.weights, targetRefl).rmse) {
    // Recompute to get the actual enabled/weights that produced bestMetrics
    // (they may differ due to the trial-and-error above)
    for (let i = 0; i < n; i++) {
      state.enabled[i] = bestMetrics.enabledChannels[i];
      state.weights[i] = bestMetrics.weights[i];
    }
  }

  return { metrics: bestMetrics, reason: bestReason };
}

// ============================================================
// Option discovery text
// ============================================================

export const OPTIMIZER_NOTE =
  '当前采用贪心局部改进策略（试切换通道 + 试调权重）。' +
  '这是课程级演示优化器，不是全局 BO/mixed-integer 求解器。' +
  '目标是展示 "离散通道选择 + 连续权重调整" 的 trade-off 逻辑，' +
  '而非给出全局最优方案。';
