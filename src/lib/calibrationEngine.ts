import type { LedChannel } from '@/data/ledLibrary';
import { N_WAVELENGTHS, WAVELENGTH_GRID } from '@/data/targetSpectra';
import { GaussianProcess } from './bo_engine';

export type MatchMode = 'spectral' | 'band';
export type SurrogateModel = 'GP' | 'RF' | 'Local';
export type AcqFn = 'EI' | 'UCB' | 'PI';
export type ObjectiveTermKey = 'matchError' | 'cost' | 'power' | 'channelCount' | 'lifetimePenalty';

export interface ObjectiveConfig {
  matchError: number;
  cost: number;
  power: number;
  channelCount: number;
  lifetimePenalty: number;
}

export interface ObjectiveBreakdown {
  matchError: number;
  cost: number;
  power: number;
  channelCount: number;
  lifetimePenalty: number;
}

export interface SensorBand {
  name: string;
  range_nm: [number, number];
}

export const SENSOR_BANDS: SensorBand[] = [
  { name: 'Coastal', range_nm: [430, 450] },
  { name: 'Blue', range_nm: [450, 510] },
  { name: 'Green', range_nm: [530, 590] },
  { name: 'Red', range_nm: [640, 670] },
  { name: 'NIR', range_nm: [850, 880] },
];

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
  objectiveValue: number;
  objectiveLabel: string;
  objectiveBreakdown: ObjectiveBreakdown;
}

export interface OptState {
  channels: LedChannel[];
  enabled: boolean[];
  weights: number[];
  targetRefl: number[];
  mode: MatchMode;
  objectiveConfig: ObjectiveConfig;
  evaluatedX: number[][];
  evaluatedY: number[];
  seed: number;
}

export const DEFAULT_OBJECTIVE_CONFIG: ObjectiveConfig = {
  matchError: 1,
  cost: 0.2,
  power: 0.15,
  channelCount: 0.15,
  lifetimePenalty: 0.1,
};

interface Candidate {
  enabled: boolean[];
  weights: number[];
  metrics: SolutionMetrics;
  feature: number[];
  opName: string;
}

interface Posterior {
  mean: number;
  std: number;
}

type TreeNode =
  | { kind: 'leaf'; value: number }
  | { kind: 'split'; featureIndex: number; threshold: number; left: TreeNode; right: TreeNode };

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function variance(values: number[]): number {
  if (values.length <= 1) return 0;
  const m = mean(values);
  return values.reduce((sum, value) => sum + (value - m) ** 2, 0) / values.length;
}

function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-(x * x) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + 1.330274 * t))));
  p = 1 - p;
  return x >= 0 ? p : 1 - p;
}

export function computeMixSpd(channels: LedChannel[], enabled: boolean[], weights: number[]): number[] {
  const spd = new Array(N_WAVELENGTHS).fill(0);
  for (let i = 0; i < channels.length; i++) {
    if (!enabled[i] || weights[i] <= 1e-6) continue;
    for (let j = 0; j < N_WAVELENGTHS; j++) spd[j] += channels[i].spd[j] * weights[i];
  }
  return spd;
}

export function rmse(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum / a.length);
}

export function l1Distance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

export function sam(a: number[], b: number[]): number {
  const aa = dot(a, a);
  const bb = dot(b, b);
  if (aa < 1e-10 || bb < 1e-10) return Math.PI / 2;
  return Math.acos(clamp(dot(a, b) / Math.sqrt(aa * bb), -1, 1));
}

export function bandIntegral(spd: number[], range: [number, number]): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < WAVELENGTH_GRID.length; i++) {
    if (WAVELENGTH_GRID[i] >= range[0] && WAVELENGTH_GRID[i] <= range[1]) {
      sum += spd[i];
      count += 1;
    }
  }
  return count > 0 ? sum / count : 0;
}

export function bandResponses(spd: number[]): number[] {
  return SENSOR_BANDS.map((band) => bandIntegral(spd, band.range_nm));
}

function getTargetVector(targetRefl: number[], mode: MatchMode): number[] {
  return mode === 'band' ? bandResponses(targetRefl) : targetRefl;
}

function getChannelVector(channel: LedChannel, mode: MatchMode): number[] {
  return mode === 'band' ? bandResponses(channel.spd) : channel.spd;
}

function normalizeObjectiveTerm(key: ObjectiveTermKey, rawValue: number): number {
  switch (key) {
    case 'matchError':
      return rawValue;
    case 'cost':
      return rawValue / 60;
    case 'power':
      return rawValue / 3;
    case 'channelCount':
      return rawValue / 8;
    case 'lifetimePenalty':
      return rawValue;
  }
}

function lifetimePenaltyFromHours(hours: number): number {
  if (hours <= 0) return 1.1;
  return clamp((50000 - hours) / 40000, 0, 1.1);
}

function computeWeightedObjective(mode: MatchMode, breakdown: ObjectiveBreakdown, objectiveConfig: ObjectiveConfig): { value: number; label: string } {
  const weights: ObjectiveConfig = { ...objectiveConfig };
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + Math.max(0, weight), 0);
  const normalized: ObjectiveBreakdown = {
    matchError: normalizeObjectiveTerm('matchError', breakdown.matchError),
    cost: normalizeObjectiveTerm('cost', breakdown.cost),
    power: normalizeObjectiveTerm('power', breakdown.power),
    channelCount: normalizeObjectiveTerm('channelCount', breakdown.channelCount),
    lifetimePenalty: normalizeObjectiveTerm('lifetimePenalty', breakdown.lifetimePenalty),
  };

  if (totalWeight <= 1e-9) {
    return { value: normalized.matchError, label: mode === 'band' ? 'Band RMSE' : 'Spectral RMSE' };
  }

  const weightedSum =
    weights.matchError * normalized.matchError +
    weights.cost * normalized.cost +
    weights.power * normalized.power +
    weights.channelCount * normalized.channelCount +
    weights.lifetimePenalty * normalized.lifetimePenalty;

  return {
    value: weightedSum / totalWeight,
    label: '加权目标',
  };
}

function optimizeWeightsForEnabled(
  channels: LedChannel[],
  enabled: boolean[],
  targetRefl: number[],
  mode: MatchMode,
  initialWeights?: number[],
): number[] {
  const activeIdx = enabled.map((isOn, idx) => (isOn ? idx : -1)).filter((idx) => idx >= 0);
  const weights = new Array(channels.length).fill(0);
  if (activeIdx.length === 0) return weights;

  const targetVec = getTargetVector(targetRefl, mode);
  const basis = activeIdx.map((idx) => getChannelVector(channels[idx], mode));
  const localWeights = activeIdx.map((idx) => clamp(initialWeights?.[idx] ?? 0.25, 0, 1));
  const prediction = new Array(targetVec.length).fill(0);

  for (let i = 0; i < basis.length; i++) {
    for (let j = 0; j < targetVec.length; j++) {
      prediction[j] += basis[i][j] * localWeights[i];
    }
  }

  for (let sweep = 0; sweep < 18; sweep++) {
    for (let i = 0; i < basis.length; i++) {
      const bi = basis[i];
      const oldWeight = localWeights[i];
      const denom = dot(bi, bi) || 1;
      let numerator = 0;
      for (let j = 0; j < targetVec.length; j++) {
        const withoutCurrent = prediction[j] - oldWeight * bi[j];
        numerator += bi[j] * (targetVec[j] - withoutCurrent);
      }
      const nextWeight = clamp(numerator / denom, 0, 1);
      if (Math.abs(nextWeight - oldWeight) < 1e-7) continue;
      localWeights[i] = nextWeight;
      for (let j = 0; j < targetVec.length; j++) {
        prediction[j] += (nextWeight - oldWeight) * bi[j];
      }
    }
  }

  for (let i = 0; i < activeIdx.length; i++) {
    weights[activeIdx[i]] = localWeights[i] >= 0.01 ? localWeights[i] : 0;
  }

  return weights;
}

function computeMetricsInternal(
  channels: LedChannel[],
  enabled: boolean[],
  weights: number[],
  targetRefl: number[],
  mode: MatchMode,
  objectiveConfig: ObjectiveConfig,
): SolutionMetrics {
  const mixSpd = computeMixSpd(channels, enabled, weights);
  const spectralRmse = rmse(mixSpd, targetRefl);
  const bandRmse = rmse(bandResponses(mixSpd), bandResponses(targetRefl));

  let totalCost = 0;
  let totalPower = 0;
  let worstLifetime = Infinity;
  let channelCount = 0;

  for (let i = 0; i < channels.length; i++) {
    if (!enabled[i] || weights[i] <= 1e-6) continue;
    totalCost += channels[i].price;
    totalPower += weights[i] * channels[i].power_max_w;
    worstLifetime = Math.min(worstLifetime, channels[i].lifetime_hours);
    channelCount += 1;
  }

  const objectiveBreakdown: ObjectiveBreakdown = {
    matchError: mode === 'band' ? bandRmse : spectralRmse,
    cost: totalCost,
    power: totalPower,
    channelCount,
    lifetimePenalty: lifetimePenaltyFromHours(worstLifetime === Infinity ? 0 : worstLifetime),
  };
  const objective = computeWeightedObjective(mode, objectiveBreakdown, objectiveConfig);

  return {
    rmse: spectralRmse,
    l1: l1Distance(mixSpd, targetRefl),
    samVal: sam(mixSpd, targetRefl),
    totalCost,
    totalPower,
    worstLifetime: worstLifetime === Infinity ? 0 : worstLifetime,
    channelCount,
    enabledChannels: [...enabled],
    weights: [...weights],
    mixSpd,
    objectiveValue: objective.value,
    objectiveLabel: objective.label,
    objectiveBreakdown,
  };
}

export function computeMetrics(
  channels: LedChannel[],
  enabled: boolean[],
  weights: number[],
  targetRefl: number[],
  mode: MatchMode,
  objectiveConfig: ObjectiveConfig,
): SolutionMetrics {
  return computeMetricsInternal(channels, enabled, weights, targetRefl, mode, objectiveConfig);
}

function candidateFeature(channels: LedChannel[], enabled: boolean[], weights: number[]): number[] {
  const active = enabled
    .map((isOn, idx) => (isOn && weights[idx] > 1e-6 ? idx : -1))
    .filter((idx) => idx >= 0);

  if (active.length === 0) return [0, 0, 0, 0, 0, 0];

  let sumWeight = 0;
  let weightedCenter = 0;
  let weightedNir = 0;
  let weightedSynthetic = 0;
  let weightedPower = 0;
  let weightedSpread = 0;

  for (const idx of active) {
    const w = weights[idx];
    const channel = channels[idx];
    sumWeight += w;
    weightedCenter += w * channel.peak_nm;
    if (channel.peak_nm >= 730) weightedNir += w;
    if (channel.isSynthetic) weightedSynthetic += w;
    weightedPower += w * channel.power_max_w;
  }

  const center = weightedCenter / sumWeight;
  for (const idx of active) {
    const diff = channels[idx].peak_nm - center;
    weightedSpread += weights[idx] * diff * diff;
  }

  return [
    active.length / channels.length,
    clamp((center - 400) / 600, 0, 1),
    clamp(Math.sqrt(weightedSpread / sumWeight) / 250, 0, 1),
    clamp(weightedNir / sumWeight, 0, 1),
    clamp(weightedSynthetic / sumWeight, 0, 1),
    clamp(weightedPower / 6, 0, 1),
  ];
}

function getTopResidualWavelength(targetRefl: number[], currentSpd: number[]): number {
  let bestIdx = 0;
  let bestResidual = -Infinity;
  for (let i = 0; i < targetRefl.length; i++) {
    const residual = targetRefl[i] - currentSpd[i];
    if (residual > bestResidual) {
      bestResidual = residual;
      bestIdx = i;
    }
  }
  return WAVELENGTH_GRID[bestIdx];
}

function getWeakestEnabledIndex(weights: number[], enabled: boolean[]): number {
  let idx = -1;
  let minWeight = Infinity;
  for (let i = 0; i < weights.length; i++) {
    if (!enabled[i] || weights[i] <= 1e-6) continue;
    if (weights[i] < minWeight) {
      minWeight = weights[i];
      idx = i;
    }
  }
  return idx;
}

function findClosestDisabledChannel(channels: LedChannel[], enabled: boolean[], targetPeak: number): number {
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < channels.length; i++) {
    if (enabled[i]) continue;
    const dist = Math.abs(channels[i].peak_nm - targetPeak);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function generateStructures(
  channels: LedChannel[],
  currentEnabled: boolean[],
  currentWeights: number[],
  currentMix: number[],
  targetRefl: number[],
  rng: () => number,
  count: number,
): { enabled: boolean[]; opName: string }[] {
  const result: { enabled: boolean[]; opName: string }[] = [];
  const currentCount = currentEnabled.filter(Boolean).length;
  const residualPeak = getTopResidualWavelength(targetRefl, currentMix);
  const weakestIdx = getWeakestEnabledIndex(currentWeights, currentEnabled);

  const makeSparseRestart = () => {
    const enabled = new Array(channels.length).fill(false);
    const targetCount = 3 + Math.floor(rng() * 4);
    const order = [...channels.keys()].sort(() => rng() - 0.5);
    for (let i = 0; i < targetCount && i < order.length; i++) enabled[order[i]] = true;
    return { enabled, opName: '随机重启' };
  };

  for (let n = 0; n < count; n++) {
    const enabled = [...currentEnabled];
    const pick = rng();

    if (pick < 0.16) {
      const idx = Math.floor(rng() * channels.length);
      enabled[idx] = !enabled[idx];
      result.push({ enabled, opName: enabled[idx] ? '随机启用通道' : '随机关闭通道' });
      continue;
    }

    if (pick < 0.34) {
      const addIdx = findClosestDisabledChannel(channels, enabled, residualPeak);
      if (addIdx >= 0) {
        enabled[addIdx] = true;
        result.push({ enabled, opName: '按残差峰值补通道' });
        continue;
      }
    }

    if (pick < 0.48 && weakestIdx >= 0) {
      enabled[weakestIdx] = false;
      result.push({ enabled, opName: '移除最弱通道' });
      continue;
    }

    if (pick < 0.62) {
      const syntheticIdx = channels
        .map((channel, idx) => (channel.isSynthetic && !enabled[idx] ? idx : -1))
        .filter((idx) => idx >= 0);
      if (syntheticIdx.length > 0) {
        const idx = syntheticIdx[Math.floor(rng() * syntheticIdx.length)];
        enabled[idx] = true;
        result.push({ enabled, opName: '启用宽谱合成通道' });
        continue;
      }
    }

    if (pick < 0.76) {
      const nirIdx = channels
        .map((channel, idx) => (channel.peak_nm >= 730 && !enabled[idx] ? idx : -1))
        .filter((idx) => idx >= 0);
      if (nirIdx.length > 0) {
        const idx = nirIdx[Math.floor(rng() * nirIdx.length)];
        enabled[idx] = true;
        result.push({ enabled, opName: '补充近红外通道' });
        continue;
      }
    }

    if (pick < 0.9 && currentCount > 0) {
      const onIdx = currentEnabled.map((isOn, idx) => (isOn ? idx : -1)).filter((idx) => idx >= 0);
      const offIdx = currentEnabled.map((isOn, idx) => (!isOn ? idx : -1)).filter((idx) => idx >= 0);
      if (onIdx.length > 0 && offIdx.length > 0) {
        const drop = onIdx[Math.floor(rng() * onIdx.length)];
        const add = offIdx[Math.floor(rng() * offIdx.length)];
        enabled[drop] = false;
        enabled[add] = true;
        result.push({ enabled, opName: '通道置换' });
        continue;
      }
    }

    result.push(makeSparseRestart());
  }

  return result;
}

function evaluateCandidate(
  channels: LedChannel[],
  enabled: boolean[],
  targetRefl: number[],
  mode: MatchMode,
  objectiveConfig: ObjectiveConfig,
  initialWeights?: number[],
): Candidate {
  const weights = optimizeWeightsForEnabled(channels, enabled, targetRefl, mode, initialWeights);
  const prunedEnabled = enabled.map((isOn, idx) => isOn && weights[idx] > 1e-6);
  const metrics = computeMetricsInternal(channels, prunedEnabled, weights, targetRefl, mode, objectiveConfig);
  return {
    enabled: prunedEnabled,
    weights,
    metrics,
    feature: candidateFeature(channels, prunedEnabled, weights),
    opName: '候选',
  };
}

function fitLocalPosterior(features: number[][], values: number[], x: number[]): Posterior {
  const pairs = features.map((feature, idx) => {
    let dist = 0;
    for (let i = 0; i < feature.length; i++) dist += (feature[i] - x[i]) ** 2;
    return { idx, dist: Math.sqrt(dist) };
  });
  pairs.sort((a, b) => a.dist - b.dist);
  const k = Math.min(8, pairs.length);

  let wSum = 0;
  let wy = 0;
  let wy2 = 0;
  for (let i = 0; i < k; i++) {
    const weight = 1 / (pairs[i].dist + 0.02);
    const y = values[pairs[i].idx];
    wSum += weight;
    wy += weight * y;
    wy2 += weight * y * y;
  }
  const posteriorMean = wy / wSum;
  const posteriorVar = Math.max(1e-6, wy2 / wSum - posteriorMean ** 2);
  return { mean: posteriorMean, std: Math.sqrt(posteriorVar) };
}

function drawBootstrapIndices(length: number, rng: () => number): number[] {
  const indices: number[] = [];
  for (let i = 0; i < length; i++) indices.push(Math.floor(rng() * length));
  return indices;
}

function sse(values: number[]): number {
  const m = mean(values);
  return values.reduce((sum, value) => sum + (value - m) ** 2, 0);
}

function buildTree(samples: { x: number[]; y: number }[], depth: number, maxDepth: number, rng: () => number): TreeNode {
  if (samples.length <= 4 || depth >= maxDepth || variance(samples.map((sample) => sample.y)) < 1e-6) {
    return { kind: 'leaf', value: mean(samples.map((sample) => sample.y)) };
  }

  const featureCount = samples[0].x.length;
  const candidateFeatures = [...Array(featureCount).keys()].sort(() => rng() - 0.5).slice(0, Math.max(2, Math.floor(Math.sqrt(featureCount))));

  let bestFeature = -1;
  let bestThreshold = 0;
  let bestScore = Infinity;
  let bestLeft: typeof samples = [];
  let bestRight: typeof samples = [];

  for (const featureIndex of candidateFeatures) {
    const values = samples.map((sample) => sample.x[featureIndex]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    if (Math.abs(maxVal - minVal) < 1e-8) continue;

    for (let attempt = 0; attempt < 5; attempt++) {
      const threshold = minVal + (maxVal - minVal) * rng();
      const left = samples.filter((sample) => sample.x[featureIndex] <= threshold);
      const right = samples.filter((sample) => sample.x[featureIndex] > threshold);
      if (left.length < 2 || right.length < 2) continue;

      const score = sse(left.map((sample) => sample.y)) + sse(right.map((sample) => sample.y));
      if (score < bestScore) {
        bestScore = score;
        bestFeature = featureIndex;
        bestThreshold = threshold;
        bestLeft = left;
        bestRight = right;
      }
    }
  }

  if (bestFeature < 0) {
    return { kind: 'leaf', value: mean(samples.map((sample) => sample.y)) };
  }

  return {
    kind: 'split',
    featureIndex: bestFeature,
    threshold: bestThreshold,
    left: buildTree(bestLeft, depth + 1, maxDepth, rng),
    right: buildTree(bestRight, depth + 1, maxDepth, rng),
  };
}

function predictTree(tree: TreeNode, x: number[]): number {
  if (tree.kind === 'leaf') return tree.value;
  if (x[tree.featureIndex] <= tree.threshold) return predictTree(tree.left, x);
  return predictTree(tree.right, x);
}

function fitForestPosterior(features: number[][], values: number[], x: number[], seed: number): Posterior {
  const rng = mulberry32Rng(seed);
  const samples = features.map((feature, idx) => ({ x: feature, y: values[idx] }));
  const treePredictions: number[] = [];

  for (let t = 0; t < 24; t++) {
    const bootstrap = drawBootstrapIndices(samples.length, rng).map((idx) => samples[idx]);
    const tree = buildTree(bootstrap, 0, 4, rng);
    treePredictions.push(predictTree(tree, x));
  }

  return { mean: mean(treePredictions), std: Math.sqrt(Math.max(1e-6, variance(treePredictions))) };
}

function fitGpPosterior(features: number[][], values: number[], x: number[]): Posterior {
  const spread = Math.max(...values) - Math.min(...values) || 1;
  const gp = new GaussianProcess(0.45, spread, 1e-5);
  gp.fit(features, values);
  const posterior = gp.predict(x);
  return { mean: posterior.mean, std: Math.max(1e-3, posterior.std) };
}

function acquisitionValue(acqFn: AcqFn, meanValue: number, stdValue: number, bestValue: number, beta: number): number {
  const std = Math.max(stdValue, 1e-6);
  const z = (bestValue - meanValue) / std;
  if (acqFn === 'UCB') return -(meanValue - beta * std);
  if (acqFn === 'PI') return normalCdf(z);
  return (bestValue - meanValue) * normalCdf(z) + std * normalPdf(z);
}

function selectCandidate(
  model: SurrogateModel,
  acqFn: AcqFn,
  beta: number,
  state: OptState,
  candidates: Candidate[],
): Candidate {
  if (state.evaluatedX.length < 4) {
    return [...candidates].sort((a, b) => a.metrics.objectiveValue - b.metrics.objectiveValue)[0];
  }

  const bestObserved = Math.min(...state.evaluatedY);
  let bestCandidate = candidates[0];
  let bestAcq = -Infinity;

  for (const candidate of candidates) {
    let posterior: Posterior;
    if (model === 'GP') {
      posterior = fitGpPosterior(state.evaluatedX, state.evaluatedY, candidate.feature);
    } else if (model === 'RF') {
      posterior = fitForestPosterior(state.evaluatedX, state.evaluatedY, candidate.feature, state.seed + state.evaluatedY.length);
    } else {
      posterior = fitLocalPosterior(state.evaluatedX, state.evaluatedY, candidate.feature);
    }

    const acq = acquisitionValue(acqFn, posterior.mean, posterior.std, bestObserved, beta);
    if (acq > bestAcq) {
      bestAcq = acq;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

function summarizeChanges(channels: LedChannel[], prev: OptState, nextEnabled: boolean[], nextWeights: number[]): string[] {
  const messages: string[] = [];
  for (let i = 0; i < channels.length; i++) {
    const wasOn = prev.enabled[i] && prev.weights[i] > 1e-6;
    const isOn = nextEnabled[i] && nextWeights[i] > 1e-6;
    if (!wasOn && isOn) {
      messages.push(`启用 ${channels[i].name}`);
      continue;
    }
    if (wasOn && !isOn) {
      messages.push(`关闭 ${channels[i].name}`);
      continue;
    }
    if (wasOn && isOn) {
      const delta = nextWeights[i] - prev.weights[i];
      if (Math.abs(delta) >= 0.08) {
        messages.push(`${channels[i].name}${delta > 0 ? ' 增强' : ' 减弱'} ${Math.abs(delta).toFixed(2)}`);
      }
    }
  }
  return messages;
}

export function mulberry32Rng(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInitState(
  channels: LedChannel[],
  targetRefl: number[],
  mode: MatchMode,
  objectiveConfig: ObjectiveConfig,
  seed: number,
): OptState {
  const rng = mulberry32Rng(seed);
  const enabled = new Array(channels.length).fill(false);
  const initialCount = 4 + Math.floor(rng() * 3);
  const order = [...channels.keys()].sort(() => rng() - 0.5);
  for (let i = 0; i < initialCount; i++) enabled[order[i]] = true;

  const weights = optimizeWeightsForEnabled(channels, enabled, targetRefl, mode);
  const metrics = computeMetricsInternal(channels, enabled, weights, targetRefl, mode, objectiveConfig);
  const feature = candidateFeature(channels, enabled, weights);

  return {
    channels,
    enabled,
    weights,
    targetRefl,
    mode,
    objectiveConfig,
    evaluatedX: [feature],
    evaluatedY: [metrics.objectiveValue],
    seed,
  };
}

export function optimizationStep(
  state: OptState,
  rng: () => number,
  model: SurrogateModel,
  acqFn: AcqFn,
  ucbBeta: number,
): { state: OptState; metrics: SolutionMetrics; reason: string } {
  const currentMetrics = computeMetricsInternal(
    state.channels,
    state.enabled,
    state.weights,
    state.targetRefl,
    state.mode,
    state.objectiveConfig,
  );
  const structures = generateStructures(
    state.channels,
    state.enabled,
    state.weights,
    currentMetrics.mixSpd,
    state.targetRefl,
    rng,
    90,
  );

  const candidates = structures.map((structure) => {
    const candidate = evaluateCandidate(
      state.channels,
      structure.enabled,
      state.targetRefl,
      state.mode,
      state.objectiveConfig,
      state.weights,
    );
    candidate.opName = structure.opName;
    return candidate;
  });

  const chosen = selectCandidate(model, acqFn, ucbBeta, state, candidates);
  const nextState: OptState = {
    ...state,
    enabled: chosen.enabled,
    weights: chosen.weights,
    evaluatedX: [...state.evaluatedX, chosen.feature],
    evaluatedY: [...state.evaluatedY, chosen.metrics.objectiveValue],
  };

  const delta = currentMetrics.objectiveValue - chosen.metrics.objectiveValue;
  const topChanges = summarizeChanges(state.channels, state, chosen.enabled, chosen.weights).slice(0, 3);
  const modelLabel = model === 'GP' ? `GP + ${acqFn}` : model === 'RF' ? `RF + ${acqFn}` : `Local + ${acqFn}`;
  const prefix = delta > 0 ? '改进' : '探索';
  const reason =
    `${prefix} | ${modelLabel} | ${chosen.opName} | ${chosen.metrics.objectiveLabel}=${chosen.metrics.objectiveValue.toFixed(4)}` +
    `${delta > 0 ? `（下降 ${delta.toFixed(4)}）` : ''} | ` +
    `${chosen.metrics.channelCount} 通道，功耗 ${chosen.metrics.totalPower.toFixed(2)} W，成本 ¥${chosen.metrics.totalCost.toFixed(1)}` +
    (topChanges.length > 0 ? ` | 变化：${topChanges.join('；')}` : '');

  return { state: nextState, metrics: chosen.metrics, reason };
}

export const OPTIMIZER_NOTE =
  '当前页面中的“代理模型”只指推荐下一步实验的近似模型，不是实验黑盒本身。黑盒仍然是 LED 光谱合成数字孪生；GP、RF、Local 三者负责在已有历史上近似黑盒并配合采集函数推荐下一点。';
