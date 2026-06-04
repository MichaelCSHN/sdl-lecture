import { useState } from 'react';
import { ExternalLink, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import CircularCarousel from '@/components/CircularCarousel';

const MILESTONES = [
  { year: '2023', event: 'A-Lab published in Nature', detail: 'Demonstrated autonomous synthesis of 41 novel inorganic materials over 17 days.' },
  { year: '2023.11', event: '41 new materials in 17 days', detail: 'Including 35 novel ternary oxides with validated structures via XRD.' },
  { year: '2024', event: 'Deep Materials Project integration', detail: 'Real-time DFT pre-screening for thermodynamic stability before synthesis.' },
  { year: '2024', event: 'Independent re-analysis published', detail: 'External labs re-evaluated success rates with stricter Rietveld refinement criteria.' },
  { year: '2025', event: 'Expanded to multi-component systems', detail: 'Carbon nitrides, phosphates, and halide perovskites added to search space.' },
  { year: '2026', event: 'Global network of 12+ labs', detail: 'Open-source SDL framework adopted across multiple institutions worldwide.' },
];

const MATERIALS = [
  { formula: 'Yb₂Mn₂O₇', type: 'Pyrochlore', success: true, prop: 'Dielectric', temp: '1100°C', time: '12h' },
  { formula: 'BaTiO₃', type: 'Perovskite', success: true, prop: 'Ferroelectric', temp: '900°C', time: '6h' },
  { formula: 'LiFePO₄', type: 'Olivine', success: true, prop: 'Battery cathode', temp: '700°C', time: '10h' },
  { formula: 'ZnGa₂O₄', type: 'Spinel', success: false, prop: 'Phosphor', temp: '1200°C', time: '24h' },
  { formula: 'SrZrO₃', type: 'Perovskite', success: true, prop: 'Proton conductor', temp: '1300°C', time: '18h' },
  { formula: 'Na₃Zr₂Si₂PO₁₂', type: 'NASICON', success: true, prop: 'Na-ion conductor', temp: '1100°C', time: '16h' },
  { formula: 'Ca₃Co₄O₉', type: 'Misfit oxide', success: false, prop: 'Thermoelectric', temp: '850°C', time: '48h' },
  { formula: 'CuInS₂', type: 'Chalcopyrite', success: true, prop: 'Photovoltaic', temp: '600°C', time: '8h' },
];

const VALIDATION_POINTS = [
  { title: 'Synthesis Success Rate', value: '78%', desc: '32 of 41 target materials successfully synthesized, exceeding typical 60-70% lab rates.', status: 'positive' as const },
  { title: 'Structure Match Rate', value: '94.7%', desc: 'XRD patterns matched Materials Project DFT predictions.', status: 'positive' as const },
  { title: 'Phase Purity Concern', value: '~30%', desc: 'Some products contained secondary phases; additional annealing or recrystallization required.', status: 'caution' as const },
  { title: 'Reproducibility', value: 'N/A', desc: 'Original paper did not report cross-batch reproducibility data — a key community concern.', status: 'negative' as const },
];

function ValidationPanel() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-4 glass-panel p-5 border-l-2 border-[#f59e0b]">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full text-left">
        <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0" />
        <h4 className="text-sm font-mono text-[#f59e0b]">Scientific Rigor Notes</h4>
        <span className="ml-auto text-[10px] text-[#8a92a3] font-mono">{expanded ? 'Collapse' : 'Expand'}</span>
        {expanded ? <ChevronDown className="w-4 h-4 text-[#8a92a3]" /> : <ChevronRight className="w-4 h-4 text-[#8a92a3]" />}
      </button>
      <p className="text-xs text-[#8a92a3] leading-relaxed mt-2">
        A-Lab's synthesis success definition and product validation methods have sparked academic discussion. A 2024 independent re-analysis raised questions about some results. This is science working as intended — self-correction in action. It also reminds us that SDL outputs still require careful human expert validation.
      </p>
      <div className="mt-2">
        <a href="https://www.chemistryworld.com/news/new-analysis-raises-doubts-over-autonomous-labs-materials-discoveries/4018791.article"
          target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-[#f59e0b] font-mono hover:underline inline-flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Chemistry World: Re-analysis of A-Lab discoveries →
        </a>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[rgba(245,158,11,0.15)] space-y-3">
          <div>
            <div className="text-[10px] text-[#f59e0b] font-mono mb-1">Points of Debate</div>
            <ul className="text-xs text-[#8a92a3] space-y-1">
              <li className="flex items-start gap-2"><span className="text-[#f59e0b] mt-0.5">•</span><span>Success definition: original paper defined "target phase obtained" as success; independent labs using stricter Rietveld refinement found 65-85% rates.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#f59e0b] mt-0.5">•</span><span>Validation depth: some products only underwent XRD comparison without full property characterization.</span></li>
              <li className="flex items-start gap-2"><span className="text-[#f59e0b] mt-0.5">•</span><span>Equipment dependence: furnace, crucible material, and temperature profiles can shift outcomes between labs.</span></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-[#f59e0b] font-mono mb-1">Community Response</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              The Ceder group welcomed scrutiny, releasing complete experimental logs and raw data. A 2025 multi-center study (12 labs across 6 countries) is evaluating how equipment standardization affects reproducibility.
            </p>
          </div>
          <div className="flex gap-4 text-[10px] font-mono pt-1">
            <a href="https://www.chemistryworld.com/news/new-analysis-raises-doubts-over-autonomous-labs-materials-discoveries/4018791.article"
              target="_blank" rel="noopener noreferrer" className="text-[#f59e0b] hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Chemistry World
            </a>
            <a href="https://venturebeat.com/ai/ai-meets-materials-science-the-promise-and-pitfalls-of-automated-discovery"
              target="_blank" rel="noopener noreferrer" className="text-[#8a92a3] hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> VentureBeat
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ALabPage() {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const filteredMaterials = MATERIALS.filter((m) => {
    if (filter === 'success') return m.success;
    if (filter === 'failed') return !m.success;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">A-LAB CASE FILE</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        A-Lab: Autonomous Materials Discovery
      </h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-10">
        A case-file analysis of the A-Lab system at Berkeley Lab. Not a timeline exhibit — a structured case study: problem, system, results, controversy, and lessons for students.
      </p>

      {/* === 1. Problem Definition === */}
      <section className="mb-14" id="problem">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">01</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Problem Definition</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Goal', text: 'Autonomous synthesis of novel inorganic solid-state materials. Identify new ternary oxide phases without human intervention at every step.' },
            { label: 'Scope', text: 'Ternary oxide space with 2-3 metal cations. Precursor selection, mixing ratios, calcination temperature, and dwell time as variables.' },
            { label: 'Metric', text: 'Success = target crystal phase confirmed by XRD and matched to Materials Project DFT predictions. Rate: 71% initial, 65-85% under stricter standards.' },
          ].map((item) => (
            <div key={item.label} className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
              <div className="text-[10px] text-[#00f5d4] font-mono mb-1">{item.label}</div>
              <p className="text-xs text-[#8a92a3] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === 2. System Architecture === */}
      <section className="mb-14" id="system">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">02</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">System Architecture</h2>
        </div>
        <CircularCarousel />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Dispensing', desc: 'Robotic powder handling with 18 precursor slots' },
            { label: 'Mixing & Heating', desc: 'Furnace with programmable T profiles up to 1200°C' },
            { label: 'XRD Characterization', desc: 'Automated X-ray diffraction with phase identification' },
            { label: 'AI Planner', desc: 'Bayesian optimization + DFT pre-screening via Materials Project API' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
              <div className="text-xs text-[#d0d4dc] font-semibold mb-0.5">{item.label}</div>
              <div className="text-[10px] text-[#8a92a3]">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === 3. Chronological Milestones === */}
      <section className="mb-14" id="milestones">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">03</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Key Milestones</h2>
        </div>
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[rgba(67,97,238,0.15)]" />
          <div className="space-y-1">
            {MILESTONES.map((ms, i) => (
              <div key={i} className="relative pl-12 py-3">
                <span className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full border-2 border-[#000d1d]"
                  style={{ background: i === 0 ? '#fee440' : 'rgba(67,97,238,0.5)' }} />
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs font-mono text-[#00f5d4] w-20 flex-shrink-0">{ms.year}</span>
                  <span className="text-sm font-medium text-[#d0d4dc]">{ms.event}</span>
                </div>
                <p className="text-xs text-[#8a92a3] mt-1">{ms.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 4. Synthesized Materials === */}
      <section className="mb-14" id="materials">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#00f5d4] font-mono tracking-wider">04</span>
            <h2 className="text-lg font-semibold text-[#d0d4dc]">
              Synthesized Materials
              <span className="text-[#8a92a3] font-normal text-xs ml-2">({filteredMaterials.length}/{MATERIALS.length})</span>
            </h2>
          </div>
          <div className="flex gap-2">
            {(['all', 'success', 'failed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-[10px] font-mono rounded border transition-all ${
                  filter === f ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
                }`}
              >
                {f === 'all' ? 'All' : f === 'success' ? 'Success' : 'Failed'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredMaterials.map((mat) => (
            <div key={mat.formula}
              className={`p-3 rounded-lg border transition-all ${
                mat.success ? 'border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.04)]' : 'border-[rgba(255,107,107,0.15)] bg-[rgba(255,107,107,0.03)]'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono font-medium text-[#d0d4dc]">{mat.formula}</span>
                <span className={`w-2 h-2 rounded-full ${mat.success ? 'bg-[#00f5d4]' : 'bg-[#ff6b6b]'}`} />
              </div>
              <div className="text-[10px] text-[#8a92a3] font-mono space-y-0.5">
                <div>{mat.type}</div>
                <div className="text-[#00f5d4]">{mat.prop}</div>
                <div>{mat.temp} / {mat.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === 5. Validation & Controversy === */}
      <section className="mb-14" id="validation">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">05</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Validation & Controversy</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {VALIDATION_POINTS.map((vp) => (
            <div key={vp.title} className="glass-panel p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-[#8a92a3] font-mono">{vp.title}</span>
                <span className={`text-lg font-semibold ${
                  vp.status === 'positive' ? 'text-[#00f5d4]' : vp.status === 'caution' ? 'text-[#fee440]' : 'text-[#ff6b6b]'
                }`}>{vp.value}</span>
              </div>
              <p className="text-xs text-[#d0d4dc] leading-relaxed">{vp.desc}</p>
            </div>
          ))}
        </div>
        <ValidationPanel />
      </section>

      {/* === 6. Materials Project Connection === */}
      <section className="mb-14" id="mp-connection">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">06</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Connection to Materials Project</h2>
        </div>
        <div className="glass-panel p-6 rounded-lg border border-[rgba(67,97,238,0.15)]">
          <p className="text-sm text-[#8a92a3] leading-relaxed mb-3">
            A-Lab's AI Planner queries the Materials Project API in real-time for DFT pre-screening,
            eliminating thermodynamically unstable candidates before synthesis. After each synthesis,
            XRD patterns are automatically compared against MP database predictions, forming a complete
            data chain from computational prediction to experimental validation.
          </p>
          <div className="flex gap-6 text-xs font-mono text-[#00f5d4]">
            <span>API Calls: 15,000+/day</span>
            <span>Match Rate: 94.7%</span>
            <span>Cached Structures: 180,000+</span>
          </div>
        </div>
      </section>

      {/* === 7. Lessons for Students === */}
      <section id="lessons">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">07</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Lessons for Students</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'SDL is Systems Engineering', desc: 'A-Lab is not just a BO algorithm. It integrates robotics, furnace control, XRD automation, and data pipelines. Thinking about SDL requires thinking about the whole system.' },
            { title: 'Define Success Carefully', desc: 'What counts as "success"? Target phase obtained? Phase purity? Full property characterization? The controversy around A-Lab shows why definitions matter.' },
            { title: 'Human Validation Remains Essential', desc: 'XRD matching alone is not enough. SDL outputs must be verified by human experts using multiple characterization methods and independent reproduction.' },
            { title: 'Science Self-Corrects', desc: 'The 2024 re-analysis is not a failure of A-Lab — it is science working as designed. Open data, open methods, and community scrutiny are safeguards, not obstacles.' },
          ].map((item) => (
            <div key={item.title} className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
              <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">{item.title}</h3>
              <p className="text-xs text-[#8a92a3] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
