/**
 * LedCaseView — LED spectral calibration case inside Case Studio.
 * Adapted from LedCalibrationPage: same engine, unified button style.
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleHelp, Play, RotateCcw, Square } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CATEGORY_LABELS, TARGET_SPECTRA, WAVELENGTH_GRID, type TargetSpectrum,
} from '@/data/targetSpectra';
import {
  FULL_LED_LIBRARY, LED_DISCLAIMER, PHOSPHOR_DISCLAIMER, type LedChannel,
} from '@/data/ledLibrary';
import {
  type AcqFn, type MatchMode, type ObjectiveConfig, type ObjectiveTermKey,
  type OptState, type SolutionMetrics, type SurrogateModel,
  DEFAULT_OBJECTIVE_CONFIG, SENSOR_BANDS, OPTIMIZER_NOTE,
  bandResponses, computeMetrics, mulberry32Rng, optimizationStep, randomInitState,
} from '@/lib/calibrationEngine';

const Plot = lazy(() => import('react-plotly.js'));
const AUTO_INTERVAL_MS = 550;

const OBJECTIVE_TERMS: Array<{
  key: ObjectiveTermKey; label: string; help: string; defaultWeight: number;
}> = [
  { key: 'matchError',     label: '匹配误差',  help: '光谱/Band 拟合误差，通常保留最高权重。',           defaultWeight: DEFAULT_OBJECTIVE_CONFIG.matchError },
  { key: 'cost',           label: '成本',      help: '成本权重越高，越偏向便宜通道。',                   defaultWeight: DEFAULT_OBJECTIVE_CONFIG.cost },
  { key: 'power',          label: '功耗',      help: '功耗权重越高，优化器偏向低驱动强度方案。',          defaultWeight: DEFAULT_OBJECTIVE_CONFIG.power },
  { key: 'channelCount',   label: '通道数',    help: '越高越偏向少通道紧凑设计。',                       defaultWeight: DEFAULT_OBJECTIVE_CONFIG.channelCount },
  { key: 'lifetimePenalty',label: '寿命惩罚',  help: '越高越避免短寿命通道成为系统瓶颈。',               defaultWeight: DEFAULT_OBJECTIVE_CONFIG.lifetimePenalty },
];

function configsEqual(a: ObjectiveConfig, b: ObjectiveConfig): boolean {
  return a.matchError === b.matchError && a.cost === b.cost &&
    a.power === b.power && a.channelCount === b.channelCount &&
    a.lifetimePenalty === b.lifetimePenalty;
}

// ── Shared UI helpers ──────────────────────────────────────────────────────

function HelpTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-[#5a6377] hover:text-[#00f5d4] transition-colors">
          <CircleHelp className="w-3 h-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-[10px] leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function Field({ label, help, control }: { label: string; help?: string; control: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-[10px] text-[#d0d4dc]">
        <span>{label}</span>
        {help && <HelpTip text={help} />}
      </div>
      {control}
    </div>
  );
}

function MetricRow({ label, value, help, highlight }: {
  label: string; value: string; help?: string;
  highlight?: 'blue' | 'cyan' | 'yellow';
}) {
  const vc = highlight === 'cyan' ? 'text-[#00f5d4]'
    : highlight === 'yellow' ? 'text-[#fee440]'
    : highlight === 'blue'   ? 'text-[#4cc9f0]'
    : 'text-[#d0d4dc]';
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1 text-[#8a92a3]">
        <span>{label}</span>
        {help && <HelpTip text={help} />}
      </div>
      <div className={`font-mono ${vc}`}>{value}</div>
    </div>
  );
}

// Unified button style matching Case Studio
function Btn({ kind, disabled = false, onClick, children }: {
  kind: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';
  disabled?: boolean; onClick?: () => void; children: React.ReactNode;
}) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-mono transition-colors';
  const styles: Record<string, string> = {
    primary:   `${base} border-[rgba(0,245,212,0.3)]   text-[#00f5d4]  hover:bg-[rgba(0,245,212,0.08)]`,
    secondary: `${base} border-[rgba(76,201,240,0.3)]  text-[#4cc9f0]  hover:bg-[rgba(76,201,240,0.06)]`,
    danger:    `${base} border-[rgba(255,107,107,0.2)] text-[#ff6b6b]  hover:bg-[rgba(255,107,107,0.06)]`,
    warning:   `${base} border-[rgba(245,158,11,0.28)] text-[#f59e0b]  hover:bg-[rgba(245,158,11,0.06)]`,
    ghost:     `${base} border-[rgba(67,97,238,0.2)]   text-[#8a92a3]  hover:bg-[rgba(67,97,238,0.06)]`,
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${styles[kind]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

const SEL = 'w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(0,13,29,0.65)] px-2 py-1.5 text-[10px] text-[#d0d4dc]';
const INP = 'w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(0,13,29,0.65)] px-2 py-1.5 text-[10px] text-[#d0d4dc]';
const plotConfig = { displaylogo: false, responsive: true, modeBarButtonsToRemove: ['lasso2d', 'select2d'] } as const;

// ── Main component ─────────────────────────────────────────────────────────

export default function LedCaseView() {
  const [matchMode, setMatchMode]       = useState<MatchMode>('spectral');
  const [selectedTarget, setSelectedTarget] = useState<TargetSpectrum>(TARGET_SPECTRA[0]);
  const [seedVal, setSeedVal]           = useState(42);
  const [surrogateModel, setSurrogateModel] = useState<SurrogateModel>('GP');
  const [acqFn, setAcqFn]              = useState<AcqFn>('EI');
  const [ucbBeta, setUcbBeta]          = useState(2.0);
  const [useSynthetic, setUseSynthetic] = useState(true);
  const [objectiveConfig, setObjectiveConfig] = useState<ObjectiveConfig>(DEFAULT_OBJECTIVE_CONFIG);
  const [autoRunning, setAutoRunning]   = useState(false);

  const [optState, setOptState]         = useState<OptState | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<SolutionMetrics | null>(null);
  const [history, setHistory]           = useState<SolutionMetrics[]>([]);
  const [iter, setIter]                 = useState(0);
  const [currentReason, setCurrentReason] = useState('');

  const rngRef      = useRef<() => number>(() => Math.random());
  const optStateRef = useRef<OptState | null>(null);
  const autoRef     = useRef(false);
  const timerRef    = useRef<number | null>(null);

  const channels = useMemo(
    () => useSynthetic ? FULL_LED_LIBRARY : FULL_LED_LIBRARY.filter((c) => !c.isSynthetic),
    [useSynthetic],
  );
  const categories = useMemo(() => [...new Set(TARGET_SPECTRA.map((t) => t.category))], []);

  useEffect(() => { optStateRef.current = optState; }, [optState]);
  useEffect(() => () => {
    autoRef.current = false;
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  // Lecture mode: R key → reset LED case
  useEffect(() => {
    const handler = () => applyReset();
    window.addEventListener('lecture:reset', handler);
    return () => window.removeEventListener('lecture:reset', handler);
  }, [applyReset]);

  const createFresh = useCallback((
    ch = channels, tgt = selectedTarget, mode = matchMode, seed = seedVal, obj = objectiveConfig,
  ) => {
    const rng = mulberry32Rng(seed);
    rngRef.current = rng;
    const state   = randomInitState(ch, tgt.reflectance, mode, obj, seed);
    const metrics = computeMetrics(ch, state.enabled, state.weights, tgt.reflectance, mode, obj);
    return { state, metrics };
  }, [channels, matchMode, objectiveConfig, seedVal, selectedTarget]);

  const applyReset = useCallback((
    ch = channels, tgt = selectedTarget, mode = matchMode, seed = seedVal, obj = objectiveConfig,
  ) => {
    autoRef.current = false;
    setAutoRunning(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const { state, metrics } = createFresh(ch, tgt, mode, seed, obj);
    optStateRef.current = state;
    setOptState(state); setCurrentMetrics(metrics); setHistory([metrics]); setIter(1);
    setCurrentReason(`初始化：${metrics.channelCount} 通道，${metrics.objectiveLabel}=${metrics.objectiveValue.toFixed(4)}`);
  }, [channels, createFresh, matchMode, objectiveConfig, seedVal, selectedTarget]);

  const ensureAligned = useCallback(() => {
    const cur = optStateRef.current;
    const ok = cur && cur.channels.length === channels.length &&
      cur.targetRefl === selectedTarget.reflectance &&
      cur.mode === matchMode && configsEqual(cur.objectiveConfig, objectiveConfig);
    if (ok) return cur;
    const { state, metrics } = createFresh(channels, selectedTarget, matchMode, seedVal, objectiveConfig);
    optStateRef.current = state;
    setOptState(state); setCurrentMetrics(metrics); setHistory([metrics]); setIter(1);
    setCurrentReason(`按新配置重置：${metrics.objectiveLabel}=${metrics.objectiveValue.toFixed(4)}`);
    return state;
  }, [channels, createFresh, matchMode, objectiveConfig, seedVal, selectedTarget]);

  const runOneStep = useCallback(() => {
    const cur = ensureAligned();
    if (!cur) return false;
    const r = optimizationStep(cur, rngRef.current, surrogateModel, acqFn, ucbBeta);
    optStateRef.current = r.state;
    setOptState(r.state); setCurrentMetrics(r.metrics); setCurrentReason(r.reason);
    setHistory((p) => [...p, r.metrics]); setIter((n) => n + 1);
    return true;
  }, [acqFn, ensureAligned, surrogateModel, ucbBeta]);

  const runFive = useCallback(() => {
    let cur = ensureAligned();
    if (!cur) return;
    const batch: SolutionMetrics[] = [];
    let lastReason = '';
    for (let i = 0; i < 5; i++) {
      const r = optimizationStep(cur, rngRef.current, surrogateModel, acqFn, ucbBeta);
      cur = r.state; batch.push(r.metrics); lastReason = r.reason;
    }
    optStateRef.current = cur;
    setOptState(cur); setCurrentMetrics(batch[batch.length - 1]); setCurrentReason(lastReason);
    setHistory((p) => [...p, ...batch]); setIter((n) => n + batch.length);
  }, [acqFn, ensureAligned, surrogateModel, ucbBeta]);

  const stopAuto = useCallback(() => {
    autoRef.current = false; setAutoRunning(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const startAuto = useCallback(() => {
    if (!ensureAligned()) return;
    autoRef.current = true; setAutoRunning(true);
    const loop = () => {
      if (!autoRef.current) { setAutoRunning(false); return; }
      runOneStep();
      timerRef.current = window.setTimeout(loop, AUTO_INTERVAL_MS);
    };
    loop();
  }, [ensureAligned, runOneStep]);

  const handleSyntheticToggle = useCallback(() => {
    const next = !useSynthetic;
    setUseSynthetic(next);
    const nextCh = next ? FULL_LED_LIBRARY : FULL_LED_LIBRARY.filter((c) => !c.isSynthetic);
    applyReset(nextCh, selectedTarget, matchMode, seedVal, objectiveConfig);
  }, [applyReset, matchMode, objectiveConfig, seedVal, selectedTarget, useSynthetic]);

  const updateWeight = useCallback((key: ObjectiveTermKey, v: number) => {
    setObjectiveConfig((p) => ({ ...p, [key]: Math.max(0, Math.min(2, isFinite(v) ? v : 0)) }));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* ── Left settings column ──────────────────────────────── */}
      <div className="lg:col-span-1 space-y-3">
        {/* Context card */}
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-1.5">案例背景</div>
          <p className="text-[10px] text-[#8a92a3] leading-5">
            用 400–1000 nm LED 阵列拟合典型地物反射光谱（植被/土壤/水体）。
            参数空间是各通道的连续驱动强度，目标是多维权衡：<span className="text-[#00f5d4]">匹配精度 + 成本 + 功耗 + 通道数</span>。
            这是高维连续空间 + 多目标的现实版 SDL。
          </p>
        </div>

        {/* Settings */}
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3 space-y-3">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest">问题设置</div>
          <Field label="匹配模式" help="光谱匹配最小化全谱 RMSE；Band-response 匹配先投影到传感器波段。"
            control={<select value={matchMode} onChange={(e) => setMatchMode(e.target.value as MatchMode)} className={SEL}>
              <option value="spectral">光谱匹配（Spectral RMSE）</option>
              <option value="band">Band-response 匹配</option>
            </select>} />

          <Field label="目标光谱" help="选择要模拟的典型地物光谱。"
            control={<select value={selectedTarget.id}
              onChange={(e) => { const t = TARGET_SPECTRA.find((x) => x.id === e.target.value); if (t) setSelectedTarget(t); }}
              className={SEL}>
              {categories.map((cat) => (
                <optgroup key={cat} label={CATEGORY_LABELS[cat] || cat}>
                  {TARGET_SPECTRA.filter((t) => t.category === cat).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>} />

          <div className="border-t border-[rgba(67,97,238,0.1)] pt-2">
            <div className="text-[9px] text-[#4361ee] font-mono mb-2">SDL 方法设置</div>
            <div className="space-y-2">
              <Field label="代理模型" help="GP 适合讲不确定性；RF 贴近工程回归；Local 为局部 k-NN。"
                control={<select value={surrogateModel} onChange={(e) => setSurrogateModel(e.target.value as SurrogateModel)} className={SEL}>
                  <option value="GP">Gaussian Process (GP)</option>
                  <option value="RF">Random Forest (RF)</option>
                  <option value="Local">Local surrogate (k-NN)</option>
                </select>} />
              <Field label="采集函数" help="EI 偏改进，UCB 偏探索，PI 更保守。"
                control={<select value={acqFn} onChange={(e) => setAcqFn(e.target.value as AcqFn)} className={SEL}>
                  <option value="EI">Expected Improvement (EI)</option>
                  <option value="UCB">Upper Confidence Bound (UCB)</option>
                  <option value="PI">Probability of Improvement (PI)</option>
                </select>} />
              {acqFn === 'UCB' && (
                <Field label="UCB β" help="越大越探索不确定区域。"
                  control={<input type="number" min={0.2} max={8} step={0.1} value={ucbBeta}
                    onChange={(e) => setUcbBeta(Number(e.target.value))} className={INP} />} />
              )}
            </div>
          </div>

          <div className="border-t border-[rgba(67,97,238,0.1)] pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-[#d0d4dc]">
              <span>合成宽谱通道</span>
              <HelpTip text="补足 700–1000 nm 的桥接能力。" />
            </div>
            <button onClick={handleSyntheticToggle}
              className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-colors ${
                useSynthetic ? 'bg-[rgba(0,245,212,0.12)] text-[#00f5d4] border-[rgba(0,245,212,0.3)]'
                             : 'bg-[rgba(67,97,238,0.06)] text-[#5a6377] border-[rgba(67,97,238,0.1)]'}`}>
              {useSynthetic ? 'ON' : 'OFF'}
            </button>
          </div>

          <Field label="随机种子" help="固定后可重复演示。"
            control={<input type="number" value={seedVal} onChange={(e) => setSeedVal(Number(e.target.value))} className={INP} />} />

          <div className="border-t border-[rgba(67,97,238,0.1)] pt-2">
            <div className="text-[9px] text-[#4361ee] font-mono mb-2">目标函数权重</div>
            <div className="space-y-2">
              {OBJECTIVE_TERMS.map((term) => {
                const enabled = objectiveConfig[term.key] > 0;
                return (
                  <div key={term.key} className="rounded border border-[rgba(67,97,238,0.08)] p-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="flex items-center gap-2 text-[10px] text-[#d0d4dc] cursor-pointer">
                        <input type="checkbox" checked={enabled}
                          onChange={(e) => updateWeight(term.key, e.target.checked ? Math.max(objectiveConfig[term.key], term.defaultWeight) : 0)} />
                        {term.label}
                      </label>
                      <HelpTip text={term.help} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={2} step={0.05} value={objectiveConfig[term.key]}
                        onChange={(e) => updateWeight(term.key, Number(e.target.value))} className="flex-1" />
                      <input type="number" min={0} max={2} step={0.05} value={objectiveConfig[term.key]}
                        onChange={(e) => updateWeight(term.key, Number(e.target.value))}
                        className="w-14 rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(0,13,29,0.65)] px-2 py-0.5 text-[10px] text-[#d0d4dc]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Btn kind="danger"   onClick={() => applyReset()}><RotateCcw className="w-3 h-3" /> 重置</Btn>
          <Btn kind="primary"  disabled={autoRunning} onClick={runOneStep}><Play className="w-3 h-3" /> Run 1</Btn>
          <Btn kind="secondary" disabled={autoRunning} onClick={runFive}><Play className="w-3 h-3" /> Run 5</Btn>
          {autoRunning
            ? <Btn kind="warning" onClick={stopAuto}><Square className="w-3 h-3" /> 停止</Btn>
            : <Btn kind="ghost"   onClick={startAuto}><Play className="w-3 h-3" /> Auto</Btn>}
        </div>

        {/* Current metrics */}
        {currentMetrics && (
          <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3 text-[10px] space-y-1">
            <div className="text-[#8a92a3] font-mono mb-1.5">当前方案 | 迭代 {iter}</div>
            <MetricRow label={currentMetrics.objectiveLabel} value={currentMetrics.objectiveValue.toFixed(4)} highlight="cyan" />
            <MetricRow label="Spectral RMSE"  value={currentMetrics.rmse.toFixed(4)} />
            <MetricRow label="SAM"            value={currentMetrics.samVal.toFixed(4)} />
            <MetricRow label="总成本"          value={`¥${currentMetrics.totalCost.toFixed(1)}`} highlight="yellow" />
            <MetricRow label="总功耗"          value={`${currentMetrics.totalPower.toFixed(2)} W`} />
            <MetricRow label="最差寿命"        value={`${(currentMetrics.worstLifetime / 1000).toFixed(0)}k h`} />
            <MetricRow label="启用通道数"      value={`${currentMetrics.channelCount}`} highlight="blue" />
            <div className="mt-2 pt-2 border-t border-[rgba(67,97,238,0.1)]">
              <div className="text-[9px] font-mono text-[#8a92a3] mb-1">推荐依据</div>
              <p className="text-[#8a92a3] leading-relaxed">{currentReason || '请先运行一次优化。'}</p>
            </div>
          </div>
        )}

        <div className="text-[8px] text-[#5a6377] space-y-1 leading-relaxed">
          <p className="text-[#fee440]">各通道权重表示 0–1 的相对驱动强度，不是绝对辐亮度定标。</p>
          <p>{LED_DISCLAIMER}</p>
          <p>{PHOSPHOR_DISCLAIMER}</p>
          <p>{OPTIMIZER_NOTE}</p>
        </div>
      </div>

      {/* ── Right: Plotly charts ───────────────────────────────── */}
      <div className="lg:col-span-3">
        {!currentMetrics ? (
          <div className="flex items-center justify-center h-80 rounded-lg border border-dashed border-[rgba(67,97,238,0.15)] text-[10px] text-[#8a92a3]">
            选择目标光谱后点击"重置"开始演示
          </div>
        ) : (
          <Suspense fallback={<div className="h-80 flex items-center justify-center text-[10px] text-[#8a92a3]">正在加载图表…</div>}>
            <LedPlots
              matchMode={matchMode}
              target={selectedTarget}
              metrics={currentMetrics}
              channels={channels}
              enabled={optState?.enabled || []}
              weights={optState?.weights || []}
              history={history}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

// ── Plotly charts (same as LedCalibrationPage) ─────────────────────────────

function LedPlots({ matchMode, target, metrics, channels, enabled, weights, history }: {
  matchMode: MatchMode; target: TargetSpectrum; metrics: SolutionMetrics;
  channels: LedChannel[]; enabled: boolean[]; weights: number[];
  history: SolutionMetrics[];
}) {
  const active = channels
    .map((c, i) => ({ c, i, w: weights[i] ?? 0 }))
    .filter(({ i, w }) => enabled[i] && w > 1e-6)
    .sort((a, b) => b.w - a.w);

  const BASE = { paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 }, margin: { t: 30, r: 10, b: 40, l: 50 } };

  const specLayout = { ...BASE, height: 280,
    title: { text: `目标：${target.name}`, font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '波长 (nm)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: '反射率 / 相对输出', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis2: { overlaying: 'y' as const, side: 'right' as const, title: { text: '残差', font: { color: '#f59e0b' } }, color: '#f59e0b', showgrid: false },
    legend: { x: 0.01, y: 0.99, font: { size: 9 } },
  };

  const contribLayout = { ...BASE, height: 200,
    title: { text: '启用通道的光谱贡献', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '波长 (nm)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: '相对输出', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    legend: { font: { size: 8 } },
  };

  const histLayout = { ...BASE, height: 200, showlegend: false,
    title: { text: `${metrics.objectiveLabel} 随迭代变化`, font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '迭代', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: metrics.objectiveLabel, font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
  };

  const paretoLayout = { ...BASE, height: 200, showlegend: false,
    title: { text: `${metrics.objectiveLabel} 与成本`, font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '总成本 (¥)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: metrics.objectiveLabel, font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
  };

  const tbands = bandResponses(target.reflectance);
  const mbands = bandResponses(metrics.mixSpd);
  const bandLayout = { ...BASE, barmode: 'group' as const, height: 200, legend: { font: { size: 9 } },
    title: { text: 'Band-response 对比', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { color: '#8a92a3' },
    yaxis: { title: { text: '平均响应', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
  };

  const intensityLayout = { ...BASE, height: 200, showlegend: false,
    title: { text: '启用通道的相对强度', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { color: '#8a92a3', tickangle: -25 },
    yaxis: { title: { text: '权重', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3', range: [0, 1.05] },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Plot data={[
          { x: WAVELENGTH_GRID, y: target.reflectance, type: 'scatter', mode: 'lines', name: '目标', line: { color: '#00f5d4', width: 2 } },
          { x: WAVELENGTH_GRID, y: metrics.mixSpd, type: 'scatter', mode: 'lines', name: '合成', line: { color: '#ff6b6b', width: 1.8, dash: 'dash' } },
          { x: WAVELENGTH_GRID, y: metrics.mixSpd.map((v, i) => v - target.reflectance[i]), type: 'scatter', mode: 'lines', name: '残差', line: { color: '#f59e0b', width: 1 }, yaxis: 'y2' },
        ]} layout={specLayout} config={plotConfig} className="w-full" />

        <Plot data={active.map(({ c, w }) => ({
          x: WAVELENGTH_GRID, y: c.spd.map((v) => v * w), type: 'scatter', mode: 'lines',
          name: c.isSynthetic ? `[宽谱] ${c.name}` : c.name,
          line: { width: c.isSynthetic ? 2 : 1.2, dash: c.isSynthetic ? 'dash' : 'solid' },
          stackgroup: 'one',
        }))} layout={contribLayout} config={plotConfig} className="w-full" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Plot data={[{
          x: active.map(({ c }) => c.name), y: active.map(({ w }) => w), type: 'bar',
          marker: { color: active.map(({ c }) => c.isSynthetic ? 'rgba(67,97,238,0.75)' : 'rgba(0,245,212,0.75)') },
        }]} layout={intensityLayout} config={plotConfig} className="w-full" />

        {matchMode === 'band'
          ? <Plot data={[
              { x: SENSOR_BANDS.map((b) => b.name), y: tbands, type: 'bar', name: '目标', marker: { color: 'rgba(0,245,212,0.65)' } },
              { x: SENSOR_BANDS.map((b) => b.name), y: mbands, type: 'bar', name: '合成', marker: { color: 'rgba(255,107,107,0.65)' } },
            ]} layout={bandLayout} config={plotConfig} className="w-full" />
          : <Plot data={[{
              x: history.map((_, i) => i + 1), y: history.map((m) => m.objectiveValue),
              type: 'scatter', mode: 'lines+markers', line: { color: '#00f5d4', width: 1.6 }, marker: { size: 4 },
            }]} layout={histLayout} config={plotConfig} className="w-full" />}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Plot data={[{
          x: history.map((m) => m.totalCost), y: history.map((m) => m.objectiveValue),
          type: 'scatter', mode: 'markers',
          marker: { color: history.map((_, i) => i === history.length - 1 ? '#ff6b6b' : '#8a92a3'), size: history.map((_, i) => i === history.length - 1 ? 8 : 5) },
          text: history.map((m, i) => `迭代 ${i + 1}<br>${metrics.objectiveLabel}: ${m.objectiveValue.toFixed(4)}<br>成本: ¥${m.totalCost.toFixed(1)}`),
          hovertemplate: '%{text}<extra></extra>',
        }]} layout={paretoLayout} config={plotConfig} className="w-full" />

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.1)] p-4 text-[10px] text-[#8a92a3]">
          <div className="text-[#d0d4dc] font-mono mb-2">当前启用通道（{active.length}）</div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {active.length === 0
              ? <div>暂无启用通道。</div>
              : active.map(({ c, w }) => (
                <div key={c.id} className="flex justify-between gap-3">
                  <div>
                    <div className="text-[#d0d4dc]">{c.name}{c.isSynthetic ? '（宽谱）' : ''}</div>
                    <div className="text-[#5a6377] text-[9px]">峰位 {c.peak_nm} nm | ¥{c.price} | {(c.lifetime_hours/1000).toFixed(0)}k h</div>
                  </div>
                  <div className="text-[#00f5d4] font-mono">{w.toFixed(2)}</div>
                </div>
              ))}
          </div>
          <div className="mt-3 pt-2 border-t border-[rgba(67,97,238,0.1)]">
            <div className="text-[9px] font-mono text-[#8a92a3] mb-1">讲座提示</div>
            <p className="leading-relaxed text-[9px]">
              先固定目标光谱，再切换代理模型或改变权重，观察推荐路径如何变化——这是讲"目标函数定义影响优化行为"的最直观方式。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
