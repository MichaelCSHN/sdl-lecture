export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">RESOURCES</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Resources</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        Reading paths, tools, benchmark catalog, glossary, and MSE experiment taxonomy reference.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: 'Reading Path', desc: 'Curated papers and textbooks organized by topic.' },
          { title: 'Tool Inventory', desc: 'Software libraries, platforms, and hardware references.' },
          { title: 'Benchmark Catalog', desc: 'Standard SDL benchmark problems and their characteristics.' },
          { title: 'Glossary', desc: 'Key terms in SDL, DOE, and MSE experimentation.' },
          { title: 'MSE Experiment Taxonomy', desc: 'Full catalog of MSE experiment types with definitions.' },
          { title: 'External References', desc: 'Links to labs, platforms, and related courses.' },
        ].map((item) => (
          <div key={item.title} className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1">{item.title}</h3>
            <p className="text-xs text-[#8a92a3]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
