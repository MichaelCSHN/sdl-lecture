/**
 * BraninCaseView — Branin function 2D benchmark demo inside Case Studio.
 *
 * The Branin function has 3 global minima at ~0.397887.
 * We negate it (maximize -Branin) so the CaseSession framework applies directly.
 * Global optima of the negative ≈ -0.3979, reachable near x1 ∈ {-π, π, 9.42}.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Play, RotateCcw, Square } from 'lucide-react';
import { liveCases } from '@/lib/bo_engine';
import { CaseSession } from '@/cases/caseEngine';

// ── Pre-compute Branin heatmap (module-level, runs once) ─────────────────

const BRANINCASE = liveCases.find((c) => c.id === 'branin')!;
const GCols = 26, GRows = 20;

function braninRaw(x1: number, x2: number): number {
  const a = 1, b = 5.1 / (4 * Math.PI ** 2), c = 5 / Math.PI;
  const r = 6, s = 10, t = 1 / (8 * Math.PI);
  return a * (x2 - b * x1 ** 2 + c * x1 - r) ** 2 + s * (1 - t) * Math.cos(x1) + s;
}

const HEATMAP = (() => {
  const cells: Array<{ i: number; j: number; px1: number; px2: number; norm: number }> = [];
  let maxV = -Infinity, minV = Infinity;
  const raw: number[] = [];
  for (let j = 0; j < GRows; j++) {
    for (let i = 0; i < GCols; i++) {
      const px1 = -5 + (i / (GCols - 1)) * 15;
      const px2 = 0 + (j / (GRows - 1)) * 15;
      const v = braninRaw(px1, px2);
      raw.push(v);
      if (v > maxV) maxV = v;
      if (v < minV) minV = v;
    }
  }
  const range = maxV - minV;
  raw.forEach((v, idx) => {
    const i = idx % GCols, j = Math.floor(idx / GCols);
    const px1 = -5 + (i / (GCols - 1)) * 15;
    const px2 = 0 + (j / (GRows - 1)) * 15;
    cells.push({ i, j, px1, px2, norm: 1 - (v - minV) / range });
  });
  return cells;
})();

// 3 global minima of Branin (where -Branin is maximized)
const GLOBAL_OPTIMA = [
  { px1: -Math.PI, px2: 12.275 },
  { px1: Math.PI,  px2: 2.275  },
  { px1: 9.42478,  px2: 2.475  },
];

// ── SVG coordinate helpers ────────────────────────────────────────────────
// Domain: x1 ∈ [-5,10], x2 ∈ [0,15]  |  SVG 490×260, pad l=44 r=10 t=12 b=32

const PAD = { l: 44, r: 10, t: 12, b: 32 };
const SVG_W = 490, SVG_H = 260;
const PW = SVG_W - PAD.l - PAD.r; // 436
const PH = SVG_H - PAD.t - PAD.b; // 216

const toSX = (px1: number) => PAD.l + ((px1 + 5) / 15) * PW;
const toSY = (px2: number) => SVG_H - PAD.b - (px2 / 15) * PH;
const cellW = PW / GCols, cellH = PH / GRows;

// ── Component ─────────────────────────────────────────────────────────────

export default function BraninCaseView() {
  const [session] = useState(() => new CaseSession(BRANINCASE, 42));
  const [, setTick] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const rerender = () => setTick((n) => n + 1);

  useEffect(() => () => {
    autoRef.current = false;
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const rec = session.state.currentRecommendation;
  const history = session.state.history;
  const bestObs = session.state.bestObservation;
  const bestParams = session.state.bestParams;

  const runOne = useCallback(() => {
    session.recommend();
    const r = session.state.currentRecommendation;
    if (r) { session.observe(r.params); session.recommend(); rerender(); }
  }, [session]);

  const runFive = useCallback(() => { session.runSteps(5); rerender(); }, [session]);
  const stopAuto = useCallback(() => {
    autoRef.current = false;
    setAutoRunning(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const startAuto = useCallback(() => {
    autoRef.current = true;
    setAutoRunning(true);
    const loop = () => {
      if (!autoRef.current) { setAutoRunning(false); return; }
      session.recommend();
      const r = session.state.currentRecommendation;
      if (r) { session.observe(r.params); session.recommend(); }
      rerender();
      timerRef.current = window.setTimeout(loop, 550);
    };
    loop();
  }, [session]);

  const doReset = useCallback(() => {
    stopAuto();
    session.reset(42);
    rerender();
  }, [session, stopAuto]);

  // Lecture mode: R key → reset this case (must be after doReset)
  useEffect(() => {
    const handler = () => doReset();
    window.addEventListener('lecture:reset', handler);
    return () => window.removeEventListener('lecture:reset', handler);
  }, [doReset]);

  // SVG data
  const recSvg = rec ? [toSX(rec.params[0]), toSY(rec.params[1])] as [number, number] : null;
  const bestSvg = bestParams.length >= 2 ? [toSX(bestParams[0]), toSY(bestParams[1])] as [number, number] : null;

  const axisTicks = useMemo(() => ({
    x1: [-5, -2.5, 0, 2.5, 5, 7.5, 10],
    x2: [0, 3, 6, 9, 12, 15],
  }), []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
      {/* ── Left: SVG visualization ───────────────────────────── */}
      <div>
        {/* Context card */}
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4 mb-4">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-1.5">关于 Branin 函数</div>
          <p className="text-[11px] text-[#8a92a3] leading-5">
            Branin 是贝叶斯优化领域的经典2D基准函数，有<span className="text-[#fee440]"> 3 个等效全局最优</span>（标记为 ★）。
            热图明亮处（teal）是低函数值区域；我们对函数取负，令 BO 的"最大化"等价于找 Branin 最小值。
            观察 BO 如何在不同 seed 下收敛到 3 个最优中的某一个。
          </p>
        </div>

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[rgba(67,97,238,0.1)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a92a3]">参数空间 · {history.length} 次实验</span>
            <div className="flex items-center gap-3 text-[9px] font-mono text-[#8a92a3]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#9B9B9B' }} /> 已探索</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#276749' }} /> 最优</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-[#2B6CB0] inline-block" style={{ background: 'transparent' }} /> 推荐</span>
              <span className="flex items-center gap-1"><span className="text-[#fee440]">★</span> 全局最优</span>
            </div>
          </div>

          <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
            {/* Heatmap */}
            {HEATMAP.map((cell) => (
              <rect
                key={`${cell.i}-${cell.j}`}
                x={PAD.l + cell.i * cellW}
                y={SVG_H - PAD.b - (cell.j + 1) * cellH}
                width={cellW + 0.5}
                height={cellH + 0.5}
                fill={`rgba(0,245,212,${(cell.norm * 0.55).toFixed(3)})`}
              />
            ))}

            {/* Grid lines */}
            {axisTicks.x1.map((v) => (
              <line key={`gx${v}`} x1={toSX(v)} y1={PAD.t} x2={toSX(v)} y2={SVG_H - PAD.b}
                stroke="rgba(67,97,238,0.12)" strokeWidth="0.5" />
            ))}
            {axisTicks.x2.map((v) => (
              <line key={`gy${v}`} x1={PAD.l} y1={toSY(v)} x2={SVG_W - PAD.r} y2={toSY(v)}
                stroke="rgba(67,97,238,0.12)" strokeWidth="0.5" />
            ))}

            {/* Axes */}
            <line x1={PAD.l} y1={SVG_H - PAD.b} x2={SVG_W - PAD.r} y2={SVG_H - PAD.b}
              stroke="rgba(138,146,163,0.5)" strokeWidth="1" />
            <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={SVG_H - PAD.b}
              stroke="rgba(138,146,163,0.5)" strokeWidth="1" />

            {/* Axis labels */}
            {axisTicks.x1.map((v) => (
              <text key={`tx${v}`} x={toSX(v)} y={SVG_H - PAD.b + 12}
                textAnchor="middle" fontSize="8" fill="#5a6377" fontFamily="monospace">{v}</text>
            ))}
            {axisTicks.x2.map((v) => (
              <text key={`ty${v}`} x={PAD.l - 5} y={toSY(v) + 3}
                textAnchor="end" fontSize="8" fill="#5a6377" fontFamily="monospace">{v}</text>
            ))}
            <text x={SVG_W / 2} y={SVG_H - 2} textAnchor="middle" fontSize="9" fill="#8a92a3" fontFamily="monospace">x₁</text>
            <text x="10" y={SVG_H / 2} textAnchor="middle" fontSize="9" fill="#8a92a3" fontFamily="monospace"
              transform={`rotate(-90,10,${SVG_H / 2})`}>x₂</text>

            {/* Global optima markers */}
            {GLOBAL_OPTIMA.map((opt, i) => (
              <text key={i} x={toSX(opt.px1)} y={toSY(opt.px2) + 4}
                textAnchor="middle" fontSize="12" fill="#fee440" style={{ pointerEvents: 'none' }}>★</text>
            ))}

            {/* Explored points */}
            {history.map((row, i) => {
              const sx = toSX(row.params[0]), sy = toSY(row.params[1]);
              const isBest = row.observation >= bestObs && bestObs > -Infinity;
              return (
                <g key={i}>
                  <circle cx={sx} cy={sy} r={isBest ? 6 : 4}
                    fill={isBest ? '#276749' : '#9B9B9B'}
                    stroke={isBest ? '#00f5d4' : 'none'} strokeWidth="1.5" />
                </g>
              );
            })}

            {/* Recommendation */}
            {recSvg && !bestSvg && (
              <circle cx={recSvg[0]} cy={recSvg[1]} r="5"
                fill="none" stroke="#2B6CB0" strokeWidth="2" strokeDasharray="4 2" />
            )}
            {recSvg && bestSvg && (
              <circle cx={recSvg[0]} cy={recSvg[1]} r="5"
                fill="none" stroke="#2B6CB0" strokeWidth="1.5" strokeDasharray="4 2" />
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button onClick={doReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(255,107,107,0.2)] text-[#ff6b6b] text-[10px] font-mono hover:bg-[rgba(255,107,107,0.06)] transition-colors">
            <RotateCcw className="w-3 h-3" /> 重置
          </button>
          <button onClick={runOne} disabled={autoRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(0,245,212,0.3)] text-[#00f5d4] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.08)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Play className="w-3 h-3" /> Run 1
          </button>
          <button onClick={runFive} disabled={autoRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(76,201,240,0.3)] text-[#4cc9f0] text-[10px] font-mono hover:bg-[rgba(76,201,240,0.06)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Play className="w-3 h-3" /> Run 5
          </button>
          {autoRunning ? (
            <button onClick={stopAuto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(245,158,11,0.28)] text-[#f59e0b] text-[10px] font-mono hover:bg-[rgba(245,158,11,0.06)] transition-colors">
              <Square className="w-3 h-3" /> 停止
            </button>
          ) : (
            <button onClick={startAuto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(67,97,238,0.2)] text-[#8a92a3] text-[10px] font-mono hover:bg-[rgba(67,97,238,0.06)] transition-colors">
              <Play className="w-3 h-3" /> Auto
            </button>
          )}
          <span className="ml-auto text-[10px] font-mono text-[#5a6377]">迭代 {history.length}</span>
        </div>
      </div>

      {/* ── Right: Info panels ────────────────────────────────── */}
      <div className="space-y-3">
        {/* Objective + best */}
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">目标与当前最优</div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <Row label="优化目标" value="最大化 −Branin(x₁,x₂)" accent />
            <Row label="x₁ 范围" value="[−5, 10]" />
            <Row label="x₂ 范围" value="[0, 15]" />
            <Row label="全局最优" value="≈ −0.3979（3 处等效）" />
            {bestObs > -Infinity && <>
              <div className="border-t border-[rgba(67,97,238,0.1)] pt-1.5 mt-1.5" />
              <Row label="当前 best" value={`${bestObs.toFixed(4)}`} highlight="cyan" />
              {bestParams.length >= 2 && (
                <Row label="at (x₁, x₂)" value={`(${bestParams[0].toFixed(2)}, ${bestParams[1].toFixed(2)})`} />
              )}
              <Row label="距最优" value={`Δ = ${Math.abs(bestObs - (-0.3979)).toFixed(4)}`} />
            </>}
          </div>
        </div>

        {/* Recommendation */}
        {rec && (
          <div className="glass-panel rounded-lg border border-[rgba(43,108,176,0.25)] p-4">
            <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">推荐下一实验点</div>
            <div className="space-y-1.5 text-[11px] font-mono mb-3">
              <Row label="x₁" value={rec.params[0].toFixed(3)} accent />
              <Row label="x₂" value={rec.params[1].toFixed(3)} accent />
              <Row label="预测均值 μ" value={rec.predictedMean.toFixed(4)} />
              <Row label="预测标准差 σ" value={rec.predictedStd.toFixed(4)} />
              <Row label="EI 值" value={rec.acquisitionValue.toFixed(5)} />
            </div>
            <div className="border-t border-[rgba(67,97,238,0.1)] pt-2">
              <div className="text-[9px] font-mono text-[#2B6CB0] mb-1">为什么推荐这个点？</div>
              <p className="text-[10px] text-[#8a92a3] leading-5">{rec.explanation}</p>
            </div>
          </div>
        )}

        {/* History table */}
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[rgba(67,97,238,0.1)]">
            <span className="text-[9px] font-mono text-[#8a92a3] tracking-widest">实验历史 ({history.length})</span>
          </div>
          {history.length === 0 ? (
            <div className="px-4 py-6 text-[10px] text-[#5a6377] text-center font-mono">
              点击"运行 1 步"开始
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto">
              <table className="w-full text-[10px] font-mono border-collapse">
                <thead className="sticky top-0" style={{ background: 'rgba(6,22,42,0.98)' }}>
                  <tr className="border-b border-[rgba(67,97,238,0.15)]">
                    {['#', 'x₁', 'x₂', '得分', 'best'].map((h) => (
                      <th key={h} className="py-1.5 px-2 text-left text-[#8a92a3] font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((row) => {
                    const isBest = row.observation >= bestObs && bestObs > -Infinity;
                    return (
                      <tr key={row.iteration}
                        className={`border-b border-[rgba(67,97,238,0.06)] ${isBest ? 'bg-[rgba(39,103,73,0.08)]' : ''}`}>
                        <td className="py-1.5 px-2 text-[#5a6377]">{row.iteration}</td>
                        <td className="py-1.5 px-2 text-[#d0d4dc]">{row.params[0].toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-[#d0d4dc]">{row.params[1].toFixed(2)}</td>
                        <td className={`py-1.5 px-2 ${isBest ? 'text-[#00f5d4] font-semibold' : 'text-[#d0d4dc]'}`}>
                          {row.observation.toFixed(4)}
                        </td>
                        <td className="py-1.5 px-2 text-[#8a92a3]">{row.bestSoFar.toFixed(4)}</td>
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
  );
}

function Row({ label, value, accent, highlight }: {
  label: string; value: string; accent?: boolean; highlight?: 'cyan';
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[#8a92a3]">{label}</span>
      <span className={accent ? 'text-[#00f5d4]' : highlight === 'cyan' ? 'text-[#00f5d4] font-semibold' : 'text-[#d0d4dc]'}>
        {value}
      </span>
    </div>
  );
}
