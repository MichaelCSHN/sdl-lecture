export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">LECTURE MVP — PHASE 1</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        AI-Era MSE Experiments
      </h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
        From DOE to Self-Driving Labs — a course platform for graduate students in materials science.
      </p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/course" className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline">
          <div className="text-[#00f5d4] font-mono text-xs mb-2">01</div>
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1">Start Course</h3>
          <p className="text-xs text-[#8a92a3]">Browse the full curriculum and learning paths.</p>
        </a>
        <a href="/case-studio" className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline">
          <div className="text-[#00f5d4] font-mono text-xs mb-2">02</div>
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1">Case Studio</h3>
          <p className="text-xs text-[#8a92a3]">Observe SDL closed-loop recommendations in action.</p>
        </a>
        <a href="/a-lab" className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline">
          <div className="text-[#00f5d4] font-mono text-xs mb-2">03</div>
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1">A-Lab Case File</h3>
          <p className="text-xs text-[#8a92a3]">Deep-dive into the A-Lab system: problems, results, and controversies.</p>
        </a>
      </div>
    </div>
  );
}
