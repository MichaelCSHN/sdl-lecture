export default function ALabPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">A-LAB CASE FILE</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        A-Lab: Autonomous Materials Discovery
      </h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        A deep case study of the A-Lab system at Berkeley Lab — not as a timeline exhibit, but as a case file: problem, system, results, controversy, and lessons.
      </p>

      {/* Case file sections */}
      <div className="space-y-6">
        {[
          {
            id: 'problem',
            title: '1. Problem Definition',
            desc: 'What was A-Lab trying to solve? New inorganic material synthesis with autonomous closed-loop experimentation. Target: discover and synthesize novel ternary oxides.',
          },
          {
            id: 'system',
            title: '2. System Architecture',
            desc: 'Robotic powder dispensing, mixing, heating in a furnace, XRD characterization, and AI-driven experiment selection. The integration of hardware, software, and decision-making.',
          },
          {
            id: 'loop',
            title: '3. The Closed Loop',
            desc: 'How parameters (precursor ratios, temperature, time), observations (XRD phases), and recommendations (next experiment) form the SDL loop. From DOE-style initial screening to Bayesian optimization.',
          },
          {
            id: 'results',
            title: '4. Key Results',
            desc: '41 novel compounds synthesized over 17 days. 71% success rate in targeting specific phases. Comparison to human-driven discovery rates.',
          },
          {
            id: 'controversy',
            title: '5. Controversy & Re-analysis',
            desc: '2024 independent re-analysis raised questions about success rate definitions. Rietveld refinement re-evaluation found 65-85% success rates depending on strictness. This is science working as intended — self-correction in action.',
          },
          {
            id: 'lessons',
            title: '6. Lessons for Students',
            desc: 'What A-Lab teaches us about SDL design: the importance of clear success criteria, the role of human validation, and why SDL is a systems engineering problem, not just an algorithm problem.',
          },
        ].map((section) => (
          <div key={section.id} id={section.id} className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">{section.title}</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">{section.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
