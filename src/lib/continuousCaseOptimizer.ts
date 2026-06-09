import { GaussianProcess } from '@/lib/bo_engine';
import { paretoFront, scalarizeRandom, type ParetoPoint } from '@/lib/multiObjective';
import { mulberry32Rng, type SurrogateModel } from '@/lib/calibrationEngine';

export type ContinuousAcqFn = 'EI' | 'UCB' | 'PI' | 'Random';
export type ObjectiveMode = 'single' | 'weighted' | 'pareto';
export type ObjectiveDirection = 'min' | 'max';

export interface ContinuousParamDef {
  name: string;
  nameEn: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface ContinuousMetricDef<Evaluation> {
  key: string;
  label: string;
  direction: ObjectiveDirection;
  range: [number, number];
  accessor: (evaluation: Evaluation) => number;
}

export interface ContinuousCaseDef<Evaluation> {
  id: string;
  name: string;
  params: ContinuousParamDef[];
  metrics: Array<ContinuousMetricDef<Evaluation>>;
  evaluate: (params: number[]) => Evaluation;
  candidateCount?: number;
  gpLengthScale?: number;
}

export type ObjectiveSpec =
  | { mode: 'single'; metricKey: string }
  | { mode: 'weighted'; weights: Record<string, number> }
  | { mode: 'pareto'; metricKeys: [string, string] };

export interface OptimizerStrategy {
  surrogateModel: SurrogateModel;
  acquisition: ContinuousAcqFn;
  ucbBeta: number;
  objective: ObjectiveSpec;
}

export interface ContinuousHistoryRecord<Evaluation> {
  iteration: number;
  params: number[];
  evaluation: Evaluation;
  metricValues: Record<string, number>;
  scalarObjective: number;
  objectiveVector: number[] | null;
  bestScalarSoFar: number;
}

export interface ContinuousRecommendation {
  params: number[];
  predictedMean: number;
  predictedStd: number;
  acquisitionValue: number;
  acquisitionType: ContinuousAcqFn;
  explanation: string;
}

export interface ParetoRecord {
  params: number[];
  objectiveVector: number[];
  metricValues: Record<string, number>;
}

export interface ContinuousSessionState<Evaluation> {
  caseId: string;
  seed: number;
  iteration: number;
  history: Array<ContinuousHistoryRecord<Evaluation>>;
  currentRecommendation: ContinuousRecommendation | null;
  bestScalarObjective: number;
  bestParams: number[];
  objectiveLabel: string;
  paretoFront: ParetoRecord[];
}

interface Posterior {
  mean: number;
  std: number;
}

export class ContinuousCaseSession<Evaluation> {
  readonly caseDef: ContinuousCaseDef<Evaluation>;

  private strategy: OptimizerStrategy;
  private seed: number;
  private rng: () => number;
  private gpLengthScale: number;
  private _state: ContinuousSessionState<Evaluation>;

  constructor(caseDef: ContinuousCaseDef<Evaluation>, strategy: OptimizerStrategy, seed = 42) {
    this.caseDef = caseDef;
    this.strategy = strategy;
    this.seed = seed;
    this.rng = mulberry32Rng(seed);
    this.gpLengthScale = caseDef.gpLengthScale ?? 0.35;
    this._state = this.createEmptyState(seed);
    this.recommend();
  }

  get state(): Readonly<ContinuousSessionState<Evaluation>> {
    return this._state;
  }

  get currentStrategy(): Readonly<OptimizerStrategy> {
    return this.strategy;
  }

  updateStrategy(next: OptimizerStrategy) {
    this.strategy = next;
    this._state.objectiveLabel = this.describeObjectiveLabel();
    this._state.currentRecommendation = null;
    this.recommend();
  }

  reset(newSeed?: number) {
    if (newSeed !== undefined) {
      this.seed = newSeed;
    }
    this.rng = mulberry32Rng(this.seed);
    this._state = this.createEmptyState(this.seed);
    this.recommend();
  }

  step(): ContinuousHistoryRecord<Evaluation> {
    const rec = this._state.currentRecommendation ?? this.recommend();
    const record = this.observe(rec.params);
    this.recommend();
    return record;
  }

  runSteps(n: number): Array<ContinuousHistoryRecord<Evaluation>> {
    const records: Array<ContinuousHistoryRecord<Evaluation>> = [];
    for (let i = 0; i < n; i++) {
      records.push(this.step());
    }
    return records;
  }

  recommend(): ContinuousRecommendation {
    const candidates = this.generateCandidates();
    const historyX = this._state.history.map((record) => this.normalizeParams(record.params));
    const historyY = this._state.history.map((record) => record.scalarObjective);
    const bestScalar = historyY.length > 0 ? Math.min(...historyY) : 0;
    const acq = this.strategy.acquisition;

    let bestCandidate = candidates[0];
    let bestAcq = -Infinity;
    let bestMean = 0.5;
    let bestStd = 0.5;

    if (acq === 'Random' || historyX.length < 2) {
      bestCandidate = candidates[Math.floor(this.rng() * candidates.length)] ?? candidates[0];
      bestAcq = this.rng();
    } else {
      for (const candidate of candidates) {
        const x = this.normalizeParams(candidate);
        const posterior = this.predictPosterior(historyX, historyY, x);
        const acqValue = acquisitionValue(
          acq,
          posterior.mean,
          posterior.std,
          bestScalar,
          this.strategy.ucbBeta,
          this.rng
        );
        if (acqValue > bestAcq) {
          bestAcq = acqValue;
          bestCandidate = candidate;
          bestMean = posterior.mean;
          bestStd = posterior.std;
        }
      }
    }

    const recommendation: ContinuousRecommendation = {
      params: bestCandidate.map((value) => roundTo(value, 3)),
      predictedMean: roundTo(bestMean, 4),
      predictedStd: roundTo(bestStd, 4),
      acquisitionValue: roundTo(bestAcq, 5),
      acquisitionType: acq,
      explanation: this.buildExplanation(acq, bestMean, bestStd, bestScalar),
    };

    this._state.currentRecommendation = recommendation;
    return recommendation;
  }

  observe(params: number[]): ContinuousHistoryRecord<Evaluation> {
    const evaluation = this.caseDef.evaluate([...params]);
    const metricValues = this.metricValuesFor(evaluation);
    const nextIteration = this._state.history.length + 1;
    const objectiveInfo = this.objectiveInfoFor(metricValues, nextIteration);
    const scalarObjective = objectiveInfo.scalarObjective;
    const bestScalarSoFar = Math.min(
      scalarObjective,
      this._state.history.length > 0 ? Math.min(...this._state.history.map((record) => record.scalarObjective)) : Infinity
    );

    const record: ContinuousHistoryRecord<Evaluation> = {
      iteration: nextIteration,
      params: [...params],
      evaluation,
      metricValues,
      scalarObjective,
      objectiveVector: objectiveInfo.objectiveVector,
      bestScalarSoFar,
    };

    this._state.history.push(record);
    this._state.iteration = nextIteration;
    this._state.objectiveLabel = objectiveInfo.label;

    if (scalarObjective < this._state.bestScalarObjective) {
      this._state.bestScalarObjective = scalarObjective;
      this._state.bestParams = [...params];
    }

    if (this.strategy.objective.mode === 'pareto') {
      this._state.paretoFront = this.buildParetoFront();
    } else {
      this._state.paretoFront = [];
    }

    return record;
  }

  private createEmptyState(seed: number): ContinuousSessionState<Evaluation> {
    return {
      caseId: this.caseDef.id,
      seed,
      iteration: 0,
      history: [],
      currentRecommendation: null,
      bestScalarObjective: Infinity,
      bestParams: [],
      objectiveLabel: this.describeObjectiveLabel(),
      paretoFront: [],
    };
  }

  private generateCandidates(): number[][] {
    const count = this.caseDef.candidateCount ?? 220;
    const candidates: number[][] = [];
    for (let i = 0; i < count; i++) {
      candidates.push(
        this.caseDef.params.map((param) => param.min + this.rng() * (param.max - param.min))
      );
    }
    return candidates;
  }

  private normalizeParams(params: number[]): number[] {
    return params.map((value, index) => {
      const param = this.caseDef.params[index];
      const range = param.max - param.min;
      return range <= 0 ? 0 : (value - param.min) / range;
    });
  }

  private metricValuesFor(evaluation: Evaluation): Record<string, number> {
    const values: Record<string, number> = {};
    for (const metric of this.caseDef.metrics) {
      values[metric.key] = metric.accessor(evaluation);
    }
    return values;
  }

  private objectiveInfoFor(
    metricValues: Record<string, number>,
    iterationSeed: number
  ): { scalarObjective: number; objectiveVector: number[] | null; label: string } {
    const objective = this.strategy.objective;

    if (objective.mode === 'single') {
      const metric = this.findMetric(objective.metricKey);
      return {
        scalarObjective: this.metricComponent(metric, metricValues[metric.key]),
        objectiveVector: null,
        label: metric.label,
      };
    }

    if (objective.mode === 'weighted') {
      const entries = Object.entries(objective.weights)
        .map(([key, weight]) => ({ metric: this.findMetric(key), weight: Math.max(0, weight) }))
        .filter((item) => item.weight > 0);

      if (entries.length === 0) {
        const fallback = this.caseDef.metrics[0];
        return {
          scalarObjective: this.metricComponent(fallback, metricValues[fallback.key]),
          objectiveVector: null,
          label: fallback.label,
        };
      }

      const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
      const weighted = entries.reduce(
        (sum, entry) => sum + entry.weight * this.metricComponent(entry.metric, metricValues[entry.metric.key]),
        0
      );
      return {
        scalarObjective: weighted / totalWeight,
        objectiveVector: null,
        label: 'Weighted objective',
      };
    }

    const metrics = objective.metricKeys.map((key) => this.findMetric(key));
    const objectiveVector = metrics.map((metric) => this.metricComponent(metric, metricValues[metric.key]));
    const scalarized = scalarizeRandom(objectiveVector, this.seed + iterationSeed);
    return {
      scalarObjective: scalarized.scalarized,
      objectiveVector,
      label: `${metrics[0].label} × ${metrics[1].label}`,
    };
  }

  private metricComponent(metric: ContinuousMetricDef<Evaluation>, rawValue: number): number {
    const [lo, hi] = metric.range;
    const span = hi - lo || 1;
    const normalized = clamp((rawValue - lo) / span, 0, 1);
    return metric.direction === 'min' ? normalized : 1 - normalized;
  }

  private findMetric(key: string): ContinuousMetricDef<Evaluation> {
    const metric = this.caseDef.metrics.find((item) => item.key === key);
    if (!metric) {
      throw new Error(`Unknown metric key: ${key}`);
    }
    return metric;
  }

  private buildParetoFront(): ParetoRecord[] {
    const points: ParetoPoint[] = this._state.history
      .filter((record) => record.objectiveVector && record.objectiveVector.length === 2)
      .map((record) => ({
        x: record.params,
        objectives: record.objectiveVector as number[],
      }));

    const front = paretoFront(points);
    return front.map((point) => {
      const record = this._state.history.find((item) =>
        item.params.length === point.x.length &&
        item.params.every((value, index) => Math.abs(value - point.x[index]) < 1e-9)
      );
      return {
        params: [...point.x],
        objectiveVector: [...point.objectives],
        metricValues: record ? { ...record.metricValues } : {},
      };
    });
  }

  private predictPosterior(historyX: number[][], historyY: number[], x: number[]): Posterior {
    if (this.strategy.surrogateModel === 'RF') {
      return fitForestPosterior(historyX, historyY, x, this.seed + historyY.length);
    }
    if (this.strategy.surrogateModel === 'Local') {
      return fitLocalPosterior(historyX, historyY, x);
    }
    return fitGpPosterior(historyX, historyY, x, this.gpLengthScale);
  }

  private describeObjectiveLabel(): string {
    const objective = this.strategy.objective;
    if (objective.mode === 'single') {
      return this.findMetric(objective.metricKey).label;
    }
    if (objective.mode === 'weighted') {
      return 'Weighted objective';
    }
    const metrics = objective.metricKeys.map((key) => this.findMetric(key).label);
    return `${metrics[0]} × ${metrics[1]}`;
  }

  private buildExplanation(acq: ContinuousAcqFn, predictedMean: number, predictedStd: number, bestScalar: number) {
    if (this._state.history.length === 0) {
      return `No history yet. The first point is chosen from a seeded candidate pool (seed=${this.seed}) to initialize the optimizer.`;
    }
    if (acq === 'Random') {
      return 'Random baseline: the next experiment is sampled without using the surrogate posterior.';
    }
    if (acq === 'UCB' && predictedStd > 0.15) {
      return `Exploration-biased choice. UCB keeps high-uncertainty regions alive (sigma=${predictedStd.toFixed(3)}).`;
    }
    if (acq === 'EI' && predictedMean < bestScalar) {
      return `Improvement-biased choice. The surrogate predicts a scalar objective (${predictedMean.toFixed(4)}) below the current best (${bestScalar.toFixed(4)}).`;
    }
    if (acq === 'PI') {
      return `Conservative improvement choice. PI favors candidates with a solid probability of beating the current best scalar objective.`;
    }
    return `Balanced choice. Predicted scalar objective ${predictedMean.toFixed(4)} with uncertainty ${predictedStd.toFixed(4)}.`;
  }
}

function fitGpPosterior(historyX: number[][], historyY: number[], x: number[], lengthScale: number): Posterior {
  const spread = Math.max(...historyY) - Math.min(...historyY) || 1;
  const gp = new GaussianProcess(lengthScale, spread, 1e-5);
  gp.fit(historyX, historyY);
  const posterior = gp.predict(x);
  return { mean: posterior.mean, std: Math.max(1e-4, posterior.std) };
}

function fitLocalPosterior(features: number[][], values: number[], x: number[]): Posterior {
  const pairs = features.map((feature, index) => ({
    index,
    dist: Math.sqrt(feature.reduce((sum, value, featureIndex) => sum + (value - x[featureIndex]) ** 2, 0)),
  }));
  pairs.sort((a, b) => a.dist - b.dist);
  const k = Math.min(8, pairs.length);

  let weightSum = 0;
  let weightedMean = 0;
  let weightedSq = 0;
  for (let i = 0; i < k; i++) {
    const weight = 1 / (pairs[i].dist + 0.02);
    const y = values[pairs[i].index];
    weightSum += weight;
    weightedMean += weight * y;
    weightedSq += weight * y * y;
  }
  const mean = weightedMean / Math.max(weightSum, 1e-9);
  const variance = Math.max(1e-6, weightedSq / Math.max(weightSum, 1e-9) - mean * mean);
  return { mean, std: Math.sqrt(variance) };
}

type TreeNode =
  | { kind: 'leaf'; value: number }
  | { kind: 'split'; featureIndex: number; threshold: number; left: TreeNode; right: TreeNode };

function fitForestPosterior(features: number[][], values: number[], x: number[], seed: number): Posterior {
  const rng = mulberry32Rng(seed);
  const samples = features.map((feature, index) => ({ x: feature, y: values[index] }));
  const treePredictions: number[] = [];

  for (let treeIndex = 0; treeIndex < 24; treeIndex++) {
    const bootstrap = Array.from({ length: samples.length }, () => samples[Math.floor(rng() * samples.length)]);
    const tree = buildTree(bootstrap, 0, 4, rng);
    treePredictions.push(predictTree(tree, x));
  }

  return {
    mean: average(treePredictions),
    std: Math.sqrt(Math.max(1e-6, variance(treePredictions))),
  };
}

function buildTree(samples: Array<{ x: number[]; y: number }>, depth: number, maxDepth: number, rng: () => number): TreeNode {
  if (samples.length <= 4 || depth >= maxDepth || variance(samples.map((sample) => sample.y)) < 1e-6) {
    return { kind: 'leaf', value: average(samples.map((sample) => sample.y)) };
  }

  const featureCount = samples[0].x.length;
  const candidateFeatures = [...Array(featureCount).keys()]
    .sort(() => rng() - 0.5)
    .slice(0, Math.max(2, Math.floor(Math.sqrt(featureCount))));

  let bestFeature = -1;
  let bestThreshold = 0;
  let bestScore = Infinity;
  let bestLeft: typeof samples = [];
  let bestRight: typeof samples = [];

  for (const featureIndex of candidateFeatures) {
    const values = samples.map((sample) => sample.x[featureIndex]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    if (Math.abs(maxValue - minValue) < 1e-9) continue;

    for (let attempt = 0; attempt < 5; attempt++) {
      const threshold = minValue + (maxValue - minValue) * rng();
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
    return { kind: 'leaf', value: average(samples.map((sample) => sample.y)) };
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
  return x[tree.featureIndex] <= tree.threshold ? predictTree(tree.left, x) : predictTree(tree.right, x);
}

function acquisitionValue(
  acqFn: ContinuousAcqFn,
  meanValue: number,
  stdValue: number,
  bestValue: number,
  beta: number,
  rng: () => number
): number {
  const std = Math.max(stdValue, 1e-6);
  const z = (bestValue - meanValue) / std;
  if (acqFn === 'Random') return rng();
  if (acqFn === 'UCB') return -(meanValue - beta * std);
  if (acqFn === 'PI') return normalCdf(z);
  return (bestValue - meanValue) * normalCdf(z) + std * normalPdf(z);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function variance(values: number[]) {
  if (values.length <= 1) return 0;
  const mean = average(values);
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

function sse(values: number[]) {
  const mean = average(values);
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
}

function normalPdf(x: number) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-(x * x) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + 1.330274 * t))));
  p = 1 - p;
  return x >= 0 ? p : 1 - p;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
