import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Square } from 'lucide-react';
import {
  CATEGORY_LABELS,
  TARGET_SPECTRA,
  WAVELENGTH_GRID,
  type TargetSpectrum,
} from '@/data/targetSpectra';
import {
  FULL_LED_LIBRARY,
  LED_DISCLAIMER,
  PHOSPHOR_DISCLAIMER,
  type LedChannel,
} from '@/data/ledLibrary';
import {
  DEFAULT_OBJECTIVE_CONFIG,
  SENSOR_BANDS,
  bandResponses,
  computeMetrics,
  type MatchMode,
  type ObjectiveConfig,
  type SolutionMetrics,
  type SurrogateModel,
} from '@/lib/calibrationEngine';
import {
  ContinuousCaseSession,
  type ContinuousAcqFn,
  type ContinuousCaseDef,
  type ContinuousParamDef,
  type ObjectiveSpec,
  type OptimizerStrategy,
} from '@/lib/continuousCaseOptimizer';
import {
  Field,
  MetricRow,
  TaskModeSummary,
  buttonClassName,
  inputClassName,
  plotConfig,
  selectClassName,
} from '@/components/caseStudioUi';

const Plot = lazy(() => import('react-plotly.js'));
const AUTO_INTERVAL_MS = 550;
const CHANNEL_THRESHOLD = 0.08;

type TaskMode = 'single' | 'weighted' | 'pareto';
type LedMetricKey = 'matchError' | 'spectralRmse' | 'sam' | 'cost' | 'power' | 'channelCount' | 'lifetimePenalty';

interface LedEvaluation extends SolutionMetrics {
  matchErrorValue: number;
  lifetimePenaltyValue: number;
}

const HELP = {
  matchMode:
    '光谱匹配直接最小化整条目标光谱与合成光谱之间的误差；Band-response 模式先投影到传感器波段，再最小化各波段响应误差。',
  target:
    '选择要模拟的典型地物光谱。不同目标会改变红边、近红外平台和暗目标斜率，从而改变推荐路径。',
  task:
    '单目标模式适合讲“只看误差”或“只看成本”；线性组合适合讲工程折中；Pareto 模式则保留两个冲突目标的非支配前沿。',
  model: 'GP 适合讲不确定性；RF 更贴近工程代理；Local 表示“基于邻近历史”的局部近似。',
  acquisition: 'EI 偏改进，UCB 偏探索，PI 更保守，Random 是无代理基线。',
  beta: 'UCB 探索强度。越大越愿意尝试高不确定度权重组合。',
  synthetic: '开启后使用完整 24 通道库；关闭后只保留窄带 LED 通道。',
  seed: '固定种子后，随机候选采样和推荐路径都可重复，便于课堂对比不同优化设置。',
  weighted:
    '权重作用在归一化后的目标分量上。误差、成本、功耗、通道数和寿命惩罚可以自由组合。',
  pareto:
    'Pareto 模式通过随机标量化推荐下一步，同时保留原始目标空间的非支配前沿。',
};

const METRIC_OPTIONS: Array<{ key: LedMetricKey; label: string }> = [
  { key: 'matchError', label: '匹配误差' },
  { key: 'spectralRmse', label: '光谱均方根误差（Spectral RMSE）' },
  { key: 'sam', label: 'SAM' },
  { key: 'cost', label: '总成本' },
  { key: 'power', label: '总功耗' },
  { key: 'channelCount', label: '通道数' },
  { key: 'lifetimePenalty', label: '寿命惩罚' },
];

export default function LedCaseView() {
  const [matchMode, setMatchMode] = useState<MatchMode>('spectral');
  const [selectedTarget, setSelectedTarget] = useState<TargetSpectrum>(TARGET_SPECTRA[0]);
  const [useSynthetic, setUseSynthetic] = useState(true);
  const [taskMode, setTaskMode] = useState<TaskMode>('weighted');
  const [singleMetric, setSingleMetric] = useState<LedMetricKey>('matchError');
  const [weights, setWeights] = useState<Record<LedMetricKey, number>>({
    matchError: DEFAULT_OBJECTIVE_CONFIG.matchError,
    spectralRmse: 0,
    sam: 0,
    cost: DEFAULT_OBJECTIVE_CONFIG.cost,
    power: DEFAULT_OBJECTIVE_CONFIG.power,
    channelCount: DEFAULT_OBJECTIVE_CONFIG.channelCount,
    lifetimePenalty: DEFAULT_OBJECTIVE_CONFIG.lifetimePenalty,
  });
  const [paretoX, setParetoX] = useState<LedMetricKey>('matchError');
  const [paretoY, setParetoY] = useState<LedMetricKey>('cost');
  const [surrogateModel, setSurrogateModel] = useState<SurrogateModel>('GP');
  const [acqFn, setAcqFn] = useState<ContinuousAcqFn>('EI');
  const [ucbBeta, setUcbBeta] = useState(2.0);
  const [seedVal, setSeedVal] = useState(42);
  const [autoRunning, setAutoRunning] = useState(false);
  const [, setTick] = useState(0);

  const sessionRef = useRef<ContinuousCaseSession<LedEvaluation> | null>(null);
  const timerRef = useRef<number | null>(null);
  const autoRef = useRef(false);
  const strategySigRef = useRef('');

  const channels = useMemo(
    () => (useSynthetic ? FULL_LED_LIBRARY : FULL_LED_LIBRARY.filter((channel) => !channel.isSynthetic)),
    [useSynthetic]
  );
  const categories = useMemo(() => [...new Set(TARGET_SPECTRA.map((item) => item.category))], []);

  const caseDef = useMemo(
    () => buildLedCaseDef(channels, selectedTarget, matchMode),
    [channels, matchMode, selectedTarget]
  );

  const objective = useMemo<ObjectiveSpec>(() => {
    if (taskMode === 'single') return { mode: 'single', metricKey: singleMetric };
    if (taskMode === 'weighted') return { mode: 'weighted', weights };
    return { mode: 'pareto', metricKeys: [paretoX, paretoY] };
  }, [paretoX, paretoY, singleMetric, taskMode, weights]);

  const strategy = useMemo<OptimizerStrategy>(
    () => ({
      surrogateModel,
      acquisition: acqFn,
      ucbBeta,
      objective,
    }),
    [acqFn, objective, surrogateModel, ucbBeta]
  );

  const strategySig = JSON.stringify({
    target: selectedTarget.id,
    matchMode,
    useSynthetic,
    seedVal,
    strategy,
  });

  const rerender = useCallback(() => setTick((tick) => tick + 1), []);

  const stopAuto = useCallback(() => {
    autoRef.current = false;
    setAutoRunning(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const ensureSession = useCallback(
    (forceReset = false) => {
      const needsNewSession =
        forceReset ||
        !sessionRef.current ||
        strategySigRef.current !== strategySig;

      if (needsNewSession) {
        stopAuto();
        sessionRef.current = new ContinuousCaseSession(caseDef, strategy, seedVal);
        strategySigRef.current = strategySig;
      }

      return sessionRef.current!;
    },
    [caseDef, seedVal, stopAuto, strategy, strategySig]
  );

  useEffect(() => {
    ensureSession(true);
    rerender();
    return () => {
      autoRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [ensureSession, rerender]);

  useEffect(() => {
    const handler = () => {
      ensureSession(true);
      rerender();
    };
    window.addEventListener('lecture:reset', handler);
    return () => window.removeEventListener('lecture:reset', handler);
  }, [ensureSession, rerender]);

  const session = ensureSession(false);
  const history = session.state.history;
  const recommendation = session.state.currentRecommendation;
  const bestRecord = history.reduce<typeof history[number] | null>(
    (best, record) => (!best || record.scalarObjective < best.scalarObjective ? record : best),
    null
  );
  const recommendationEval = recommendation ? caseDef.evaluate(recommendation.params) : null;

  const paretoData = useMemo(() => {
    const front = [...session.state.paretoFront].sort((a, b) => a.metricValues[paretoX] - b.metricValues[paretoX]);
    return {
      history: {
        x: history.map((record) => record.metricValues[paretoX]),
        y: history.map((record) => record.metricValues[paretoY]),
        type: 'scatter' as const,
        mode: 'markers' as const,
        marker: {
          color: history.map((_, index) => (index === history.length - 1 ? '#ff6b6b' : '#8a92a3')),
          size: history.map((_, index) => (index === history.length - 1 ? 8 : 5)),
        },
        text: history.map(
          (record) =>
            `iter ${record.iteration}<br>${metricLabel(paretoX)}: ${record.metricValues[paretoX].toFixed(4)}<br>${metricLabel(paretoY)}: ${record.metricValues[paretoY].toFixed(4)}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: '全部观测点',
      },
      front:
        front.length > 0
          ? {
              x: front.map((record) => record.metricValues[paretoX]),
              y: front.map((record) => record.metricValues[paretoY]),
              type: 'scatter' as const,
              mode: 'lines+markers' as const,
              line: { color: '#00f5d4', width: 2 },
              marker: { size: 6, color: '#00f5d4' },
              name: 'Pareto 前沿',
            }
          : null,
    };
  }, [history, paretoX, paretoY, session.state.paretoFront]);

  const currentMetrics = bestRecord?.evaluation ?? recommendationEval ?? null;
  const activeChannels = useMemo(
    () => (currentMetrics ? activeChannelsFromEvaluation(channels, currentMetrics) : []),
    [channels, currentMetrics]
  );

  const runOne = useCallback(() => {
    const liveSession = ensureSession(false);
    liveSession.step();
    rerender();
  }, [ensureSession, rerender]);

  const runFive = useCallback(() => {
    const liveSession = ensureSession(false);
    liveSession.runSteps(5);
    rerender();
  }, [ensureSession, rerender]);

  const startAuto = useCallback(() => {
    const liveSession = ensureSession(false);
    autoRef.current = true;
    setAutoRunning(true);
    const loop = () => {
      if (!autoRef.current) {
        setAutoRunning(false);
        return;
      }
      liveSession.step();
      rerender();
      timerRef.current = window.setTimeout(loop, AUTO_INTERVAL_MS);
    };
    loop();
  }, [ensureSession, rerender]);

  const doReset = useCallback(() => {
    ensureSession(true);
    rerender();
  }, [ensureSession, rerender]);

  const taskSummary = {
    modeLabel:
      taskMode === 'single'
        ? '单目标（Single Objective）'
        : taskMode === 'weighted'
          ? '线性组合（Weighted Sum）'
          : 'Pareto 前沿（Pareto Frontier）',
    objectiveLabel:
      taskMode === 'single'
        ? `针对目标光谱 ${selectedTarget.name}，直接优化 ${metricLabel(singleMetric)}。`
        : taskMode === 'weighted'
          ? '最小化由匹配质量、成本、功耗、通道数和寿命惩罚共同构成的加权分数。'
          : `跟踪 ${metricLabel(paretoX)} 与 ${metricLabel(paretoY)} 之间的非支配权衡。`,
    strategyLabel:
      taskMode === 'pareto'
        ? '先读目标空间中的前沿，再看是哪些通道组合和光谱形状形成了这些权衡。'
        : '把标量分数历史和启用通道一起看，才能知道优化器在牺牲什么。',
    takeaway:
      taskMode === 'single'
        ? '这个模式最适合展示系统只关心一个运行 KPI 时会发生什么。'
        : taskMode === 'weighted'
          ? '这是更接近工程实际的定标设定：优化器只看一个总分，但原始指标会说明这个总分是用成本、功耗还是硬件复杂度换来的。'
          : '这是决策支持设定：优化器不再隐藏权衡，而是直接返回一条可选折中前沿。',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      <div className="lg:col-span-1 space-y-3">
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-1.5">案例背景（Case Background）</div>
          <p className="text-[10px] text-[#8a92a3] leading-5">
            现在 `LED calibration` 也和 `Branin`、`Thin-Film` 使用同一套优化会话。不同之处只剩下黑盒本身：这里的黑盒是
            多通道 LED 光谱合成数字孪生。
          </p>
        </div>

        <TaskModeSummary
          modeLabel={taskSummary.modeLabel}
          objectiveLabel={taskSummary.objectiveLabel}
          strategyLabel={taskSummary.strategyLabel}
          takeaway={taskSummary.takeaway}
        />

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3 space-y-3">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest">问题设定（Problem Setup）</div>

          <Field
            label="匹配模式"
            help={HELP.matchMode}
            control={
              <select value={matchMode} onChange={(event) => setMatchMode(event.target.value as MatchMode)} className={selectClassName}>
                <option value="spectral">光谱匹配（Spectral RMSE）</option>
                <option value="band">波段响应匹配（Band-response）</option>
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

          <div className="border-t border-[rgba(67,97,238,0.1)] pt-2 flex items-center justify-between">
            <div className="text-[10px] text-[#d0d4dc]">合成宽谱通道</div>
            <button
              onClick={() => setUseSynthetic((prev) => !prev)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-colors ${
                useSynthetic
                  ? 'bg-[rgba(0,245,212,0.12)] text-[#00f5d4] border-[rgba(0,245,212,0.3)]'
                  : 'bg-[rgba(67,97,238,0.06)] text-[#5a6377] border-[rgba(67,97,238,0.1)]'
              }`}
            >
              {useSynthetic ? '开' : '关'}
            </button>
          </div>
          <p className="text-[8px] text-[#5a6377] leading-relaxed">{HELP.synthetic}</p>

          <Field
            label="任务模式"
            help={HELP.task}
            control={
              <select value={taskMode} onChange={(event) => setTaskMode(event.target.value as TaskMode)} className={selectClassName}>
                <option value="single">单目标</option>
                <option value="weighted">线性组合</option>
                    <option value="pareto">帕累托（Pareto）</option>
              </select>
            }
          />

          {taskMode === 'single' && (
            <Field
              label="单目标"
              control={
                <select value={singleMetric} onChange={(event) => setSingleMetric(event.target.value as LedMetricKey)} className={selectClassName}>
                  {METRIC_OPTIONS.map((metric) => (
                    <option key={metric.key} value={metric.key}>
                      {metricLabel(metric.key)}
                    </option>
                  ))}
                </select>
              }
            />
          )}

          {taskMode === 'weighted' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#d0d4dc]">线性组合权重</div>
              <p className="text-[8px] text-[#5a6377] leading-relaxed">{HELP.weighted}</p>
              {(['matchError', 'cost', 'power', 'channelCount', 'lifetimePenalty'] as const).map((key) => (
                <div key={key} className="rounded border border-[rgba(67,97,238,0.08)] p-2">
                  <div className="flex items-center justify-between mb-1 text-[10px] text-[#d0d4dc]">
                    <span>{metricLabel(key)}</span>
                    <span className="font-mono text-[#4cc9f0]">{weights[key].toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={weights[key]}
                    onChange={(event) => setWeights((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          )}

          {taskMode === 'pareto' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#d0d4dc]">Pareto 目标</div>
              <p className="text-[8px] text-[#5a6377] leading-relaxed">{HELP.pareto}</p>
              <Field
                label="目标 X"
                control={
                  <select
                    value={paretoX}
                    onChange={(event) => {
                      const next = event.target.value as LedMetricKey;
                      setParetoX(next);
                      if (next === paretoY) setParetoY(next === 'cost' ? 'power' : 'cost');
                    }}
                    className={selectClassName}
                  >
                    {METRIC_OPTIONS.filter((metric) => metric.key !== 'spectralRmse' || matchMode === 'spectral').map((metric) => (
                      <option key={metric.key} value={metric.key}>
                        {metricLabel(metric.key)}
                      </option>
                    ))}
                  </select>
                }
              />
              <Field
                label="目标 Y"
                control={
                  <select
                    value={paretoY}
                    onChange={(event) => {
                      const next = event.target.value as LedMetricKey;
                      setParetoY(next);
                      if (next === paretoX) setParetoX(next === 'matchError' ? 'cost' : 'matchError');
                    }}
                    className={selectClassName}
                  >
                    {METRIC_OPTIONS.filter((metric) => metric.key !== 'spectralRmse' || matchMode === 'spectral').map((metric) => (
                      <option key={metric.key} value={metric.key}>
                        {metricLabel(metric.key)}
                      </option>
                    ))}
                  </select>
                }
              />
            </div>
          )}

          <div className="border-t border-[rgba(67,97,238,0.1)] pt-2">
            <div className="text-[9px] text-[#4361ee] font-mono mb-2">SDL 方法设置（SDL Method Setup）</div>
            <div className="space-y-2">
              <Field
                label="代理模型"
                help={HELP.model}
                control={
                  <select
                    value={surrogateModel}
                    onChange={(event) => setSurrogateModel(event.target.value as SurrogateModel)}
                    className={selectClassName}
                  >
                    <option value="GP">Gaussian Process (GP)</option>
                    <option value="RF">Random Forest (RF)</option>
                    <option value="Local">Local surrogate (k-NN)</option>
                  </select>
                }
              />
              <Field
                label="采集函数"
                help={HELP.acquisition}
                control={
                  <select value={acqFn} onChange={(event) => setAcqFn(event.target.value as ContinuousAcqFn)} className={selectClassName}>
                    <option value="EI">Expected Improvement (EI)</option>
                    <option value="UCB">Upper Confidence Bound (UCB)</option>
                    <option value="PI">Probability of Improvement (PI)</option>
                    <option value="Random">随机基线（Random baseline）</option>
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
          </div>

          <Field
            label="随机种子"
            help={HELP.seed}
            control={<input type="number" value={seedVal} onChange={(event) => setSeedVal(Number(event.target.value))} className={inputClassName} />}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={doReset} className={buttonClassName('danger')}>
            <RotateCcw className="w-3 h-3" /> 重置
          </button>
          <button onClick={runOne} disabled={autoRunning} className={buttonClassName('primary', autoRunning)}>
            <Play className="w-3 h-3" /> 运行 1 步
          </button>
          <button onClick={runFive} disabled={autoRunning} className={buttonClassName('secondary', autoRunning)}>
            <Play className="w-3 h-3" /> 运行 5 步
          </button>
          {autoRunning ? (
            <button onClick={stopAuto} className={buttonClassName('warning')}>
              <Square className="w-3 h-3" /> 停止
            </button>
          ) : (
            <button onClick={startAuto} className={buttonClassName('ghost')}>
              <Play className="w-3 h-3" /> 自动运行
            </button>
          )}
        </div>

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3 text-[10px] space-y-1">
          <div className="text-[#8a92a3] font-mono mb-1.5">当前状态 | 迭代 {history.length}</div>
          <MetricRow label="任务" value={taskMode === 'single' ? '单目标' : taskMode === 'weighted' ? '线性组合' : 'Pareto'} highlight="blue" />
          <MetricRow label="优化目标" value={session.state.objectiveLabel} highlight="cyan" />
          {bestRecord ? (
            <>
              <MetricRow label="当前最佳标量值" value={bestRecord.scalarObjective.toFixed(4)} highlight="cyan" />
              <MetricRow label={matchMode === 'band' ? '波段 RMSE（Band RMSE）' : '匹配误差（Match Error）'} value={bestRecord.metricValues.matchError.toFixed(4)} />
              <MetricRow label="总成本" value={`¥${bestRecord.metricValues.cost.toFixed(1)}`} />
              <MetricRow label="总功耗" value={`${bestRecord.metricValues.power.toFixed(2)} W`} />
              <MetricRow label="通道数" value={`${bestRecord.metricValues.channelCount.toFixed(0)}`} />
            </>
          ) : (
            <div className="text-[#5a6377]">尚未执行实验。</div>
          )}
        </div>

        <div className="text-[8px] text-[#5a6377] space-y-1 leading-relaxed">
          <p className="text-[#fee440]">当前版本使用统一连续参数化：每个 LED 通道的权重都在 `[0,1]` 内优化，低于阈值的通道视为关闭。</p>
          <p>{LED_DISCLAIMER}</p>
          <p>{PHOSPHOR_DISCLAIMER}</p>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {!currentMetrics ? (
          <div className="flex items-center justify-center h-80 rounded-lg border border-dashed border-[rgba(67,97,238,0.15)] text-[10px] text-[#8a92a3]">
            先点击“重置”开始演示。
          </div>
        ) : (
          <>
            <Suspense fallback={<div className="h-80 flex items-center justify-center text-[10px] text-[#8a92a3]">正在加载图表…</div>}>
              <LedPlots
                matchMode={matchMode}
                target={selectedTarget}
                metrics={currentMetrics}
                activeChannels={activeChannels}
                history={history}
                taskMode={taskMode}
                paretoData={paretoData}
                paretoX={paretoX}
                paretoY={paretoY}
              />
            </Suspense>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="glass-panel rounded-lg border border-[rgba(43,108,176,0.25)] p-4">
                <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">下一推荐设置（Recommended Next Setting）</div>
                {recommendation && recommendationEval ? (
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <MetricRow label={matchMode === 'band' ? '波段 RMSE（Band RMSE）' : '匹配误差（Match Error）'} value={recommendationEval.matchErrorValue.toFixed(4)} highlight="cyan" />
                    <MetricRow label="光谱均方根误差（Spectral RMSE）" value={recommendationEval.rmse.toFixed(4)} />
                    <MetricRow label="SAM" value={recommendationEval.samVal.toFixed(4)} />
                    <MetricRow label="总成本" value={`¥${recommendationEval.totalCost.toFixed(1)}`} />
                    <MetricRow label="总功耗" value={`${recommendationEval.totalPower.toFixed(2)} W`} />
                    <MetricRow label="通道数" value={`${recommendationEval.channelCount}`} />
                    <MetricRow label="预测均值（Predicted Mean）" value={recommendation.predictedMean.toFixed(4)} />
                    <MetricRow label="预测标准差（Predicted Std）" value={recommendation.predictedStd.toFixed(4)} />
                    <MetricRow label="采集函数值（Acquisition）" value={`${recommendation.acquisitionType} = ${recommendation.acquisitionValue.toFixed(5)}`} />
                    <div className="pt-2 border-t border-[rgba(67,97,238,0.1)] text-[10px] text-[#8a92a3] leading-5">
                      <p>{recommendation.explanation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-[#5a6377] font-mono">尚无推荐设置。</div>
                )}
              </div>

              <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] overflow-hidden">
                <div className="px-4 py-2 border-b border-[rgba(67,97,238,0.1)]">
                  <span className="text-[9px] font-mono text-[#8a92a3] tracking-widest">历史记录（History, {history.length}）</span>
                </div>
                {history.length === 0 ? (
                  <div className="px-4 py-6 text-[10px] text-[#5a6377] text-center font-mono">点击“运行 1 步”开始。</div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-[10px] font-mono border-collapse">
                      <thead className="sticky top-0" style={{ background: 'rgba(6,22,42,0.98)' }}>
                        <tr className="border-b border-[rgba(67,97,238,0.15)]">
                          {['#', '匹配', '成本', '功耗', '通道数', '标量值'].map((header) => (
                            <th key={header} className="py-1.5 px-2 text-left text-[#8a92a3] font-normal">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().map((record) => {
                          const isBest = bestRecord?.iteration === record.iteration;
                          return (
                            <tr
                              key={record.iteration}
                              className={`border-b border-[rgba(67,97,238,0.06)] ${isBest ? 'bg-[rgba(39,103,73,0.08)]' : ''}`}
                            >
                              <td className="py-1.5 px-2 text-[#5a6377]">{record.iteration}</td>
                              <td className="py-1.5 px-2 text-[#d0d4dc]">{record.metricValues.matchError.toFixed(3)}</td>
                              <td className="py-1.5 px-2 text-[#d0d4dc]">{record.metricValues.cost.toFixed(1)}</td>
                              <td className="py-1.5 px-2 text-[#d0d4dc]">{record.metricValues.power.toFixed(2)}</td>
                              <td className="py-1.5 px-2 text-[#d0d4dc]">{record.metricValues.channelCount.toFixed(0)}</td>
                              <td className={`py-1.5 px-2 ${isBest ? 'text-[#00f5d4] font-semibold' : 'text-[#d0d4dc]'}`}>
                                {record.scalarObjective.toFixed(4)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LedPlots({
  matchMode,
  target,
  metrics,
  activeChannels,
  history,
  taskMode,
  paretoData,
  paretoX,
  paretoY,
}: {
  matchMode: MatchMode;
  target: TargetSpectrum;
  metrics: LedEvaluation;
  activeChannels: Array<{ channel: LedChannel; weight: number }>;
  history: Array<{ iteration: number; scalarObjective: number } & { evaluation: LedEvaluation }>;
  taskMode: TaskMode;
  paretoData: { history: any; front: any | null };
  paretoX: LedMetricKey;
  paretoY: LedMetricKey;
}) {
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
      y: metrics.mixSpd.map((value, index) => value - target.reflectance[index]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: '残差',
      line: { color: '#f59e0b', width: 1 },
      yaxis: 'y2',
    },
  ];

  const contributionData = activeChannels.map(({ channel, weight }) => ({
    x: WAVELENGTH_GRID,
    y: channel.spd.map((value) => value * weight),
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: channel.isSynthetic ? `[宽谱] ${channel.name}` : channel.name,
    line: { width: channel.isSynthetic ? 2.1 : 1.2, dash: (channel.isSynthetic ? 'dash' : 'solid') as 'dash' | 'solid' },
    stackgroup: 'one' as const,
  }));

  const intensityData = [
    {
      x: activeChannels.map(({ channel }) => channel.name),
      y: activeChannels.map(({ weight }) => weight),
      type: 'bar' as const,
      marker: {
        color: activeChannels.map(({ channel }) => (channel.isSynthetic ? 'rgba(67,97,238,0.75)' : 'rgba(0,245,212,0.75)')),
      },
    },
  ];

  const historyData = [
    {
      x: history.map((record) => record.iteration),
      y: history.map((record) => record.scalarObjective),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      line: { color: '#00f5d4', width: 1.6 },
      marker: { size: 4 },
      name: '标量目标（Scalar Objective）',
    },
  ];

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Plot
          data={spectrumData}
          layout={{
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
          }}
          config={plotConfig}
          className="w-full"
        />

        <Plot
          data={contributionData}
          layout={{
            title: { text: '启用通道的光谱贡献', font: { color: '#d0d4dc', size: 12 } },
            xaxis: { title: { text: '波长 (nm)', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
            yaxis: { title: { text: '相对输出', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'rgba(0,13,29,0.5)',
            font: { color: '#8a92a3', size: 10 },
            margin: { t: 30, r: 10, b: 40, l: 50 },
            height: 220,
            legend: { font: { size: 8 } },
          }}
          config={plotConfig}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Plot
          data={intensityData}
          layout={{
            title: { text: '启用通道的相对强度', font: { color: '#d0d4dc', size: 12 } },
            xaxis: { color: '#8a92a3', tickangle: -25 },
            yaxis: { title: { text: '权重', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3', range: [0, 1.05] },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'rgba(0,13,29,0.5)',
            font: { color: '#8a92a3', size: 10 },
            margin: { t: 30, r: 10, b: 80, l: 50 },
            height: 240,
            showlegend: false,
          }}
          config={plotConfig}
          className="w-full"
        />

        {taskMode === 'pareto' ? (
          <Plot
            data={paretoData.front ? [paretoData.history, paretoData.front] : [paretoData.history]}
            layout={{
              title: { text: '目标空间（Objective Space）', font: { color: '#d0d4dc', size: 12 } },
              xaxis: { title: { text: metricLabel(paretoX), font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
              yaxis: { title: { text: metricLabel(paretoY), font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(0,13,29,0.5)',
              font: { color: '#8a92a3', size: 10 },
              margin: { t: 30, r: 10, b: 40, l: 50 },
              height: 220,
              legend: { x: 0.01, y: 0.99, font: { size: 9 } },
            }}
            config={plotConfig}
            className="w-full"
          />
        ) : matchMode === 'band' ? (
          <Plot
            data={bandCompareData}
            layout={{
              barmode: 'group' as const,
              title: { text: '波段响应对比（Band-response）', font: { color: '#d0d4dc', size: 12 } },
              xaxis: { color: '#8a92a3' },
              yaxis: { title: { text: '平均响应', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(0,13,29,0.5)',
              font: { color: '#8a92a3', size: 10 },
              margin: { t: 30, r: 10, b: 40, l: 50 },
              height: 220,
              legend: { font: { size: 9 } },
            }}
            config={plotConfig}
            className="w-full"
          />
        ) : (
          <Plot
            data={historyData}
            layout={{
              title: { text: '标量目标（Scalar Objective）随迭代变化', font: { color: '#d0d4dc', size: 12 } },
              xaxis: { title: { text: '迭代', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
              yaxis: { title: { text: '标量目标（Scalar Objective）', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'rgba(0,13,29,0.5)',
              font: { color: '#8a92a3', size: 10 },
              margin: { t: 30, r: 10, b: 40, l: 50 },
              height: 220,
              showlegend: false,
            }}
            config={plotConfig}
            className="w-full"
          />
        )}
      </div>

      <div className="rounded-lg border border-[rgba(67,97,238,0.1)] bg-[rgba(6,22,42,0.82)] p-4 text-[10px] text-[#8a92a3]">
        <div className="text-[#d0d4dc] font-mono mb-2">当前启用通道 ({activeChannels.length})</div>
        <div className="space-y-1 max-h-44 overflow-y-auto">
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
      </div>
    </div>
  );
}

function buildLedCaseDef(
  channels: LedChannel[],
  target: TargetSpectrum,
  matchMode: MatchMode
): ContinuousCaseDef<LedEvaluation> {
  const paramDefs: ContinuousParamDef[] = channels.map((channel) => ({
    name: channel.name,
    nameEn: channel.name,
    unit: '',
    min: 0,
    max: 1,
    step: 0.02,
    default: 0,
  }));

  const maxCost = channels.reduce((sum, channel) => sum + channel.price, 0);
  const maxPower = channels.reduce((sum, channel) => sum + channel.power_max_w, 0);

  return {
    id: `led-${target.id}-${matchMode}-${channels.length}`,
    name: 'LED calibration',
    params: paramDefs,
    metrics: [
      {
        key: 'matchError',
        label: matchMode === 'band' ? '波段 RMSE（Band RMSE）' : '匹配误差（Match Error）',
        direction: 'min',
        range: [0, 1],
        accessor: (evaluation) => evaluation.matchErrorValue,
      },
      { key: 'spectralRmse', label: '光谱均方根误差（Spectral RMSE）', direction: 'min', range: [0, 1], accessor: (evaluation) => evaluation.rmse },
      { key: 'sam', label: 'SAM', direction: 'min', range: [0, Math.PI / 2], accessor: (evaluation) => evaluation.samVal },
      { key: 'cost', label: '总成本', direction: 'min', range: [0, maxCost], accessor: (evaluation) => evaluation.totalCost },
      { key: 'power', label: '总功耗', direction: 'min', range: [0, maxPower], accessor: (evaluation) => evaluation.totalPower },
      { key: 'channelCount', label: '通道数', direction: 'min', range: [0, channels.length], accessor: (evaluation) => evaluation.channelCount },
      {
        key: 'lifetimePenalty',
        label: '寿命惩罚',
        direction: 'min',
        range: [0, 1.1],
        accessor: (evaluation) => evaluation.lifetimePenaltyValue,
      },
    ],
    evaluate: (params) => evaluateLedParams(channels, target, matchMode, params),
    candidateCount: channels.length > 16 ? 160 : 220,
    gpLengthScale: 0.45,
  };
}

function evaluateLedParams(
  channels: LedChannel[],
  target: TargetSpectrum,
  matchMode: MatchMode,
  params: number[]
): LedEvaluation {
  const weights = params.map((value) => clamp(value, 0, 1));
  const enabled = weights.map((value) => value >= CHANNEL_THRESHOLD);
  const metrics = computeMetrics(channels, enabled, weights, target.reflectance, matchMode, DEFAULT_OBJECTIVE_CONFIG as ObjectiveConfig);
  return {
    ...metrics,
    matchErrorValue: metrics.objectiveBreakdown.matchError,
    lifetimePenaltyValue: metrics.objectiveBreakdown.lifetimePenalty,
  };
}

function activeChannelsFromEvaluation(channels: LedChannel[], evaluation: LedEvaluation) {
  return channels
    .map((channel, index) => ({ channel, weight: evaluation.weights[index] ?? 0 }))
    .filter(({ weight }) => weight >= CHANNEL_THRESHOLD)
    .sort((a, b) => b.weight - a.weight);
}

function metricLabel(key: LedMetricKey) {
  return METRIC_OPTIONS.find((metric) => metric.key === key)?.label ?? key;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
