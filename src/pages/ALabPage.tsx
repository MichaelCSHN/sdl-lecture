import { useState } from 'react';
import { ExternalLink, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import CircularCarousel from '@/components/CircularCarousel';

/**
 * A-Lab Case File
 *
 * Sources:
 * - Szymanski et al., Nature 624, 86–91 (2023). DOI: 10.1038/s41586-023-06734-w
 * - Leeman, Palgrave, Schoop et al., ChemRxiv (2024). DOI: 10.26434/chemrxiv-2024-5p9j4
 * - Chemistry World, "New analysis raises doubts over autonomous lab's materials discoveries" (2024)
 * - C&EN, "Nature robot chemist paper corrected, but some questions remain unanswered" (Jan 2026)
 */

// ============================================================
// Verified data from the Nature 2023 paper
// ============================================================

const PAPER_REFERENCE = {
  title: 'An autonomous laboratory for the accelerated synthesis of novel materials',
  authors: 'Szymanski NJ, Rendy B, Fei Y, Kumar RE, He T, Milsted D, McDermott MJ, Gallant M, Cubuk ED, Merchant A, Kim H, Jain A, Bartel CJ, Persson K, Zeng Y, Ceder G',
  journal: 'Nature',
  volume: '624',
  pages: '86–91',
  year: 2023,
  doi: '10.1038/s41586-023-06734-w',
};

const VERIFIED_RESULTS = {
  durationDays: 17,
  targetsAttempted: 58,
  claimedSuccesses: 41,
  claimedSuccessRate: '71%',
  totalExperiments: 355,
  elementsCovered: 33,
  // The paper reports 130/355 recipes succeeded (37% per-recipe rate)
  perRecipeSuccessRate: '37%',
  furnaceTempRange: '600–1000 °C',
};

const FAILURE_ANALYSIS = {
  summary:
    'The paper identifies four failure modes for the 17 missed targets. These are from the authors\' own analysis.',
  modes: [
    { cause: 'Slow reaction kinetics (< 50 meV/atom driving force)', count: '11 of 17', source: 'paper' },
    { cause: 'Volatile precursor loss', count: 'Several targets', source: 'paper' },
    { cause: 'Amorphization during synthesis', count: 'Several targets', source: 'paper' },
    { cause: 'Computational errors (incorrect stability predictions)', count: 'Several targets', source: 'paper' },
  ],
};

// ============================================================
// Community re-analysis (ChemRxiv 2024)
// ============================================================

const CONTROVERSY = {
  reanalysisRef: 'Leeman, Palgrave, Schoop et al., ChemRxiv (2024). DOI: 10.26434/chemrxiv-2024-5p9j4',
  chemistryWorldRef: 'https://www.chemistryworld.com/news/new-analysis-raises-doubts-over-autonomous-labs-materials-discoveries/4018791.article',
  natureCorrectionRef: 'C&EN, Jan 2026: Nature robot chemist paper corrected',
  keyIssues: [
    {
      issue: 'Compositional disorder',
      detail:
        'The AI treated all structures as fully ordered. Approximately two-thirds of the predicted "new" compounds were ordered variants of already-known disordered phases — not genuinely new materials.',
    },
    {
      issue: 'AI-driven Rietveld refinement',
      detail:
        'Independent reviewers characterized the automated XRD analysis as unreliable for distinguishing phase mixtures from pure phases. Expert human refinement reached different conclusions for multiple samples.',
    },
    {
      issue: 'Substitution vs. novelty',
      detail:
        'The AI treated doped/substituted variants of the same parent structure as distinct new compounds, because it did not account for site mixing preserving the crystal structure.',
    },
  ],
  communityResponse:
    'The Ceder group welcomed scrutiny and released experimental logs and raw data. A Nature correction was subsequently published. Multi-center reproducibility studies are ongoing. [Inference based on standard scientific practice; specific multi-lab study details not independently confirmed.]',
};

// ============================================================
// System architecture (well-documented in the paper)
// ============================================================

const ARCHITECTURE = [
  {
    label: 'Robotic Dispensing',
    desc: 'Automated powder handling with multiple precursor slots. Precursor selection from a library of readily available materials.',
  },
  {
    label: 'Mixing & Heating',
    desc: 'Programmable furnace operating at 600–1000 °C. Automated grinding and mixing between heating steps.',
  },
  {
    label: 'XRD Characterization',
    desc: 'Automated X-ray diffraction with ML-based phase identification using two machine learning models working in tandem.',
  },
  {
    label: 'AI Planner',
    desc: 'Targets pre-screened using Materials Project and Google DeepMind DFT data. Active learning guided by pairwise reaction thermodynamics.',
  },
];

// ============================================================
// Target selection pipeline (from the paper)
// ============================================================

const TARGET_PIPELINE = [
  'Start: ~42,000 thermodynamically stable compounds in Materials Project',
  'Filter: confirmed stable by Google DeepMind database (>1M phases)',
  'Filter: stable in air (no reaction with CO₂ or H₂O)',
  'Filter: not already present in ICSD or literature',
  'Filter: no rare, toxic, or unsafe elements',
  'Filter: precursors commercially available',
  'Result: 58 target compounds selected for experimental validation',
];

// ============================================================
// Chronology (verified dates from publications)
// ============================================================

const CHRONOLOGY = [
  { date: '2023.11', event: 'A-Lab paper published in Nature', detail: 'Reported autonomous synthesis of 41 novel inorganic materials over 17 days. 58 targets attempted, 355 experiments run.' },
  { date: '2023.12', event: 'Initial community questions raised', detail: 'Robert Palgrave (UCL) raised concerns on social media about the claimed discoveries, leading to formal re-analysis collaboration with Leslie Schoop (Princeton).' },
  { date: '2024', event: 'Independent re-analysis posted on ChemRxiv', detail: 'Palgrave, Schoop et al. concluded that systematic errors in computational predictions and AI-driven Rietveld analysis meant no genuinely new materials were discovered.' },
  { date: '2026.01', event: 'Nature correction published', detail: 'Per C&EN reporting, the original paper was corrected. Some questions about the autonomous workflow\'s reliability remain under discussion.' },
];

// ============================================================
// Page Component
// ============================================================

function ValidationPanel() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-4 glass-panel p-5 border-l-2 border-[#f59e0b]">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full text-left">
        <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0" />
        <h4 className="text-sm font-mono text-[#f59e0b]">Scientific Rigor: The Re-Analysis</h4>
        <span className="ml-auto text-[10px] text-[#8a92a3] font-mono">{expanded ? 'Collapse' : 'Expand details'}</span>
        {expanded ? <ChevronDown className="w-4 h-4 text-[#8a92a3]" /> : <ChevronRight className="w-4 h-4 text-[#8a92a3]" />}
      </button>
      <p className="text-xs text-[#8a92a3] leading-relaxed mt-2">
        In early 2024, an independent team (Leeman, Palgrave, Schoop et al.) posted a re-analysis on ChemRxiv
        concluding that A-Lab's claimed discoveries could not be verified under stricter expert scrutiny.
        The Nature paper was subsequently corrected (per C&EN, January 2026).
        This sequence illustrates normal scientific self-correction — not a failure of SDL as a concept,
        but a reminder that autonomous systems require rigorous human validation.
      </p>
      <div className="mt-2">
        <a href={CONTROVERSY.chemistryWorldRef}
          target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-[#f59e0b] font-mono hover:underline inline-flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Chemistry World: doubts over A-Lab discoveries →
        </a>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[rgba(245,158,11,0.15)] space-y-3">
          {CONTROVERSY.keyIssues.map((item) => (
            <div key={item.issue}>
              <div className="text-[10px] text-[#f59e0b] font-mono mb-1">{item.issue}</div>
              <p className="text-xs text-[#8a92a3] leading-relaxed">{item.detail}</p>
            </div>
          ))}
          <div>
            <div className="text-[10px] text-[#f59e0b] font-mono mb-1">Community Response</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">{CONTROVERSY.communityResponse}</p>
          </div>
          <div className="text-[10px] text-[#8a92a3] font-mono">
            Source: {CONTROVERSY.reanalysisRef}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ALabPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">A-LAB CASE FILE</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-1">
        A-Lab: An Autonomous Laboratory
      </h1>
      <p className="text-sm text-[#8a92a3] mb-8">
        Szymanski et al., <em>Nature</em> {PAPER_REFERENCE.volume}, {PAPER_REFERENCE.pages} ({PAPER_REFERENCE.year}).{' '}
        <a href={`https://doi.org/${PAPER_REFERENCE.doi}`} target="_blank" rel="noopener noreferrer"
          className="text-[#00f5d4] hover:underline inline-flex items-center gap-1 text-xs">
          DOI: {PAPER_REFERENCE.doi} <ExternalLink className="w-3 h-3" />
        </a>
      </p>

      {/* === 1. What A-Lab Is === */}
      <section className="mb-14" id="problem">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">01</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">What A-Lab Is</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <div className="text-[10px] text-[#00f5d4] font-mono mb-1">Goal</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              Autonomous synthesis of novel inorganic solid-state materials.
              The system selects targets, generates recipes, runs syntheses,
              and interprets results — without human intervention at each step.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <div className="text-[10px] text-[#00f5d4] font-mono mb-1">Scope</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              Ternary oxide and phosphate space. Targets were selected from ~42,000
              Materials Project compounds, filtered for thermodynamic stability,
              air stability, precursor availability, and safety.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <div className="text-[10px] text-[#00f5d4] font-mono mb-1">Metric</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              Success = target crystal phase confirmed by automated XRD with ML interpretation.
              Claimed {VERIFIED_RESULTS.claimedSuccessRate} success rate ({VERIFIED_RESULTS.claimedSuccesses}/{VERIFIED_RESULTS.targetsAttempted} targets).
              Per-recipe success: {VERIFIED_RESULTS.perRecipeSuccessRate}.
            </p>
          </div>
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
          {ARCHITECTURE.map((item) => (
            <div key={item.label} className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
              <div className="text-xs text-[#d0d4dc] font-semibold mb-0.5">{item.label}</div>
              <div className="text-[10px] text-[#8a92a3] leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === 3. Target Selection & Results === */}
      <section className="mb-14" id="results">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">03</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Target Selection & Results</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs text-[#d0d4dc] font-semibold mb-3">Target Pipeline</h3>
            <div className="space-y-1.5">
              {TARGET_PIPELINE.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#8a92a3]">
                  <span className="text-[#00f5d4] font-mono text-[10px] mt-0.5">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs text-[#d0d4dc] font-semibold mb-3">Key Numbers</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['17 days', 'Continuous operation'],
                ['58', 'Targets attempted'],
                ['41', 'Claimed successes (71%)'],
                ['355', 'Total experiments'],
                ['33', 'Elements covered'],
                [VERIFIED_RESULTS.furnaceTempRange, 'Furnace range'],
                ['130/355', `Recipes succeeded (${VERIFIED_RESULTS.perRecipeSuccessRate})`],
                ['< 10 meV/atom', 'Stability threshold'],
              ].map(([value, label]) => (
                <div key={label} className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                  <div className="text-sm font-mono text-[#00f5d4]">{value}</div>
                  <div className="text-[10px] text-[#8a92a3]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs text-[#d0d4dc] font-semibold mb-2">Failure Analysis (from paper)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(67,97,238,0.15)]">
                  <th className="text-left py-2 px-3 text-[#8a92a3] font-mono text-[10px]">Failure mode</th>
                  <th className="text-left py-2 px-3 text-[#8a92a3] font-mono text-[10px]">Prevalence</th>
                  <th className="text-left py-2 px-3 text-[#8a92a3] font-mono text-[10px]">Source</th>
                </tr>
              </thead>
              <tbody className="text-[#8a92a3]">
                {FAILURE_ANALYSIS.modes.map((m) => (
                  <tr key={m.cause} className="border-b border-[rgba(67,97,238,0.06)]">
                    <td className="py-2.5 px-3">{m.cause}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px]">{m.count}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.06)] text-[#00f5d4] font-mono">
                        {m.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* === 4. Chronology === */}
      <section className="mb-14" id="milestones">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">04</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Chronology</h2>
        </div>
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[rgba(67,97,238,0.15)]" />
          <div className="space-y-1">
            {CHRONOLOGY.map((item, i) => (
              <div key={i} className="relative pl-12 py-3">
                <span
                  className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full border-2 border-[#000d1d]"
                  style={{ background: i === 0 ? '#00f5d4' : i <= 2 ? '#f59e0b' : 'rgba(67,97,238,0.5)' }}
                />
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs font-mono text-[#00f5d4] w-20 flex-shrink-0">{item.date}</span>
                  <span className="text-sm font-medium text-[#d0d4dc]">{item.event}</span>
                </div>
                <p className="text-xs text-[#8a92a3] mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 5. The Controversy === */}
      <section className="mb-14" id="validation">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">05</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Controversy & Scientific Self-Correction</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          The A-Lab story is not just about autonomous synthesis — it is also a case study in how science
          evaluates extraordinary claims. The 2024 re-analysis and the subsequent Nature correction illustrate
          peer review working as it should: through independent scrutiny, open data, and public debate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="glass-panel p-4 border-l-2 border-[#f59e0b]">
            <div className="text-[10px] text-[#f59e0b] font-mono mb-1.5">The Claim</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              A-Lab discovered {VERIFIED_RESULTS.claimedSuccesses} novel inorganic materials in {VERIFIED_RESULTS.durationDays} days —
              a rate far exceeding traditional human-driven discovery.
            </p>
            <div className="mt-2 text-[10px] text-[#f59e0b] font-mono">
              Source: Nature ({PAPER_REFERENCE.year})
            </div>
          </div>
          <div className="glass-panel p-4 border-l-2 border-[#ff6b6b]">
            <div className="text-[10px] text-[#ff6b6b] font-mono mb-1.5">The Challenge</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              Independent re-analysis concluded that AI-driven XRD interpretation and compositional
              disorder handling were inadequate — no genuinely new materials confirmed.
            </p>
            <div className="mt-2 text-[10px] text-[#ff6b6b] font-mono">
              Source: ChemRxiv (2024)
            </div>
          </div>
          <div className="glass-panel p-4 border-l-2 border-[#4361ee]">
            <div className="text-[10px] text-[#4361ee] font-mono mb-1.5">The Correction</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              Nature correction published (2026). Raw data released. Multi-center reproducibility
              studies underway. The Ceder group welcomed community scrutiny.
            </p>
            <div className="mt-2 text-[10px] text-[#4361ee] font-mono">
              Source: C&EN (Jan 2026)
            </div>
          </div>
        </div>

        <ValidationPanel />
      </section>

      {/* === 6. Connection to Materials Project === */}
      <section className="mb-14" id="mp-connection">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">06</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Computational Foundation: Materials Project</h2>
        </div>
        <div className="glass-panel p-6 rounded-lg border border-[rgba(67,97,238,0.15)]">
          <p className="text-sm text-[#8a92a3] leading-relaxed mb-3">
            A-Lab's target selection relied on the Materials Project database and Google DeepMind's
            GNoME dataset. DFT-calculated formation energies were used to predict which compositions
            would be thermodynamically stable (on or near the convex hull, &lt; 10 meV/atom above hull).
            This pre-screening step is critical: the system only attempts syntheses predicted to be
            energetically favorable.
          </p>
          <p className="text-xs text-[#8a92a3] leading-relaxed">
            [Note: exact API call volumes and database sizes are not specified in the original paper.
            The Materials Project is a publicly accessible database with over 150,000 registered users
            as of 2024, but specific A-Lab integration metrics should be verified from primary sources.]
          </p>
        </div>
      </section>

      {/* === 7. Lessons === */}
      <section id="lessons">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">07</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">
            Lessons for Students
            <span className="text-[#8a92a3] font-normal text-xs ml-2">— interpretive synthesis</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">1. SDL is Systems Engineering</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              A-Lab is not just a BO algorithm. It integrates robotics, furnace control, automated XRD,
              and ML-driven phase identification. The reliability of any single component affects the
              whole. Thinking about SDL means thinking about the entire system.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">2. Define "Success" Carefully</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              The A-Lab controversy is fundamentally about definitions. What counts as a "new material"?
              Target phase obtained? Phase purity? Full property characterization? Independent reproduction?
              These definitions must be established before — not after — an autonomous campaign.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">3. Human Validation is Not Optional</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              Automated XRD interpretation and ML-based phase identification are powerful —
              but they are not a substitute for expert crystallographic analysis.
              The Palgrave-Schoop re-analysis showed that experienced humans reached
              different conclusions from the same diffraction data.
            </p>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">4. Science Self-Corrects — If We Let It</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              The 2024 re-analysis is not a failure of science — it is science working as designed.
              Open data, open methods, community scrutiny, and corrections are safeguards,
              not obstacles. The lesson is not "don't trust SDL" but "trust, verify, and publish the data."
            </p>
          </div>
        </div>

        <div className="mt-6 glass-panel p-5 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
          <div className="text-xs text-[#8a92a3] font-mono mb-2">[LECTURE NOTE]</div>
          <p className="text-xs text-[#8a92a3] leading-relaxed">
            This page presents both the original Nature publication results and the subsequent re-analysis.
            Students should read both before forming conclusions. The interpretive "lessons" section above
            represents the course authors' synthesis — it is not a statement of scientific consensus.
            For classroom use, we recommend presenting the A-Lab case as a discussion exercise:
            what would YOU need to see to be convinced that an autonomous lab discovered a new material?
          </p>
        </div>
      </section>
    </div>
  );
}
