/**
 * CaseStudioPage — multi-case SDL demo.
 *
 * Supports all cases defined in bo_engine.ts liveCases.
 * Lecture MVP highlights: RGB LED (benchmark) and Perovskite (materials case).
 */

import { useState, useCallback, useMemo } from 'react';
import { Play, RotateCcw, Zap, ChevronDown } from 'lucide-react';
import { liveCases, type LiveCase } from '@/lib/bo_engine';
import { CaseSession, type ExperimentRecord } from '@/cases/caseEngine';
import { useLecture } from '@/contexts/LectureContext';

// ── Cases available in the selector ──────────────────────────────────────

const SELECTOR_CASES = [
  'rgb_led',
  'perovskite',
  'suzuki',
  'snar_pareto',
  'catalyst_yield',
  'battery',
].map((id) => liveCases.find((c) => c.id === id)!).filter(Boolean);

// ── RGB LED color preview helper ──────────────────────────────────────────

function isRgbLed(caseId: string) { return caseId === 'rgb_led'; }

function pwmToHex(r: number, g: number, b: number): string {
  const toV = (pwm: number) => Math.max(0, Math.min(255, Math.round(2.55 * pwm)));
  return '#' + [toV(r), toV(g), toV(b)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
}

function ColorDot({ hex, size = 16 }: { hex: string; size?: number }) {
  return (
    <div
      className="rounded-sm border border-[rgba(255,255,255,0.15)] inline-block"
      style={{ width: size, height: size, background: hex, flexShrink: 0 }}
    />
  );
}

// ── Generic param value formatter ────────────────────────────────────────

function fmtParam(value: number, unit: string): string {
  return `${value.toFixed(unit === '%' || unit === '' ? 0 : 1)} ${unit}`.trim();
}

// ── Case selector dropdown ────────────────────────────────────────────────

function CaseSelector({
  selected,
  onChange,
}: {
  selected: LiveCase;
  onChange: (c: LiveCase) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded border border-[rgba(0,245,212,0.25)]
                   text-xs font-mono text-[#d0d4dc] hover:border-[#00f5d4] transition-colors"
      >
        <span className="text-[#00f5d4]">案例：</span>
        {selected.name}
        <ChevronDown className="w-3.5 h-3.5 text-[#8a92a3]" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-20 rounded-lg border border-[rgba(67,97,238,0.25)] overflow-hidden"
          style={{ background: '#06162a', minWidth: 220 }}
        >
          {SELECTOR_CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => { onChange(c); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[11px] font-mono transition-colors
                          hover:bg-[rgba(0,245,212,0.06)] border-b border-[rgba(67,97,238,0.08)] last:border-0
                          ${c.id === selected.id ? 'text-[#00f5d4]' : 'text-[#8a92a3]'}`}
            >
              <div className="text-[#d0d4dc] mb-0.5">{c.name}</div>
              <div className="text-[9px] opacity-70 truncate">{c.description.slice(0, 55)}…</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function CaseStudioPage() {
  const { isLectureMode } = useLecture();

  const [selectedCase, setSelectedCase] = useState<LiveCase>(
    SELECTOR_CASES[0] // rgb_led by default
  );

  // Create a new session whenever the case changes
  const [session, setSession] = useState<CaseSession>(
    () => new CaseSession(selectedCase, 42)
  );
  const [tick, setTick] = useState(0);
  const [lastRecords, setLastRecords] = useState<ExperimentRecord[]>([]);

  const rerender = () => setTick((t) => t + 1);

  const switchCase = useCallback((c: LiveCase) => {
    setSelectedCase(c);
    setSession(new CaseSession(c, 42));
    setLastRecords([]);
    setTick(0);
  }, []);

  const rec = session.state.currentRecommendation;
  const bestObs = session.state.bestObservation;
  const history = session.state.history;
  const caseDef = session.caseDef;

  const runOne = useCallback(() => {
    session.recommend();
    const r = session.state.currentRecommendation;
    if (r) {
      const record = session.observe(r.params);
      setLastRecords([record]);
      session.recommend();
      rerender();
    }
  }, [session]);

  const runFive = useCallback(() => {
    const records = session.runSteps(5);
    setLastRecords(records);
    rerender();
  }, [session]);

  const doReset = useCallback(() => {
    session.reset(42);
    setLastRecords([]);
    rerender();
  }, [session]);

  // For RGB LED: color preview of best params
  const bestHex = useMemo(() => {
    if (!isRgbLed(caseDef.id) || session.state.bestParams.length < 3) return null;
    const [r, g, b] = session.state.bestParams;
    return pwmToHex(r, g, b);
  }, [caseDef.id, session.state.bestParams, tick]);

  const TARGET_HEX = '#B4783C'; // fixed target for RGB LED

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-2">案例工作台</div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">SDL 闭环演示</h1>
          <p className="text-[#8a92a3] text-sm max-w-xl leading-relaxed">
            贝叶斯优化实时运行：参数推荐 → 模拟实验 → 更新 surrogate → 再推荐。
            观察模型如何平衡探索（高不确定性区域）与利用（预测高值区域）。
          </p>
        </div>
        <CaseSelector selected={selectedCase} onChange={switchCase} />
      </div>

      {/* Studio panel */}
      <div className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.2)] mb-6">
        {/* Meta bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-[#00f5d4]" />
            <span className="text-sm font-mono text-[#d0d4dc]">{caseDef.name}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.15)] text-[#00f5d4] font-mono">
              离线运行
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-[#8a92a3]">
            <span>种子 <span className="text-[#00f5d4]">{session.state.seed}</span></span>
            <span>|</span>
            <span>迭代 <span className="text-[#d0d4dc]">{session.state.iteration}</span></span>
            <span>|</span>
            <span>AF <span className="text-[#d0d4dc]">EI</span></span>
          </div>
        </div>

        {/* Info cards: objective | best | recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Objective */}
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.12)]">
            <div className="text-[9px] text-[#8a92a3] font-mono tracking-widest mb-3">目标与参数</div>
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between gap-2">
                <span className="text-[#8a92a3]">优化目标</span>
                <span className="text-[#00f5d4]">最大化 {caseDef.unit}</span>
              </div>
              {caseDef.params.map((p) => (
                <div key={p.nameEn} className="flex justify-between gap-2">
                  <span className="text-[#8a92a3]">{p.name}</span>
                  <span className="text-[#d0d4dc]">{p.min}–{p.max} {p.unit}</span>
                </div>
              ))}
              {isRgbLed(caseDef.id) && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[rgba(67,97,238,0.1)]">
                  <span className="text-[#8a92a3]">目标颜色</span>
                  <ColorDot hex={TARGET_HEX} />
                  <span className="text-[#d0d4dc]">{TARGET_HEX}</span>
                </div>
              )}
            </div>
          </div>

          {/* Best so far */}
          <div className="p-4 rounded-lg border border-[rgba(0,245,212,0.15)]">
            <div className="text-[9px] text-[#8a92a3] font-mono tracking-widest mb-3">当前最佳</div>
            {bestObs > -Infinity ? (
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a92a3]">最佳值</span>
                  <span className="text-[#00f5d4] text-base font-semibold">
                    {bestObs.toFixed(1)} {caseDef.unit}
                  </span>
                </div>
                {session.state.bestParams.map((v, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="text-[#8a92a3]">{caseDef.params[i]?.name}</span>
                    <span className="text-[#d0d4dc]">{fmtParam(v, caseDef.params[i]?.unit ?? '')}</span>
                  </div>
                ))}
                {isRgbLed(caseDef.id) && bestHex && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[rgba(67,97,238,0.1)]">
                    <span className="text-[#8a92a3]">当前颜色</span>
                    <ColorDot hex={bestHex} />
                    <span className="text-[#d0d4dc]">{bestHex}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-[#5a6377] py-2">尚未运行实验</div>
            )}
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.15)]">
            <div className="text-[9px] text-[#8a92a3] font-mono tracking-widest mb-3">下一推荐点</div>
            {rec ? (
              <>
                <div className="space-y-1.5 text-[10px] font-mono mb-3">
                  {rec.params.map((v, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="text-[#8a92a3]">{caseDef.params[i]?.name}</span>
                      <span className="text-[#00f5d4]">{fmtParam(v, caseDef.params[i]?.unit ?? '')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-2 pt-2 border-t border-[rgba(67,97,238,0.08)]">
                    <span className="text-[#8a92a3]">预测值</span>
                    <span className="text-[#d0d4dc]">
                      {rec.predictedMean.toFixed(1)} ± {rec.predictedStd.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#8a92a3]">EI 值</span>
                    <span className="text-[#d0d4dc]">{rec.acquisitionValue.toFixed(4)}</span>
                  </div>
                </div>
                {/* Recommendation reason — required by PRD success criteria */}
                <div className="mt-3 pt-3 border-t border-[rgba(67,97,238,0.12)]">
                  <div className="text-[9px] text-[#00f5d4] font-mono mb-1.5 tracking-wide">
                    为什么推荐这个点？
                  </div>
                  <p className="text-[10px] text-[#8a92a3] leading-relaxed">{rec.explanation}</p>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-[#5a6377] py-2">初始化中…</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-lg border border-[rgba(67,97,238,0.1)] flex-wrap">
          <span className="text-[10px] text-[#8a92a3] font-mono mr-1">操作</span>
          <button
            onClick={runOne}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(0,245,212,0.3)]
                       text-[#00f5d4] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.08)] transition-colors"
          >
            <Play className="w-3 h-3" /> 运行 1 步
          </button>
          <button
            onClick={runFive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(67,97,238,0.2)]
                       text-[#8a92a3] text-[10px] font-mono hover:bg-[rgba(67,97,238,0.06)] transition-colors"
          >
            <Zap className="w-3 h-3" /> 运行 5 步
          </button>
          <button
            onClick={doReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(255,107,107,0.2)]
                       text-[#ff6b6b] text-[10px] font-mono hover:bg-[rgba(255,107,107,0.06)] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> 重置（种子 42）
          </button>
          {isLectureMode && (
            <span className="text-[9px] text-amber-400 font-mono ml-auto">
              讲者模式：← → 切换节点，R = Reset
            </span>
          )}
        </div>

        {/* History table */}
        <div>
          <div className="text-[10px] text-[#8a92a3] font-mono mb-2 tracking-wide">
            实验历史（{history.length} 次）
            {lastRecords.length > 0 && (
              <span className="text-[#00f5d4] ml-2">
                — 最新: {lastRecords.map((r) => `#${r.iteration}=${r.observation.toFixed(1)}`).join(', ')}
              </span>
            )}
          </div>
          {history.length > 0 ? (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-[10px] font-mono border-collapse">
                <thead className="sticky top-0" style={{ background: 'rgba(6,22,42,0.98)' }}>
                  <tr className="border-b border-[rgba(67,97,238,0.2)]">
                    <th className="text-left py-2 px-2 text-[#8a92a3]">#</th>
                    {caseDef.params.map((p) => (
                      <th key={p.nameEn} className="text-left py-2 px-2 text-[#8a92a3]">
                        {p.name} ({p.unit})
                      </th>
                    ))}
                    <th className="text-left py-2 px-2 text-[#8a92a3]">
                      {caseDef.unit}
                    </th>
                    <th className="text-left py-2 px-2 text-[#8a92a3]">最佳</th>
                    {isRgbLed(caseDef.id) && (
                      <th className="text-left py-2 px-2 text-[#8a92a3] w-8">色</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => {
                    const isBest = row.observation >= bestObs && bestObs > -Infinity;
                    const hex = isRgbLed(caseDef.id) && row.params.length >= 3
                      ? pwmToHex(row.params[0], row.params[1], row.params[2])
                      : null;
                    return (
                      <tr
                        key={row.iteration}
                        className={`border-b border-[rgba(67,97,238,0.06)] ${
                          isBest ? 'bg-[rgba(0,245,212,0.04)]' : ''
                        }`}
                      >
                        <td className="py-1.5 px-2 text-[#8a92a3]">{row.iteration}</td>
                        {row.params.map((v, i) => (
                          <td key={i} className="py-1.5 px-2 text-[#d0d4dc]">
                            {fmtParam(v, caseDef.params[i]?.unit ?? '')}
                          </td>
                        ))}
                        <td
                          className={`py-1.5 px-2 font-semibold ${
                            isBest ? 'text-[#00f5d4]' : 'text-[#d0d4dc]'
                          }`}
                        >
                          {row.observation.toFixed(1)}
                        </td>
                        <td className={`py-1.5 px-2 ${isBest ? 'text-[#00f5d4]' : 'text-[#8a92a3]'}`}>
                          {row.bestSoFar.toFixed(1)}
                        </td>
                        {isRgbLed(caseDef.id) && (
                          <td className="py-1.5 px-2">
                            {hex && <ColorDot hex={hex} size={14} />}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-[10px] text-[#8a92a3] py-6 text-center border border-dashed border-[rgba(67,97,238,0.1)] rounded">
              点击「运行 1 步」开始第一个实验。种子固定（42），结果完全可重复。
            </div>
          )}
        </div>
      </div>

      {/* Lecture note */}
      {isLectureMode && (
        <div className="p-3 rounded border border-amber-800 bg-[rgba(120,53,15,0.15)]">
          <p className="text-[10px] text-amber-300 font-mono leading-relaxed">
            <strong>讲者提示：</strong>RGB LED 为首选演示案例（参数直觉最强）；
            钙钛矿案例适合讲完 A-Lab 后切换，展示材料领域闭环。
            种子 42 固定，重置后结果序列完全相同，可在讲座前彩排。
          </p>
        </div>
      )}

      {!isLectureMode && (
        <div className="p-3 rounded border border-[rgba(67,97,238,0.1)]">
          <p className="text-[10px] text-[#8a92a3] leading-relaxed">
            <strong>说明：</strong>所有案例完全在浏览器内运行，不调用任何外部 API。
            Surrogate 使用 RBF 核的 Gaussian Process，Acquisition Function 为 Expected Improvement。
          </p>
        </div>
      )}
    </div>
  );
}
