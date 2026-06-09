import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Square } from 'lucide-react';
import { branin, currin } from '@/lib/benchmarks';
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
  TaskModeSummary,
  buttonClassName,
  inputClassName,
  plotConfig,
  selectClassName,
} from '@/components/caseStudioUi';

const Plot = lazy(() => import('react-plotly.js'));
const AUTO_INTERVAL_MS = 550;

type TaskMode = 'single' | 'weighted' | 'pareto';

interface BraninEvaluation {
  branin: number;
  currin: number;
}

const BRANIN_CASE: ContinuousCaseDef<BraninEvaluation> = {
  id: 'branin-studio',
  name: 'Branin-Currin Studio',
  params: [
    { name: 'x₁', nameEn: 'x1', unit: '', min: -5, max: 10, step: 0.1, default: 0 },
    { name: 'x₂', nameEn: 'x2', unit: '', min: 0, max: 15, step: 0.1, default: 5 },
  ],
  metrics: [
    { key: 'branin', label: 'Branin', direction: 'min', range: [0, 320], accessor: (evaluation) => evaluation.branin },
    { key: 'currin', label: 'Currin', direction: 'min', range: [0, 15], accessor: (evaluation) => evaluation.currin },
  ],
  evaluate: (params) => ({
    branin: branin(params[0], params[1]),
    currin: currin(params[0], params[1]),
  }),
  candidateCount: 320,
  gpLengthScale: 0.28,
};

const PAD = { l: 44, r: 10, t: 12, b: 32 };
const SVG_W = 490;
const SVG_H = 260;
const PW = SVG_W - PAD.l - PAD.r;
const PH = SVG_H - PAD.t - PAD.b;
const GRID_COLS = 26;
const GRID_ROWS = 20;
const cellW = PW / GRID_COLS;
const cellH = PH / GRID_ROWS;
const toSX = (x1: number) => PAD.l + ((x1 + 5) / 15) * PW;
const toSY = (x2: number) => SVG_H - PAD.b - (x2 / 15) * PH;
const GLOBAL_OPTIMA = [
  { x1: -Math.PI, x2: 12.275 },
  { x1: Math.PI, x2: 2.275 },
  { x1: 9.42478, x2: 2.475 },
];

const HELP = {
  task:
    '单目标模式只优化一个数学目标；线性组合模式把 Branin 和 Currin 归一化后按权重加和；Pareto 模式用随机标量化推荐下一点，同时维护非支配前沿。',
  singleMetric: '单目标时只选择一个目标。Branin 更贴近经典 BO 教学；Currin 可用来观察目标切换后的搜索路径变化。',
  model: 'GP 适合讲不确定性；RF 更贴近工程代理；Local 表示“只信附近样本”的局部近似。',
  acquisition: 'EI 偏改进，UCB 偏探索，PI 更保守，Random 用于当作无代理基线。',
  beta: 'UCB 的探索强度。越大越偏向高不确定度区域。',
  weighted:
    '权重作用于归一化后的目标分量。权重大，优化器越愿意为该目标牺牲另一个目标。',
  pareto: 'Pareto 模式下，界面会同时显示决策空间轨迹和目标空间的非支配前沿。',
  seed: '固定种子后，候选采样、随机标量化和推荐路径都可重复，方便演示不同方法差异。',
};

const axisTicks = {
  x1: [-5, -2.5, 0, 2.5, 5, 7.5, 10],
  x2: [0, 3, 6, 9, 12, 15],
};

export default function BraninCaseView() {
  const [taskMode, setTaskMode] = useState<TaskMode>('single');
  const [singleMetric, setSingleMetric] = useState<'branin' | 'currin'>('branin');
  const [weights, setWeights] = useState({ branin: 1, currin: 0.65 });
  const [paretoX, setParetoX] = useState<'branin' | 'currin'>('branin');
  const [paretoY, setParetoY] = useState<'branin' | 'currin'>('currin');
  const [surrogateModel, setSurrogateModel] = useState<SurrogateModel>('GP');
  const [acqFn, setAcqFn] = useState<ContinuousAcqFn>('EI');
  const [ucbBeta, setUcbBeta] = useState(2.0);
  const [seedVal, setSeedVal] = useState(42);
  const [autoRunning, setAutoRunning] = useState(false);
  const [, setTick] = useState(0);

  const sessionRef = useRef<ContinuousCaseSession<BraninEvaluation> | null>(null);
  const timerRef = useRef<number | null>(null);
  const autoRef = useRef(false);
  const strategySigRef = useRef('');

  const objective = useMemo<ObjectiveSpec>(() => {
    if (taskMode === 'single') {
      return { mode: 'single', metricKey: singleMetric };
    }
    if (taskMode === 'weighted') {
      return { mode: 'weighted', weights };
    }
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
        sessionRef.current = new ContinuousCaseSession(BRANIN_CASE, strategy, seedVal);
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
  const recommendationEval = recommendation ? BRANIN_CASE.evaluate(recommendation.params) : null;

  const heatmap = useMemo(() => {
    const cells: Array<{ i: number; j: number; x1: number; x2: number; norm: number }> = [];
    const rawValues: number[] = [];

    for (let j = 0; j < GRID_ROWS; j++) {
      for (let i = 0; i < GRID_COLS; i++) {
        const x1 = -5 + (i / (GRID_COLS - 1)) * 15;
        const x2 = (j / (GRID_ROWS - 1)) * 15;
        const evaluation = BRANIN_CASE.evaluate([x1, x2]);
        const value =
          taskMode === 'single'
            ? singleMetric === 'branin'
              ? evaluation.branin
              : evaluation.currin
            : taskMode === 'weighted'
              ? weightedObjectiveValue(evaluation, weights)
              : evaluation.branin;
        rawValues.push(value);
      }
    }

    const minValue = Math.min(...rawValues);
    const maxValue = Math.max(...rawValues);
    const span = maxValue - minValue || 1;

    rawValues.forEach((value, index) => {
      const i = index % GRID_COLS;
      const j = Math.floor(index / GRID_COLS);
      const x1 = -5 + (i / (GRID_COLS - 1)) * 15;
      const x2 = (j / (GRID_ROWS - 1)) * 15;
      cells.push({ i, j, x1, x2, norm: 1 - (value - minValue) / span });
    });

    return cells;
  }, [singleMetric, taskMode, weights]);

  const historyPlotData = [
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

  const paretoData = useMemo(() => {
    const xKey = paretoX;
    const yKey = paretoY;
    const front = [...session.state.paretoFront].sort((a, b) => a.metricValues[xKey] - b.metricValues[xKey]);
    return {
      history: {
        x: history.map((record) => record.metricValues[xKey]),
        y: history.map((record) => record.metricValues[yKey]),
        type: 'scatter' as const,
        mode: 'markers' as const,
        marker: {
          color: history.map((_, index) => (index === history.length - 1 ? '#ff6b6b' : '#8a92a3')),
          size: history.map((_, index) => (index === history.length - 1 ? 8 : 5)),
        },
        text: history.map(
          (record) =>
            `迭代 ${record.iteration}<br>${xKey}: ${record.metricValues[xKey].toFixed(4)}<br>${yKey}: ${record.metricValues[yKey].toFixed(4)}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: '全部观测点',
      },
      front:
        front.length > 0
          ? {
              x: front.map((record) => record.metricValues[xKey]),
              y: front.map((record) => record.metricValues[yKey]),
              type: 'scatter' as const,
              mode: 'lines+markers' as const,
              line: { color: '#00f5d4', width: 2 },
              marker: { size: 6, color: '#00f5d4' },
              name: 'Pareto 前沿',
            }
          : null,
    };
  }, [history, paretoX, paretoY, session.state.paretoFront]);

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

  const heatmapTitle =
    taskMode === 'single'
      ? singleMetric === 'branin'
        ? '决策空间（Decision Space）· Branin 曲面'
        : '决策空间（Decision Space）· Currin 曲面'
      : taskMode === 'weighted'
        ? '决策空间（Decision Space）· 线性组合标量目标'
        : '决策空间（Decision Space）· Branin 曲面（Pareto 模式请结合目标空间图）';

  const taskSummary = {
    modeLabel:
      taskMode === 'single'
        ? '单目标（Single Objective）'
        : taskMode === 'weighted'
          ? '线性组合（Weighted Sum）'
          : 'Pareto 前沿（Pareto Frontier）',
    objectiveLabel:
      taskMode === 'single'
        ? `直接优化 ${singleMetric === 'branin' ? 'Branin' : 'Currin'}。`
        : taskMode === 'weighted'
          ? `最小化归一化后的加权损失，其中 Branin 权重为 ${weights.branin.toFixed(2)}，Currin 权重为 ${weights.currin.toFixed(2)}。`
          : `跟踪 ${paretoX} 与 ${paretoY} 之间的非支配权衡。`,
    strategyLabel:
      taskMode === 'pareto'
        ? '先读目标空间中的前沿，再结合决策空间中的搜索路径。'
        : '先读标量目标历史，再比较不同代理模型或采集函数下的路径变化。',
    takeaway:
      taskMode === 'single'
        ? '这是最适合教学的干净设定：同一决策空间里，只改变目标指标，就会出现不同搜索轨迹。'
        : taskMode === 'weighted'
          ? '这是工程折中设定：优化器只看一个标量目标，但两个原始指标仍然清楚展示权衡。'
          : '这是无偏好设定：推荐来自标量化子问题，但解释必须回到原始双目标空间。',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      <div className="lg:col-span-1 space-y-3">
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-3">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-1.5">案例背景（Case Background）</div>
          <p className="text-[10px] text-[#8a92a3] leading-5">
            Branin 负责经典 BO 教学，Currin 提供第二目标。这样同一个 2D 参数空间里可以切换单目标、线性组合和 Pareto
            三种任务，而不必换案例。
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
              help={HELP.singleMetric}
              control={
                <select
                  value={singleMetric}
                  onChange={(event) => setSingleMetric(event.target.value as 'branin' | 'currin')}
                  className={selectClassName}
                >
                  <option value="branin">Branin</option>
                  <option value="currin">Currin</option>
                </select>
              }
            />
          )}

          {taskMode === 'weighted' && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#d0d4dc]">线性组合权重</div>
              <p className="text-[8px] text-[#5a6377] leading-relaxed">{HELP.weighted}</p>
              {(['branin', 'currin'] as const).map((key) => (
                <div key={key} className="rounded border border-[rgba(67,97,238,0.08)] p-2">
                  <div className="flex items-center justify-between mb-1 text-[10px] text-[#d0d4dc]">
                    <span>{key === 'branin' ? 'Branin' : 'Currin'}</span>
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
                    onChange={(event) => setParetoX(event.target.value as 'branin' | 'currin')}
                    className={selectClassName}
                  >
                    <option value="branin">Branin</option>
                    <option value="currin">Currin</option>
                  </select>
                }
              />
              <Field
                label="目标 Y"
                control={
                  <select
                    value={paretoY}
                    onChange={(event) => setParetoY(event.target.value as 'branin' | 'currin')}
                    className={selectClassName}
                  >
                    <option value="currin">Currin</option>
                    <option value="branin">Branin</option>
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
            control={
              <input
                type="number"
                value={seedVal}
                onChange={(event) => setSeedVal(Number(event.target.value))}
                className={inputClassName}
              />
            }
          />
          <p className="text-[8px] text-[#5a6377] leading-relaxed">
            改动任务模式、权重、代理模型或种子后，下一次运行会自动按新配置从头开始。
          </p>
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
              <MetricRow label="Branin" value={bestRecord.metricValues.branin.toFixed(4)} />
              <MetricRow label="Currin" value={bestRecord.metricValues.currin.toFixed(4)} />
              <MetricRow label="at (x₁, x₂)" value={`(${bestRecord.params[0].toFixed(2)}, ${bestRecord.params[1].toFixed(2)})`} />
            </>
          ) : (
            <div className="text-[#5a6377]">尚未执行实验。</div>
          )}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[rgba(67,97,238,0.1)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a92a3]">{heatmapTitle}</span>
            <span className="text-[10px] font-mono text-[#5a6377]">{history.length} 次实验</span>
          </div>

          <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
            {heatmap.map((cell) => (
              <rect
                key={`${cell.i}-${cell.j}`}
                x={PAD.l + cell.i * cellW}
                y={SVG_H - PAD.b - (cell.j + 1) * cellH}
                width={cellW + 0.5}
                height={cellH + 0.5}
                fill={`rgba(0,245,212,${(cell.norm * 0.55).toFixed(3)})`}
              />
            ))}

            {axisTicks.x1.map((value) => (
              <line
                key={`gx-${value}`}
                x1={toSX(value)}
                y1={PAD.t}
                x2={toSX(value)}
                y2={SVG_H - PAD.b}
                stroke="rgba(67,97,238,0.12)"
                strokeWidth="0.5"
              />
            ))}
            {axisTicks.x2.map((value) => (
              <line
                key={`gy-${value}`}
                x1={PAD.l}
                y1={toSY(value)}
                x2={SVG_W - PAD.r}
                y2={toSY(value)}
                stroke="rgba(67,97,238,0.12)"
                strokeWidth="0.5"
              />
            ))}

            <line x1={PAD.l} y1={SVG_H - PAD.b} x2={SVG_W - PAD.r} y2={SVG_H - PAD.b} stroke="rgba(138,146,163,0.5)" />
            <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={SVG_H - PAD.b} stroke="rgba(138,146,163,0.5)" />

            {axisTicks.x1.map((value) => (
              <text
                key={`tx-${value}`}
                x={toSX(value)}
                y={SVG_H - PAD.b + 12}
                textAnchor="middle"
                fontSize="8"
                fill="#5a6377"
                fontFamily="monospace"
              >
                {value}
              </text>
            ))}
            {axisTicks.x2.map((value) => (
              <text
                key={`ty-${value}`}
                x={PAD.l - 5}
                y={toSY(value) + 3}
                textAnchor="end"
                fontSize="8"
                fill="#5a6377"
                fontFamily="monospace"
              >
                {value}
              </text>
            ))}
            <text x={SVG_W / 2} y={SVG_H - 2} textAnchor="middle" fontSize="9" fill="#8a92a3" fontFamily="monospace">
              x₁
            </text>
            <text
              x="10"
              y={SVG_H / 2}
              textAnchor="middle"
              fontSize="9"
              fill="#8a92a3"
              fontFamily="monospace"
              transform={`rotate(-90,10,${SVG_H / 2})`}
            >
              x₂
            </text>

            {GLOBAL_OPTIMA.map((point, index) => (
              <text key={index} x={toSX(point.x1)} y={toSY(point.x2) + 4} textAnchor="middle" fontSize="12" fill="#fee440">
                ★
              </text>
            ))}

            {history.map((record) => {
              const isBest = bestRecord?.iteration === record.iteration;
              return (
                <circle
                  key={record.iteration}
                  cx={toSX(record.params[0])}
                  cy={toSY(record.params[1])}
                  r={isBest ? 6 : 4}
                  fill={isBest ? '#276749' : '#9B9B9B'}
                  stroke={isBest ? '#00f5d4' : 'none'}
                  strokeWidth="1.5"
                />
              );
            })}

            {recommendation ? (
              <circle
                cx={toSX(recommendation.params[0])}
                cy={toSY(recommendation.params[1])}
                r="5"
                fill="none"
                stroke="#2B6CB0"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            ) : null}
          </svg>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {recommendation && recommendationEval ? (
            <div className="glass-panel rounded-lg border border-[rgba(43,108,176,0.25)] p-4">
              <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">下一推荐点（Recommended Next Point）</div>
              <div className="space-y-1.5 text-[11px] font-mono mb-3">
                <MetricRow label="x₁" value={recommendation.params[0].toFixed(3)} highlight="blue" />
                <MetricRow label="x₂" value={recommendation.params[1].toFixed(3)} highlight="blue" />
                <MetricRow label="预测均值（Predicted Mean）" value={recommendation.predictedMean.toFixed(4)} />
                <MetricRow label="预测标准差（Predicted Std）" value={recommendation.predictedStd.toFixed(4)} />
                <MetricRow label="采集函数值（Acquisition）" value={`${recommendation.acquisitionType} = ${recommendation.acquisitionValue.toFixed(5)}`} />
                <MetricRow label="Branin" value={recommendationEval.branin.toFixed(4)} />
                <MetricRow label="Currin" value={recommendationEval.currin.toFixed(4)} />
              </div>
              <div className="pt-2 border-t border-[rgba(67,97,238,0.1)] text-[10px] text-[#8a92a3] leading-5">
                <p>{recommendation.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4 text-[10px] text-[#5a6377]">
              尚无推荐点。
            </div>
          )}

          <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4">
            <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">任务说明（Task Summary）</div>
            <div className="space-y-1.5 text-[10px] text-[#8a92a3] leading-5">
              <p>单目标：选择 Branin 或 Currin 其中之一，观察不同目标函数如何改变搜索轨迹。</p>
              <p>线性组合：把两个目标归一化后加权求和，适合讲“目标定义改变最优点”。</p>
              <p>Pareto：用随机标量化推荐下一点，同时在右侧目标空间里维护非支配前沿。</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Suspense fallback={<div className="h-72 flex items-center justify-center text-[10px] text-[#8a92a3]">正在加载图表…</div>}>
            {taskMode === 'pareto' ? (
              <Plot
                data={paretoData.front ? [paretoData.history, paretoData.front] : [paretoData.history]}
                layout={{
                  title: { text: '目标空间（Objective Space）', font: { color: '#d0d4dc', size: 12 } },
                  xaxis: { title: { text: paretoX === 'branin' ? 'Branin' : 'Currin', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
                  yaxis: { title: { text: paretoY === 'branin' ? 'Branin' : 'Currin', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
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
                data={historyPlotData}
                layout={{
                  title: { text: `${session.state.objectiveLabel} 随迭代变化`, font: { color: '#d0d4dc', size: 12 } },
                  xaxis: { title: { text: '迭代（Iteration）', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
                  yaxis: { title: { text: '标量目标（Scalar Objective）', font: { color: '#8a92a3' } }, gridcolor: 'rgba(67,97,238,0.08)', color: '#8a92a3' },
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
              <span className="text-[9px] font-mono text-[#8a92a3] tracking-widest">历史记录（History, {history.length}）</span>
            </div>
            {history.length === 0 ? (
              <div className="px-4 py-6 text-[10px] text-[#5a6377] text-center font-mono">点击“运行 1 步”开始。</div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-[10px] font-mono border-collapse">
                  <thead className="sticky top-0" style={{ background: 'rgba(6,22,42,0.98)' }}>
                    <tr className="border-b border-[rgba(67,97,238,0.15)]">
                      {['#', 'x₁', 'x₂', 'Branin', 'Currin', '标量值'].map((header) => (
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
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.params[0].toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.params[1].toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.metricValues.branin.toFixed(3)}</td>
                          <td className="py-1.5 px-2 text-[#d0d4dc]">{record.metricValues.currin.toFixed(3)}</td>
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

function weightedObjectiveValue(evaluation: BraninEvaluation, weights: { branin: number; currin: number }) {
  const totalWeight = Math.max(weights.branin + weights.currin, 1e-9);
  const braninNorm = clamp((evaluation.branin - 0) / 320, 0, 1);
  const currinNorm = clamp((evaluation.currin - 0) / 15, 0, 1);
  return (weights.branin * braninNorm + weights.currin * currinNorm) / totalWeight;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
