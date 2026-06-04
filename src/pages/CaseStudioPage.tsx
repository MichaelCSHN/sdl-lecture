export default function CaseStudioPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">CASE STUDIO</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Case Studio</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        Observe how SDL chooses the next experiment. Each case demonstrates the full loop: parameters → observations → recommendations.
      </p>

      {/* Case selector placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { id: 'rgb', title: 'RGB LED Benchmark', desc: 'Color-matching optimization', ready: true },
          { id: 'snar', title: 'SnAr Reaction', desc: 'Nucleophilic aromatic substitution optimization', ready: false },
          { id: 'material', title: 'Materials Case', desc: 'Composition-property optimization', ready: false },
        ].map((c) => (
          <div key={c.id} className={`glass-panel p-4 rounded-lg border ${c.ready ? 'border-[rgba(0,245,212,0.3)]' : 'border-[rgba(67,97,238,0.1)]'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[#00f5d4]">{c.id}</span>
              {c.ready && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.12)] text-[#00f5d4] font-mono">READY</span>}
            </div>
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1">{c.title}</h3>
            <p className="text-xs text-[#8a92a3]">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Reserved: Case workbench area */}
      <div className="glass-panel p-6 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
        <div className="text-xs text-[#8a92a3] font-mono mb-3">[RESERVED] Case Workbench</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-1">Parameters & Constraints</div>
            <div className="h-20 flex items-center justify-center text-[10px] text-[#8a92a3]">—</div>
          </div>
          <div className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-1">Observations & Target</div>
            <div className="h-20 flex items-center justify-center text-[10px] text-[#8a92a3]">—</div>
          </div>
          <div className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-1">Recommendation & Reason</div>
            <div className="h-20 flex items-center justify-center text-[10px] text-[#8a92a3]">—</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-1">History Table & Best-so-far</div>
            <div className="h-16 flex items-center justify-center text-[10px] text-[#8a92a3]">—</div>
          </div>
          <div className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-1">Reset / Replay Controls</div>
            <div className="h-16 flex items-center justify-center text-[10px] text-[#8a92a3]">—</div>
          </div>
        </div>
      </div>
    </div>
  );
}
