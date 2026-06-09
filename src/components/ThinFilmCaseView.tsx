import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Square } from 'lucide-react';
import { hypervolume2D } from '@/lib/multiObjective';
import type { ThinFilmMetrics } from '@/lib/thinFilmEngine';
import {
  THIN_FILM_PROBLEM,
  describeThinFilmLayers,
  evaluateThinFilmDesign,
} from '@/lib/thinFilmEngine';
import {
  ContinuousCaseSession,
  type ContinuousAcqFn,
  type ContinuousCaseDef,
  type ObjectiveSpec,
  type OptimizerStrategy,
} from '@/lib/continuousCaseOptimizer';
import type { SurrogateModel } from '@/lib/calibrationEngine';
import {
  Field,
  MetricRow,
  buttonClassName,
  inputClassName,
  plotConfig,
  selectClassName,
} from '@/components/caseStudioUi';

const Plot = lazy(() => import('react-plotly.js'));
const AUTO_INTERVAL_MS = 550;

type TaskMode = 'single' | 'weighted' | 'pareto';
type SpectrumView = 'best' | 'recommendation';
type ThinFilmMetricKey =
  | 'legacyObjective'
  | 'avgInBandAbsorption'
  | 'avgShortPassTransmission'
  | 'avgLongPassTransmission'
  | 'avgOutOfBandTransmission'
  | 'avgInBandReflectance'
  | 'totalThicknessNm';

const THIN_FILM_CASE: ContinuousCaseDef<ThinFilmMetrics> = {
  id: 'thin-film-studio',
  name: 'Thin-film absorber',
  params: [
    { name: 'SiO2 cap', nameEn: 'SiO2 Cap', unit: 'nm', min: 10, max: 180, step: 1, default: 135 },
    { name: 'TiO2 mirror', nameEn: 'TiO2 Mirror', unit: 'nm', min: 10, max: 180, step: 1, default: 80 },
    { name: 'SiO2 spacer', nameEn: 'SiO2 Spacer', unit: 'nm', min: 5, max: 220, step: 1, default: 160 },
    { name: 'Cr absorber', nameEn: 'Cr Absorber', unit: 'nm', min: 4, max: 30, step: 0.5, default: 6 },
  ],
  metrics: [
    { key: 'legacyObjective', label: 'Legacy objective', direction: 'max', range: [0, 1], accessor: (evaluation) => evaluation.objective },
    { key: 'avgInBandAbsorption', label: 'A(650-700)', direction: 'max', range: [0, 1], accessor: (evaluation) => evaluation.avgInBandAbsorption },
    { key: 'avgShortPassTransmission', label: 'T(400-620)', direction: 'max', range: [0, 1], accessor: (evaluation) => evaluation.avgShortPassTransmission },
    { key: 'avgLongPassTransmission', label: 'T(730-1100)', direction: 'max', range: [0, 1], accessor: (evaluation) => evaluation.avgLongPassTransmission },
    {
      key: 'avgOutOfBandTransmission',
      label: 'T(out-of-band)',
      direction: 'max',
      range: [0, 1],
      accessor: (evaluation) => 0.5 * (evaluation.avgShortPassTransmission + evaluation.avgLongPassTransmission),
    },
    { key: 'avgInBandReflectance', label: 'R(650-700)', direction: 'min', range: [0, 1], accessor: (evaluation) => evaluation.avgInBandReflectance },
    { key: 'totalThicknessNm', label: 'Total thickness', direction: 'min', range: [350, 900], accessor: (evaluation) => evaluation.totalThicknessNm },
  ],
  evaluate: (params) => evaluateThinFilmDesign(params),
  candidateCount: 180,
  gpLengthScale: 0.24,
};

const METRIC_OPTIONS: Array<{ key: ThinFilmMetricKey; label: string }> = [
  { key: 'legacyObjective', label: 'Legacy objective' },
  { key: 'avgInBandAbsorption', label: 'A(650-700)' },
  { key: 'avgShortPassTransmission', label: 'T(400-620)' },
  { key: 'avgLongPassTransmission', label: 'T(730-1100)' },
  { key: 'avgOutOfBandTransmission', label: 'T(out-of-band)' },
  { key: 'avgInBandReflectance', label: 'R(650-700)' },
  { key: 'totalThicknessNm', label: 'Total thickness' },
];

const HELP = {
  task:
    '单目标模式适合讲“目标换了，最优设计也换了”；线性组合模式适合讲工程权衡；Pareto 模式则把“吸收 / 透过 / 厚度”这类冲突目标放到同一张目标空间图里。',
  model: 'GP 适合讲不确定性，RF 更贴近工程代理，Local 则更像“基于近邻经验”的局部模型。',
  acquisition: 'EI 偏改进，UCB 偏探索，PI 更保守，Random 用于当作基线。',
  beta: 'UCB 探索强度。越大越会去试还不确定的膜厚组合。',
  seed: '固定后可重复比较不同目标任务、代理模型或采集函数导致的设计轨迹差异。',
  weighted:
    '这里的权重作用在归一化后的目标分量上。最大化目标会自动转成“损失”，最小化目标保持为“代价”。',
  pareto:
    'Pareto 模式通过随机标量化推荐下一步，但前沿显示的是原始物理指标，不是内部的归一化损失。',
  view:
    '可切换查看当前最优设计和下一推荐设计，避免把“最佳已观测结果”和“下一候选设计”混在同一张图里。',
};

export default function ThinFilmCaseView() {
  const [taskMode, setTaskMode] = useState<TaskMode>('single');
  const [singleMetric, setSingleMetric] = useState<ThinFilmMetricKey>('legacyObjective');
  const [weights, setWeights] = useState<Record<string, number>>({
    avgInBandAbsorption: 1.2,
    avgShortPassTransmission: 0.5,
    avgLongPassTransmission: 0.5,
    avgInBandReflectance: 0.35,
    totalThicknessNm: 0.2,
  });
  const [paretoX, setParetoX] = useState<ThinFilmMetricKey>('avgInBandAbsorption');
  const [paretoY, setParetoY] = useState<ThinFilmMetricKey>('avgOutOfBandTransmission');
  const [surrogateModel, setSurrogateModel] = useState<SurrogateModel>('GP');
  const [acqFn, setAcqFn] = useState<ContinuousAcqFn>('EI');
  const [ucbBeta, setUcbBeta] = useState(2.0);
  const [seedVal, setSeedVal] = useState(42);
  const [autoRunning, setAutoRunning] = useState(false);
  const [spectrumView, setSpectrumView] = useState<SpectrumView>('best');
  const [, setTick] = useState(0);

  const sessionRef = useRef<ContinuousCaseSession<ThinFilmMetrics> | null>(null);
  const timerRef = useRef<number | null>(null);
  const autoRef = useRef(false);
  const strategySigRef = useRef('');

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

  const strategySig = JSON.stringify({ seedVal, strategy });
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
        sessionRef.current = new ContinuousCaseSession(THIN_FILM_CASE, strategy, seedVal);
        strategySigRef.current = strategySig;
      }

      return sessionRef.current!;
    },
    [seedVal, stopAuto, strategy, strategySig]
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
  const recommendationEval = recommendation ? THIN_FILM_CASE.evaluate(recommendation.params) : null;

  const displayMetrics =
    spectrumView === 'recommendation' ? recommendationEval ?? bestRecord?.evaluation ?? null : bestRecord?.evaluation ?? recommendationEval ?? null;
  const displayParams =
    spectrumView === 'recommendation' ? recommendation?.params ?? bestRecord?.params ?? null : bestRecord?.params ?? recommendation?.params ?? null;
  const layerStack = displayParams ? describeThinFilmLayers(displayParams) : describeThinFilmLayers([135, 80, 160, 6]);
  const maxLayerThickness = Math.max(...layerStack.map((layer) => layer.thicknessNm), 1);

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
        name: 'All observations',
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
              name: 'Pareto front',
            }
          : null,
    };
  }, [history, paretoX, paretoY, session.state.paretoFront]);

  const hvHistory = useMemo(() => {
    if (taskMode !== 'pareto') return [];
    const values: number[] = [];
    const points: number[][] = [];
    for (const record of history) {
      if (record.objectiveVector && record.objectiveVector.length === 2) {
        points.push(record.objectiveVector);
        values.push(hypervolume2D(points, [1.05, 1.05]));
      }
    }
    return values;
  }, [history, taskMode]);

  const currentHypervolume = hvHistory.length > 0 ? hvHistory[hvHistory.length - 1] : 0;

  const scalarHistoryData = [
    {
      x: history.map((record) => record.iteration),
      y: history.map((record) => record.scalarObjective),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      line: { color: '#00f5d4', width: 1.6 },
      marker: { size: 4 },
      name: 'Scalar objective',
    },
  ];

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

  const exportParetoFront = useCallback(() => {
    const front = session.state.paretoFront;
    if (front.length === 0) return;

    const headers = [
      'x_metric',
      'y_metric',
      'x_value',
      'y_value',
      'siO2_cap_nm',
      'tiO2_mirror_nm',
      'siO2_spacer_nm',
      'cr_absorber_nm',
      'legacy_objective',
      'avg_in_band_absorption',
      'avg_short_pass_transmission',
      'avg_long_pass_transmission',
      'avg_out_of_band_transmission',
      'avg_in_band_reflectance',
      'total_thickness_nm',
    ];

    const rows = front.map((record) => [
      paretoX,
      paretoY,
      record.metricValues[paretoX]?.toFixed(6) ?? '',
      record.metricValues[paretoY]?.toFixed(6) ?? '',
      record.params[0]?.toFixed(4) ?? '',
      record.params[1]?.toFixed(4) ?? '',
      record.params[2]?.toFixed(4) ?? '',
      record.params[3]?.toFixed(4) ?? '',
      record.metricValues.legacyObjective?.toFixed(6) ?? '',
      record.metricValues.avgInBandAbsorption?.toFixed(6) ?? '',
      record.metricValues.avgShortPassTransmission?.toFixed(6) ?? '',
      record.metricValues.avgLongPassTransmission?.toFixed(6) ?? '',
      record.metricValues.avgOutOfBandTransmission?.toFixed(6) ?? '',
      record.metricValues.avgInBandReflectance?.toFixed(6) ?? '',
      record.metricValues.totalThicknessNm?.toFixed(6) ?? '',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thin-film-pareto-${paretoX}-vs-${paretoY}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [paretoX, paretoY, session.state.paretoFront]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      <div className="lg:col-span-1 space-y-3">
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-1.5">REALISTIC CASE</div>
          <p className="text-[10px] text-[#8a92a3] leading-5">
            这个案例背后是真实的薄膜传输矩阵模拟器，不是手写 toy function。你现在可以把它当成一个可切换任务定义的
            SDL 黑盒：优化对象不变，目标定义和推荐策略可切换。
          </p>
        </div>

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3 space-y-3">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest">Problem setup</div>

          <Field
            label="任务模式"
            help={HELP.task}
            control={
              <select value={taskMode} onChange={(event) => setTaskMode(event.target.value as TaskMode)} className={selectClassName}>
                <option value="single">单目标</option>
                <option value="weighted">线性组合</option>
                <option value="pareto">Pareto</option>
              </select>
            }
          />

          {taskMode === 'single' && (
            <Field
              label="单目标"
              control={
                <select
                  value={singleMetric}
                  onChange={(event) => setSingleMetric(event.target.value as ThinFilmMetricKey)}
                  className={selectClassName}
                >
                  {METRIC_OPTIONS.map((metric) => (
                    <option key={metric.key} value={metric.key}>
                      {metric.label}
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
              {(['avgInBandAbsorption', 'avgShortPassTransmission', 'avgLongPassTransmission', 'avgInBandReflectance', 'totalThicknessNm'] as const).map((key) => (
                <div key={key} className="rounded border border-[rgba(67,97,238,0.08)] p-2">
                  <div className="flex items-center justify-between mb-1 text-[10px] text-[#d0d4dc]">
                    <span>{metricLabel(key)}</span>
                    <span className="font-mono text-[#4cc9f0]">{(weights[key] ?? 0).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={weights[key] ?? 0}
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
                      const next = event.target.value as ThinFilmMetricKey;
                      setParetoX(next);
                      if (next === paretoY) setParetoY(next === 'avgOutOfBandTransmission' ? 'totalThicknessNm' : 'avgOutOfBandTransmission');
                    }}
                    className={selectClassName}
                  >
                    {METRIC_OPTIONS.filter((metric) => metric.key !== 'legacyObjective').map((metric) => (
                      <option key={metric.key} value={metric.key}>
                        {metric.label}
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
                      const next = event.target.value as ThinFilmMetricKey;
                      setParetoY(next);
                      if (next === paretoX) setParetoX(next === 'avgInBandAbsorption' ? 'totalThicknessNm' : 'avgInBandAbsorption');
                    }}
                    className={selectClassName}
                  >
                    {METRIC_OPTIONS.filter((metric) => metric.key !== 'legacyObjective').map((metric) => (
                      <option key={metric.key} value={metric.key}>
                        {metric.label}
                      </option>
                    ))}
                  </select>
                }
              />
            </div>
          )}

          <div className="border-t border-[rgba(67,97,238,0.1)] pt-2">
            <div className="text-[9px] text-[#4361ee] font-mono mb-2">SDL method setup</div>
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
                    <option value="Random">Random baseline</option>
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
            control={
              <input
                type="number"
                value={seedVal}
                onChange={(event) => setSeedVal(Number(event.target.value))}
                className={inputClassName}
              />
            }
          />

          <Field
            label="光谱展示对象"
            help={HELP.view}
            control={
              <select value={spectrumView} onChange={(event) => setSpectrumView(event.target.value as SpectrumView)} className={selectClassName}>
                <option value="best">当前最优设计</option>
                <option value="recommendation">下一推荐设计</option>
              </select>
            }
          />
          <p className="text-[8px] text-[#5a6377] leading-relaxed">
            改动任务模式、目标权重、代理模型或种子后，下一次运行会按新配置重新开始。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={doReset} className={buttonClassName('danger')}>
            <RotateCcw className="w-3 h-3" /> 重置
          </button>
          <button onClick={runOne} disabled={autoRunning} className={buttonClassName('primary', autoRunning)}>
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

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3 text-[10px] space-y-1">
          <div className="text-[#8a92a3] font-mono mb-1.5">当前状态 | 迭代 {history.length}</div>
          <MetricRow label="任务" value={taskMode === 'single' ? '单目标' : taskMode === 'weighted' ? '线性组合' : 'Pareto'} highlight="blue" />
          <MetricRow label="优化目标" value={session.state.objectiveLabel} highlight="cyan" />
          {bestRecord ? (
            <>
              <MetricRow label="best scalar" value={bestRecord.scalarObjective.toFixed(4)} highlight="cyan" />
              <MetricRow label="Legacy objective" value={bestRecord.metricValues.legacyObjective.toFixed(4)} />
              <MetricRow label="A(650-700)" value={bestRecord.metricValues.avgInBandAbsorption.toFixed(4)} />
              <MetricRow label="T(out-of-band)" value={bestRecord.metricValues.avgOutOfBandTransmission.toFixed(4)} />
              <MetricRow label="Thickness" value={`${bestRecord.metricValues.totalThicknessNm.toFixed(1)} nm`} />
            </>
          ) : (
            <div className="text-[#5a6377]">尚未执行实验。</div>
          )}
        </div>

        {taskMode === 'pareto' && (
          <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3 text-[10px] space-y-2">
            <div className="text-[#8a92a3] font-mono mb-1.5">Pareto stats</div>
            <MetricRow label="前沿点数" value={`${session.state.paretoFront.length}`} highlight="blue" />
            <MetricRow label="Hypervolume" value={currentHypervolume.toFixed(4)} highlight="cyan" />
            <button onClick={exportParetoFront} disabled={session.state.paretoFront.length === 0} className={buttonClassName('ghost', session.state.paretoFront.length === 0)}>
              导出前沿 CSV
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[rgba(67,97,238,0.1)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a92a3]">
              Spectrum and stack | {displayMetrics ? (spectrumView === 'best' ? 'best observed design' : 'recommended design') : 'no design yet'}
            </span>
            <span className="text-[10px] font-mono text-[#5a6377]">{history.length} experiments</span>
          </div>

          {!displayMetrics ? (
            <div className="flex items-center justify-center h-80 text-[10px] text-[#8a92a3]">Run one experiment to initialize the spectrum view.</div>
          ) : (
            <div className="p-3 space-y-3">
              <Suspense fallback={<div className="h-80 flex items-center justify-center text-[10px] text-[#8a92a3]">Loading chart...</div>}>
                <Plot
                  data={[
                    {
                      x: displayMetrics.wavelengthsNm,
                      y: displayMetrics.transmittance,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'T',
                      line: { color: '#00f5d4', width: 2 },
                    },
                    {
                      x: displayMetrics.wavelengthsNm,
                      y: displayMetrics.reflectance,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'R',
                      line: { color: '#4cc9f0', width: 1.6 },
                    },
                    {
                      x: displayMetrics.wavelengthsNm,
                      y: displayMetrics.absorptance,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'A',
                      line: { color: '#ff6b6b', width: 1.8, dash: 'dash' },
                    },
                  ]}
                  layout={{
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'rgba(0,13,29,0.5)',
                    font: { color: '#8a92a3', size: 10 },
                    margin: { t: 28, r: 10, b: 40, l: 50 },
                    height: 320,
                    title: {
                      text: spectrumView === 'best' ? 'Best observed spectrum' : 'Recommended spectrum preview',
                      font: { color: '#d0d4dc', size: 12 },
                    },
                    xaxis: {
                      title: { text: 'Wavelength (nm)', font: { color: '#8a92a3' } },
                      gridcolor: 'rgba(67,97,238,0.08)',
                      color: '#8a92a3',
                    },
                    yaxis: {
                      title: { text: 'R / T / A', font: { color: '#8a92a3' } },
                      range: [0, 1],
                      gridcolor: 'rgba(67,97,238,0.08)',
                      color: '#8a92a3',
                    },
                    legend: { x: 0.01, y: 0.99, font: { size: 9 } },
                    shapes: [
                      {
                        type: 'rect',
                        x0: THIN_FILM_PROBLEM.inBand[0],
                        x1: THIN_FILM_PROBLEM.inBand[1],
                        y0: 0,
                        y1: 1,
                        fillcolor: 'rgba(255,107,107,0.08)',
                        line: { width: 0 },
                      },
                    ],
                  }}
                  config={plotConfig}
                  className="w-full"
                />
              </Suspense>

              <div className="rounded-lg border border-[rgba(67,97,238,0.1)] bg-[rgba(0,13,29,0.35)] p-3">
                <div className="text-[10px] font-mono text-[#8a92a3] mb-2">Symmetric stack layout</div>
                <div className="flex items-end gap-2 overflow-x-auto pb-1">
                  {layerStack.map((layer, index) => (
                    <div key={`${layer.label}-${index}`} className="min-w-[52px] text-center">
                      <div
                        className={`rounded-t ${
                          layer.family === 'absorber'
                            ? 'bg-[rgba(255,107,107,0.75)]'
                            : layer.family === 'dielectric-high'
                              ? 'bg-[rgba(67,97,238,0.75)]'
                              : 'bg-[rgba(0,245,212,0.72)]'
                        }`}
                        style={{ height: `${36 + (92 * layer.thicknessNm) / maxLayerThickness}px` }}
                      />
                      <div className="mt-1 text-[9px] font-mono text-[#d0d4dc]">{layer.label}</div>
                      <div className="text-[9px] font-mono text-[#5a6377]">{layer.thicknessNm.toFixed(1)} nm</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4">
            <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">Current best</div>
            {bestRecord ? (
              <div className="space-y-1.5 text-[11px] font-mono">
                <MetricRow label="Legacy objective" value={bestRecord.metricValues.legacyObjective.toFixed(4)} highlight="cyan" />
                <MetricRow label="A(650-700)" value={bestRecord.metricValues.avgInBandAbsorption.toFixed(4)} highlight="yellow" />
                <MetricRow label="T(400-620)" value={bestRecord.metricValues.avgShortPassTransmission.toFixed(4)} />
                <MetricRow label="T(730-1100)" value={bestRecord.metricValues.avgLongPassTransmission.toFixed(4)} />
                <MetricRow label="R(650-700)" value={bestRecord.metricValues.avgInBandReflectance.toFixed(4)} />
                <MetricRow label="Total thickness" value={`${bestRecord.metricValues.totalThicknessNm.toFixed(1)} nm`} />
              </div>
            ) : (
              <div className="text-[10px] text-[#5a6377] font-mono">No observed design yet.</div>
            )}
          </div>

          <div className="glass-panel rounded-lg border border-[rgba(43,108,176,0.25)] p-4">
            <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">Recommended next design</div>
            {recommendation && recommendationEval ? (
              <div className="space-y-1.5 text-[11px] font-mono">
                {recommendation.params.map((value, index) => (
                  <MetricRow key={index} label={THIN_FILM_CASE.params[index].nameEn} value={`${value.toFixed(1)} nm`} highlight={index === 3 ? 'yellow' : 'blue'} />
                ))}
                <MetricRow label="Predicted mean" value={recommendation.predictedMean.toFixed(4)} />
                <MetricRow label="Predicted std" value={recommendation.predictedStd.toFixed(4)} />
                <MetricRow label="Acquisition" value={`${recommendation.acquisitionType} = ${recommendation.acquisitionValue.toFixed(5)}`} />
                <MetricRow label="Legacy objective" value={recommendationEval.objective.toFixed(4)} />
                <MetricRow label="A(650-700)" value={recommendationEval.avgInBandAbsorption.toFixed(4)} />
                <MetricRow label="T(out-of-band)" value={((recommendationEval.avgShortPassTransmission + recommendationEval.avgLongPassTransmission) / 2).toFixed(4)} />
                <div className="pt-2 border-t border-[rgba(67,97,238,0.1)] text-[10px] text-[#8a92a3] leading-5">
                  <p>{recommendation.explanation}</p>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-[#5a6377] font-mono">No recommendation yet.</div>
            )}
          </div>
        </div>

        {taskMode === 'pareto' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4 text-[10px] text-[#8a92a3] leading-5">
              <div className="text-[9px] font-mono tracking-widest mb-3">Pareto notes</div>
              <p>当前前沿显示的是原始物理指标，不是内部随机标量化之后的临时标量值。</p>
              <p>Hypervolume 越大，表示在当前参考点 `[1.05, 1.05]` 下，前沿整体覆盖范围越好。</p>
              <p>导出的 CSV 包含前沿点的膜厚参数和全部关键指标，便于课后分析或做对比图。</p>
            </div>

            <Suspense fallback={<div className="h-56 flex items-center justify-center text-[10px] text-[#8a92a3]">Loading chart...</div>}>
              <Plot
                data={[
                  {
                    x: hvHistory.map((_, index) => index + 1),
                    y: hvHistory,
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { color: '#fee440', width: 1.6 },
                    marker: { size: 4, color: '#fee440' },
                    name: 'Hypervolume',
                  },
                ]}
                layout={{
                  title: { text: 'Hypervolume over iterations', font: { color: '#d0d4dc', size: 12 } },
                  xaxis: { title: { text: 'Pareto updates', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
                  yaxis: { title: { text: 'Hypervolume', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
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
            </Suspense>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Suspense fallback={<div className="h-72 flex items-center justify-center text-[10px] text-[#8a92a3]">Loading chart...</div>}>
            {taskMode === 'pareto' ? (
              <Plot
                data={paretoData.front ? [paretoData.history, paretoData.front] : [paretoData.history]}
                layout={{
                  title: { text: 'Objective space', font: { color: '#d0d4dc', size: 12 } },
                  xaxis: { title: { text: metricLabel(paretoX), font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
                  yaxis: { title: { text: metricLabel(paretoY), font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'rgba(0,13,29,0.5)',
                  font: { color: '#8a92a3', size: 10 },
                  margin: { t: 30, r: 10, b: 40, l: 50 },
                  height: 280,
                  legend: { x: 0.01, y: 0.99, font: { size: 9 } },
                }}
                config={plotConfig}
                className="w-full"
              />
            ) : (
              <Plot
                data={scalarHistoryData}
                layout={{
                  title: { text: `${session.state.objectiveLabel} over iterations`, font: { color: '#d0d4dc', size: 12 } },
                  xaxis: { title: { text: 'Iteration', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
                  yaxis: { title: { text: 'Scalar objective', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'rgba(0,13,29,0.5)',
                  font: { color: '#8a92a3', size: 10 },
                  margin: { t: 30, r: 10, b: 40, l: 50 },
                  height: 280,
                  showlegend: false,
                }}
                config={plotConfig}
                className="w-full"
              />
            )}
          </Suspense>

          <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] overflow-hidden">
            <div className="px-4 py-2 border-b border-[rgba(67,97,238,0.1)]">
              <span className="text-[9px] font-mono text-[#8a92a3] tracking-widest">History ({history.length})</span>
            </div>
            {history.length === 0 ? (
              <div className="px-4 py-6 text-[10px] text-[#5a6377] text-center font-mono">Click Run 1 to start the design loop.</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-[10px] font-mono border-collapse">
                  <thead className="sticky top-0" style={{ background: 'rgba(6,22,42,0.98)' }}>
                    <tr className="border-b border-[rgba(67,97,238,0.15)]">
                      {['#', 'Cap', 'TiO2', 'Spacer', 'Cr', 'A_in', 'T_out', 'Scalar'].map((header) => (
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
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.params[0].toFixed(1)}</td>
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.params[1].toFixed(1)}</td>
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.params[2].toFixed(1)}</td>
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.params[3].toFixed(1)}</td>
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.metricValues.avgInBandAbsorption.toFixed(3)}</td>
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.metricValues.avgOutOfBandTransmission.toFixed(3)}</td>
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
      </div>
    </div>
  );
}

function metricLabel(key: ThinFilmMetricKey) {
  return METRIC_OPTIONS.find((metric) => metric.key === key)?.label ?? key;
}
