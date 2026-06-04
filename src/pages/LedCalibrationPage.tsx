import { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import { Play, RotateCcw, Square } from 'lucide-react';
import {
  GaussianProcess, expectedImprovement, setBORngSeed,
} from '@/lib/bo_engine';
import { WAVELENGTH_GRID, TARGET_SPECTRA, CATEGORY_LABELS, type TargetSpectrum } from '@/data/targetSpectra';
import { FULL_LED_LIBRARY, LED_DISCLAIMER, PHOSPHOR_DISCLAIMER } from '@/data/ledLibrary';
import {
  computeMetrics, bandResponses, SENSOR_BANDS, OPTIMIZER_NOTE,
  mulberry32Rng, type SolutionMetrics,
} from '@/lib/calibrationEngine';

const Plot = lazy(() => import('react-plotly.js'));

type MatchMode = 'spectral' | 'band';
type AcqFn = 'EI' | 'UCB' | 'PI' | 'Random';
const SPECTRA_DISCLAIMER =
  '文献启发教学光谱。基于已发表遥感文献的典型反射率特征手工构建，' +
  '不是 ECOSTRESS/USGS/ASTER 光谱库的原始下载样本。';

// ================================================================
// Helpers (adapted from SDLDemoPage)
// ================================================================

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function eiAcq(mu: number, sigma: number, yBest: number): number {
  return expectedImprovement(-mu, sigma, -yBest); // minimization
}
function ucbAcq(mu: number, sigma: number, beta: number): number {
  return -mu + beta * sigma; // minimization
}
function piAcq(mu: number, sigma: number, yBest: number, xi: number = 0.01): number {
  if (sigma < 1e-9) return 0;
  return normalCDF((-mu - (-yBest) - xi) / sigma);
}

/** Encode channel config into a continuous vector for GP input */
function encodeConfig(enabled: boolean[], weights: number[]): number[] {
  // Use only enabled channels for GP — encode as concatenated weights
  const vec: number[] = [];
  for (let i = 0; i < enabled.length; i++) {
    vec.push(enabled[i] ? 1 : 0);
    vec.push(enabled[i] ? weights[i] : 0);
  }
  return vec;
}

/** Randomly perturb a channel config to generate a candidate */
function perturbConfig(
  enabled: boolean[], weights: number[],
  rng: () => number, channelsLen: number,
): { enabled: boolean[]; weights: number[] } {
  const newEnabled = [...enabled];
  const newWeights = [...weights];
  // 30% chance to toggle one channel
  if (rng() < 0.3) {
    const idx = Math.floor(rng() * channelsLen);
    newEnabled[idx] = !newEnabled[idx];
    if (newEnabled[idx] && newWeights[idx] < 1e-6) newWeights[idx] = rng() * 0.5 + 0.3;
    if (!newEnabled[idx]) newWeights[idx] = 0;
  }
  // Adjust weights for 2 random enabled channels
  for (let t = 0; t < 2; t++) {
    const idx = Math.floor(rng() * channelsLen);
    if (newEnabled[idx]) {
      newWeights[idx] = Math.max(0.05, Math.min(1.5, newWeights[idx] * (0.6 + rng() * 0.8)));
    }
  }
  return { enabled: newEnabled, weights: newWeights };
}

// ================================================================
// Page
// ================================================================

export default function LedCalibrationPage() {
  const [matchMode, setMatchMode] = useState<MatchMode>('spectral');
  const [selectedTarget, setSelectedTarget] = useState<TargetSpectrum>(TARGET_SPECTRA[0]);
  const [seedVal, setSeedVal] = useState(42);
  const [autoRunning, setAutoRunning] = useState(false);
  const [acqFn, setAcqFn] = useState<AcqFn>('EI');
  const [ucbBeta, setUcbBeta] = useState(2.0);
  const [usePhosphor, setUsePhosphor] = useState(true);

  const allChannels = usePhosphor ? FULL_LED_LIBRARY : FULL_LED_LIBRARY.filter((c) => !c.isPhosphor);

  const [iter, setIter] = useState(0);
  const [history, setHistory] = useState<SolutionMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<SolutionMetrics | null>(null);
  const [currentReason, setCurrentReason] = useState('');
  const [enabled, setEnabled] = useState<boolean[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const gpRef = useRef<GaussianProcess | null>(null);
  const autoRef = useRef(false);
  const rngRef = useRef(() => Math.random());

  useEffect(() => { return () => { autoRef.current = false; }; }, []);

  const doReset = useCallback(() => {
    autoRef.current = false; setAutoRunning(false);
    setBORngSeed(seedVal);
    const rng = mulberry32Rng(seedVal);
    rngRef.current = rng;

    const n = allChannels.length;
    const en: boolean[] = []; const w: number[] = [];
    for (let i = 0; i < n; i++) {
      const isOn = rng() > 0.4;
      en.push(isOn);
      w.push(isOn ? rng() * 0.8 + 0.2 : 0);
    }
    setEnabled(en); setWeights(w);

    const gp = new GaussianProcess(0.3, 1.0, 1e-4);
    gpRef.current = gp;

    const m = computeMetrics(allChannels, en, w, selectedTarget.reflectance);
    gp.fit([encodeConfig(en, w)], [m.rmse]);
    setCurrentMetrics(m);
    setHistory([m]);
    setIter(1);
    setCurrentReason('初始化：随机启用约 60% 通道。GP 已用初始点拟合。');
  }, [seedVal, selectedTarget, allChannels]);

  const runOne = useCallback(() => {
    const gp = gpRef.current;
    if (!gp || enabled.length === 0) return;
    const rng = rngRef.current;

    // Generate candidates via perturbation
    const nCandidates = 300;
    let bestAcq = -Infinity;
    let bestEn = enabled; let bestW = weights;
    const yBest = history.length > 0 ? Math.min(...history.map((h) => h.rmse)) : (currentMetrics?.rmse ?? 1);

    for (let c = 0; c < nCandidates; c++) {
      const cand = perturbConfig(enabled, weights, rng, allChannels.length);
      const vec = encodeConfig(cand.enabled, cand.weights);
      const pred = gp.predict(vec);
      let av: number;
      switch (acqFn) {
        case 'EI': av = eiAcq(pred.mean, pred.std, yBest); break;
        case 'UCB': av = ucbAcq(pred.mean, pred.std, ucbBeta); break;
        case 'PI': av = piAcq(pred.mean, pred.std, yBest); break;
        default: av = rng(); break;
      }
      if (av > bestAcq) { bestAcq = av; bestEn = cand.enabled; bestW = cand.weights; }
    }

    const m = computeMetrics(allChannels, bestEn, bestW, selectedTarget.reflectance);
    setEnabled(bestEn); setWeights(bestW);
    setCurrentMetrics(m);
    setIter((i) => i + 1);
    setHistory((h) => [...h, m]);

    const chCount = bestEn.filter(Boolean).length;
    const prevBest = history.length > 0 ? Math.min(...history.map((h) => h.rmse)) : m.rmse;
    const improved = m.rmse < prevBest;
    setCurrentReason(
      improved
        ? `[改进] ${acqFn} 推荐新配置：${chCount} 通道, RMSE ${m.rmse.toFixed(4)} (↓${(prevBest - m.rmse).toFixed(4)}), 成本 ¥${m.totalCost.toFixed(1)}`
        : `[探索] ${acqFn} 探索新区域：${chCount} 通道, RMSE ${m.rmse.toFixed(4)}, 成本 ¥${m.totalCost.toFixed(1)}`
    );

    gp.fit([...gp['X'] || [], encodeConfig(bestEn, bestW)], [...(gp['y'] || []), m.rmse]);
  }, [enabled, weights, allChannels, selectedTarget, acqFn, ucbBeta, history, currentMetrics]);

  const runFive = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      const gp = gpRef.current;
      if (!gp || enabled.length === 0) continue;
      const rng = rngRef.current;
      const nCandidates = 200;
      let bestAcq = -Infinity;
      let bestEn = enabled; let bestW = weights;
      const yBest = history.length > 0 ? Math.min(...history.map((h) => h.rmse)) : (currentMetrics?.rmse ?? 1);
      for (let c = 0; c < nCandidates; c++) {
        const cand = perturbConfig(enabled, weights, rng, allChannels.length);
        const pred = gp.predict(encodeConfig(cand.enabled, cand.weights));
        let av: number;
        switch (acqFn) {
          case 'EI': av = eiAcq(pred.mean, pred.std, yBest); break;
          case 'UCB': av = ucbAcq(pred.mean, pred.std, ucbBeta); break;
          case 'PI': av = piAcq(pred.mean, pred.std, yBest); break;
          default: av = rng(); break;
        }
        if (av > bestAcq) { bestAcq = av; bestEn = cand.enabled; bestW = cand.weights; }
      }
      const m = computeMetrics(allChannels, bestEn, bestW, selectedTarget.reflectance);
      setEnabled(bestEn); setWeights(bestW);
      setCurrentMetrics(m);
      setIter((i) => i + 1);
      setHistory((h) => [...h, m]);
      gp.fit([...gp['X'] || [], encodeConfig(bestEn, bestW)], [...(gp['y'] || []), m.rmse]);
    }
    setCurrentReason(`[批处理] 完成 5 步 ${acqFn} 推荐。当前 RMSE ${currentMetrics?.rmse.toFixed(4)}`);
  }, [enabled, weights, allChannels, selectedTarget, acqFn, ucbBeta, history, currentMetrics]);

  const startAuto = useCallback(() => {
    autoRef.current = true; setAutoRunning(true);
    const loop = () => {
      if (!autoRef.current) { setAutoRunning(false); return; }
      runOne();
      setTimeout(loop, 600);
    };
    loop();
  }, [runOne]);

  const stopAuto = useCallback(() => { autoRef.current = false; setAutoRunning(false); }, []);

  // ================================================================
  // Render
  // ================================================================
  const categories = [...new Set(TARGET_SPECTRA.map((s) => s.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">遥感定标光源</div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">多通道光谱校准源设计</h1>
      <p className="text-[#8a92a3] text-sm mb-6">真实应用案例 — 用多 LED 通道近似目标地物光谱，展示成本/功耗/寿命/精度 trade-off</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Controls */}
        <div className="lg:col-span-1 space-y-3">
          <div className="p-3 rounded-lg border border-[rgba(67,97,238,0.15)]" style={{ background: 'rgba(6,22,42,0.8)' }}>
            <div className="text-[10px] text-[#8a92a3] font-mono mb-2">问题设置</div>
            <div className="space-y-2">
              <div>
                <label className="text-[9px] text-[#8a92a3]">匹配模式</label>
                <select value={matchMode} onChange={(e) => setMatchMode(e.target.value as MatchMode)}
                  className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]">
                  <option value="spectral">光谱匹配（逐 nm）</option>
                  <option value="band">Band-response 匹配</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-[#8a92a3]">目标光谱</label>
                <select value={selectedTarget.id} onChange={(e) => setSelectedTarget(TARGET_SPECTRA.find((s) => s.id === e.target.value)!)}
                  className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]">
                  {categories.map((cat) => (
                    <optgroup key={cat} label={CATEGORY_LABELS[cat] || cat}>
                      {TARGET_SPECTRA.filter((s) => s.category === cat).map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="text-[8px] text-[#5a6377] leading-relaxed">{selectedTarget.description.slice(0, 80)}…</div>
              <div className="text-[7px] text-[#5a6377] leading-relaxed mt-1 italic">{SPECTRA_DISCLAIMER}</div>

              {/* SDL method controls */}
              <div className="pt-2 border-t border-[rgba(67,97,238,0.1)]">
                <div className="text-[9px] text-[#4361ee] font-mono mb-1">SDL 方法设置</div>
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
                {acqFn === 'UCB' && (
                  <div className="mt-1">
                    <label className="text-[9px] text-[#8a92a3]">UCB β</label>
                    <input type="number" value={ucbBeta} onChange={(e) => setUcbBeta(Number(e.target.value))} min={0.1} max={10} step={0.1}
                      className="w-full mt-0.5 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="text-[9px] text-[#8a92a3]">伪荧光通道</label>
                <button onClick={() => { setUsePhosphor(!usePhosphor); doReset(); }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors ${usePhosphor ? 'bg-[rgba(0,245,212,0.12)] text-[#00f5d4] border border-[rgba(0,245,212,0.3)]' : 'bg-[rgba(67,97,238,0.06)] text-[#5a6377] border border-[rgba(67,97,238,0.1)]'}`}>
                  {usePhosphor ? 'ON' : 'OFF'}
                </button>
                <span className="text-[8px] text-[#5a6377]">+6 PC</span>
              </div>
              <div>
                <label className="text-[9px] text-[#8a92a3]">种子</label>
                <input type="number" value={seedVal} onChange={(e) => setSeedVal(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1 rounded text-[10px] bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border border-[rgba(67,97,238,0.15)]" />
              </div>
            </div>
          </div>

          {/* Run controls */}
          <div className="flex flex-wrap gap-2">
            <button onClick={doReset} className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(255,107,107,0.2)] text-[#ff6b6b] text-[10px] font-mono hover:bg-[rgba(255,107,107,0.06)]">
              <RotateCcw className="w-3 h-3" /> 重置
            </button>
            <button onClick={runOne} disabled={autoRunning}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(0,245,212,0.3)] text-[#00f5d4] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.06)] disabled:opacity-40">
              <Play className="w-3 h-3" /> 1 步
            </button>
            <button onClick={runFive} disabled={autoRunning}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(67,97,238,0.3)] text-[#4361ee] text-[10px] font-mono hover:bg-[rgba(67,97,238,0.06)] disabled:opacity-40">
              <Play className="w-3 h-3" /> 5 步
            </button>
            {autoRunning ? (
              <button onClick={stopAuto} className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(245,158,11,0.3)] text-[#f59e0b] text-[10px] font-mono hover:bg-[rgba(245,158,11,0.06)]">
                <Square className="w-3 h-3" /> 停止
              </button>
            ) : (
              <button onClick={startAuto} className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-[rgba(0,245,212,0.15)] text-[#8a92a3] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.04)] disabled:opacity-40">
                <Play className="w-3 h-3" /> Auto
              </button>
            )}
          </div>

          {/* Metrics */}
          {currentMetrics && (
            <div className="p-3 rounded-lg border border-[rgba(67,97,238,0.1)] text-[10px] space-y-1" style={{ background: 'rgba(6,22,42,0.8)' }}>
              <div className="text-[#8a92a3] font-mono mb-1">当前方案 | 迭代 {iter}</div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">RMSE</span><span className="text-[#00f5d4] font-mono">{currentMetrics.rmse.toFixed(4)}</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">SAM</span><span className="text-[#d0d4dc] font-mono">{currentMetrics.samVal.toFixed(4)}</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">成本</span><span className="text-[#fee440] font-mono">¥{currentMetrics.totalCost.toFixed(1)}</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">功耗</span><span className="text-[#8a92a3] font-mono">{currentMetrics.totalPower.toFixed(2)} W</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">最差寿命</span><span className="text-[#8a92a3] font-mono">{(currentMetrics.worstLifetime / 1000).toFixed(0)}k h</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">通道数</span><span className="text-[#4361ee] font-mono">{currentMetrics.channelCount}</span></div>
              {currentReason && (
                <div className="mt-2 pt-2 border-t border-[rgba(67,97,238,0.1)]">
                  <div className="text-[#8a92a3] font-mono mb-1">推荐依据</div>
                  <p className="text-[#8a92a3] leading-relaxed">{currentReason}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-[8px] text-[#5a6377] space-y-1">
            <p>{LED_DISCLAIMER}</p>
            <p>{PHOSPHOR_DISCLAIMER}</p>
            <p>{OPTIMIZER_NOTE}</p>
          </div>
        </div>

        {/* Right: Plots */}
        <div className="lg:col-span-3">
          {!currentMetrics ? (
            <div className="flex items-center justify-center h-80 border border-dashed border-[rgba(67,97,238,0.15)] rounded-lg text-[10px] text-[#8a92a3]">
              选择目标光谱，点击「重置」开始优化
            </div>
          ) : (
            <Suspense fallback={<div className="h-80 flex items-center justify-center text-[10px] text-[#8a92a3]">加载图表…</div>}>
              <CalibrationPlots
                matchMode={matchMode}
                target={selectedTarget}
                metrics={currentMetrics}
                channels={allChannels}
                enabled={enabled}
                weights={weights}
                history={history}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Plots (unchanged)
// ================================================================

function CalibrationPlots({
  matchMode, target, metrics, channels, enabled, weights, history,
}: {
  matchMode: MatchMode; target: TargetSpectrum; metrics: SolutionMetrics;
  channels: typeof FULL_LED_LIBRARY; enabled: boolean[]; weights: number[];
  history: SolutionMetrics[];
}) {
  const targetTrace = {
    x: WAVELENGTH_GRID, y: target.reflectance,
    type: 'scatter' as const, mode: 'lines' as const,
    name: '目标光谱', line: { color: '#00f5d4', width: 2 },
  };
  const mixTrace = {
    x: WAVELENGTH_GRID, y: metrics.mixSpd,
    type: 'scatter' as const, mode: 'lines' as const,
    name: '合成光谱', line: { color: '#ff6b6b', width: 1.5, dash: 'dash' as const },
  };
  const residTrace = {
    x: WAVELENGTH_GRID,
    y: metrics.mixSpd.map((v, i) => v - target.reflectance[i]),
    type: 'scatter' as const, mode: 'lines' as const,
    name: '残差', line: { color: '#f59e0b', width: 1 }, yaxis: 'y2',
  };
  const specData = [targetTrace, mixTrace, residTrace];
  const specLayout = {
    title: { text: `目标: ${target.name}`, font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '波长 (nm)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: '反射率', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis2: { overlaying: 'y' as const, side: 'right' as const, title: { text: '残差', font: { color: '#f59e0b' } }, color: '#f59e0b', showgrid: false },
    paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 50, b: 40, l: 50 }, height: 300,
    legend: { x: 0.01, y: 0.99, font: { size: 9 } },
  };

  const enabledLedTraces = channels
    .map((ch, i) => {
      if (!enabled[i] || weights[i] < 1e-6) return null;
      return {
        x: WAVELENGTH_GRID,
        y: ch.spd.map((v) => v * weights[i]),
        type: 'scatter' as const, mode: 'lines' as const,
        name: ch.isPhosphor ? `[PC] ${ch.name}` : ch.name,
        line: { width: ch.isPhosphor ? 2 : 1, dash: (ch.isPhosphor ? 'dash' : 'solid') as 'dash' | 'solid' },
        stackgroup: 'one' as const,
      };
    })
    .filter(Boolean);
  const ledLayout = {
    title: { text: '启用的 LED 通道（虚线=PC）', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '波长 (nm)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 }, height: 220,
    showlegend: true, legend: { font: { size: 7 } },
  };

  let bandPlotContent = null;
  if (matchMode === 'band') {
    const targetBands = bandResponses(target.reflectance);
    const mixBands = bandResponses(metrics.mixSpd);
    const bandLabels = SENSOR_BANDS.map((b) => b.name);
    const bandData = [
      { x: bandLabels, y: targetBands, type: 'bar' as const, name: '目标响应', marker: { color: 'rgba(0,245,212,0.6)' } },
      { x: bandLabels, y: mixBands, type: 'bar' as const, name: '合成响应', marker: { color: 'rgba(255,107,107,0.5)' } },
    ];
    const bandLayout = {
      title: { text: 'Band Response 对比', font: { color: '#d0d4dc', size: 12 } },
      xaxis: { gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
      yaxis: { title: { text: '积分响应', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
      paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)',
      font: { color: '#8a92a3', size: 10 },
      margin: { t: 30, r: 10, b: 40, l: 50 }, height: 220,
      legend: { x: 0.01, y: 0.99, font: { size: 9 } }, barmode: 'overlay' as const,
    };
    bandPlotContent = <Plot data={bandData} layout={bandLayout} useResizeHandler style={{ width: '100%' }} />;
  }

  const rmseH = history.map((m) => m.rmse);
  const histTrace = {
    x: rmseH.map((_, i) => i + 1), y: rmseH,
    type: 'scatter' as const, mode: 'lines+markers' as const,
    name: 'RMSE', line: { color: '#00f5d4', width: 1.5 }, marker: { size: 3 },
  };
  const histLayout = {
    title: { text: 'RMSE vs 迭代', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '迭代', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: 'RMSE', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 }, height: 180, showlegend: false,
  };

  const costD = history.map((m) => m.totalCost);
  const paretoTrace = {
    x: costD, y: rmseH,
    type: 'scatter' as const, mode: 'markers' as const,
    name: 'RMSE vs 成本',
    marker: {
      color: history.map((_, i) => i === history.length - 1 ? '#ff6b6b' : '#8a92a3'),
      size: history.map((_, i) => i === history.length - 1 ? 8 : 4),
    },
  };
  const paretoLayout = {
    title: { text: 'RMSE vs 成本 (Pareto)', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '成本 (¥)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: 'RMSE', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 }, height: 220, showlegend: false,
  };

  return (
    <div>
      <Plot data={specData} layout={specLayout} useResizeHandler style={{ width: '100%' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Plot data={enabledLedTraces as any} layout={ledLayout} useResizeHandler style={{ width: '100%' }} />
        {bandPlotContent || <Plot data={[histTrace]} layout={histLayout} useResizeHandler style={{ width: '100%' }} />}
      </div>
      <Plot data={[paretoTrace]} layout={paretoLayout} useResizeHandler style={{ width: '100%' }} />
    </div>
  );
}
