import { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import { Play, RotateCcw, Settings, ChevronDown, ChevronRight, Square } from 'lucide-react';
import {
  GaussianProcess,
  expectedImprovement,
  setBORngSeed,
  uniformBORandom,
  gaussianRandom,
} from '@/lib/bo_engine';
import { mulberry32 } from '@/lib/doe_engine';
import {
  forrester,
  FORRESTER_DOMAIN,
  branin,
  BRANIN_DOMAIN,
  braninCurrinObj1,
  braninCurrinObj2,
} from '@/lib/benchmarks';
import { paretoFront, hypervolume2D, scalarizeRandom, type ParetoPoint } from '@/lib/multiObjective';
import GpBoHero from '@/components/gpbo/GpBoHero';
import GpBoModeGuide from '@/components/gpbo/GpBoModeGuide';
import GpBoCaseBridge from '@/components/gpbo/GpBoCaseBridge';

const Plot = lazy(() => import('react-plotly.js'));

type TabId = '1d' | '2d' | 'multi';
type AcqFn = 'EI' | 'UCB' | 'PI' | 'Random';
type InitDesign = 'random' | 'lhs';
type OptimDir = 'min' | 'max';
type MultiObjectiveMode = 'weighted' | 'pareto';
type ObjectiveVector = [number, number];

interface RunState {
  iteration: number;
  X: number[][];
  y: number[];
  bestY: number;
  bestX: number[];
  nextX: number[] | null;
  nextReason: string;
  gpData: { x: number[][]; mean: number[]; std: number[] } | null;
  acqData: { x: number[]; y: number[] } | null;
  contData: { x: number[]; y: number[]; z: number[][] } | null;
  paretoPoints: ParetoPoint[];
  hvHistory: number[];
  moObs: ObjectiveVector[] | null;
}

const TABS: { id: TabId; label: string; desc: string }[] = [
  { id: '1d', label: '1D GP 沙盒', desc: 'Forrester 后验（posterior）、不确定度与采集函数' },
  { id: '2d', label: '2D 单目标', desc: 'Branin 搜索轨迹与 best-so-far 曲线' },
  { id: 'multi', label: '2D 多目标', desc: 'Branin-Currin 的线性组合与 Pareto 视图' },
];

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function eiAcq(mu: number, sigma: number, yBest: number, dir: OptimDir): number {
  const effMu = dir === 'min' ? -mu : mu;
  const effBest = dir === 'min' ? -yBest : yBest;
  return expectedImprovement(effMu, sigma, effBest);
}

function piAcq(mu: number, sigma: number, yBest: number, dir: OptimDir, xi: number = 0.01): number {
  const effMu = dir === 'min' ? -mu : mu;
  const effBest = dir === 'min' ? -yBest : yBest;
  if (sigma < 1e-9) return 0;
  return normalCDF((effMu - effBest - xi) / sigma);
}

function ucbAcq(mu: number, sigma: number, beta: number, dir: OptimDir): number {
  return dir === 'min' ? -mu + beta * sigma : mu + beta * sigma;
}

function lhsSample(n: number, dims: number, domain: [number, number][], rng: () => number): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < n; i++) {
    const pt: number[] = [];
    for (let d = 0; d < dims; d++) {
      const bucket = (i + rng()) / n;
      pt.push(domain[d][0] + bucket * (domain[d][1] - domain[d][0]));
    }
    result.push(pt);
  }
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scalarizeWeightedObjectives(
  objectives: ObjectiveVector,
  weights: { branin: number; currin: number },
): number {
  const totalWeight = Math.max(weights.branin + weights.currin, 1e-9);
  const braninNorm = clamp(objectives[0] / 300, 0, 2);
  const currinNorm = clamp(objectives[1] / 15, 0, 2);
  return (weights.branin * braninNorm + weights.currin * currinNorm) / totalWeight;
}

function exportParetoFrontCsv(points: ParetoPoint[]) {
  if (typeof window === 'undefined' || points.length === 0) return;
  const rows = [
    'x1,x2,objective_1_branin,objective_2_currin',
    ...points.map((point) => `${point.x[0]},${point.x[1]},${point.objectives[0]},${point.objectives[1]}`),
  ];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = 'pareto-front.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

function cloneRunState(runState: RunState): RunState {
  return {
    ...runState,
    X: runState.X.map((point) => [...point]),
    y: [...runState.y],
    paretoPoints: [...runState.paretoPoints],
    hvHistory: [...runState.hvHistory],
    moObs: runState.moObs ? runState.moObs.map((obs) => [...obs] as ObjectiveVector) : null,
  };
}

export default function SDLDemoPage() {
  const [tab, setTab] = useState<TabId>('1d');
  const [acqFn, setAcqFn] = useState<AcqFn>('EI');
  const [optimDir, setOptimDir] = useState<OptimDir>('min');
  const [multiMode, setMultiMode] = useState<MultiObjectiveMode>('weighted');
  const [initDesign, setInitDesign] = useState<InitDesign>('lhs');
  const [nInit, setNInit] = useState(3);
  const [noise, setNoise] = useState(0);
  const [seedVal, setSeedVal] = useState(42);
  const [ucbBeta, setUcbBeta] = useState(2);
  const [weightBranin, setWeightBranin] = useState(0.6);
  const [weightCurrin, setWeightCurrin] = useState(0.4);
  const [paretoRefBranin, setParetoRefBranin] = useState(400);
  const [paretoRefCurrin, setParetoRefCurrin] = useState(20);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [runState, setRunState] = useState<RunState | null>(null);

  const gpRef = useRef<GaussianProcess | null>(null);
  const autoRef = useRef(false);
  const initializedRef = useRef(false);
  const modeSignatureRef = useRef('');

  const effectiveDir: OptimDir = tab === 'multi' ? 'min' : optimDir;
  const activeMode = tab === 'multi' ? (multiMode === 'weighted' ? 'scalarized' : 'pareto') : 'single';
  const modeSignature = tab === 'multi' ? `${tab}:${multiMode}` : tab;

  useEffect(() => {
    return () => {
      autoRef.current = false;
    };
  }, []);

  const doReset = useCallback(() => {
    autoRef.current = false;
    setAutoRunning(false);
    setBORngSeed(seedVal);

    const gp = new GaussianProcess(0.3, 1.0, noise > 0 ? noise : 1e-5);
    gpRef.current = gp;

    const rng = mulberry32(seedVal);
    const domain = tab === '1d' ? [FORRESTER_DOMAIN] : BRANIN_DOMAIN;
    const dims = domain.length;
    const weights = { branin: weightBranin, currin: weightCurrin };

    let initX: number[][];
    if (initDesign === 'lhs') {
      initX = lhsSample(nInit, dims, domain, rng);
    } else {
      initX = [];
      for (let i = 0; i < nInit; i++) {
        initX.push(domain.map((range) => range[0] + rng() * (range[1] - range[0])));
      }
    }

    let initY: number[];
    let initMOObs: ObjectiveVector[] | null = null;

    if (tab === 'multi') {
      initMOObs = initX.map((x) => [braninCurrinObj1(x[0], x[1]), braninCurrinObj2(x[0], x[1])]);
      initY = initMOObs.map((objectives, idx) =>
        multiMode === 'weighted'
          ? scalarizeWeightedObjectives(objectives, weights)
          : scalarizeRandom(objectives, seedVal + idx).scalarized,
      );
    } else {
      const fn = tab === '1d' ? (x: number[]) => forrester(x[0]) : (x: number[]) => branin(x[0], x[1]);
      initY = initX.map((x) => fn(x) + (noise > 0 ? gaussianRandom(0, noise) : 0));
    }

    gp.fit(initX, initY);

    const bestIdx = initY.reduce((best, _, i) =>
      (effectiveDir === 'min' ? initY[i] < initY[best] : initY[i] > initY[best]) ? i : best, 0);

    const initialParetoPoints =
      initMOObs !== null ? paretoFront(initX.map((x, i) => ({ x, objectives: initMOObs![i] }))) : [];
    const initialHvHistory =
      tab === 'multi' && multiMode === 'pareto' && initialParetoPoints.length > 0
        ? [hypervolume2D(initialParetoPoints.map((point) => point.objectives), [paretoRefBranin, paretoRefCurrin])]
        : [];

    const state: RunState = {
      iteration: nInit,
      X: initX,
      y: initY,
      bestY: initY[bestIdx],
      bestX: initX[bestIdx],
      nextX: null,
      nextReason: '',
      gpData: null,
      acqData: null,
      contData: null,
      paretoPoints: initialParetoPoints,
      hvHistory: initialHvHistory,
      moObs: initMOObs,
    };

    computeVisData(state, gp, tab, acqFn, effectiveDir, ucbBeta, domain);
    setRunState({ ...state });
  }, [
    seedVal,
    tab,
    acqFn,
    effectiveDir,
    nInit,
    initDesign,
    noise,
    ucbBeta,
    multiMode,
    weightBranin,
    weightCurrin,
    paretoRefBranin,
    paretoRefCurrin,
  ]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      modeSignatureRef.current = modeSignature;
      doReset();
      return;
    }
    if (modeSignatureRef.current !== modeSignature) {
      modeSignatureRef.current = modeSignature;
      doReset();
    }
  }, [modeSignature, doReset]);

  const executeOneStep = useCallback((state: RunState) => {
    const gp = gpRef.current;
    if (!gp) return state;

    const domain = tab === '1d' ? [FORRESTER_DOMAIN] : BRANIN_DOMAIN;
    const weights = { branin: weightBranin, currin: weightCurrin };
    const nCandidates = 500;
    const candidates: number[][] = [];
    for (let i = 0; i < nCandidates; i++) {
      candidates.push(domain.map((range) => uniformBORandom() * (range[1] - range[0]) + range[0]));
    }

    let bestAcqVal = -Infinity;
    let bestCandidate = candidates[0];
    let bestMean = 0;
    let bestStd = 0;

    const yBestIdx = state.y.reduce((best, y, i) =>
      (effectiveDir === 'min' ? y < state.y[best] : y > state.y[best]) ? i : best, 0);
    const yBest = state.y[yBestIdx];

    for (const candidate of candidates) {
      const pred = gp.predict(candidate);
      let acqVal: number;
      switch (acqFn) {
        case 'EI':
          acqVal = eiAcq(pred.mean, pred.std, yBest, effectiveDir);
          break;
        case 'UCB':
          acqVal = ucbAcq(pred.mean, pred.std, ucbBeta, effectiveDir);
          break;
        case 'PI':
          acqVal = piAcq(pred.mean, pred.std, yBest, effectiveDir);
          break;
        default:
          acqVal = uniformBORandom();
      }
      if (acqVal > bestAcqVal) {
        bestAcqVal = acqVal;
        bestCandidate = candidate;
        bestMean = pred.mean;
        bestStd = pred.std;
      }
    }

    const updatedX = [...state.X, bestCandidate];
    let obs: number;

    if (tab === 'multi') {
      const objectives: ObjectiveVector = [braninCurrinObj1(bestCandidate[0], bestCandidate[1]), braninCurrinObj2(bestCandidate[0], bestCandidate[1])];
      obs =
        multiMode === 'weighted'
          ? scalarizeWeightedObjectives(objectives, weights)
          : scalarizeRandom(objectives, seedVal + state.iteration).scalarized;

      const newMOObs = [...(state.moObs || []), objectives];
      state.moObs = newMOObs;
      state.paretoPoints = paretoFront(updatedX.map((x, i) => ({ x, objectives: newMOObs[i] })));
      if (multiMode === 'pareto') {
        state.hvHistory.push(
          hypervolume2D(state.paretoPoints.map((point) => point.objectives), [paretoRefBranin, paretoRefCurrin]),
        );
      }
    } else {
      const fn = tab === '1d' ? (x: number[]) => forrester(x[0]) : (x: number[]) => branin(x[0], x[1]);
      obs = fn(bestCandidate) + (noise > 0 ? gaussianRandom(0, noise) : 0);
    }

    state.X.push(bestCandidate);
    state.y.push(obs);
    state.iteration += 1;

    const isImprovement = effectiveDir === 'min' ? obs < state.bestY : obs > state.bestY;
    if (isImprovement) {
      state.bestY = obs;
      state.bestX = bestCandidate;
    }

    state.nextX = bestCandidate;
    state.nextReason = buildReason(acqFn, bestMean, bestStd, yBest, state.iteration, effectiveDir, tab, multiMode);
    gp.fit(state.X, state.y);
    computeVisData(state, gp, tab, acqFn, effectiveDir, ucbBeta, domain);
    return state;
  }, [
    tab,
    acqFn,
    effectiveDir,
    ucbBeta,
    noise,
    seedVal,
    multiMode,
    weightBranin,
    weightCurrin,
    paretoRefBranin,
    paretoRefCurrin,
  ]);

  const runOne = useCallback(() => {
    if (!runState) return;
    const next = executeOneStep(cloneRunState(runState));
    setRunState({ ...next });
  }, [runState, executeOneStep]);

  const runFive = useCallback(() => {
    if (!runState) return;
    let state = cloneRunState(runState);
    for (let i = 0; i < 5; i++) {
      state = executeOneStep(state);
    }
    setRunState({ ...state });
  }, [runState, executeOneStep]);

  const startAuto = useCallback(() => {
    if (!runState) return;
    autoRef.current = true;
    setAutoRunning(true);
    let state = cloneRunState(runState);
    const loop = () => {
      if (!autoRef.current) {
        setAutoRunning(false);
        return;
      }
      state = executeOneStep(state);
      setRunState({ ...state });
      setTimeout(loop, 400);
    };
    loop();
  }, [runState, executeOneStep]);

  const stopAuto = useCallback(() => {
    autoRef.current = false;
    setAutoRunning(false);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <GpBoHero />
      <GpBoModeGuide activeMode={activeMode} />
      <GpBoCaseBridge />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-xl border px-4 py-2 text-left text-xs font-mono transition-colors ${
              tab === item.id
                ? 'border-[rgba(0,245,212,0.3)] bg-[rgba(0,245,212,0.12)] text-[#00f5d4]'
                : 'border-[rgba(67,97,238,0.1)] text-[#8a92a3] hover:border-[rgba(0,245,212,0.2)]'
            }`}
          >
            <div>{item.label}</div>
            <div className="mt-1 text-[10px] text-[#5a6377]">{item.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-1">
          <div className="rounded-2xl border border-[rgba(67,97,238,0.15)] bg-[rgba(6,22,42,0.8)] p-4">
            <div className="mb-2 text-[10px] font-mono tracking-[0.18em] text-[#8a92a3]">控制面板（Control Panel）</div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[#8a92a3]">代理模型（Surrogate Model）</label>
                <select
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded border border-[rgba(67,97,238,0.08)] bg-[rgba(67,97,238,0.04)] px-2 py-1 text-[11px] text-[#5a6377]"
                >
                  <option>高斯过程（Gaussian Process，当前引擎）</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#8a92a3]">采集函数（Acquisition Function）</label>
                <select
                  value={acqFn}
                  onChange={(e) => setAcqFn(e.target.value as AcqFn)}
                  className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                >
                  <option value="EI">EI</option>
                  <option value="UCB">UCB</option>
                  <option value="PI">PI</option>
                  <option value="Random">随机基线（Random Baseline）</option>
                </select>
              </div>

              {tab === 'multi' ? (
                <div className="rounded-xl border border-[rgba(0,245,212,0.12)] bg-[rgba(0,245,212,0.04)] p-3">
                  <div className="mb-2 text-[11px] text-[#8a92a3]">多目标模式（Multi-Objective Mode）</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMultiMode('weighted')}
                      className={`rounded border px-2 py-1.5 text-[11px] font-mono transition-colors ${
                        multiMode === 'weighted'
                          ? 'border-[rgba(0,245,212,0.28)] bg-[rgba(0,245,212,0.12)] text-[#00f5d4]'
                          : 'border-[rgba(67,97,238,0.12)] text-[#8a92a3]'
                      }`}
                    >
                      线性组合（Weighted Sum）
                    </button>
                    <button
                      onClick={() => setMultiMode('pareto')}
                      className={`rounded border px-2 py-1.5 text-[11px] font-mono transition-colors ${
                        multiMode === 'pareto'
                          ? 'border-[rgba(0,245,212,0.28)] bg-[rgba(0,245,212,0.12)] text-[#00f5d4]'
                          : 'border-[rgba(67,97,238,0.12)] text-[#8a92a3]'
                      }`}
                    >
                      Pareto 前沿
                    </button>
                  </div>

                  {multiMode === 'weighted' ? (
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[#8a92a3]">权重：Branin</label>
                          <input
                            type="number"
                            value={weightBranin}
                            onChange={(e) => setWeightBranin(Number(e.target.value))}
                            min={0}
                            max={1}
                            step={0.1}
                            className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#8a92a3]">权重：Currin</label>
                          <input
                            type="number"
                            value={weightCurrin}
                            onChange={(e) => setWeightCurrin(Number(e.target.value))}
                            min={0}
                            max={1}
                            step={0.1}
                            className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] leading-5 text-[#8a92a3]">
                        优化器最小化归一化后的线性组合目标。调整权重后，请点击“重置”重新开始。
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[#8a92a3]">参考点：Branin</label>
                          <input
                            type="number"
                            value={paretoRefBranin}
                            onChange={(e) => setParetoRefBranin(Number(e.target.value))}
                            min={50}
                            max={600}
                            step={10}
                            className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#8a92a3]">参考点：Currin</label>
                          <input
                            type="number"
                            value={paretoRefCurrin}
                            onChange={(e) => setParetoRefCurrin(Number(e.target.value))}
                            min={1}
                            max={40}
                            step={1}
                            className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] leading-5 text-[#8a92a3]">
                        这一教学实现使用随机标量化（random scalarization）推进搜索，并用 hypervolume 跟踪前沿质量。
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-[#8a92a3]">优化方向（Optimization Direction）</label>
                  <select
                    value={optimDir}
                    onChange={(e) => setOptimDir(e.target.value as OptimDir)}
                    className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                  >
                    <option value="min">最小化（Minimize）</option>
                    <option value="max">最大化（Maximize）</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[#8a92a3]">噪声（Noise）</label>
                  <input
                    type="number"
                    value={noise}
                    onChange={(e) => setNoise(Number(e.target.value))}
                    min={0}
                    max={5}
                    step={0.1}
                    className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8a92a3]">初始点数（Initial Points）</label>
                  <input
                    type="number"
                    value={nInit}
                    onChange={(e) => setNInit(Number(e.target.value))}
                    min={2}
                    max={20}
                    className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#8a92a3]">随机种子（Seed）</label>
                <input
                  type="number"
                  value={seedVal}
                  onChange={(e) => setSeedVal(Number(e.target.value))}
                  min={1}
                  max={9999}
                  className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                />
              </div>

              <button
                onClick={() => setAdvancedOpen((open) => !open)}
                className="flex items-center gap-1 text-[11px] font-mono text-[#8a92a3] transition-colors hover:text-[#d0d4dc]"
              >
                <Settings className="h-3 w-3" />
                高级选项（Advanced）
                {advancedOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {advancedOpen && (
                <div className="space-y-2 border-t border-[rgba(67,97,238,0.08)] pt-2">
                  <div>
                    <label className="text-[11px] text-[#8a92a3]">初始设计（Initial Design）</label>
                    <select
                      value={initDesign}
                      onChange={(e) => setInitDesign(e.target.value as InitDesign)}
                      className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                    >
                      <option value="lhs">LHS</option>
                      <option value="random">随机（Random）</option>
                    </select>
                  </div>
                  {acqFn === 'UCB' && (
                    <div>
                      <label className="text-[11px] text-[#8a92a3]">UCB 参数 beta</label>
                      <input
                        type="number"
                        value={ucbBeta}
                        onChange={(e) => setUcbBeta(Number(e.target.value))}
                        min={0.1}
                        max={10}
                        step={0.1}
                        className="mt-1 w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(67,97,238,0.08)] px-2 py-1 text-[11px] text-[#d0d4dc]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={doReset}
              className="flex items-center gap-1 rounded-full border border-[rgba(255,107,107,0.2)] px-3 py-1.5 text-[11px] font-mono text-[#ff6b6b] transition-colors hover:bg-[rgba(255,107,107,0.06)]"
            >
              <RotateCcw className="h-3 w-3" />
              重置
            </button>
            <button
              onClick={runOne}
              disabled={!runState || autoRunning}
              className="flex items-center gap-1 rounded-full border border-[rgba(0,245,212,0.3)] px-3 py-1.5 text-[11px] font-mono text-[#00f5d4] transition-colors hover:bg-[rgba(0,245,212,0.06)] disabled:opacity-40"
            >
              <Play className="h-3 w-3" />
              1 步
            </button>
            <button
              onClick={runFive}
              disabled={!runState || autoRunning}
              className="flex items-center gap-1 rounded-full border border-[rgba(67,97,238,0.3)] px-3 py-1.5 text-[11px] font-mono text-[#4361ee] transition-colors hover:bg-[rgba(67,97,238,0.06)] disabled:opacity-40"
            >
              <Play className="h-3 w-3" />
              5 步
            </button>
            {autoRunning ? (
              <button
                onClick={stopAuto}
                className="flex items-center gap-1 rounded-full border border-[rgba(245,158,11,0.3)] px-3 py-1.5 text-[11px] font-mono text-[#f59e0b] transition-colors hover:bg-[rgba(245,158,11,0.06)]"
              >
                <Square className="h-3 w-3" />
                停止
              </button>
            ) : (
              <button
                onClick={startAuto}
                disabled={!runState}
                className="flex items-center gap-1 rounded-full border border-[rgba(0,245,212,0.15)] px-3 py-1.5 text-[11px] font-mono text-[#8a92a3] transition-colors hover:bg-[rgba(0,245,212,0.04)] disabled:opacity-40"
              >
                <Play className="h-3 w-3" />
                自动运行
              </button>
            )}
          </div>

          {runState && (
            <div className="rounded-2xl border border-[rgba(67,97,238,0.1)] bg-[rgba(6,22,42,0.8)] p-4 text-[11px]">
              <div className="mb-2 text-[10px] font-mono tracking-[0.18em] text-[#8a92a3]">状态（State）</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#8a92a3]">迭代（Iteration）</span>
                  <span className="font-mono text-[#d0d4dc]">{runState.iteration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a92a3]">
                    {tab === 'multi' && multiMode === 'weighted' ? '当前最佳线性组合分数' : '当前最佳观测分数'}
                  </span>
                  <span className="font-mono text-[#00f5d4]">{runState.bestY.toFixed(4)}</span>
                </div>
                {tab === 'multi' && (
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">Pareto 点数</span>
                    <span className="font-mono text-[#d0d4dc]">{runState.paretoPoints.length}</span>
                  </div>
                )}
              </div>
              {runState.nextReason && (
                <div className="mt-3 border-t border-[rgba(67,97,238,0.1)] pt-3">
                  <div className="mb-1 text-[10px] font-mono tracking-[0.18em] text-[#8a92a3]">推荐原因（Selection Reason）</div>
                  <p className="leading-5 text-[#8a92a3]">{runState.nextReason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {!runState ? (
            <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-[rgba(67,97,238,0.15)] text-[11px] text-[#8a92a3]">
              点击“重置”初始化 GP-BO 实验台（GP-BO Lab）。
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex h-80 items-center justify-center text-[11px] text-[#8a92a3]">
                  图表加载中……
                </div>
              }
            >
              <PlotsView
                tab={tab}
                runState={runState}
                optimDir={effectiveDir}
                acqFn={acqFn}
                multiMode={multiMode}
                weights={{ branin: weightBranin, currin: weightCurrin }}
                paretoRef={[paretoRefBranin, paretoRefCurrin]}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

function PlotsView({
  tab,
  runState,
  optimDir,
  acqFn,
  multiMode,
  weights,
  paretoRef,
}: {
  tab: TabId;
  runState: RunState;
  optimDir: OptimDir;
  acqFn: AcqFn;
  multiMode: MultiObjectiveMode;
  weights: { branin: number; currin: number };
  paretoRef: [number, number];
}) {
  if (tab === '1d' && runState.gpData) return <OneDPlots runState={runState} />;
  if (tab === '2d' && runState.contData) return <TwoDPlots runState={runState} optimDir={optimDir} />;
  if (tab === 'multi') {
    return (
      <MultiObjPlots
        runState={runState}
        acqFn={acqFn}
        mode={multiMode}
        weights={weights}
        paretoRef={paretoRef}
      />
    );
  }
  return <div className="text-[11px] text-[#8a92a3]">暂无可用图表数据。</div>;
}

function OneDPlots({ runState }: { runState: RunState }) {
  const gpData = runState.gpData!;
  const acqData = runState.acqData!;
  const xs = gpData.x.map((point) => point[0]);

  const trueTrace = {
    x: xs,
    y: gpData.x.map((point) => forrester(point[0])),
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: '真实函数',
    line: { color: '#00f5d4', width: 2 },
  };
  const meanTrace = {
    x: xs,
    y: gpData.mean,
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: 'GP 均值',
    line: { color: '#4361ee', width: 1.5, dash: 'dash' as const },
  };
  const ciTrace = {
    x: [...xs, ...xs.slice().reverse()],
    y: [
      ...gpData.mean.map((mean, i) => mean + 2 * gpData.std[i]),
      ...gpData.mean.map((mean, i) => mean - 2 * gpData.std[i]).reverse(),
    ],
    type: 'scatter' as const,
    mode: 'lines' as const,
    fill: 'toself' as const,
    fillcolor: 'rgba(67,97,238,0.12)',
    line: { width: 0 },
    name: '95% 置信带',
  };
  const samplesTrace = {
    x: runState.X.map((point) => point[0]),
    y: runState.y,
    type: 'scatter' as const,
    mode: 'markers' as const,
    name: '采样点',
    marker: { color: '#fee440', size: 8, symbol: 'circle-open' },
  };
  const nextTrace = runState.nextX
    ? {
        x: [runState.nextX[0]],
        y: [0],
        type: 'scatter' as const,
        mode: 'markers' as const,
        name: '下一推荐点',
        marker: { color: '#ff6b6b', size: 12, symbol: 'triangle-down' },
      }
    : null;

  const mainLayout = {
    title: { text: '1D 后验（posterior）与采样点', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: 'x', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: 'f(x)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 320,
    legend: { x: 0.01, y: 0.99, font: { size: 9 } },
  };

  const acqTrace = {
    x: acqData.x,
    y: acqData.y,
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: '采集函数',
    line: { color: '#f59e0b', width: 1.5 },
  };
  const acqLayout = {
    title: { text: '采集函数值（Acquisition Value）', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: 'x', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 210,
    showlegend: false,
  };

  return (
    <div>
      <Plot
        data={[trueTrace, meanTrace, ciTrace, samplesTrace, nextTrace].filter(Boolean) as any[]}
        layout={mainLayout}
        useResizeHandler
        style={{ width: '100%' }}
      />
      <Plot data={[acqTrace]} layout={acqLayout} useResizeHandler style={{ width: '100%' }} />
    </div>
  );
}

function TwoDPlots({ runState, optimDir }: { runState: RunState; optimDir: OptimDir }) {
  const contourData = runState.contData!;
  const contourTrace = {
    x: contourData.x,
    y: contourData.y,
    z: contourData.z,
    type: 'contour' as const,
    name: 'Branin',
    colorscale: [[0, '#06162a'], [0.4, '#4361ee'], [0.7, '#00f5d4'], [1, '#fee440']],
    contours: { coloring: 'heatmap' as const },
    showscale: false,
  };
  const sampleTrace = {
    x: runState.X.map((point) => point[0]),
    y: runState.X.map((point) => point[1]),
    type: 'scatter' as const,
    mode: 'markers+lines' as const,
    name: '搜索轨迹',
    marker: {
      color: runState.X.map((_, i) => (i === runState.X.length - 1 ? '#ff6b6b' : '#fee440')),
      size: 6,
    },
    line: { color: 'rgba(255,107,107,0.35)', width: 1 },
  };
  const bestTrace = {
    x: [runState.bestX[0]],
    y: [runState.bestX[1]],
    type: 'scatter' as const,
    mode: 'markers' as const,
    name: '当前最优点',
    marker: { color: '#00f5d4', size: 10, symbol: 'star' },
  };
  const nextTrace = runState.nextX
    ? {
        x: [runState.nextX[0]],
        y: [runState.nextX[1]],
        type: 'scatter' as const,
        mode: 'markers' as const,
        name: '下一推荐点',
        marker: { color: '#ff6b6b', size: 10, symbol: 'x' },
      }
    : null;

  const layout = {
    title: { text: 'Branin 上的 2D 搜索轨迹', font: { color: '#d0d4dc', size: 12 } },
    xaxis: {
      title: { text: 'x1', font: { color: '#8a92a3' } },
      range: [-5, 10],
      gridcolor: 'rgba(67,97,238,0.08)',
      color: '#8a92a3',
    },
    yaxis: {
      title: { text: 'x2', font: { color: '#8a92a3' } },
      range: [0, 15],
      gridcolor: 'rgba(67,97,238,0.08)',
      color: '#8a92a3',
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 380,
    legend: { x: 0.01, y: 0.99, font: { size: 9 } },
  };

  const bestHistory = runState.y.map((_, i) => {
    const slice = runState.y.slice(0, i + 1);
    return optimDir === 'min' ? Math.min(...slice) : Math.max(...slice);
  });
  const bestHistoryTrace = {
    x: bestHistory.map((_, i) => i + 1),
    y: bestHistory,
    type: 'scatter' as const,
    mode: 'lines+markers' as const,
    name: '当前最佳值',
    line: { color: '#00f5d4', width: 1.5 },
    marker: { color: '#00f5d4', size: 4 },
  };
  const historyLayout = {
    title: { text: '当前最佳值 vs 迭代', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '迭代（Iteration）', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: '目标值（Objective）', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 190,
    showlegend: false,
  };

  return (
    <div>
      <Plot
        data={[contourTrace, sampleTrace, bestTrace, nextTrace].filter(Boolean) as any[]}
        layout={layout}
        useResizeHandler
        style={{ width: '100%' }}
      />
      <Plot data={[bestHistoryTrace]} layout={historyLayout} useResizeHandler style={{ width: '100%' }} />
    </div>
  );
}

function MultiObjPlots({
  runState,
  acqFn,
  mode,
  weights,
  paretoRef,
}: {
  runState: RunState;
  acqFn: AcqFn;
  mode: MultiObjectiveMode;
  weights: { branin: number; currin: number };
  paretoRef: [number, number];
}) {
  const objPoints = runState.moObs || [];
  const pareto = paretoFront(runState.X.map((x, i) => ({ x, objectives: objPoints[i] || [0, 0] })));
  const sortedPareto = [...pareto].sort((a, b) => a.objectives[0] - b.objectives[0]);
  const bestScalarIdx =
    runState.y.length > 0 ? runState.y.reduce((best, _, i) => (runState.y[i] < runState.y[best] ? i : best), 0) : -1;

  const scatterTrace = {
    x: objPoints.map((objectives) => objectives[0]),
    y: objPoints.map((objectives) => objectives[1]),
    type: 'scatter' as const,
    mode: 'markers' as const,
    name: '全部观测',
    marker: { color: '#8a92a3', size: 5, opacity: 0.65 },
  };
  const paretoTrace = sortedPareto.length > 0
    ? {
        x: sortedPareto.map((point) => point.objectives[0]),
        y: sortedPareto.map((point) => point.objectives[1]),
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        name: 'Pareto 前沿',
        line: { color: '#00f5d4', width: 2 },
        marker: { color: '#00f5d4', size: 6 },
      }
    : null;
  const weightedBestTrace = mode === 'weighted' && bestScalarIdx >= 0
    ? {
        x: [objPoints[bestScalarIdx][0]],
        y: [objPoints[bestScalarIdx][1]],
        type: 'scatter' as const,
        mode: 'markers' as const,
        name: '最佳线性组合点',
        marker: { color: '#fee440', size: 11, symbol: 'star' },
      }
    : null;
  const latestTrace = mode === 'pareto' && objPoints.length > 0
    ? {
        x: [objPoints[objPoints.length - 1][0]],
        y: [objPoints[objPoints.length - 1][1]],
        type: 'scatter' as const,
        mode: 'markers' as const,
        name: '最新推荐点',
        marker: { color: '#ff6b6b', size: 10, symbol: 'x' },
      }
    : null;
  const refTrace = mode === 'pareto'
    ? {
        x: [paretoRef[0]],
        y: [paretoRef[1]],
        type: 'scatter' as const,
        mode: 'markers' as const,
        name: '参考点',
        marker: { color: '#f59e0b', size: 9, symbol: 'diamond' },
      }
    : null;

  const objectiveLayout = {
    title: {
      text: mode === 'weighted' ? '目标空间：最佳线性组合点' : '目标空间：Pareto 前沿',
      font: { color: '#d0d4dc', size: 12 },
    },
    xaxis: { title: { text: 'Branin（最小化）', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: 'Currin（最小化）', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 340,
    legend: { x: 0.01, y: 0.99, font: { size: 9 } },
  };

  const lowerTrace =
    mode === 'pareto'
      ? {
          x: runState.hvHistory.map((_, i) => i + 1),
          y: runState.hvHistory,
          type: 'scatter' as const,
          mode: 'lines+markers' as const,
          name: 'Hypervolume',
          line: { color: '#00f5d4', width: 1.5 },
          marker: { color: '#00f5d4', size: 4 },
        }
      : {
          x: runState.y.map((_, i) => i + 1),
          y: runState.y.map((_, i) => Math.min(...runState.y.slice(0, i + 1))),
          type: 'scatter' as const,
          mode: 'lines+markers' as const,
          name: '最佳线性组合分数',
          line: { color: '#fee440', width: 1.5 },
          marker: { color: '#fee440', size: 4 },
        };

  const lowerLayout = {
    title: {
      text: mode === 'pareto' ? 'Hypervolume vs 迭代' : '最佳线性组合分数 vs 迭代',
      font: { color: '#d0d4dc', size: 12 },
    },
    xaxis: { title: { text: '迭代（Iteration）', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 190,
    showlegend: false,
  };

  return (
    <div>
      <Plot
        data={[scatterTrace, paretoTrace, weightedBestTrace, latestTrace, refTrace].filter(Boolean) as any[]}
        layout={objectiveLayout}
        useResizeHandler
        style={{ width: '100%' }}
      />
      <Plot data={[lowerTrace]} layout={lowerLayout} useResizeHandler style={{ width: '100%' }} />
      <div className="mt-2 rounded-2xl border border-[rgba(67,97,238,0.1)] bg-[rgba(6,22,42,0.8)] p-4 text-[11px] text-[#8a92a3]">
        {mode === 'weighted' ? (
          <p className="leading-6">
            这一模式会把两个目标压缩为一个归一化分数：
            {' '}
            <span className="font-mono text-[#d0d4dc]">w_b={weights.branin.toFixed(2)}</span>
            {' '}
            and
            {' '}
            <span className="font-mono text-[#d0d4dc]">w_c={weights.currin.toFixed(2)}</span>.
            GP 与采集函数优化的是这个标量分数，但图中仍然保留完整的目标空间，便于理解它到底牺牲了什么。
          </p>
        ) : (
          <div className="space-y-3">
            <p className="leading-6">
              这一教学实现使用随机标量化（random scalarization）来模拟 ParEGO 的逻辑，并用 hypervolume 评价前沿质量。当前参考点（reference point）是
              {' '}
              <span className="font-mono text-[#d0d4dc]">({paretoRef[0]}, {paretoRef[1]})</span>.
              。当前标量化子问题里使用的采集函数（acquisition function）是
              {' '}
              <span className="font-mono text-[#d0d4dc]">{acqFn}</span>.
            </p>
            <button
              onClick={() => exportParetoFrontCsv(pareto)}
              disabled={pareto.length === 0}
              className="rounded-full border border-[rgba(0,245,212,0.24)] px-3 py-1.5 text-[11px] font-mono text-[#00f5d4] transition-colors hover:bg-[rgba(0,245,212,0.08)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              导出 Pareto 前沿 CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function computeVisData(
  state: RunState,
  gp: GaussianProcess,
  tab: TabId,
  acqFn: AcqFn,
  optimDir: OptimDir,
  ucbBeta: number,
  domain: [number, number][],
) {
  const yBest = state.bestY;
  if (tab === '1d') {
    const gridSize = 200;
    const xs: number[][] = [];
    for (let i = 0; i < gridSize; i++) {
      xs.push([domain[0][0] + (i / (gridSize - 1)) * (domain[0][1] - domain[0][0])]);
    }

    const means: number[] = [];
    const stds: number[] = [];
    const acqVals: number[] = [];
    for (const point of xs) {
      const pred = gp.predict(point);
      means.push(pred.mean);
      stds.push(pred.std);
      let acquisitionValue: number;
      switch (acqFn) {
        case 'EI':
          acquisitionValue = eiAcq(pred.mean, pred.std, yBest, optimDir);
          break;
        case 'UCB':
          acquisitionValue = ucbAcq(pred.mean, pred.std, ucbBeta, optimDir);
          break;
        case 'PI':
          acquisitionValue = piAcq(pred.mean, pred.std, yBest, optimDir);
          break;
        default:
          acquisitionValue = uniformBORandom();
      }
      acqVals.push(Math.abs(acquisitionValue) < 1e-9 ? 0 : acquisitionValue);
    }

    state.gpData = { x: xs.map((point) => [point[0]]), mean: means, std: stds };
    state.acqData = { x: xs.map((point) => point[0]), y: acqVals };
  }

  if (tab === '2d' || tab === 'multi') {
    const resolution = 40;
    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[][] = [];
    for (let i = 0; i < resolution; i++) {
      const row: number[] = [];
      for (let j = 0; j < resolution; j++) {
        const x1 = domain[0][0] + (i / (resolution - 1)) * (domain[0][1] - domain[0][0]);
        const x2 = domain[1][0] + (j / (resolution - 1)) * (domain[1][1] - domain[1][0]);
        if (i === 0) ys.push(x2);
        row.push(branin(x1, x2));
      }
      xs.push(domain[0][0] + (i / (resolution - 1)) * (domain[0][1] - domain[0][0]));
      zs.push(row);
    }
    state.contData = { x: xs, y: ys, z: zs };
  }
}

function buildReason(
  acqFn: AcqFn,
  mean: number,
  std: number,
  bestY: number,
  iter: number,
  dir: OptimDir,
  tab: TabId,
  multiMode: MultiObjectiveMode,
): string {
  if (tab === 'multi' && multiMode === 'weighted') {
    return `当前 GP 正在优化一个标量化目标。${acqFn} 选择了预测分数为 ${mean.toFixed(3)}、不确定度为 ${std.toFixed(3)} 的点。`;
  }
  if (tab === 'multi' && multiMode === 'pareto') {
    return `当前闭环先从标量化子问题中采样，再更新 Pareto 前沿。${acqFn} 选择了预测标量分数为 ${mean.toFixed(3)}、不确定度为 ${std.toFixed(3)} 的点。`;
  }
  if (iter <= 3) {
    return `当前处于早期探索阶段：可用观测点很少，GP 仍然高度不确定，因此 ${acqFn} 主要受先验形状影响。`;
  }
  const isBetter = dir === 'min' ? mean < bestY : mean > bestY;
  if (acqFn === 'EI' && isBetter) {
    return `EI 正在利用一个区域：该区域的预测均值 ${mean.toFixed(3)} 已优于当前最佳值 ${bestY.toFixed(3)}。`;
  }
  if (acqFn === 'UCB' && std > 2) {
    return `UCB 正在偏向不确定区域：sigma=${std.toFixed(2)} 足够高，因此值得继续探索。`;
  }
  return `${acqFn} 正在 ${dir === 'min' ? '最小化' : '最大化'} 目标下平衡预测值 ${mean.toFixed(3)} 与不确定度 ${std.toFixed(3)}。`;
}
