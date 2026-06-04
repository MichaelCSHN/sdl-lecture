import { useState, useCallback } from 'react';
import { Play, RotateCcw, Zap, Hash, Target, Crosshair, TrendingUp } from 'lucide-react';
import { liveCases } from '@/lib/bo_engine';
import { CaseSession, type ExperimentRecord } from '@/cases/caseEngine';

// ============================================================
// RGB LED 案例定义（来源：bo_engine liveCases）
// ============================================================

const RGB_LED_CASE = liveCases.find((c) => c.id === 'rgb_led')!;

const TARGET_COLOR = { r: 180, g: 120, b: 60, hex: '#B4783C', name: '暖橙色' };

// ============================================================
// 颜色预览辅助组件
// ============================================================

function pwmToRgb(rPwm: number, gPwm: number, bPwm: number): { r: number; g: number; b: number; hex: string } {
  const r = Math.round(2.55 * rPwm);
  const g = Math.round(2.55 * gPwm);
  const b = Math.round(2.55 * bPwm);
  const hex = '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  return { r, g, b, hex };
}

function ColorSwatch({ r, g, b, label, size }: { r: number; g: number; b: number; label?: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';
  return (
    <div className="flex items-center gap-2">
      <div className={`${s} rounded border border-[rgba(255,255,255,0.15)]`} style={{ background: `rgb(${r},${g},${b})` }} />
      {label && <span className="text-[10px] font-mono text-[#8a92a3]">{label}</span>}
    </div>
  );
}

// ============================================================
// 页面
// ============================================================

export default function CaseStudioPage() {
  const [session] = useState<CaseSession>(() => new CaseSession(RGB_LED_CASE, 42));
  const [, setTick] = useState(0);
  const [lastRecords, setLastRecords] = useState<ExperimentRecord[]>([]);
  const rerender = () => setTick((t) => t + 1);

  const rec = session.state.currentRecommendation;
  const bestObs = session.state.bestObservation;
  const history = session.state.history;

  const bestParams = session.state.bestParams.length > 0 ? session.state.bestParams : null;
  const bestColor = bestParams
    ? pwmToRgb(bestParams[0], bestParams[1], bestParams[2])
    : null;

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

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">现场演示</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">案例工作台</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed text-sm mb-8">
        SDL 闭环的实时演示。观察贝叶斯优化如何选择下一个实验点：参数输入 → 生成观测 → 更新模型 → 推荐下一点。
      </p>

      {/* ===== 工作台 ===== */}
      <div className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.2)] mb-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-[#00f5d4]" />
            <span className="text-sm font-mono text-[#d0d4dc]">RGB LED 颜色匹配</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.15)] text-[#00f5d4] font-mono">
              实时运行
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#8a92a3]">
            <Hash className="w-3 h-3" />
            种子: <span className="text-[#00f5d4]">{session.state.seed}</span>
            <span className="text-[#8a92a3]">|</span>
            <span>迭代: <span className="text-[#d0d4dc]">{session.state.iteration}</span></span>
          </div>
        </div>

        {/* 三列面板：目标 | 当前最佳 | 推荐 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* 目标 */}
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.12)]">
            <div className="flex items-center gap-1.5 mb-3">
              <Target className="w-3.5 h-3.5 text-[#fee440]" />
              <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">目标</span>
            </div>
            <ColorSwatch r={TARGET_COLOR.r} g={TARGET_COLOR.g} b={TARGET_COLOR.b} label={TARGET_COLOR.name} />
            <div className="mt-2 space-y-1 text-[10px] font-mono">
              <div className="flex justify-between"><span className="text-[#8a92a3]">RGB</span><span className="text-[#d0d4dc]">({TARGET_COLOR.r}, {TARGET_COLOR.g}, {TARGET_COLOR.b})</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">指标</span><span className="text-[#d0d4dc]">颜色距离（最高 100）</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">优化目标</span><span className="text-[#00f5d4]">最大化匹配得分</span></div>
            </div>
          </div>

          {/* 当前最佳 */}
          <div className="p-4 rounded-lg border border-[rgba(0,245,212,0.15)]">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#00f5d4]" />
              <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">当前最佳</span>
            </div>
            {bestColor ? (
              <>
                <ColorSwatch r={bestColor.r} g={bestColor.g} b={bestColor.b}
                  label={`(${bestParams![0].toFixed(0)}, ${bestParams![1].toFixed(0)}, ${bestParams![2].toFixed(0)})`} />
                <div className="mt-2 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">得分</span>
                    <span className="text-[#00f5d4] text-lg font-semibold">{bestObs.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">RGB</span>
                    <span className="text-[#d0d4dc]">({bestColor.r}, {bestColor.g}, {bestColor.b})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">轮次</span>
                    <span className="text-[#d0d4dc]">{history.find((r) => r.observation >= bestObs)?.iteration ?? '—'}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-[#8a92a3] py-3">尚未运行实验。点击下方按钮开始。</div>
            )}
          </div>

          {/* 推荐 */}
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.12)]">
            <div className="flex items-center gap-1.5 mb-3">
              <Crosshair className="w-3.5 h-3.5 text-[#4361ee]" />
              <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">下一推荐</span>
            </div>
            {rec ? (
              <>
                <div className="text-xs text-[#d0d4dc] mb-1">
                  <span className="text-[#8a92a3]">R </span>
                  <span className="text-[#ff6b6b] font-mono">{rec.params[0].toFixed(1)}%</span>
                  <span className="text-[#8a92a3] ml-2">G </span>
                  <span className="text-[#00f5d4] font-mono">{rec.params[1].toFixed(1)}%</span>
                  <span className="text-[#8a92a3] ml-2">B </span>
                  <span className="text-[#4361ee] font-mono">{rec.params[2].toFixed(1)}%</span>
                </div>
                <div className="mt-2 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">预测值</span>
                    <span className="text-[#d0d4dc]">{rec.predictedMean.toFixed(1)} ± {rec.predictedStd.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">EI 值</span>
                    <span className="text-[#00f5d4]">{rec.acquisitionValue.toFixed(4)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-[#8a92a3] py-3">初始化中…</div>
            )}
            {/* 推荐解释 */}
            {rec && (
              <div className="mt-3 pt-3 border-t border-[rgba(67,97,238,0.1)]">
                <div className="text-[10px] text-[#8a92a3] font-mono mb-1">为什么推荐这个点？</div>
                <p className="text-[10px] text-[#8a92a3] leading-relaxed">{rec.explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* 讲者控制 */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-lg border border-[rgba(67,97,238,0.1)]">
          <span className="text-[10px] text-[#8a92a3] font-mono mr-2">操作</span>
          <button onClick={runOne}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(0,245,212,0.3)] text-[#00f5d4] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.08)] active:bg-[rgba(0,245,212,0.15)] transition-colors">
            <Play className="w-3 h-3" /> 运行 1 步
          </button>
          <button onClick={runFive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(67,97,238,0.2)] text-[#8a92a3] text-[10px] font-mono hover:bg-[rgba(67,97,238,0.06)] active:bg-[rgba(67,97,238,0.12)] transition-colors">
            <Zap className="w-3 h-3" /> 运行 5 步
          </button>
          <button onClick={doReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(255,107,107,0.2)] text-[#ff6b6b] text-[10px] font-mono hover:bg-[rgba(255,107,107,0.06)] active:bg-[rgba(255,107,107,0.12)] transition-colors">
            <RotateCcw className="w-3 h-3" /> 重置（种子 42）
          </button>
        </div>

        {/* 历史表 */}
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
                    <th className="text-left py-2 px-2 text-[#8a92a3]">R%</th>
                    <th className="text-left py-2 px-2 text-[#8a92a3]">G%</th>
                    <th className="text-left py-2 px-2 text-[#8a92a3]">B%</th>
                    <th className="text-left py-2 px-2 text-[#8a92a3]">得分</th>
                    <th className="text-left py-2 px-2 text-[#8a92a3]">最佳</th>
                    <th className="text-left py-2 px-2 text-[#8a92a3] w-8">颜色</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => {
                    const { hex } = pwmToRgb(row.params[0], row.params[1], row.params[2]);
                    const isBest = row.observation >= bestObs && bestObs > -Infinity;
                    return (
                      <tr key={row.iteration}
                        className={`border-b border-[rgba(67,97,238,0.06)] ${isBest ? 'bg-[rgba(0,245,212,0.04)]' : ''}`}>
                        <td className="py-1.5 px-2 text-[#8a92a3]">{row.iteration}</td>
                        <td className="py-1.5 px-2 text-[#ff6b6b]">{row.params[0].toFixed(0)}</td>
                        <td className="py-1.5 px-2 text-[#00f5d4]">{row.params[1].toFixed(0)}</td>
                        <td className="py-1.5 px-2 text-[#4361ee]">{row.params[2].toFixed(0)}</td>
                        <td className={`py-1.5 px-2 ${isBest ? 'text-[#00f5d4] font-semibold' : 'text-[#d0d4dc]'}`}>
                          {row.observation.toFixed(1)}
                        </td>
                        <td className={`py-1.5 px-2 ${isBest ? 'text-[#00f5d4]' : 'text-[#8a92a3]'}`}>
                          {row.bestSoFar.toFixed(1)}
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="w-4 h-4 rounded border border-[rgba(255,255,255,0.1)]" style={{ background: hex }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-[10px] text-[#8a92a3] py-6 text-center border border-dashed border-[rgba(67,97,238,0.1)] rounded">
              点击「运行 1 步」开始第一个实验。所有结果种子固定，可重复。
            </div>
          )}
        </div>
      </div>

      {/* 其他案例（计划中） */}
      <div className="mb-8">
        <h2 className="text-xs text-[#8a92a3] font-mono tracking-widest mb-4">其他案例（后续版本提供）</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {liveCases
            .filter((c) => c.id !== 'rgb_led' && c.params.length <= 3)
            .slice(0, 2)
            .map((c) => (
              <div key={c.id} className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.08)] opacity-60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(67,97,238,0.08)] text-[#8a92a3] font-mono">
                    计划中
                  </span>
                  <span className="text-xs font-mono text-[#d0d4dc]">{c.nameEn}</span>
                </div>
                <p className="text-[10px] text-[#8a92a3] leading-relaxed">{c.description.slice(0, 60)}…</p>
              </div>
            ))}
        </div>
      </div>

      {/* 讲座说明 */}
      <div className="p-3 rounded border border-[rgba(67,97,238,0.1)]">
        <p className="text-[10px] text-[#8a92a3] leading-relaxed">
          <strong>讲者说明：</strong>RGB LED 案例完全可运行，种子固定（42），每次重置后可得到完全相同的结果序列。
          运行 1 步展示单步推荐逻辑；运行 5 步展示收敛过程。其他案例为后续课程扩展，本次讲座以 A-Lab 案例档案替代。
        </p>
      </div>
    </div>
  );
}
