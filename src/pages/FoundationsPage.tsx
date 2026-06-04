import { useState } from 'react';
import { experimentTimeline, type TimelineEvent } from '@/data/experiment_timeline';

const CATEGORY_COLORS: Record<string, string> = {
  observation: '#8a92a3',
  methodology: '#00f5d4',
  institution: '#4361ee',
  technology: '#fee440',
  paradigm: '#ff6b6b',
};

const CATEGORY_LABELS: Record<string, string> = {
  observation: 'Observation',
  methodology: 'Methodology',
  institution: 'Institution',
  technology: 'Technology',
  paradigm: 'Paradigm',
};

export default function FoundationsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filteredTimeline = activeCategory
    ? experimentTimeline.filter((e) => e.category === activeCategory)
    : experimentTimeline;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">FOUNDATIONS</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        Foundations: Experiment-Centered MSE
      </h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-10">
        Before self-driving labs, we must answer two fundamental questions:
        What <em>is</em> an experiment? And what types of experiments exist in materials science?
      </p>

      {/* ===== Section A: Experiment History Timeline ===== */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#fee440] font-mono tracking-wider">A</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">The Story of Experiment</h2>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
              activeCategory === null
                ? 'border-[#00f5d4] text-[#00f5d4]'
                : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all flex items-center gap-1.5 ${
                activeCategory === key
                  ? 'border-[#00f5d4] text-[#00f5d4]'
                  : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[key] }} />
              {label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[rgba(67,97,238,0.15)]" />
          <div className="space-y-1">
            {filteredTimeline.map((event: TimelineEvent) => (
              <div key={event.year + event.labelEn} className="relative pl-12 py-3 group">
                <span
                  className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full border-2 border-[#000d1d]"
                  style={{ background: CATEGORY_COLORS[event.category] }}
                />
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs font-mono text-[#00f5d4] w-20 flex-shrink-0">{event.year}</span>
                  <span className="text-sm font-medium text-[#d0d4dc]">{event.label}</span>
                  <span className="text-[10px] text-[#8a92a3]">{event.labelEn}</span>
                </div>
                <p className="text-xs text-[#8a92a3] mt-1 leading-relaxed max-w-2xl">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Section B: MSE Experiment Taxonomy (reserved) ===== */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">B</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">MSE Experiment Taxonomy</h2>
        </div>

        <div className="glass-panel p-6 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
          <div className="text-xs text-[#8a92a3] font-mono mb-3">[RESERVED] Interactive Taxonomy Diagram</div>
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-4">
            An interactive catalog of MSE experiment types organized by purpose, not by material class:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Synthesis', desc: 'Sample preparation & material creation' },
              { label: 'Processing', desc: 'Shape, form & post-treatment' },
              { label: 'Characterization', desc: 'Structure, composition & morphology' },
              { label: 'Property Measurement', desc: 'Electrical, mechanical, thermal, magnetic, optical' },
              { label: 'Functional Testing', desc: 'Device-level performance evaluation' },
              { label: 'Stability & Failure', desc: 'Aging, degradation & failure analysis' },
              { label: 'Metrology & Calibration', desc: 'Standards, reference materials & calibration' },
              { label: 'High-Throughput & Closed-Loop', desc: 'Automated & autonomous experimentation' },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded border border-[rgba(67,97,238,0.08)]"
              >
                <div className="text-xs text-[#d0d4dc] font-semibold mb-0.5">{item.label}</div>
                <div className="text-[10px] text-[#8a92a3]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Section C: DOE vs SDL — The Methodological Bridge ===== */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#4361ee] font-mono tracking-wider">C</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">DOE vs SDL: Methodological Continuity</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-6 max-w-2xl">
          The course does NOT frame SDL as a replacement for traditional methods. Instead, it shows the
          continuous evolution: trial-and-error → DOE → automation → SDL. Understanding where each method
          succeeds — and where it fails — is central to the course.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(67,97,238,0.15)]">
                <th className="text-left py-2 px-3 text-[#8a92a3] font-mono text-[10px]">Dimension</th>
                <th className="text-left py-2 px-3 text-[#8a92a3] font-mono text-[10px]">Trial-and-Error</th>
                <th className="text-left py-2 px-3 text-[#8a92a3] font-mono text-[10px]">DOE</th>
                <th className="text-left py-2 px-3 text-[#00f5d4] font-mono text-[10px]">SDL</th>
              </tr>
            </thead>
            <tbody className="text-[#8a92a3]">
              {[
                ['Strategy', 'Intuition-driven', 'Statistical design', 'Model-driven, adaptive'],
                ['Data efficiency', 'Low', 'Moderate', 'High (targeted sampling)'],
                ['Parameter space', 'Narrow (1-3 factors)', 'Moderate (3-8 factors)', 'High-dimensional capable'],
                ['Uncertainty handling', 'Implicit / ignored', 'ANOVA, residual analysis', 'Explicit (GP posterior)'],
                ['Iteration speed', 'Slow (human in loop)', 'Moderate (batch)', 'Fast (closed-loop)'],
                ['Best for', 'Early exploration', 'Screening & main effects', 'Complex, expensive experiments'],
                ['Key limitation', 'No guarantees', 'Scalability (curse of dimensionality)', 'Requires good priors & measurement'],
              ].map(([dim, trial, doe, sdl]) => (
                <tr key={dim} className="border-b border-[rgba(67,97,238,0.06)]">
                  <td className="py-2.5 px-3 text-[#d0d4dc] font-semibold">{dim}</td>
                  <td className="py-2.5 px-3">{trial}</td>
                  <td className="py-2.5 px-3">{doe}</td>
                  <td className="py-2.5 px-3 text-[#d0d4dc]">{sdl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Section D: SDL Core Concepts ===== */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#f59e0b] font-mono tracking-wider">D</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">SDL Core Concepts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Surrogate Model',
              desc: 'A probabilistic model (typically a Gaussian Process) that approximates the true experimental response surface. It predicts both the expected outcome and the uncertainty at any untested point.',
            },
            {
              title: 'Uncertainty Quantification',
              desc: 'The surrogate provides not just a prediction but a full posterior distribution. Regions with few observations have high uncertainty — this is what drives exploration.',
            },
            {
              title: 'Acquisition Function',
              desc: 'Balances exploration (sampling where uncertainty is high) and exploitation (sampling where the predicted outcome is best). Common choices: EI, UCB, Thompson Sampling.',
            },
            {
              title: 'Closed-Loop Decision',
              desc: 'The loop: propose → execute experiment → observe result → update model → propose next. Each iteration reduces uncertainty and improves the model of the response surface.',
            },
          ].map((concept) => (
            <div
              key={concept.title}
              className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]"
            >
              <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">{concept.title}</h3>
              <p className="text-xs text-[#8a92a3] leading-relaxed">{concept.desc}</p>
            </div>
          ))}
        </div>

        {/* Surrogate / Uncertainty / Acquisition relationship diagram placeholder */}
        <div className="mt-6 glass-panel p-5 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
          <div className="text-xs text-[#8a92a3] font-mono mb-2">
            [RESERVED] Interactive: Surrogate → Uncertainty → Acquisition Relationship
          </div>
          <p className="text-xs text-[#8a92a3]">
            An interactive visualization showing how the Gaussian Process surrogate, its uncertainty bands,
            and the acquisition function together drive the next experiment selection.
          </p>
        </div>
      </div>
    </div>
  );
}
