export default function FoundationsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">FOUNDATIONS</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        Foundations: Experiment-Centered MSE
      </h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        Before self-driving labs, we must answer two fundamental questions: What is an experiment? What types of experiments exist in MSE?
      </p>

      {/* Placeholder sections for lecture content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {[
          { title: 'History & Role of Experiments', desc: 'The evolution of experimentation in science and MSE.' },
          { title: 'MSE Experiment Taxonomy', desc: 'A catalog of experiment types: synthesis, characterization, measurement, and more.' },
          { title: 'Data, Error & Uncertainty', desc: 'Controlled vs measured variables, noise, repeatability.' },
          { title: 'Heuristics & Trial-and-Error', desc: 'Why traditional methods remain important.' },
          { title: 'DOE: Design of Experiments', desc: 'Factorial designs, response surfaces, and their limits.' },
          { title: 'DOE vs SDL Comparison', desc: 'Methodological contrasts and continuity.' },
          { title: 'SDL Core Concepts', desc: 'Surrogate models, uncertainty, acquisition, closed-loop decisions.' },
          { title: 'Multi-Objective SDL', desc: 'Balancing competing goals in autonomous experiments.' },
        ].map((item) => (
          <div key={item.title} className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1">{item.title}</h3>
            <p className="text-xs text-[#8a92a3]">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Reserved: MSE Experiment Taxonomy Diagram placeholder */}
      <div className="glass-panel p-6 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)] mb-8">
        <div className="text-xs text-[#8a92a3] font-mono mb-2">[RESERVED] MSE Experiment Taxonomy Diagram</div>
        <p className="text-xs text-[#8a92a3]">
          This area will contain an interactive taxonomy diagram of MSE experiment types: sample prep, processing, characterization, property measurement, functional testing, stability/failure, metrology/calibration, and high-throughput/closed-loop experiments.
        </p>
      </div>

      {/* Reserved: DOE vs SDL comparison block */}
      <div className="glass-panel p-6 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
        <div className="text-xs text-[#8a92a3] font-mono mb-2">[RESERVED] DOE vs SDL Interactive Comparison</div>
        <p className="text-xs text-[#8a92a3]">
          Side-by-side comparison of experimental approaches: trial-and-error, DOE (full factorial, fractional factorial, response surface), and SDL (Bayesian optimization, active learning).
        </p>
      </div>
    </div>
  );
}
