import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleHelp, Play, RotateCcw, Square } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CATEGORY_LABELS, TARGET_SPECTRA, WAVELENGTH_GRID, type TargetSpectrum } from '@/data/targetSpectra';
import { FULL_LED_LIBRARY, LED_DISCLAIMER, PHOSPHOR_DISCLAIMER, type LedChannel } from '@/data/ledLibrary';
import {
  type AcqFn,
  type MatchMode,
  type ObjectiveConfig,
  type ObjectiveTermKey,
  type OptState,
  type SolutionMetrics,
  type SurrogateModel,
  DEFAULT_OBJECTIVE_CONFIG,
  SENSOR_BANDS,
  OPTIMIZER_NOTE,
  bandResponses,
  computeMetrics,
  mulberry32Rng,
  optimizationStep,
  randomInitState,
} from '@/lib/calibrationEngine';

const Plot = lazy(() => import('react-plotly.js'));

const AUTO_INTERVAL_MS = 550;

const SPECTRA_DISCLAIMER =
  '当前目标光谱属于“文献启发教学光谱”：保留了典型地物在可见—近红外范围内的谱形特征，但不是 ECOSTRESS / USGS / ASTER 原始样本的逐条下载版。';

const MODEL_NOTE =
  '这里比较的是不同代理模型如何近似实验黑盒并推荐下一轮实验，而不是在切换“真实实验”本身。真实实验黑盒始终是 LED 光谱合成数字孪生。';

const INTENSITY_NOTE =
  '每个通道的权重表示 0–1 的相对驱动强度。V1 重点研究相对光谱匹配和工程权衡，不直接做绝对辐亮度定标。';

const HELP = {
  matchMode:
    '光谱匹配直接最小化整条目标光谱与合成光谱之间的误差；Band-response 匹配则先把光谱投影到简化传感器波段，再最小化各波段响应误差。',
  target:
    '选择要模拟的典型地物光谱。不同目标会改变红边、近红外平台、暗目标斜率等关键谱形，从而改变最优通道组合。',
  model:
    '代理模型根据已有实验历史近似黑盒。GP 适合讲不确定性与采集函数；RF 更贴近工程回归；Local 表示局部相似性模型。',
  acquisition:
    '采集函数决定下一轮更偏“继续利用当前低误差区域”还是“探索还不确定的区域”。EI 偏改进，UCB 偏探索，PI 更保守。',
  beta: 'UCB 的探索强度参数。数值越大，越鼓励去试不确定区域；越小，越偏向当前看起来最优的附近。',
  synthetic:
    '开启后会加入单峰宽谱的合成 LED 通道，用来模拟荧光转换或宽谱封装带来的光谱桥接能力，尤其补足 700–1000 nm。',
  seed: '固定种子后，初始化通道组合、候选采样和推荐路径都可重复，便于课堂演示与对比不同模型。',
  objectiveBuilder:
    '在这里定义“什么算是好方案”。每一项都可以打开/关闭，并单独赋予权重。权重越大，这一项在综合目标中的影响越大。',
  matchWeight: '匹配误差通常应保留最高权重，因为它定义了目标光谱或 band-response 的核心拟合质量。',
  costWeight: '成本权重越高，优化器越倾向于使用更便宜或更少的通道完成拟合。',
  powerWeight: '功耗权重越高，优化器越倾向于较低驱动强度、较低总功耗的方案。',
  channelWeight: '通道数权重控制“尽量少用通道”的偏好，有助于逼迫优化器寻找更紧凑的设计。',
  lifetimeWeight: '寿命惩罚越高，越会避免使用寿命短、容易成为系统瓶颈的通道组合。',
  objective: '这里显示的是当前真正用于优化与比较历史方案的综合目标值，而不再只是单一的 RMSE。',
  power: '总功耗由各启用通道的相对强度与最大功率共同决定，是工程代价的重要组成部分。',
  lifetime: '最差寿命取所有已启用通道中的最小寿命，表示系统最先失效的薄弱环节。',
  intensity: '这张图展示的是当前启用通道的相对驱动强度。它们是优化器显式求解的核心连续变量。',
} as const;

const OBJECTIVE_TERMS: Array<{
  key: ObjectiveTermKey;
  label: string;
  help: string;
  defaultWeight: number;
}> = [
  { key: 'matchError', label: '匹配误差', help: HELP.matchWeight, defaultWeight: DEFAULT_OBJECTIVE_CONFIG.matchError },
  { key: 'cost', label: '成本', help: HELP.costWeight, defaultWeight: DEFAULT_OBJECTIVE_CONFIG.cost },
  { key: 'power', label: '功耗', help: HELP.powerWeight, defaultWeight: DEFAULT_OBJECTIVE_CONFIG.power },
  { key: 'channelCount', label: '通道数', help: HELP.channelWeight, defaultWeight: DEFAULT_OBJECTIVE_CONFIG.channelCount },
  {
    key: 'lifetimePenalty',
    label: '寿命惩罚',
    help: HELP.lifetimeWeight,
    defaultWeight: DEFAULT_OBJECTIVE_CONFIG.lifetimePenalty,
  },
];

function objectiveConfigsEqual(a: ObjectiveConfig, b: ObjectiveConfig): boolean {
  return (
    a.matchError === b.matchError &&
    a.cost === b.cost &&
    a.power === b.power &&
    a.channelCount === b.channelCount &&
    a.lifetimePenalty === b.lifetimePenalty
  );
}

export default function LedCalibrationPage() {
  const [matchMode, setMatchMode] = useState<MatchMode>('spectral');
  const [selectedTarget, setSelectedTarget] = useState<TargetSpectrum>(TARGET_SPECTRA[0]);
  const [seedVal, setSeedVal] = useState(42);
  const [surrogateModel, setSurrogateModel] = useState<SurrogateModel>('GP');
  const [acqFn, setAcqFn] = useState<AcqFn>('EI');
  const [ucbBeta, setUcbBeta] = useState(2.0);
  const [useSynthetic, setUseSynthetic] = useState(true);
  const [objectiveConfig, setObjectiveConfig] = useState<ObjectiveConfig>(DEFAULT_OBJECTIVE_CONFIG);
  const [autoRunning, setAutoRunning] = useState(false);

  const [optState, setOptState] = useState<OptState | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<SolutionMetrics | null>(null);
  const [history, setHistory] = useState<SolutionMetrics[]>([]);
  const [iter, setIter] = useState(0);
  const [currentReason, setCurrentReason] = useState('');

  const rngRef = useRef<() => number>(() => Math.random());
  const optStateRef = useRef<OptState | null>(null);
  const autoRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const channels = useMemo(
    () => (useSynthetic ? FULL_LED_LIBRARY : FULL_LED_LIBRARY.filter((channel) => !channel.isSynthetic)),
    [useSynthetic],
  );
  const categories = useMemo(() => [...new Set(TARGET_SPECTRA.map((item) => item.category))], []);

  useEffect(() => {
    optStateRef.current = optState;
  }, [optState]);

  useEffect(() => {
    return () => {
      autoRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const createFreshState = useCallback(
    (
      nextChannels = channels,
      nextTarget = selectedTarget,
      nextMode = matchMode,
      nextSeed = seedVal,
      nextObjective = objectiveConfig,
    ) => {
      const rng = mulberry32Rng(nextSeed);
      rngRef.current = rng;
      const state = randomInitState(nextChannels, nextTarget.reflectance, nextMode, nextObjective, nextSeed);
      const metrics = computeMetrics(nextChannels, state.enabled, state.weights, nextTarget.reflectance, nextMode, nextObjective);
      return { state, metrics };
    },
    [channels, matchMode, objectiveConfig, seedVal, selectedTarget],
  );

  const applyReset = useCallback(
    (
      nextChannels = channels,
      nextTarget = selectedTarget,
      nextMode = matchMode,
      nextSeed = seedVal,
      nextObjective = objectiveConfig,
    ) => {
      autoRef.current = false;
      setAutoRunning(false);
      if (timerRef.current) window.clearTimeout(timerRef.current);

      const { state, metrics } = createFreshState(nextChannels, nextTarget, nextMode, nextSeed, nextObjective);
      optStateRef.current = state;
      setOptState(state);
      setCurrentMetrics(metrics);
      setHistory([metrics]);
      setIter(1);
      setCurrentReason(`初始化完成：${metrics.channelCount} 个通道，${metrics.objectiveLabel}=${metrics.objectiveValue.toFixed(4)}。`);
    },
    [channels, createFreshState, matchMode, objectiveConfig, seedVal, selectedTarget],
  );

  const ensureAlignedState = useCallback(() => {
    const current = optStateRef.current;
    const aligned =
      current &&
      current.channels.length === channels.length &&
      current.targetRefl === selectedTarget.reflectance &&
      current.mode === matchMode &&
      objectiveConfigsEqual(current.objectiveConfig, objectiveConfig);

    if (aligned) return current;

    const { state, metrics } = createFreshState(channels, selectedTarget, matchMode, seedVal, objectiveConfig);
    optStateRef.current = state;
    setOptState(state);
    setCurrentMetrics(metrics);
    setHistory([metrics]);
    setIter(1);
    setCurrentReason(`已按新的目标函数/模式重置：${metrics.objectiveLabel}=${metrics.objectiveValue.toFixed(4)}。`);
    return state;
  }, [channels, createFreshState, matchMode, objectiveConfig, seedVal, selectedTarget]);

  const runOneStep = useCallback(() => {
    const current = ensureAlignedState();
    if (!current) return false;
    const result = optimizationStep(current, rngRef.current, surrogateModel, acqFn, ucbBeta);
    optStateRef.current = result.state;
    setOptState(result.state);
    setCurrentMetrics(result.metrics);
    setCurrentReason(result.reason);
    setHistory((prev) => [...prev, result.metrics]);
    setIter((prev) => prev + 1);
    return true;
  }, [acqFn, ensureAlignedState, surrogateModel, ucbBeta]);

  const runFive = useCallback(() => {
    let current = ensureAlignedState();
    if (!current) return;

    const metricsBatch: SolutionMetrics[] = [];
    let lastReason = '';
    for (let step = 0; step < 5; step++) {
      const result = optimizationStep(current, rngRef.current, surrogateModel, acqFn, ucbBeta);
      current = result.state;
      metricsBatch.push(result.metrics);
      lastReason = result.reason;
    }

    optStateRef.current = current;
    setOptState(current);
    setCurrentMetrics(metricsBatch[metricsBatch.length - 1]);
    setCurrentReason(lastReason);
    setHistory((prev) => [...prev, ...metricsBatch]);
    setIter((prev) => prev + metricsBatch.length);
  }, [acqFn, ensureAlignedState, surrogateModel, ucbBeta]);

  const stopAuto = useCallback(() => {
    autoRef.current = false;
    setAutoRunning(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const startAuto = useCallback(() => {
    if (!ensureAlignedState()) return;
    autoRef.current = true;
    setAutoRunning(true);
    const loop = () => {
      if (!autoRef.current) {
        setAutoRunning(false);
        return;
      }
      runOneStep();
      timerRef.current = window.setTimeout(loop, AUTO_INTERVAL_MS);
    };
    loop();
  }, [ensureAlignedState, runOneStep]);

  const handleSyntheticToggle = useCallback(() => {
    const nextUseSynthetic = !useSynthetic;
    setUseSynthetic(nextUseSynthetic);
    const nextChannels = nextUseSynthetic
      ? FULL_LED_LIBRARY
      : FULL_LED_LIBRARY.filter((channel) => !channel.isSynthetic);
    applyReset(nextChannels, selectedTarget, matchMode, seedVal, objectiveConfig);
  }, [applyReset, matchMode, objectiveConfig, seedVal, selectedTarget, useSynthetic]);

  const updateObjectiveWeight = useCallback((key: ObjectiveTermKey, nextValue: number) => {
    setObjectiveConfig((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(2, Number.isFinite(nextValue) ? nextValue : 0)),
    }));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">遥感地面定标案例</div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">多通道光谱校准光源设计</h1>
      <p className="text-[#8a92a3] text-sm mb-6">
        用 400–1000 nm LED 通道近似典型地物反射光谱，展示通道选择、强度分配、代理模型和目标函数定制如何共同影响误差、成本、功耗和寿命。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="p-3 rounded-lg border border-[rgba(67,97,238,0.15)] bg-[rgba(6,22,42,0.82)]">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-2">问题设置</div>
            <div className="space-y-3">
              <Field
                label="匹配模式"
                help={HELP.matchMode}
                control={
                  <select value={matchMode} onChange={(event) => setMatchMode(event.target.value as MatchMode)} className={selectClassName}>
                    <option value="spectral">光谱匹配（Spectral RMSE）</option>
                    <option value="band">Band-response 匹配</option>
                  </select>
                }
              />

              <Field
                label="目标光谱"
                help={HELP.target}
                control={
                  <select
                    value={selectedTarget.id}
                    onChange={(event) => {
                      const next = TARGET_SPECTRA.find((item) => item.id === event.target.value);
                      if (next) setSelectedTarget(next);
                    }}
                    className={selectClassName}
                  >
                    {categories.map((category) => (
                      <optgroup key={category} label={CATEGORY_LABELS[category] || category}>
                        {TARGET_SPECTRA.filter((item) => item.category === category).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                }
              />

              <p className="text-[8px] text-[#5a6377] leading-relaxed">{selectedTarget.description}</p>
              <p className="text-[8px] text-[#5a6377] leading-relaxed italic">{SPECTRA_DISCLAIMER}</p>

              <div className="pt-2 border-t border-[rgba(67,97,238,0.1)]">
                <div className="text-[9px] text-[#4361ee] font-mono mb-1">SDL 方法设置</div>
                <p className="text-[8px] text-[#5a6377] mb-2">{MODEL_NOTE}</p>

                <Field
                  label="代理模型"
                  help={HELP.model}
                  control={
                    <select value={surrogateModel} onChange={(event) => setSurrogateModel(event.target.value as SurrogateModel)} className={selectClassName}>
                      <option value="GP">Gaussian Process（GP）</option>
                      <option value="RF">Random Forest（RF）</option>
                      <option value="Local">Local surrogate（k-NN）</option>
                    </select>
                  }
                />

                <Field
                  label="采集函数"
                  help={HELP.acquisition}
                  control={
                    <select value={acqFn} onChange={(event) => setAcqFn(event.target.value as AcqFn)} className={selectClassName}>
                      <option value="EI">Expected Improvement（EI）</option>
                      <option value="UCB">Upper Confidence Bound（UCB）</option>
                      <option value="PI">Probability of Improvement（PI）</option>
                    </select>
                  }
                />

                {acqFn === 'UCB' && (
                  <Field
                    label="UCB β"
                    help={HELP.beta}
                    control={
                      <input
                        type="number"
                        min={0.2}
                        max={8}
                        step={0.1}
                        value={ucbBeta}
                        onChange={(event) => setUcbBeta(Number(event.target.value))}
                        className={inputClassName}
                      />
                    }
                  />
                )}
              </div>

              <div className="pt-2 border-t border-[rgba(67,97,238,0.1)]">
                <div className="flex items-center gap-2">
                  <FieldLabel label="合成宽谱通道" help={HELP.synthetic} />
                  <button
                    onClick={handleSyntheticToggle}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-colors ${
                      useSynthetic
                        ? 'bg-[rgba(0,245,212,0.12)] text-[#00f5d4] border-[rgba(0,245,212,0.3)]'
                        : 'bg-[rgba(67,97,238,0.06)] text-[#5a6377] border-[rgba(67,97,238,0.1)]'
                    }`}
                  >
                    {useSynthetic ? 'ON' : 'OFF'}
                  </button>
                </div>
                <p className="text-[8px] text-[#5a6377] leading-relaxed mt-1">
                  默认开启单峰宽谱合成 LED，用于补足 700–1000 nm 的桥接能力。
                </p>
              </div>

              <Field
                label="随机种子"
                help={HELP.seed}
                control={
                  <input
                    type="number"
                    value={seedVal}
                    onChange={(event) => setSeedVal(Number(event.target.value))}
                    className={inputClassName}
                  />
                }
              />

              <div className="pt-2 border-t border-[rgba(67,97,238,0.1)]">
                <div className="text-[9px] text-[#4361ee] font-mono mb-1">目标函数定制</div>
                <p className="text-[8px] text-[#5a6377] mb-2">{HELP.objectiveBuilder}</p>
                <div className="space-y-2">
                  {OBJECTIVE_TERMS.map((term) => {
                    const enabled = objectiveConfig[term.key] > 0;
                    return (
                      <div key={term.key} className="rounded-md border border-[rgba(67,97,238,0.08)] p-2 bg-[rgba(0,13,29,0.35)]">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-[10px] text-[#d0d4dc]">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(event) =>
                                updateObjectiveWeight(term.key, event.target.checked ? Math.max(objectiveConfig[term.key], term.defaultWeight) : 0)
                              }
                            />
                            <span>{term.label}</span>
                          </label>
                          <HelpTip text={term.help} />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="range"
                            min={0}
                            max={2}
                            step={0.05}
                            value={objectiveConfig[term.key]}
                            onChange={(event) => updateObjectiveWeight(term.key, Number(event.target.value))}
                            className="flex-1"
                          />
                          <input
                            type="number"
                            min={0}
                            max={2}
                            step={0.05}
                            value={objectiveConfig[term.key]}
                            onChange={(event) => updateObjectiveWeight(term.key, Number(event.target.value))}
                            className="w-16 rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(0,13,29,0.65)] px-2 py-1 text-[10px] text-[#d0d4dc]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[8px] text-[#5a6377] leading-relaxed mt-2">
                  修改任意目标项或权重后，下一次运行会自动按新的综合目标重新开始。
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => applyReset()} className={buttonClassName('danger')}>
              <RotateCcw className="w-3 h-3" /> 重置
            </button>
            <button onClick={runOneStep} disabled={autoRunning} className={buttonClassName('primary', autoRunning)}>
              <Play className="w-3 h-3" /> Run 1
            </button>
            <button onClick={runFive} disabled={autoRunning} className={buttonClassName('secondary', autoRunning)}>
              <Play className="w-3 h-3" /> Run 5
            </button>
            {autoRunning ? (
              <button onClick={stopAuto} className={buttonClassName('warning')}>
                <Square className="w-3 h-3" /> 停止
              </button>
            ) : (
              <button onClick={startAuto} className={buttonClassName('ghost')}>
                <Play className="w-3 h-3" /> Auto
              </button>
            )}
          </div>

          {currentMetrics && (
            <div className="p-3 rounded-lg border border-[rgba(67,97,238,0.1)] bg-[rgba(6,22,42,0.82)] text-[10px] space-y-1">
              <div className="text-[#8a92a3] font-mono mb-1">当前方案 | 迭代 {iter}</div>
              <MetricRow label="目标函数" value={currentMetrics.objectiveLabel} highlight="blue" help={HELP.objective} />
              <MetricRow label={currentMetrics.objectiveLabel} value={currentMetrics.objectiveValue.toFixed(4)} highlight="cyan" />
              <MetricRow label={matchMode === 'band' ? 'Band RMSE 分量' : 'Spectral RMSE 分量'} value={currentMetrics.objectiveBreakdown.matchError.toFixed(4)} />
              <MetricRow label="Spectral RMSE" value={currentMetrics.rmse.toFixed(4)} />
              <MetricRow label="SAM" value={currentMetrics.samVal.toFixed(4)} />
              <MetricRow label="总成本" value={`¥${currentMetrics.totalCost.toFixed(1)}`} highlight="yellow" />
              <MetricRow label="总功耗" value={`${currentMetrics.totalPower.toFixed(2)} W`} help={HELP.power} />
              <MetricRow label="最差寿命" value={`${(currentMetrics.worstLifetime / 1000).toFixed(0)}k h`} help={HELP.lifetime} />
              <MetricRow label="启用通道数" value={`${currentMetrics.channelCount}`} highlight="blue" />

              <div className="mt-2 pt-2 border-t border-[rgba(67,97,238,0.1)]">
                <div className="text-[#8a92a3] font-mono mb-1">目标分解</div>
                <p className="text-[#8a92a3] leading-relaxed">
                  成本={currentMetrics.objectiveBreakdown.cost.toFixed(1)}，功耗={currentMetrics.objectiveBreakdown.power.toFixed(2)}，
                  通道数={currentMetrics.objectiveBreakdown.channelCount}，寿命惩罚=
                  {currentMetrics.objectiveBreakdown.lifetimePenalty.toFixed(3)}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-[rgba(67,97,238,0.1)]">
                <div className="text-[#8a92a3] font-mono mb-1">推荐依据</div>
                <p className="text-[#8a92a3] leading-relaxed">{currentReason || '请先运行一次优化。'}</p>
              </div>
            </div>
          )}

          <div className="text-[8px] text-[#5a6377] space-y-1 leading-relaxed">
            <p className="text-[#fee440]">{INTENSITY_NOTE}</p>
            <p>{LED_DISCLAIMER}</p>
            <p>{PHOSPHOR_DISCLAIMER}</p>
            <p>{OPTIMIZER_NOTE}</p>
          </div>
        </div>

        <div className="lg:col-span-3">
          {!currentMetrics ? (
            <div className="flex items-center justify-center h-80 rounded-lg border border-dashed border-[rgba(67,97,238,0.15)] text-[10px] text-[#8a92a3]">
              先选择目标光谱与方法设置，再点击“重置”开始演示。
            </div>
          ) : (
            <Suspense fallback={<div className="h-80 flex items-center justify-center text-[10px] text-[#8a92a3]">正在加载图表…</div>}>
              <CalibrationPlots
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
    </div>
  );
}

function CalibrationPlots({
  matchMode,
  target,
  metrics,
  channels,
  enabled,
  weights,
  history,
}: {
  matchMode: MatchMode;
  target: TargetSpectrum;
  metrics: SolutionMetrics;
  channels: LedChannel[];
  enabled: boolean[];
  weights: number[];
  history: SolutionMetrics[];
}) {
  const activeChannels = channels
    .map((channel, idx) => ({ channel, idx, weight: weights[idx] ?? 0 }))
    .filter(({ idx, weight }) => enabled[idx] && weight > 1e-6)
    .sort((a, b) => b.weight - a.weight);

  const spectrumData = [
    {
      x: WAVELENGTH_GRID,
      y: target.reflectance,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: '目标光谱',
      line: { color: '#00f5d4', width: 2 },
    },
    {
      x: WAVELENGTH_GRID,
      y: metrics.mixSpd,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: '合成光谱',
      line: { color: '#ff6b6b', width: 1.8, dash: 'dash' as const },
    },
    {
      x: WAVELENGTH_GRID,
      y: metrics.mixSpd.map((value, idx) => value - target.reflectance[idx]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: '残差',
      line: { color: '#f59e0b', width: 1 },
      yaxis: 'y2',
    },
  ];

  const spectrumLayout = {
    title: { text: `目标：${target.name}`, font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '波长 (nm)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: '反射率 / 相对输出', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis2: { overlaying: 'y' as const, side: 'right' as const, title: { text: '残差', font: { color: '#f59e0b' } }, color: '#f59e0b', showgrid: false },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 50, b: 40, l: 50 },
    height: 300,
    legend: { x: 0.01, y: 0.99, font: { size: 9 } },
  };

  const contributionData = activeChannels.map(({ channel, weight }) => ({
    x: WAVELENGTH_GRID,
    y: channel.spd.map((value) => value * weight),
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: channel.isSynthetic ? `[宽谱] ${channel.name}` : channel.name,
    line: { width: channel.isSynthetic ? 2.1 : 1.2, dash: (channel.isSynthetic ? 'dash' : 'solid') as 'dash' | 'solid' },
    stackgroup: 'one' as const,
  }));

  const contributionLayout = {
    title: { text: '启用通道的光谱贡献', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '波长 (nm)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: '相对输出', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 220,
    legend: { font: { size: 8 } },
    showlegend: true,
  };

  const intensityData = [
    {
      x: activeChannels.map(({ channel }) => channel.name),
      y: activeChannels.map(({ weight }) => weight),
      type: 'bar' as const,
      marker: {
        color: activeChannels.map(({ channel }) => (channel.isSynthetic ? 'rgba(67,97,238,0.75)' : 'rgba(0,245,212,0.75)')),
      },
      name: '相对强度',
    },
  ];

  const intensityLayout = {
    title: { text: '启用通道的相对强度', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { color: '#8a92a3', tickangle: -25 },
    yaxis: { title: { text: '权重', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3', range: [0, 1.05] },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 80, l: 50 },
    height: 240,
    showlegend: false,
  };

  const historyData = [
    {
      x: history.map((_, idx) => idx + 1),
      y: history.map((item) => item.objectiveValue),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: '目标函数',
      line: { color: '#00f5d4', width: 1.6 },
      marker: { size: 4 },
    },
  ];

  const historyLayout = {
    title: { text: `${metrics.objectiveLabel} 随迭代变化`, font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '迭代', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: metrics.objectiveLabel, font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 220,
    showlegend: false,
  };

  const paretoData = [
    {
      x: history.map((item) => item.totalCost),
      y: history.map((item) => item.objectiveValue),
      type: 'scatter' as const,
      mode: 'markers' as const,
      marker: {
        color: history.map((_, idx) => (idx === history.length - 1 ? '#ff6b6b' : '#8a92a3')),
        size: history.map((_, idx) => (idx === history.length - 1 ? 8 : 5)),
      },
      text: history.map(
        (item, idx) =>
          `迭代 ${idx + 1}<br>${metrics.objectiveLabel}: ${item.objectiveValue.toFixed(4)}<br>成本: ¥${item.totalCost.toFixed(1)}<br>功耗: ${item.totalPower.toFixed(2)} W`,
      ),
      hovertemplate: '%{text}<extra></extra>',
      name: '历史方案',
    },
  ];

  const paretoLayout = {
    title: { text: `${metrics.objectiveLabel} 与成本`, font: { color: '#d0d4dc', size: 12 } },
    xaxis: { title: { text: '总成本 (¥)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    yaxis: { title: { text: metrics.objectiveLabel, font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 55 },
    height: 220,
    showlegend: false,
  };

  const targetBands = bandResponses(target.reflectance);
  const mixBands = bandResponses(metrics.mixSpd);
  const bandCompareData = [
    {
      x: SENSOR_BANDS.map((band) => band.name),
      y: targetBands,
      type: 'bar' as const,
      name: '目标 band',
      marker: { color: 'rgba(0,245,212,0.65)' },
    },
    {
      x: SENSOR_BANDS.map((band) => band.name),
      y: mixBands,
      type: 'bar' as const,
      name: '合成 band',
      marker: { color: 'rgba(255,107,107,0.65)' },
    },
  ];

  const bandLayout = {
    barmode: 'group' as const,
    title: { text: 'Band-response 对比', font: { color: '#d0d4dc', size: 12 } },
    xaxis: { color: '#8a92a3' },
    yaxis: { title: { text: '平均响应', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(0,13,29,0.5)',
    font: { color: '#8a92a3', size: 10 },
    margin: { t: 30, r: 10, b: 40, l: 50 },
    height: 220,
    legend: { font: { size: 9 } },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Plot data={spectrumData} layout={spectrumLayout} config={plotConfig} className="w-full" />
        <Plot data={contributionData} layout={contributionLayout} config={plotConfig} className="w-full" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Plot data={intensityData} layout={intensityLayout} config={plotConfig} className="w-full" />
        {matchMode === 'band' ? (
          <Plot data={bandCompareData} layout={bandLayout} config={plotConfig} className="w-full" />
        ) : (
          <Plot data={historyData} layout={historyLayout} config={plotConfig} className="w-full" />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Plot data={paretoData} layout={paretoLayout} config={plotConfig} className="w-full" />
        <div className="rounded-lg border border-[rgba(67,97,238,0.1)] bg-[rgba(6,22,42,0.82)] p-4 text-[10px] text-[#8a92a3]">
          <div className="text-[#d0d4dc] font-mono mb-2">当前启用通道</div>
          <div className="space-y-1">
            {activeChannels.length === 0 ? (
              <div>暂无启用通道。</div>
            ) : (
              activeChannels.map(({ channel, weight }) => (
                <div key={channel.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[#d0d4dc]">
                      {channel.name}
                      {channel.isSynthetic ? '（宽谱）' : ''}
                    </div>
                    <div className="text-[#5a6377] text-[9px]">
                      峰位 {channel.peak_nm} nm | FWHM {channel.fwhm_nm} nm | ¥{channel.price}
                    </div>
                  </div>
                  <div className="text-[#00f5d4] font-mono">{weight.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(67,97,238,0.1)]">
            <div className="text-[#d0d4dc] font-mono mb-1">讲座提示</div>
            <p className="leading-relaxed">
              当前页面把“通道选择”“强度分配”“代理模型”“加权目标”四件事拆开了。讲解时可先固定目标光谱，再逐项改变代理模型或目标权重，让学生观察推荐路径与最终方案如何变化。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, help, control }: { label: string; help?: string; control: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <FieldLabel label={label} help={help} />
      {control}
    </div>
  );
}

function FieldLabel({ label, help }: { label: string; help?: string }) {
  return (
    <div className="flex items-center gap-1 text-[10px] text-[#d0d4dc]">
      <span>{label}</span>
      {help ? <HelpTip text={help} /> : null}
    </div>
  );
}

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

function MetricRow({
  label,
  value,
  help,
  highlight,
}: {
  label: string;
  value: string;
  help?: string;
  highlight?: 'blue' | 'cyan' | 'yellow';
}) {
  const valueClass =
    highlight === 'cyan'
      ? 'text-[#00f5d4]'
      : highlight === 'yellow'
        ? 'text-[#fee440]'
        : highlight === 'blue'
          ? 'text-[#4cc9f0]'
          : 'text-[#d0d4dc]';

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1 text-[#8a92a3]">
        <span>{label}</span>
        {help ? <HelpTip text={help} /> : null}
      </div>
      <div className={`font-mono ${valueClass}`}>{value}</div>
    </div>
  );
}

function buttonClassName(kind: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost', disabled = false) {
  const base = 'inline-flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-mono border transition-colors';
  if (disabled) return `${base} opacity-50 cursor-not-allowed border-[rgba(67,97,238,0.08)] text-[#5a6377]`;
  switch (kind) {
    case 'primary':
      return `${base} bg-[rgba(0,245,212,0.12)] text-[#00f5d4] border-[rgba(0,245,212,0.28)] hover:bg-[rgba(0,245,212,0.18)]`;
    case 'secondary':
      return `${base} bg-[rgba(76,201,240,0.12)] text-[#4cc9f0] border-[rgba(76,201,240,0.28)] hover:bg-[rgba(76,201,240,0.18)]`;
    case 'danger':
      return `${base} bg-[rgba(255,107,107,0.12)] text-[#ff6b6b] border-[rgba(255,107,107,0.28)] hover:bg-[rgba(255,107,107,0.18)]`;
    case 'warning':
      return `${base} bg-[rgba(245,158,11,0.12)] text-[#f59e0b] border-[rgba(245,158,11,0.28)] hover:bg-[rgba(245,158,11,0.18)]`;
    case 'ghost':
      return `${base} bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border-[rgba(67,97,238,0.18)] hover:bg-[rgba(67,97,238,0.14)]`;
  }
}

const selectClassName =
  'w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(0,13,29,0.65)] px-2 py-1.5 text-[10px] text-[#d0d4dc]';

const inputClassName =
  'w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(0,13,29,0.65)] px-2 py-1.5 text-[10px] text-[#d0d4dc]';

const plotConfig = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
} as const;
