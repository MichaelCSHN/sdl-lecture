import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Square } from 'lucide-react';
import { CaseSession } from '@/cases/caseEngine';
import {
  THIN_FILM_CASE,
  THIN_FILM_LAYER_LABELS,
  THIN_FILM_PROBLEM,
  describeThinFilmLayers,
  evaluateThinFilmDesign,
} from '@/lib/thinFilmEngine';

const Plot = lazy(() => import('react-plotly.js'));
const AUTO_INTERVAL_MS = 550;
const plotConfig = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
} as const;

export default function ThinFilmCaseView() {
  const [session] = useState(() => new CaseSession(THIN_FILM_CASE, 42));
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

  const bestMetrics = useMemo(
    () => (bestParams.length === 4 ? evaluateThinFilmDesign(bestParams) : null),
    [bestParams]
  );
  const recMetrics = useMemo(
    () => (rec?.params?.length === 4 ? evaluateThinFilmDesign(rec.params) : null),
    [rec]
  );

  const runOne = useCallback(() => {
    session.recommend();
    const next = session.state.currentRecommendation;
    if (next) {
      session.observe(next.params);
      session.recommend();
      rerender();
    }
  }, [session]);

  const runFive = useCallback(() => {
    session.runSteps(5);
    rerender();
  }, [session]);

  const stopAuto = useCallback(() => {
    autoRef.current = false;
    setAutoRunning(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const startAuto = useCallback(() => {
    autoRef.current = true;
    setAutoRunning(true);
    const loop = () => {
      if (!autoRef.current) {
        setAutoRunning(false);
        return;
      }
      session.recommend();
      const next = session.state.currentRecommendation;
      if (next) {
        session.observe(next.params);
        session.recommend();
      }
      rerender();
      timerRef.current = window.setTimeout(loop, AUTO_INTERVAL_MS);
    };
    loop();
  }, [session]);

  const doReset = useCallback(() => {
    stopAuto();
    session.reset(42);
    rerender();
  }, [session, stopAuto]);

  useEffect(() => {
    const handler = () => doReset();
    window.addEventListener('lecture:reset', handler);
    return () => window.removeEventListener('lecture:reset', handler);
  }, [doReset]);

  const chartMetrics = bestMetrics ?? recMetrics;
  const layerStack = bestParams.length === 4 ? describeThinFilmLayers(bestParams) : describeThinFilmLayers([135, 80, 160, 6]);
  const maxLayerThickness = Math.max(...layerStack.map((layer) => layer.thicknessNm), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_420px] gap-6">
      <div className="space-y-4">
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-1.5">REALISTIC CASE</div>
          <p className="text-[11px] text-[#8a92a3] leading-5">
            This case uses a thin-film optics simulator rather than a toy benchmark. The stack is a symmetric
            SiO2/TiO2/Cr absorber tuned for <span className="text-[#fee440]">650-700 nm band-stop absorption</span>,
            while keeping the short- and long-pass regions transmissive.
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
            <SpecChip label="In-band" value="650-700 nm" accent="#ff6b6b" />
            <SpecChip label="Passband 1" value="400-620 nm" accent="#00f5d4" />
            <SpecChip label="Passband 2" value="730-1100 nm" accent="#4cc9f0" />
          </div>
        </div>

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[rgba(67,97,238,0.1)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a92a3]">
              Spectrum and stack | {history.length} experiments
            </span>
            <span className="text-[10px] font-mono text-[#5a6377]">
              Objective = 0.55A_in + 0.225T_short + 0.225T_long
            </span>
          </div>

          {!chartMetrics ? (
            <div className="flex items-center justify-center h-80 text-[10px] text-[#8a92a3]">
              Run one experiment to initialize the spectrum view.
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <Suspense fallback={<div className="h-80 flex items-center justify-center text-[10px] text-[#8a92a3]">Loading chart...</div>}>
                <Plot
                  data={[
                    {
                      x: chartMetrics.wavelengthsNm,
                      y: chartMetrics.transmittance,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'T',
                      line: { color: '#00f5d4', width: 2 },
                    },
                    {
                      x: chartMetrics.wavelengthsNm,
                      y: chartMetrics.reflectance,
                      type: 'scatter',
                      mode: 'lines',
                      name: 'R',
                      line: { color: '#4cc9f0', width: 1.6 },
                    },
                    {
                      x: chartMetrics.wavelengthsNm,
                      y: chartMetrics.absorptance,
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
                      text: bestMetrics ? 'Best observed spectrum' : 'Current recommendation spectrum',
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
                  {layerStack.map((layer, idx) => (
                    <div key={`${layer.label}-${idx}`} className="min-w-[52px] text-center">
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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={doReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(255,107,107,0.2)] text-[#ff6b6b] text-[10px] font-mono hover:bg-[rgba(255,107,107,0.06)] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={runOne}
            disabled={autoRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(0,245,212,0.3)] text-[#00f5d4] text-[10px] font-mono hover:bg-[rgba(0,245,212,0.08)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-3 h-3" /> Run 1
          </button>
          <button
            onClick={runFive}
            disabled={autoRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(76,201,240,0.3)] text-[#4cc9f0] text-[10px] font-mono hover:bg-[rgba(76,201,240,0.06)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-3 h-3" /> Run 5
          </button>
          {autoRunning ? (
            <button
              onClick={stopAuto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(245,158,11,0.28)] text-[#f59e0b] text-[10px] font-mono hover:bg-[rgba(245,158,11,0.06)] transition-colors"
            >
              <Square className="w-3 h-3" /> Stop
            </button>
          ) : (
            <button
              onClick={startAuto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(67,97,238,0.2)] text-[#8a92a3] text-[10px] font-mono hover:bg-[rgba(67,97,238,0.06)] transition-colors"
            >
              <Play className="w-3 h-3" /> Auto
            </button>
          )}
          <span className="ml-auto text-[10px] font-mono text-[#5a6377]">Iterations {history.length}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">Problem spec</div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <MetricRow label="Stack" value="7-layer symmetric" accent="cyan" />
            <MetricRow label="Absorber" value="Cr (Johnson)" accent="yellow" />
            <MetricRow label="Target" value="High A in 650-700 nm" />
            <MetricRow label="Constraint" value="High T outside target band" />
          </div>
          <div className="mt-3 pt-2 border-t border-[rgba(67,97,238,0.1)] space-y-1 text-[10px] text-[#8a92a3] leading-5">
            {THIN_FILM_PROBLEM.materials.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] p-4">
          <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">Current best</div>
          {bestMetrics ? (
            <div className="space-y-1.5 text-[11px] font-mono">
              <MetricRow label="Objective" value={bestMetrics.objective.toFixed(4)} accent="cyan" />
              <MetricRow label="A(650-700)" value={bestMetrics.avgInBandAbsorption.toFixed(4)} accent="yellow" />
              <MetricRow label="T(400-620)" value={bestMetrics.avgShortPassTransmission.toFixed(4)} />
              <MetricRow label="T(730-1100)" value={bestMetrics.avgLongPassTransmission.toFixed(4)} />
              <MetricRow label="R(650-700)" value={bestMetrics.avgInBandReflectance.toFixed(4)} />
              <MetricRow label="Total thickness" value={`${bestMetrics.totalThicknessNm.toFixed(1)} nm`} />
            </div>
          ) : (
            <div className="text-[10px] text-[#5a6377] font-mono">No observed design yet.</div>
          )}
        </div>

        {rec && recMetrics && (
          <div className="glass-panel rounded-lg border border-[rgba(43,108,176,0.25)] p-4">
            <div className="text-[9px] font-mono text-[#8a92a3] tracking-widest mb-3">Recommended next design</div>
            <div className="space-y-1.5 text-[11px] font-mono mb-3">
              {rec.params.map((value, idx) => (
                <MetricRow
                  key={THIN_FILM_LAYER_LABELS[idx]}
                  label={THIN_FILM_CASE.params[idx].nameEn}
                  value={`${value.toFixed(1)} nm`}
                  accent={idx === 3 ? 'yellow' : 'blue'}
                />
              ))}
              <MetricRow label="Predicted mean" value={rec.predictedMean.toFixed(4)} />
              <MetricRow label="Predicted std" value={rec.predictedStd.toFixed(4)} />
              <MetricRow label="Expected improvement" value={rec.acquisitionValue.toFixed(5)} />
            </div>
            <div className="pt-2 border-t border-[rgba(67,97,238,0.1)] text-[10px] text-[#8a92a3] leading-5">
              <p>{rec.explanation}</p>
            </div>
          </div>
        )}

        <div className="glass-panel rounded-lg border border-[rgba(67,97,238,0.15)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[rgba(67,97,238,0.1)]">
            <span className="text-[9px] font-mono text-[#8a92a3] tracking-widest">History ({history.length})</span>
          </div>
          {history.length === 0 ? (
            <div className="px-4 py-6 text-[10px] text-[#5a6377] text-center font-mono">
              Click Run 1 to start the design loop.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-[10px] font-mono border-collapse">
                <thead className="sticky top-0" style={{ background: 'rgba(6,22,42,0.98)' }}>
                  <tr className="border-b border-[rgba(67,97,238,0.15)]">
                    {['#', 'Cap', 'TiO2', 'Spacer', 'Cr', 'Score', 'Best'].map((h) => (
                      <th key={h} className="py-1.5 px-2 text-left text-[#8a92a3] font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((row) => {
                    const isBest = row.observation >= bestObs && bestObs > -Infinity;
                    return (
                      <tr
                        key={row.iteration}
                        className={`border-b border-[rgba(67,97,238,0.06)] ${
                          isBest ? 'bg-[rgba(39,103,73,0.08)]' : ''
                        }`}
                      >
                        <td className="py-1.5 px-2 text-[#5a6377]">{row.iteration}</td>
                        <td className="py-1.5 px-2 text-[#d0d4dc]">{row.params[0].toFixed(1)}</td>
                        <td className="py-1.5 px-2 text-[#d0d4dc]">{row.params[1].toFixed(1)}</td>
                        <td className="py-1.5 px-2 text-[#d0d4dc]">{row.params[2].toFixed(1)}</td>
                        <td className="py-1.5 px-2 text-[#d0d4dc]">{row.params[3].toFixed(1)}</td>
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

function SpecChip({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded border px-2 py-2" style={{ borderColor: `${accent}40`, background: `${accent}10` }}>
      <div className="text-[9px] font-mono" style={{ color: accent }}>
        {label}
      </div>
      <div className="text-[10px] font-mono text-[#d0d4dc]">{value}</div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'blue' | 'cyan' | 'yellow';
}) {
  const valueColor =
    accent === 'cyan'
      ? 'text-[#00f5d4]'
      : accent === 'yellow'
        ? 'text-[#fee440]'
        : accent === 'blue'
          ? 'text-[#4cc9f0]'
          : 'text-[#d0d4dc]';

  return (
    <div className="flex justify-between gap-2">
      <span className="text-[#8a92a3]">{label}</span>
      <span className={valueColor}>{value}</span>
    </div>
  );
}
