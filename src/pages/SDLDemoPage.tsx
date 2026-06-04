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
import { forrester, FORRESTER_DOMAIN, branin, BRANIN_DOMAIN, braninCurrinObj1, braninCurrinObj2 } from '@/lib/benchmarks';
import { paretoFront, hypervolume2D, scalarizeRandom, type ParetoPoint } from '@/lib/multiObjective';

const Plot = lazy(() => import('react-plotly.js'));

// ============================================================
// Types
// ============================================================

type TabId = '1d' | '2d' | 'multi';
type AcqFn = 'EI' | 'UCB' | 'PI' | 'Random';
type InitDesign = 'random' | 'lhs';
type OptimDir = 'min' | 'max';

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
  moObs: number[][] | null;
}

// ============================================================
// Math helpers
// ============================================================

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

/**
 * EI (Expected Improvement).
 * Defined for MAXIMIZATION: EI = E[max(0, f - yBest)].
 *
 * For minimization, we pass effective values:
 *   effMean = -mu, effBest = -bestY
 * which gives EI on negated objective = correct min-direction EI.
 */
function eiAcq(mu: number, sigma: number, yBest: number, dir: OptimDir): number {
  const effMu = dir === 'min' ? -mu : mu;
  const effBest = dir === 'min' ? -yBest : yBest;
  return expectedImprovement(effMu, sigma, effBest);
}

/**
 * PI (Probability of Improvement).
 * Defined for MAXIMIZATION: P(f > yBest + xi).
 * Same negation logic as EI for minimization.
 */
function piAcq(mu: number, sigma: number, yBest: number, dir: OptimDir, xi: number = 0.01): number {
  const effMu = dir === 'min' ? -mu : mu;
  const effBest = dir === 'min' ? -yBest : yBest;
  if (sigma < 1e-9) return 0;
  return normalCDF((effMu - effBest - xi) / sigma);
}

/**
 * UCB (Upper Confidence Bound).
 * Defined for MAXIMIZATION: UCB = mu + beta * sigma.
 * For minimization, we want to minimize, so: acq = -(mu - beta * sigma) = -mu + beta * sigma.
 * Since we always maximize acquisition, this correctly directs search toward low-mu, high-sigma regions.
 */
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

// ============================================================
// Tabs
// ============================================================

const TABS: { id: TabId; label: string; desc: string }[] = [
  { id: '1d', label: '1D 单目标', desc: 'Forrester — 代理模型 / 不确定度 / 采集函数' },
  { id: '2d', label: '2D 单目标', desc: 'Branin-Hoo — 全局搜索 / 探索与利用' },
  { id: 'multi', label: '2D 双目标', desc: 'Branin-Currin — Pareto front / 多目标权衡' },
];

// ================================================================
// Page
// ================================================================

export default function SDLDemoPage() {
  const [tab, setTab] = useState<TabId>('1d');
  const [acqFn, setAcqFn] = useState<AcqFn>('EI');
  const [optimDir, setOptimDir] = useState<OptimDir>('min');
  const [initDesign, setInitDesign] = useState<InitDesign>('lhs');
  const [nInit, setNInit] = useState(3);
  const [noise, setNoise] = useState(0.0);
  const [seedVal, setSeedVal] = useState(42);
  const [ucbBeta, setUcbBeta] = useState(2.0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);

  const [runState, setRunState] = useState<RunState | null>(null);
  const gpRef = useRef<GaussianProcess | null>(null);
  const autoRef = useRef<boolean>(false);

  // Multi-obj is always minimization — lock UI
  const effectiveDir: OptimDir = tab === 'multi' ? 'min' : optimDir;

  // Cleanup auto on unmount
  useEffect(() => {
    return () => { autoRef.current = false; };
  }, []);

  // ================================================================
  // Reset / Init
  // ================================================================
  const doReset = useCallback(() => {
    autoRef.current = false;
    setAutoRunning(false);
    setBORngSeed(seedVal);

    const gp = new GaussianProcess(0.3, 1.0, noise > 0 ? noise : 1e-5);
    gpRef.current = gp;

    const rng = mulberry32(seedVal);
    const domain = tab === '1d' ? [FORRESTER_DOMAIN] : BRANIN_DOMAIN;
    const dims = domain.length;

    let initX: number[][];
    if (initDesign === 'lhs') {
      initX = lhsSample(nInit, dims, domain, rng);
    } else {
      initX = [];
      for (let i = 0; i < nInit; i++) {
        const pt = domain.map((d) => d[0] + rng() * (d[1] - d[0]));
        initX.push(pt);
      }
    }

    let initY: number[];
    let initMOObs: number[][] | null = null;

    if (tab === 'multi') {
      initMOObs = initX.map((x) => [braninCurrinObj1(x[0], x[1]), braninCurrinObj2(x[0], x[1])]);
      initY = initMOObs.map((obs, idx) => {
        const { scalarized } = scalarizeRandom(obs, seedVal + idx);
        return scalarized;
      });
    } else {
      const fn = tab === '1d' ? (x: number[]) => forrester(x[0]) : (x: number[]) => branin(x[0], x[1]);
      initY = initX.map((x) => fn(x) + (noise > 0 ? gaussianRandom(0, noise) : 0));
    }

    gp.fit(initX, initY);

    const bestIdx = initY.reduce((best, _, i) =>
      (effectiveDir === 'min' ? initY[i] < initY[best] : initY[i] > initY[best]) ? i : best, 0);

    const state: RunState = {
      iteration: nInit,
      X: initX, y: initY,
      bestY: initY[bestIdx], bestX: initX[bestIdx],
      nextX: null, nextReason: '',
      gpData: null, acqData: null, contData: null,
      paretoPoints: initMOObs ? initX.map((x, i) => ({ x, objectives: initMOObs![i] })) : [],
      hvHistory: [], moObs: initMOObs,
    };

    computeVisData(state, gp, tab, acqFn, effectiveDir, ucbBeta, domain);
    setRunState({ ...state });
  }, [seedVal, tab, acqFn, effectiveDir, nInit, initDesign, noise, ucbBeta]);

  // ================================================================
  // Run one step (core logic)
  // ================================================================
  const executeOneStep = useCallback((state: RunState) => {
    const gp = gpRef.current;
    if (!gp || !state) return state;

    const domain = tab === '1d' ? [FORRESTER_DOMAIN] : BRANIN_DOMAIN;
    const nCandidates = 500;
    const candidates: number[][] = [];
    for (let i = 0; i < nCandidates; i++) {
      candidates.push(domain.map((d) => uniformBORandom() * (d[1] - d[0]) + d[0]));
    }

    // Always maximize acquisition value
    let bestAcqVal = -Infinity;
    let bestCandidate = candidates[0];
    let bestMean = 0, bestStd = 0;

    const yBestIdx = state.y.reduce((b, y, i) =>
      (effectiveDir === 'min' ? y < state.y[b] : y > state.y[b]) ? i : b, 0);
    const yBest = state.y[yBestIdx];

    for (const cand of candidates) {
      const pred = gp.predict(cand);
      let acqVal: number;
      switch (acqFn) {
        case 'EI':   acqVal = eiAcq(pred.mean, pred.std, yBest, effectiveDir); break;
        case 'UCB':  acqVal = ucbAcq(pred.mean, pred.std, ucbBeta, effectiveDir); break;
        case 'PI':   acqVal = piAcq(pred.mean, pred.std, yBest, effectiveDir); break;
        default:     acqVal = uniformBORandom(); break;
      }
      if (acqVal > bestAcqVal) {
        bestAcqVal = acqVal;
        bestCandidate = cand;
        bestMean = pred.mean;
        bestStd = pred.std;
      }
    }

    // Evaluate
    let obs: number;
    if (tab === 'multi') {
      const o1 = braninCurrinObj1(bestCandidate[0], bestCandidate[1]);
      const o2 = braninCurrinObj2(bestCandidate[0], bestCandidate[1]);
      const { scalarized } = scalarizeRandom([o1, o2], seedVal + state.iteration);
      obs = scalarized;
      const newMOObs = [...(state.moObs || []), [o1, o2]];
      state.moObs = newMOObs;
      state.paretoPoints = paretoFront(state.X.map((x, i) => ({ x, objectives: newMOObs[i] })));
      const pf = state.paretoPoints.map((p) => p.objectives);
      state.hvHistory.push(hypervolume2D(pf, [400, 20]));
    } else {
      const fn = tab === '1d' ? (x: number[]) => forrester(x[0]) : (x: number[]) => branin(x[0], x[1]);
      obs = fn(bestCandidate) + (noise > 0 ? gaussianRandom(0, noise) : 0);
    }

    state.X.push(bestCandidate);
    state.y.push(obs);
    state.iteration++;

    const newBest = effectiveDir === 'min'
      ? Math.min(state.bestY, obs) : Math.max(state.bestY, obs);
    if (newBest !== state.bestY) { state.bestY = obs; state.bestX = bestCandidate; }

    state.nextX = bestCandidate;
    state.nextReason = buildReason(acqFn, bestMean, bestStd, yBest, state.iteration, effectiveDir);
    gp.fit(state.X, state.y);
    computeVisData(state, gp, tab, acqFn, effectiveDir, ucbBeta, domain);
    return state;
  }, [tab, acqFn, effectiveDir, ucbBeta, noise, seedVal]);

  // ================================================================
  // User actions
  // ================================================================
  const runOne = useCallback(() => {
    if (!runState) return;
    const next = executeOneStep({ ...runState, X: [...runState.X], y: [...runState.y], moObs: runState.moObs ? [...runState.moObs] : null, paretoPoints: [...runState.paretoPoints], hvHistory: [...runState.hvHistory] });
    setRunState({ ...next! });
  }, [runState, executeOneStep]);

  const runFive = useCallback(() => {
    if (!runState) return;
    let s = { ...runState, X: [...runState.X], y: [...runState.y], moObs: runState.moObs ? [...runState.moObs] : null, paretoPoints: [...runState.paretoPoints], hvHistory: [...runState.hvHistory] };
    for (let i = 0; i < 5; i++) {
      const next = executeOneStep(s);
      if (!next) break;
      s = next;
    }
    setRunState({ ...s });
  }, [runState, executeOneStep]);

  const startAuto = useCallback(() => {
    if (!runState) return;
    autoRef.current = true;
    setAutoRunning(true);
    let s = { ...runState, X: [...runState.X], y: [...runState.y], moObs: runState.moObs ? [...runState.moObs] : null, paretoPoints: [...runState.paretoPoints], hvHistory: [...runState.hvHistory] };
    const loop = () => {
      if (!autoRef.current) { setAutoRunning(false); return; }
      const next = executeOneStep(s);
      if (!next) { setAutoRunning(false); return; }
      s = next;
      setRunState({ ...s });
      setTimeout(loop, 400);
    };
    loop();
  }, [runState, executeOneStep]);

  const stopAuto = useCallback(() => {
    autoRef.current = false;
    setAutoRunning(false);
  }, []);

  // ================================================================
  // Render
  // ================================================================
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">SDL 演示</div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Benchmark Lab</h1>
      <p className="text-[#8a92a3] text-sm mb-6">数学基准实验台 — 直观展示贝叶斯优化的代理模型、不确定度与采集函数机制</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setRunState(null); }}
            className={`px-4 py-2 rounded text-xs font-mono transition-colors ${
              tab === t.id ? 'bg-[rgba(0,245,212,0.12)] text-[#00f5d4] border border-[rgba(0,245,212,0.3)]' : 'text-[#8a92a3] border border-[rgba(67,97,238,0.1)] hover:border-[rgba(0,245,212,0.2)]'
            }`}>
            {t.label}
            <span className="block text-[9px] text-[#5a6377] mt-0.5">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Controls + Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Control panel */}
        <div className="lg:col-span-1 space-y-3">
          <div className="p-3 rounded-lg border border-[rgba(67,97,238,0.15)]" style={{ background: 'rgba(6,22,42,0.8)' }}>
            <div className="text-[10px] text-[#8a92a3] font-mono mb-2">控制面板</div>
            <div className="space-y-2">
              {/* Surrogate model — honest GP-only */}
              <div>
                <label className="text-[9px] text-[#8a92a3]">代理模型</label>
                <select disabled
                  className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.04)] text-[#5a6377] border border-[rgba(67,97,238,0.08)] cursor-not-allowed">
                  <option>Gaussian Process (GP)</option>
                </select>
                <div className="text-[8px] text-[#5a6377] mt-0.5">当前版本仅支持 GP。Random Forest 计划后续提供。</div>
              </div>

              <div>
                <label className="text-[9px] text-[#8a92a3]">采集函数</label>
                <select value={acqFn} onChange={(e) => setAcqFn(e.target.value as AcqFn)}
                  className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]">
                  <option value="EI">EI (Expected Improvement)</option>
                  <option value="UCB">UCB (Upper Conf Bound)</option>
                  <option value="PI">PI (Prob Improvement)</option>
                  <option value="Random">Random baseline</option>
                </select>
              </div>

              {tab === 'multi' ? (
                <div className="p-2 rounded border border-[rgba(255,107,107,0.1)] text-[9px] text-[#f59e0b] leading-relaxed">
                  多目标模式下方向锁定为<b>最小化</b>。Branin-Currin 两个目标均越小越好。
                </div>
              ) : (
                <div>
                  <label className="text-[9px] text-[#8a92a3]">优化方向</label>
                  <select value={optimDir} onChange={(e) => setOptimDir(e.target.value as OptimDir)}
                    className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]">
                    <option value="min">最小化</option>
                    <option value="max">最大化</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-[#8a92a3]">噪声 σ</label>
                  <input type="number" value={noise} onChange={(e) => setNoise(Number(e.target.value))} min={0} max={5} step={0.1}
                    className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-[#8a92a3]">初始点</label>
                  <input type="number" value={nInit} onChange={(e) => setNInit(Number(e.target.value))} min={2} max={20}
                    className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-[#8a92a3]">种子</label>
                <input type="number" value={seedVal} onChange={(e) => setSeedVal(Number(e.target.value))} min={1} max={9999}
                  className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]" />
              </div>

              {/* Advanced */}
              <button onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex items-center gap-1 text-[9px] text-[#8a92a3] font-mono hover:text-[#d0d4dc]">
                <Settings className="w-3 h-3" /> 进阶 {advancedOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {advancedOpen && (
                <div className="space-y-2 pt-1 border-t border-[rgba(67,97,238,0.08)]">
                  <div>
                    <label className="text-[9px] text-[#8a92a3]">初始设计</label>
                    <select value={initDesign} onChange={(e) => setInitDesign(e.target.value as InitDesign)}
                      className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]">
                      <option value="lhs">LHS (拉丁超立方)</option>
                      <option value="random">Random (随机)</option>
                    </select>
                  </div>
                  {acqFn === 'UCB' && (
                    <div>
                      <label className="text-[9px] text-[#8a92a3]">UCB β</label>
                      <input type="number" value={ucbBeta} onChange={(e) => setUcbBeta(Number(e.target.value))} min={0.1} max={10} step={0.1}
                        className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Run controls */}
          <div className="flex flex-wrap gap-2">
            <button onClick={doReset} className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(255,107,107,0.2)] text-[#ff6b6b] text-[10px] font-mono hover:bg-[rgba(255,107,107,0.06)]">
              <RotateCcw className="w-3 h-3" /> 重置
            </button>
            <button onClick={runOne} disabled={!runState || autoRunning}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(0,245,212,0.3)] text-[#00f5d4] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.06)] disabled:opacity-40">
              <Play className="w-3 h-3" /> 1 步
            </button>
            <button onClick={runFive} disabled={!runState || autoRunning}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(67,97,238,0.3)] text-[#4361ee] text-[10px] font-mono hover:bg-[rgba(67,97,238,0.06)] disabled:opacity-40">
              <Play className="w-3 h-3" /> 5 步
            </button>
            {autoRunning ? (
              <button onClick={stopAuto}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(245,158,11,0.3)] text-[#f59e0b] text-[10px] font-mono hover:bg-[rgba(245,158,11,0.06)]">
                <Square className="w-3 h-3" /> 停止
              </button>
            ) : (
              <button onClick={startAuto} disabled={!runState}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(0,245,212,0.15)] text-[#8a92a3] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.04)] disabled:opacity-40">
                <Play className="w-3 h-3" /> Auto
              </button>
            )}
          </div>

          {/* Info */}
          {runState && (
            <div className="p-3 rounded-lg border border-[rgba(67,97,238,0.1)] text-[10px] space-y-1" style={{ background: 'rgba(6,22,42,0.8)' }}>
              <div className="text-[#8a92a3] font-mono">状态</div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">迭代</span><span className="text-[#d0d4dc] font-mono">{runState.iteration}</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">当前最佳</span><span className="text-[#00f5d4] font-mono">{runState.bestY.toFixed(4)}</span></div>
              {runState.nextReason && (
                <div className="mt-2 pt-2 border-t border-[rgba(67,97,238,0.1)]">
                  <div className="text-[#8a92a3] font-mono mb-1">推荐依据</div>
                  <p className="text-[#8a92a3] leading-relaxed">{runState.nextReason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Viz */}
        <div className="lg:col-span-3">
          {!runState ? (
            <div className="flex items-center justify-center h-80 border border-dashed border-[rgba(67,97,238,0.15)] rounded-lg text-[10px] text-[#8a92a3]">
              点击「重置」加载 benchmark，然后使用控制按钮观察 BO 迭代
            </div>
          ) : (
            <Suspense fallback={<div className="h-80 flex items-center justify-center text-[10px] text-[#8a92a3]">加载图表…</div>}>
              <PlotsView tab={tab} runState={runState} _optimDir={effectiveDir} acqFn={acqFn} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Plots
// ================================================================

function PlotsView({ tab, runState, _optimDir, acqFn }: { tab: TabId; runState: RunState; _optimDir: OptimDir; acqFn: AcqFn }) {
  if (tab === '1d' && runState.gpData) return <OneDPlots runState={runState} />;
  if (tab === '2d' && runState.contData) return <TwoDPlots runState={runState} _optimDir={_optimDir} />;
  if (tab === 'multi') return <MultiObjPlots runState={runState} acqFn={acqFn} />;
  return <div className="text-[10px] text-[#8a92a3]">图表数据尚未生成</div>;
}

function OneDPlots({ runState }: { runState: RunState }) {
  const gd = runState.gpData!;
  const ad = runState.acqData!;
  const xs = gd.x.map((v) => v[0]);

  const trueTrace = { x: xs, y: gd.x.map((_, i) => forrester(gd.x[i][0])), type: 'scatter' as const, mode: 'lines' as const, name: '真实函数', line: { color: '#00f5d4', width: 2 } };
  const meanTrace = { x: xs, y: gd.mean, type: 'scatter' as const, mode: 'lines' as const, name: 'GP 均值', line: { color: '#4361ee', width: 1.5, dash: 'dash' as const } };
  const ciFill = { x: [...xs, ...xs.reverse()], y: [...gd.mean.map((m, i) => m + 2 * gd.std[i]), ...gd.mean.map((m, i) => m - 2 * gd.std[i]).reverse()], type: 'scatter' as const, mode: 'lines' as const, fill: 'toself' as const, fillcolor: 'rgba(67,97,238,0.12)', line: { width: 0 }, name: '±2σ 置信', showlegend: true };
  const sampTrace = { x: runState.X.map((x) => x[0]), y: runState.y, type: 'scatter' as const, mode: 'markers' as const, name: '采样点', marker: { color: '#fee440', size: 8, symbol: 'circle-open' } };
  const nextTrace = runState.nextX ? { x: [runState.nextX[0]], y: [0], type: 'scatter' as const, mode: 'markers' as const, name: '下一推荐', marker: { color: '#ff6b6b', size: 12, symbol: 'triangle-down' } } : null;
  const mainData = [trueTrace, meanTrace, ciFill, sampTrace, nextTrace].filter(Boolean) as any[];
  const mainLayout = { title: { text: '代理模型与采样', font: { color: '#d0d4dc', size: 12 } }, xaxis: { title: { text: 'x', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, yaxis: { title: { text: 'f(x)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)', font: { color: '#8a92a3', size: 10 }, margin: { t: 30, r: 10, b: 40, l: 50 }, height: 300, legend: { x: 0.01, y: 0.99, font: { size: 9 } }, showlegend: true };
  const acqTrace = { x: xs, y: ad.y, type: 'scatter' as const, mode: 'lines' as const, name: '采集函数', line: { color: '#f59e0b', width: 1.5 } };
  const acqLayout = { title: { text: '采集函数', font: { color: '#d0d4dc', size: 12 } }, xaxis: { title: { text: 'x', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, yaxis: { gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)', font: { color: '#8a92a3', size: 10 }, margin: { t: 30, r: 10, b: 40, l: 50 }, height: 200, showlegend: false };
  return (<div><Plot data={mainData} layout={mainLayout} useResizeHandler style={{ width: '100%' }} /><Plot data={[acqTrace]} layout={acqLayout} useResizeHandler style={{ width: '100%' }} /></div>);
}

function TwoDPlots({ runState, _optimDir }: { runState: RunState; _optimDir: OptimDir }) {
  const optimDir = _optimDir;
  const cd = runState.contData!;
  const contTrace = { x: cd.x, y: cd.y, z: cd.z, type: 'contour' as const, name: 'Branin', colorscale: [[0, '#06162a'], [0.4, '#4361ee'], [0.7, '#00f5d4'], [1, '#fee440']], contours: { coloring: 'heatmap' as const }, showscale: false };
  const sampTrace = { x: runState.X.map((x) => x[0]), y: runState.X.map((x) => x[1]), type: 'scatter' as const, mode: 'markers+lines' as const, name: '采样轨迹', marker: { color: runState.X.map((_, i) => i === runState.X.length - 1 ? '#ff6b6b' : '#fee440'), size: 6 }, line: { color: 'rgba(254,68,0,0.4)', width: 1 } };
  const bestTrace = { x: [runState.bestX[0]], y: [runState.bestX[1]], type: 'scatter' as const, mode: 'markers' as const, name: '当前最佳', marker: { color: '#00f5d4', size: 10, symbol: 'star' } };
  const nextTrace = runState.nextX ? { x: [runState.nextX[0]], y: [runState.nextX[1]], type: 'scatter' as const, mode: 'markers' as const, name: '下一推荐', marker: { color: '#ff6b6b', size: 10, symbol: 'x' } } : null;
  const data = [contTrace, sampTrace, bestTrace, nextTrace].filter(Boolean) as any[];
  const layout = { title: { text: 'Branin-Hoo — 搜索轨迹', font: { color: '#d0d4dc', size: 12 } }, xaxis: { title: { text: 'x₁', font: { color: '#8a92a3' } }, range: [-5, 10], gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, yaxis: { title: { text: 'x₂', font: { color: '#8a92a3' } }, range: [0, 15], gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)', font: { color: '#8a92a3', size: 10 }, margin: { t: 30, r: 10, b: 40, l: 50 }, height: 360, legend: { x: 0.01, y: 0.99, font: { size: 9 } } };
  const bestYData = runState.y.map((_, i) => { const slice = runState.y.slice(0, i + 1); return optimDir === 'min' ? Math.min(...slice) : Math.max(...slice); });
  const bestTrace2 = { x: bestYData.map((_, i) => i + 1), y: bestYData, type: 'scatter' as const, mode: 'lines+markers' as const, name: 'best-so-far', line: { color: '#00f5d4', width: 1.5 }, marker: { size: 4, color: '#00f5d4' } };
  const bestLayout = { title: { text: 'Best-so-far vs 迭代', font: { color: '#d0d4dc', size: 12 } }, xaxis: { title: { text: '迭代', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, yaxis: { title: { text: 'f(x)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)', font: { color: '#8a92a3', size: 10 }, margin: { t: 30, r: 10, b: 40, l: 50 }, height: 180, showlegend: false };
  return (<div><Plot data={data} layout={layout} useResizeHandler style={{ width: '100%' }} /><Plot data={[bestTrace2]} layout={bestLayout} useResizeHandler style={{ width: '100%' }} /></div>);
}

function MultiObjPlots({ runState, acqFn }: { runState: RunState; acqFn: AcqFn }) {
  const objPoints = runState.moObs || [];
  const pf = paretoFront(runState.X.map((x, i) => ({ x, objectives: objPoints[i] || [0, 0] })));
  const pfObjs = pf.map((p) => p.objectives);
  // Sort Pareto points by first objective, keeping (x,y) paired
  const sortedPf = [...pfObjs].sort((a, b) => a[0] - b[0]);

  const scatterTrace = { x: objPoints.map((o) => o[0]), y: objPoints.map((o) => o[1]), type: 'scatter' as const, mode: 'markers' as const, name: '所有观测', marker: { color: '#8a92a3', size: 5, opacity: 0.6 } };
  const pfTrace = sortedPf.length > 0 ? { x: sortedPf.map((o) => o[0]), y: sortedPf.map((o) => o[1]), type: 'scatter' as const, mode: 'lines+markers' as const, name: 'Pareto front', line: { color: '#00f5d4', width: 2 }, marker: { size: 6, color: '#00f5d4' } } : null;
  const lastIdx = objPoints.length - 1;
  const recTrace = lastIdx >= 0 ? { x: [objPoints[lastIdx][0]], y: [objPoints[lastIdx][1]], type: 'scatter' as const, mode: 'markers' as const, name: '最新推荐', marker: { color: '#ff6b6b', size: 10, symbol: 'x' } } : null;
  const objData = [scatterTrace, pfTrace, recTrace].filter(Boolean) as any[];
  const objLayout = { title: { text: '目标空间 — Pareto Front（均最小化）', font: { color: '#d0d4dc', size: 12 } }, xaxis: { title: { text: 'Branin (越小越好)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, yaxis: { title: { text: 'Currin (越小越好)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)', font: { color: '#8a92a3', size: 10 }, margin: { t: 30, r: 10, b: 40, l: 50 }, height: 320, legend: { x: 0.01, y: 0.99, font: { size: 9 } } };

  const hvTrace = runState.hvHistory.length > 0 ? { x: runState.hvHistory.map((_, i) => runState.X.length - runState.hvHistory.length + i + 1), y: runState.hvHistory, type: 'scatter' as const, mode: 'lines+markers' as const, name: 'Hypervolume', line: { color: '#00f5d4', width: 1.5 }, marker: { size: 4, color: '#00f5d4' } } : null;
  const hvLayout = { title: { text: 'Hypervolume vs 迭代', font: { color: '#d0d4dc', size: 12 } }, xaxis: { title: { text: '迭代', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, yaxis: { gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' }, paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)', font: { color: '#8a92a3', size: 10 }, margin: { t: 30, r: 10, b: 40, l: 50 }, height: 180, showlegend: false };

  return (
    <div>
      <Plot data={objData} layout={objLayout} useResizeHandler style={{ width: '100%' }} />
      {hvTrace && <Plot data={[hvTrace]} layout={hvLayout} useResizeHandler style={{ width: '100%' }} />}
      <div className="p-3 mt-2 rounded border border-[rgba(67,97,238,0.1)] text-[10px] text-[#8a92a3] leading-relaxed">
        <strong className="text-[#d0d4dc]">实现方式：</strong>ParEGO 风格随机标量化（Augmented Tchebycheff）。
        每次迭代：随机生成权重 → 标量化为单目标 → 单目标 BO（{acqFn}）→ 更新 Pareto 集。
        <strong>这不是严格的多目标 BO</strong>（如 ParEGO 原论文或 EHVI），而是教学中用于展示
        "标量化 → 单目标推荐 → Pareto 改善"逻辑链的简化实现。
        两个目标均假设<b>最小化</b>。Pareto front 线按第一目标排序后保持真实配对关系绘制。
      </div>
    </div>
  );
}

// ================================================================
// computeVisData — same acquisition fix as execution
// ================================================================

function computeVisData(
  state: RunState, gp: GaussianProcess, tab: TabId, acqFn: AcqFn,
  optimDir: OptimDir, ucbBeta: number, domain: [number, number][],
) {
  const yBest = state.bestY;
  if (tab === '1d') {
    const n = 200;
    const xs: number[][] = [];
    for (let i = 0; i < n; i++) xs.push([domain[0][0] + (i / (n - 1)) * (domain[0][1] - domain[0][0])]);
    const means: number[] = [], stds: number[] = [], acqVals: number[] = [];
    for (const x of xs) {
      const p = gp.predict(x);
      means.push(p.mean); stds.push(p.std);
      let av: number;
      switch (acqFn) {
        case 'EI':  av = eiAcq(p.mean, p.std, yBest, optimDir); break;
        case 'UCB': av = ucbAcq(p.mean, p.std, ucbBeta, optimDir); break;
        case 'PI':  av = piAcq(p.mean, p.std, yBest, optimDir); break;
        default:    av = uniformBORandom(); break;
      }
      acqVals.push(Math.abs(av) < 1e-9 ? 0 : av);
    }
    state.gpData = { x: xs.map((x) => [x[0]]), mean: means, std: stds };
    state.acqData = { x: xs.map((x) => x[0]), y: acqVals };
  }
  if (tab === '2d' || tab === 'multi') {
    const res = 40;
    const xs: number[] = [], ys: number[] = [], zs: number[][] = [];
    for (let i = 0; i < res; i++) {
      const row: number[] = [];
      for (let j = 0; j < res; j++) {
        const x1 = domain[0][0] + (i / (res - 1)) * (domain[0][1] - domain[0][0]);
        const x2 = domain[1][0] + (j / (res - 1)) * (domain[1][1] - domain[1][0]);
        if (i === 0) ys.push(x2);
        row.push(branin(x1, x2));
      }
      xs.push(domain[0][0] + (i / (res - 1)) * (domain[0][1] - domain[0][0]));
      zs.push(row);
    }
    state.contData = { x: xs, y: ys, z: zs };
  }
}

function buildReason(acqFn: AcqFn, mean: number, std: number, bestY: number, iter: number, dir: OptimDir): string {
  if (iter <= 3) return `[初始探索] 仅有少量采样点，GP 的不确定度较高。推荐点基于先验分布和采集函数 ${acqFn} 选择。`;
  const isBetter = dir === 'min' ? mean < bestY : mean > bestY;
  if (acqFn === 'EI' && isBetter) return `[利用] EI 发现该区域预测值 (${mean.toFixed(3)}) 优于当前最佳 (${bestY.toFixed(3)})，且不确定性较低，模型在此"精炼"搜索。`;
  if (acqFn === 'UCB' && std > 2) return `[探索] UCB (β=2.0) 偏向高不确定度区域 (σ=${std.toFixed(2)})。GP 对这片区域了解不足，模型主动"试探"。`;
  return `[平衡] ${acqFn} 在预测均值 (${mean.toFixed(3)}) 和不确定度 (σ=${std.toFixed(2)}) 之间权衡。${dir === 'min' ? '越小越好' : '越大越好'}。`;
}
