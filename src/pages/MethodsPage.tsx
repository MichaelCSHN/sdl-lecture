export default function MethodsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">METHODS LAB</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Methods Lab</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        Compare experimental design methods: DOE strategies, Bayesian optimization acquisition functions, exploration vs exploitation, and noise effects.
      </p>

      <div className="glass-panel p-6 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
        <div className="text-xs text-[#8a92a3] font-mono mb-2">[RESERVED] Methods Comparison Dashboard</div>
        <p className="text-xs text-[#8a92a3]">
          Phase 2 will deliver interactive method comparisons: full factorial vs fractional factorial vs Latin hypercube vs Sobol sequences; EI vs UCB vs Thompson sampling acquisition; convergence under varying noise levels.
        </p>
      </div>
    </div>
  );
}
