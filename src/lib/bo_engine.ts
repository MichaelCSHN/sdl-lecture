import { Matrix, inverse } from 'ml-matrix';
import { mulberry32 } from './doe_engine';

// ==================== Gaussian Process ====================

// RBF (Squared Exponential) kernel
function rbfKernel(x1: number[], x2: number[], lengthScale: number = 1.0, sigmaF: number = 1.0): number {
  const distSq = x1.reduce((sum, v, i) => sum + (v - x2[i]) ** 2, 0);
  return sigmaF ** 2 * Math.exp(-distSq / (2 * lengthScale ** 2));
}

// Build covariance matrix K(X, X)
function buildKMatrix(X: number[][], lengthScale: number, sigmaF: number, noise: number = 1e-5): Matrix {
  const n = X.length;
  const K = new Matrix(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      K.set(i, j, rbfKernel(X[i], X[j], lengthScale, sigmaF) + (i === j ? noise : 0));
    }
  }
  return K;
}

// Build cross-covariance k(X*, X)
function buildKStar(X: number[][], xStar: number[], lengthScale: number, sigmaF: number): number[] {
  return X.map((xi) => rbfKernel(xStar, xi, lengthScale, sigmaF));
}

export interface GPPosterior {
  mean: number;
  variance: number;
  std: number;
}

export class GaussianProcess {
  private X: number[][] = [];
  private y: number[] = [];
  public lengthScale: number;
  private sigmaF: number;
  private noise: number;
  private Kinv: Matrix | null = null;

  constructor(lengthScale: number = 1.0, sigmaF: number = 1.0, noise: number = 1e-5) {
    this.lengthScale = lengthScale;
    this.sigmaF = sigmaF;
    this.noise = noise;
  }

  fit(X: number[][], y: number[]) {
    this.X = X;
    this.y = y;
    if (X.length === 0) { this.Kinv = null; return; }
    if (X.length === 1) {
      this.Kinv = new Matrix([[1.0 / (this.sigmaF ** 2 + this.noise)]]);
      return;
    }
    const K = buildKMatrix(X, this.lengthScale, this.sigmaF, this.noise);
    try { this.Kinv = inverse(K); } catch {
      // Add jitter if singular
      for (let i = 0; i < K.rows; i++) K.set(i, i, K.get(i, i) + 0.01);
      try { this.Kinv = inverse(K); } catch { this.Kinv = null; }
    }
  }

  predict(xStar: number[]): GPPosterior {
    if (!this.Kinv || this.X.length === 0) {
      return { mean: 0, variance: this.sigmaF ** 2, std: this.sigmaF };
    }
    if (this.X.length === 1) {
      const kxx = rbfKernel(xStar, xStar, this.lengthScale, this.sigmaF) + this.noise;
      const kxX = rbfKernel(xStar, this.X[0], this.lengthScale, this.sigmaF);
      const mean = kxX * this.Kinv.get(0, 0) * this.y[0];
      const variance = Math.max(0, kxx - kxX * this.Kinv.get(0, 0) * kxX);
      return { mean, variance, std: Math.sqrt(variance) };
    }
    const kStar = buildKStar(this.X, xStar, this.lengthScale, this.sigmaF);
    const kStarMatrix = new Matrix([kStar]);
    const kXX = rbfKernel(xStar, xStar, this.lengthScale, this.sigmaF) + this.noise;

    const yMatrix = Matrix.columnVector(this.y);
    const meanMat = kStarMatrix.mmul(this.Kinv).mmul(yMatrix);
    const varMat = kStarMatrix.mmul(this.Kinv).mmul(kStarMatrix.transpose());

    const mean = meanMat.get(0, 0);
    const variance = Math.max(1e-10, kXX - varMat.get(0, 0));

    return { mean, variance, std: Math.sqrt(variance) };
  }
}

// ==================== Acquisition Functions ====================

export function expectedImprovement(mu: number, sigma: number, yBest: number, xi: number = 0.01): number {
  if (sigma < 1e-9) return 0;
  const z = (mu - yBest - xi) / sigma;
  return (mu - yBest - xi) * normalCDF(z) + sigma * normalPDF(z);
}

export function upperConfidenceBound(mu: number, sigma: number, kappa: number): number {
  return mu + kappa * sigma;
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCDF(x: number): number {
  // Approximation
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

// ==================== Live Cases ====================

export interface LiveCase {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  params: CaseParam[];
  objectiveFn: (values: number[]) => number;
  noise: number;
  unit: string;
  xlabel: string;
  ylabel: string;
  domain: [number, number][];
  lengthScale?: number;
}

export interface CaseParam {
  name: string;
  nameEn: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export const liveCases: LiveCase[] = [
  {
    id: 'branin',
    name: 'Branin 函数',
    nameEn: 'Branin Function',
    description: '经典2D全局优化基准函数，3个全局最小值。常用于测试BO算法的全局搜索能力。',
    params: [
      { name: 'x₁', nameEn: 'x1', unit: '', min: -5, max: 10, step: 0.1, default: 0 },
      { name: 'x₂', nameEn: 'x2', unit: '', min: 0, max: 15, step: 0.1, default: 5 },
    ],
    objectiveFn: ([x1, x2]) => {
      const a = 1, b = 5.1 / (4 * Math.PI * Math.PI), c = 5 / Math.PI;
      const r = 6, s = 10, t = 1 / (8 * Math.PI);
      return -(a * (x2 - b * x1 * x1 + c * x1 - r) ** 2 + s * (1 - t) * Math.cos(x1) + s);
    },
    noise: 0.5,
    unit: 'f(x)',
    xlabel: 'x₁',
    ylabel: 'x₂',
    domain: [[-5, 10], [0, 15]],
    lengthScale: 2.0,
  },
  {
    id: 'suzuki',
    name: 'Suzuki 偶联反应',
    nameEn: 'Suzuki Coupling',
    description: '钯催化的交叉偶联反应优化。优化温度和配体用量以最大化产率。',
    params: [
      { name: '温度', nameEn: 'Temperature', unit: '°C', min: 60, max: 120, step: 1, default: 80 },
      { name: '催化剂用量', nameEn: 'Catalyst Loading', unit: 'mol%', min: 0.1, max: 5, step: 0.1, default: 1.0 },
    ],
    objectiveFn: ([temp, catalyst]) => {
      const t = (temp - 60) / 60;
      const c = catalyst / 5;
      const yield_ = 95 * Math.exp(-((t - 0.7) ** 2 + (c - 0.4) ** 2) / 0.15) + 10 * t * c + gaussianRandom(0, 2);
      return Math.max(0, Math.min(100, yield_));
    },
    noise: 2,
    unit: '%',
    xlabel: '温度 (°C)',
    ylabel: '催化剂 (mol%)',
    domain: [[60, 120], [0.1, 5]],
    lengthScale: 0.3,
  },
  {
    id: 'perovskite',
    name: '钙钛矿导电率',
    nameEn: 'Perovskite Conductivity',
    description: '优化钙钛矿合成温度和时间以获得最高离子导电率。',
    params: [
      { name: '烧结温度', nameEn: 'Sintering Temp', unit: '°C', min: 800, max: 1400, step: 10, default: 1100 },
      { name: '烧结时间', nameEn: 'Sintering Time', unit: 'h', min: 2, max: 48, step: 1, default: 12 },
    ],
    objectiveFn: ([temp, time]) => {
      const t = (temp - 800) / 600;
      const tm = time / 48;
      const peak1 = Math.exp(-((t - 0.6) ** 2 + (tm - 0.3) ** 2) / 0.05);
      const peak2 = Math.exp(-((t - 0.3) ** 2 + (tm - 0.7) ** 2) / 0.08);
      return peak1 * 85 + peak2 * 60 + gaussianRandom(0, 5);
    },
    noise: 5,
    unit: 'S/cm',
    xlabel: '温度 (°C)',
    ylabel: '时间 (h)',
    domain: [[800, 1400], [2, 48]],
    lengthScale: 0.2,
  },
  {
    id: 'rgb_led',
    name: 'RGB LED 颜色匹配',
    nameEn: 'RGB LED Color Matching',
    description: '自驱动实验室的经典光学demo：调节R/G/B三个LED的PWM占空比以匹配目标颜色。',
    params: [
      { name: 'R 占空比', nameEn: 'Red PWM', unit: '%', min: 0, max: 100, step: 1, default: 50 },
      { name: 'G 占空比', nameEn: 'Green PWM', unit: '%', min: 0, max: 100, step: 1, default: 50 },
      { name: 'B 占空比', nameEn: 'Blue PWM', unit: '%', min: 0, max: 100, step: 1, default: 50 },
    ],
    objectiveFn: ([r, g, b]) => {
      // Target: RGB(180, 120, 60) - warm orange
      const targetR = 180, targetG = 120, targetB = 60;
      const actualR = 2.5 * r, actualG = 2.2 * g, actualB = 1.8 * b;
      const dist = Math.sqrt((actualR - targetR) ** 2 + (actualG - targetG) ** 2 + (actualB - targetB) ** 2);
      return Math.max(0, 100 - dist + gaussianRandom(0, 3));
    },
    noise: 3,
    unit: '匹配度',
    xlabel: 'R (%)',
    ylabel: 'G (%)',
    domain: [[0, 100], [0, 100], [0, 100]],
    lengthScale: 0.25,
  },
  {
    id: 'catalyst_yield',
    name: '合成产率优化',
    nameEn: 'Catalyst Yield Optimization',
    description: '优化反应温度、时间和前驱体比例以最大化化学合成产率。',
    params: [
      { name: '反应温度', nameEn: 'Reaction Temp', unit: '°C', min: 20, max: 150, step: 1, default: 80 },
      { name: '反应时间', nameEn: 'Reaction Time', unit: 'h', min: 0.5, max: 24, step: 0.5, default: 6 },
      { name: '前驱体比例', nameEn: 'Precursor Ratio', unit: '', min: 0.5, max: 3, step: 0.1, default: 1.0 },
    ],
    objectiveFn: ([temp, time, ratio]) => {
      const t = (temp - 20) / 130;
      const tm = time / 24;
      const r = (ratio - 0.5) / 2.5;
      const yield_ = 92 * Math.exp(-((t - 0.65) ** 2 + (tm - 0.35) ** 2 + (r - 0.5) ** 2) / 0.12) + 5 * t * tm * r * 100;
      return Math.max(0, Math.min(100, yield_ + gaussianRandom(0, 2)));
    },
    noise: 2,
    unit: '%',
    xlabel: '温度 (°C)',
    ylabel: '时间 (h)',
    domain: [[20, 150], [0.5, 24], [0.5, 3]],
    lengthScale: 0.25,
  },
  {
    id: 'battery',
    name: '锂电池电解液',
    nameEn: 'Li-ion Battery Electrolyte',
    description: '优化电解液溶剂配比和添加剂浓度以最大化离子电导率。',
    params: [
      { name: 'EC 含量', nameEn: 'EC Content', unit: 'wt%', min: 10, max: 50, step: 1, default: 30 },
      { name: 'DMC 含量', nameEn: 'DMC Content', unit: 'wt%', min: 30, max: 80, step: 1, default: 60 },
      { name: 'LiPF₆ 浓度', nameEn: 'LiPF6 Conc.', unit: 'mol/L', min: 0.5, max: 2, step: 0.1, default: 1.0 },
    ],
    objectiveFn: ([ec, dmc, lipf6]) => {
      const e = ec / 50, d = dmc / 80, l = lipf6 / 2;
      const cond = 12 * Math.exp(-((e - 0.6) ** 2 + (d - 0.7) ** 2 + (l - 0.6) ** 2) / 0.1) + 2 * e * d * l * 10;
      return Math.max(0, cond + gaussianRandom(0, 0.5));
    },
    noise: 0.5,
    unit: 'mS/cm',
    xlabel: 'EC (wt%)',
    ylabel: 'DMC (wt%)',
    domain: [[10, 50], [30, 80], [0.5, 2]],
    lengthScale: 0.2,
  },
  {
    id: 'co2_reduction',
    name: '光催化 CO₂ 还原',
    nameEn: 'Photocatalytic CO₂ Reduction',
    description: '优化光催化剂组成和光照条件以最大化CO₂还原产物（CO/CH₄）选择性。',
    params: [
      { name: 'TiO₂ 含量', nameEn: 'TiO2 Content', unit: 'wt%', min: 10, max: 90, step: 1, default: 50 },
      { name: '光照强度', nameEn: 'Light Intensity', unit: 'mW/cm²', min: 10, max: 200, step: 5, default: 100 },
      { name: '反应时间', nameEn: 'Irradiation Time', unit: 'h', min: 1, max: 12, step: 0.5, default: 4 },
    ],
    objectiveFn: ([tio2, light, time]) => {
      const t = tio2 / 90, l = light / 200, tm = time / 12;
      const selectivity = 75 * Math.exp(-((t - 0.55) ** 2 + (l - 0.8) ** 2 + (tm - 0.4) ** 2) / 0.1) + 8 * t * l * 10;
      return Math.max(0, Math.min(100, selectivity + gaussianRandom(0, 3)));
    },
    noise: 3,
    unit: '%',
    xlabel: 'TiO₂ (wt%)',
    ylabel: '光照 (mW/cm²)',
    domain: [[10, 90], [10, 200], [1, 12]],
    lengthScale: 0.2,
  },
  {
    id: 'snar_pareto',
    name: 'SnAr 多目标优化',
    nameEn: 'SnAr Multi-objective',
    description: '核取代芳香反应：同时优化产率（最大化）和 E-factor（最小化，即环境因子 = 废料质量/产品质量）。展示 Pareto 前沿。',
    params: [
      { name: '停留时间', nameEn: 'Residence Time', unit: 'min', min: 1, max: 10, step: 0.5, default: 5 },
      { name: '温度', nameEn: 'Temperature', unit: '°C', min: 60, max: 130, step: 1, default: 90 },
    ],
    objectiveFn: ([time, temp]) => {
      const t = (time - 1) / 9;
      const T = (temp - 60) / 70;
      // Yield peaks at middle temp + longer time
      const yield_ = 85 * Math.exp(-((t - 0.7) ** 2 + (T - 0.6) ** 2) / 0.15) + 15 * t * T * 10;
      // E-factor: lower is better (minimize)
      // High yield + low temp → low E-factor
      const eFactor = 50 * (1 - t * 0.3) * (1 + T * 0.5) + gaussianRandom(0, 3);
      // Combined scalarization: maximize yield - 0.5 * eFactor
      return Math.max(0, yield_ - 0.5 * Math.max(0, eFactor));
    },
    noise: 3,
    unit: '综合得分',
    xlabel: '停留时间 (min)',
    ylabel: '温度 (°C)',
    domain: [[1, 10], [60, 130]],
    lengthScale: 0.3,
  },
];

let _globalRng = mulberry32(42);

export function setBORngSeed(seed: number) {
  _globalRng = mulberry32(seed);
}

export function gaussianRandom(mean: number, std: number): number {
  const u1 = Math.max(1e-10, _globalRng()), u2 = _globalRng();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Grid search for visualization (2D slice)
export function computeGPGrid(
  gp: GaussianProcess,
  case_: LiveCase,
  fixedValues: number[],
  paramIdx1: number,
  paramIdx2: number,
  resolution: number = 30
): { x: number[]; y: number[]; zMean: number[][]; zVar: number[][]; zEI: number[][] } {
  const p1 = case_.params[paramIdx1];
  const p2 = case_.params[paramIdx2];

  // Pre-build full coordinate axes
  const x = Array.from({ length: resolution }, (_, i) =>
    p1.min + (i / (resolution - 1)) * (p1.max - p1.min)
  );
  const y = Array.from({ length: resolution }, (_, j) =>
    p2.min + (j / (resolution - 1)) * (p2.max - p2.min)
  );

  const zMean: number[][] = [];
  const zVar: number[][] = [];
  const zEI: number[][] = [];
  const yBest = Math.max(...(gp as any).y || [-Infinity]);

  for (let i = 0; i < resolution; i++) {
    const rowMean: number[] = [];
    const rowVar: number[] = [];
    const rowEI: number[] = [];
    for (let j = 0; j < resolution; j++) {
      const xVec = [...fixedValues];
      xVec[paramIdx1] = x[i];
      xVec[paramIdx2] = y[j];
      const pred = gp.predict(xVec);
      rowMean.push(pred.mean);
      rowVar.push(pred.std);
      rowEI.push(expectedImprovement(pred.mean, pred.std, yBest));
    }
    zMean.push(rowMean);
    zVar.push(rowVar);
    zEI.push(rowEI);
  }

  return { x, y, zMean, zVar, zEI };
}
