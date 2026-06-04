import { useState, useCallback } from 'react';
import { Play, RotateCcw, Zap, Hash, Target, Crosshair, TrendingUp } from 'lucide-react';
import { liveCases } from '@/lib/bo_engine';
import { CaseSession, type ExperimentRecord } from '@/cases/caseEngine';

// ============================================================
// RGB LED Case Definition (from liveCases, with lecture metadata)
// ============================================================

const RGB_LED_CASE = liveCases.find((c) => c.id === 'rgb_led')!;

const TARGET_COLOR = { r: 180, g: 120, b: 60, hex: '#B4783C', name: 'Warm Orange / Amber' };

// ============================================================
// Color preview helper
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
// Page
// ============================================================

export default function CaseStudioPage() {
  const [session] = useState<CaseSession>(() => new CaseSession(RGB_LED_CASE, 42));
  // Force re-render counter — avoids Object.assign prototype hacks
  const [, setTick] = useState(0);
  const [lastRecords, setLastRecords] = useState<ExperimentRecord[]>([]);
  const rerender = () => setTick((t) => t + 1);

  const rec = session.state.currentRecommendation;
  const bestObs = session.state.bestObservation;
  const history = session.state.history;

  // Compute current best color
  const bestParams = session.state.bestParams.length > 0 ? session.state.bestParams : null;
  const bestColor = bestParams
    ? pwmToRgb(bestParams[0], bestParams[1], bestParams[2])
    : null;

  // Run 1 step
  const runOne = useCallback(() => {
    session.recommend();
    const r = session.state.currentRecommendation;
    if (r) {
      const record = session.observe(r.params);
      setLastRecords([record]);
      session.recommend(); // next recommendation
      rerender();
    }
  }, [session]);

  // Run 5 steps
  const runFive = useCallback(() => {
    const records = session.runSteps(5);
    setLastRecords(records);
    rerender();
  }, [session]);

  // Reset
  const doReset = useCallback(() => {
    session.reset(42); // fixed seed 42
    setLastRecords([]);
    rerender();
  }, [session]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">CASE STUDIO</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">Case Studio</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed text-sm mb-8">
        Live SDL closed-loop demonstration. Observe how Bayesian optimization selects each next experiment.
      </p>

      {/* ===== Workbench ===== */}
      <div className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.2)] mb-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-[#00f5d4]" />
            <span className="text-sm font-mono text-[#d0d4dc]">RGB LED Color Matching</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.15)] text-[#00f5d4] font-mono">
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#8a92a3]">
            <Hash className="w-3 h-3" />
            Seed: <span className="text-[#00f5d4]">{session.state.seed}</span>
            <span className="text-[#8a92a3]">|</span>
            <span>Iteration: <span className="text-[#d0d4dc]">{session.state.iteration}</span></span>
          </div>
        </div>

        {/* 3-column: Target | Current Best | Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Target */}
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.12)]">
            <div className="flex items-center gap-1.5 mb-3">
              <Target className="w-3.5 h-3.5 text-[#fee440]" />
              <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">TARGET</span>
            </div>
            <ColorSwatch r={TARGET_COLOR.r} g={TARGET_COLOR.g} b={TARGET_COLOR.b} label={TARGET_COLOR.name} />
            <div className="mt-2 space-y-1 text-[10px] font-mono">
              <div className="flex justify-between"><span className="text-[#8a92a3]">RGB</span><span className="text-[#d0d4dc]">({TARGET_COLOR.r}, {TARGET_COLOR.g}, {TARGET_COLOR.b})</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">Metric</span><span className="text-[#d0d4dc]">Color distance (max = 100)</span></div>
              <div className="flex justify-between"><span className="text-[#8a92a3]">Goal</span><span className="text-[#00f5d4]">Maximize match score</span></div>
            </div>
          </div>

          {/* Current Best */}
          <div className="p-4 rounded-lg border border-[rgba(0,245,212,0.15)]">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#00f5d4]" />
              <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">BEST SO FAR</span>
            </div>
            {bestColor ? (
              <>
                <ColorSwatch r={bestColor.r} g={bestColor.g} b={bestColor.b}
                  label={`(${bestParams![0].toFixed(0)}, ${bestParams![1].toFixed(0)}, ${bestParams![2].toFixed(0)})`} />
                <div className="mt-2 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">Score</span>
                    <span className="text-[#00f5d4] text-lg font-semibold">{bestObs.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">RGB</span>
                    <span className="text-[#d0d4dc]">({bestColor.r}, {bestColor.g}, {bestColor.b})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">Iteration</span>
                    <span className="text-[#d0d4dc]">{history.find((r) => r.observation >= bestObs)?.iteration ?? 0}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-[#8a92a3] py-3">No experiments yet. Run a step to begin.</div>
            )}
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.12)]">
            <div className="flex items-center gap-1.5 mb-3">
              <Crosshair className="w-3.5 h-3.5 text-[#4361ee]" />
              <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">NEXT RECOMMENDATION</span>
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
                    <span className="text-[#8a92a3]">Predicted</span>
                    <span className="text-[#d0d4dc]">{rec.predictedMean.toFixed(1)} ± {rec.predictedStd.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a92a3]">EI value</span>
                    <span className="text-[#00f5d4]">{rec.acquisitionValue.toFixed(4)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-[#8a92a3] py-3">Initializing...</div>
            )}
            {/* Explanation */}
            {rec && (
              <div className="mt-3 pt-3 border-t border-[rgba(67,97,238,0.1)]">
                <div className="text-[10px] text-[#8a92a3] font-mono mb-1">WHY THIS POINT?</div>
                <p className="text-[10px] text-[#8a92a3] leading-relaxed">{rec.explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Speaker Controls */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-lg border border-[rgba(67,97,238,0.1)]">
          <span className="text-[10px] text-[#8a92a3] font-mono mr-2">CONTROLS</span>
          <button
            onClick={runOne}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(0,245,212,0.3)] text-[#00f5d4] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.08)] active:bg-[rgba(0,245,212,0.15)] transition-colors"
          >
            <Play className="w-3 h-3" /> Run 1 Step
          </button>
          <button
            onClick={runFive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(67,97,238,0.2)] text-[#8a92a3] text-[10px] font-mono hover:bg-[rgba(67,97,238,0.06)] active:bg-[rgba(67,97,238,0.12)] transition-colors"
          >
            <Zap className="w-3 h-3" /> Run 5 Steps
          </button>
          <button
            onClick={doReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(255,107,107,0.2)] text-[#ff6b6b] text-[10px] font-mono hover:bg-[rgba(255,107,107,0.06)] active:bg-[rgba(255,107,107,0.12)] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset (Seed 42)
          </button>
        </div>

        {/* History Table */}
        <div>
          <div className="text-[10px] text-[#8a92a3] font-mono mb-2 tracking-wide">
            EXPERIMENT HISTORY ({history.length} runs)
            {lastRecords.length > 0 && (
              <span className="text-[#00f5d4] ml-2">
                — latest: {lastRecords.map((r) => `#${r.iteration}=${r.observation.toFixed(1)}`).join(', ')}
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
                    <th className="text-left py-2 px-2 text-[#8a92a3]">Score</th>
                    <th className="text-left py-2 px-2 text-[#8a92a3]">Best</th>
                    <th className="text-left py-2 px-2 text-[#8a92a3] w-8">Color</th>
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
              Click "Run 1 Step" to start the first experiment.
            </div>
          )}
        </div>
      </div>

      {/* ===== Other Cases ===== */}
      <div className="mb-8">
        <h2 className="text-xs text-[#8a92a3] font-mono tracking-widest mb-4">OTHER CASES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {liveCases
            .filter((c) => c.id !== 'rgb_led' && c.params.length <= 3)
            .slice(0, 2)
            .map((c) => (
              <div key={c.id} className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.08)] opacity-60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(67,97,238,0.08)] text-[#8a92a3] font-mono">
                    PLANNED
                  </span>
                  <span className="text-xs font-mono text-[#d0d4dc]">{c.nameEn}</span>
                </div>
                <p className="text-[10px] text-[#8a92a3] leading-relaxed">
                  {c.description.slice(0, 80)}...
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Lecture note */}
      <div className="p-3 rounded border border-[rgba(67,97,238,0.1)]">
        <p className="text-[10px] text-[#8a92a3] leading-relaxed">
          <strong>Lecture note:</strong> The RGB LED case is fully live with seeded reproducibility (seed=42).
          Run 1 Step to show individual decisions; Run 5 Steps to show convergence.
          Reset to replay from scratch. Other cases are scaffolded for future phases.
        </p>
      </div>
    </div>
  );
}
