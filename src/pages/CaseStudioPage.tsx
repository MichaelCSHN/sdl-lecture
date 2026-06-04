import { Play, RotateCcw, Zap } from 'lucide-react';

interface CaseMeta {
  id: string;
  title: string;
  domain: string;
  desc: string;
  ready: boolean;
  params: number;
  objectives: string;
}

const CASES: CaseMeta[] = [
  {
    id: 'rgb-led',
    title: 'RGB LED Color Matching',
    domain: 'Benchmark',
    desc: 'A closed-loop color optimization problem. Find the RGB PWM values that produce a target color. Simple parameters (3-D), clear observations, and immediate feedback — ideal as a first SDL demonstration.',
    ready: true,
    params: 3,
    objectives: 'Single: minimize color distance (ΔE)',
  },
  {
    id: 'snar',
    title: 'SnAr Reaction Optimization',
    domain: 'Organic Synthesis',
    desc: 'Nucleophilic aromatic substitution reaction. Optimize reagent stoichiometry, solvent ratio, temperature, and time for maximum yield while minimizing byproducts.',
    ready: false,
    params: 5,
    objectives: 'Multi: maximize yield, minimize byproducts',
  },
  {
    id: 'perovskite',
    title: 'Perovskite Composition Screening',
    domain: 'Materials',
    desc: 'Search for stable perovskite compositions with desired band gap and phase stability. Multi-cation mixing with competing property constraints.',
    ready: false,
    params: 6,
    objectives: 'Multi: target bandgap, phase stability, tolerance factor',
  },
];

export default function CaseStudioPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">CASE STUDIO</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Case Studio</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        Observe how SDL chooses the next experiment. Each case demonstrates the full closed loop:
        parameters → observations → model update → recommendation.
      </p>

      {/* Case selector */}
      <div className="mb-10">
        <h2 className="text-xs text-[#00f5d4] font-mono tracking-widest mb-4">CASES</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CASES.map((c) => (
            <div
              key={c.id}
              className={`glass-panel p-5 rounded-lg border transition-colors ${
                c.ready
                  ? 'border-[rgba(0,245,212,0.3)] hover:border-[#00f5d4] cursor-pointer'
                  : 'border-[rgba(67,97,238,0.1)] opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-[#00f5d4] bg-[rgba(0,245,212,0.08)] px-1.5 py-0.5 rounded">
                  {c.id}
                </span>
                {c.ready ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.12)] text-[#00f5d4] font-mono">
                    READY
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(67,97,238,0.08)] text-[#8a92a3] font-mono">
                    PLANNED
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#4361ee] font-mono mb-1">{c.domain}</div>
              <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">{c.title}</h3>
              <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">{c.desc}</p>
              <div className="flex items-center gap-4 text-[10px] text-[#8a92a3] font-mono">
                <span>{c.params} parameters</span>
                <span>{c.objectives}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Workbench */}
      <div>
        <h2 className="text-xs text-[#00f5d4] font-mono tracking-widest mb-4">WORKBENCH</h2>

        {/* Currently selected case: RGB LED (ready) */}
        <div className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.15)] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-4 h-4 text-[#00f5d4]" />
            <span className="text-xs font-mono text-[#d0d4dc]">Selected: RGB LED Benchmark</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.12)] text-[#00f5d4] font-mono">
              DEMO-READY
            </span>
          </div>

          {/* Workbench grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
              <div className="text-[10px] text-[#8a92a3] font-mono mb-2">PARAMETERS & CONSTRAINTS</div>
              <div className="space-y-2">
                {[
                  { label: 'R (PWM)', range: '[0, 255]', step: 'int' },
                  { label: 'G (PWM)', range: '[0, 255]', step: 'int' },
                  { label: 'B (PWM)', range: '[0, 255]', step: 'int' },
                ].map((p) => (
                  <div key={p.label} className="flex items-center justify-between text-xs">
                    <span className="text-[#d0d4dc]">{p.label}</span>
                    <span className="text-[#8a92a3] font-mono text-[10px]">{p.range}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
              <div className="text-[10px] text-[#8a92a3] font-mono mb-2">TARGET & OBSERVATION</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#d0d4dc]">Target color</span>
                  <span className="text-[#8a92a3] font-mono text-[10px]">#00F5D4</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#d0d4dc]">Metric</span>
                  <span className="text-[#8a92a3] font-mono text-[10px]">ΔE (CIEDE2000)</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[rgba(67,97,238,0.08)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#d0d4dc]">Best ΔE so far</span>
                    <span className="text-[#00f5d4] font-mono text-[10px]">—</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
              <div className="text-[10px] text-[#8a92a3] font-mono mb-2">RECOMMENDATION</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#d0d4dc]">Next point</span>
                  <span className="text-[#8a92a3] font-mono text-[10px]">—</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#d0d4dc]">Acquisition</span>
                  <span className="text-[#8a92a3] font-mono text-[10px]">EI</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#d0d4dc]">Predicted ΔE</span>
                  <span className="text-[#8a92a3] font-mono text-[10px]">—</span>
                </div>
              </div>
            </div>
          </div>

          {/* History + Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
              <div className="text-[10px] text-[#8a92a3] font-mono mb-2">EXPERIMENT HISTORY</div>
              <div className="h-24 flex items-center justify-center text-[10px] text-[#8a92a3]">
                [RESERVED] History table with iteration, parameters, observed ΔE, best-so-far
              </div>
            </div>
            <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
              <div className="text-[10px] text-[#8a92a3] font-mono mb-2">SPEAKER CONTROLS</div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(0,245,212,0.2)] text-[10px] font-mono text-[#00f5d4] hover:bg-[rgba(0,245,212,0.06)] transition-colors">
                  <Play className="w-3 h-3" /> Run 1 Step
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(67,97,238,0.15)] text-[10px] font-mono text-[#8a92a3] hover:bg-[rgba(67,97,238,0.04)] transition-colors">
                  <Zap className="w-3 h-3" /> Run 5 Steps
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[rgba(67,97,238,0.15)] text-[10px] font-mono text-[#8a92a3] hover:bg-[rgba(67,97,238,0.04)] transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              <div className="mt-3 text-[10px] text-[#8a92a3]">
                [RESERVED] Seed: fixed random state for reproducible lecture demos
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2 roadmap */}
        <div className="glass-panel p-5 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
          <div className="text-xs text-[#8a92a3] font-mono mb-2">[RESERVED] Phase 2 — Case Engine Integration</div>
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
            The full case engine will connect the legacy DemoSection's Gaussian Process, acquisition functions,
            and DOE sampling to this workbench UI. Each case will define:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['parameterSchema', 'constraints', 'observationModel', 'evaluator', 'initialDesign', 'recommender', 'historyColumns', 'seedConfig'].map((field) => (
              <div key={field} className="px-2 py-1 rounded border border-[rgba(67,97,238,0.06)] text-[10px] text-[#8a92a3] font-mono">
                {field}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
