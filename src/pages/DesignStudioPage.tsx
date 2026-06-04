export default function DesignStudioPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">DESIGN STUDIO</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Research Design Studio</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        Translate your research question into a minimum-viable SDL design: objective, parameters, constraints, measurements, and strategy.
      </p>

      <div className="glass-panel p-6 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
        <div className="text-xs text-[#8a92a3] font-mono mb-2">[RESERVED] Design Studio Wizard</div>
        <div className="space-y-3">
          {['Objective', 'Parameters', 'Constraints', 'Measurements', 'Suggested Strategy', 'Risks', 'Human Judgment Needed', 'Validation Plan'].map((field) => (
            <div key={field} className="flex items-center gap-3 p-2 rounded border border-[rgba(67,97,238,0.06)]">
              <span className="text-[10px] text-[#8a92a3] font-mono w-40">{field}</span>
              <span className="text-[10px] text-[#8a92a3]">—</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
