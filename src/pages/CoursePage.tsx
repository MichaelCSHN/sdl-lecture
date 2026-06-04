export default function CoursePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">COURSE</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Course Map</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        A structured curriculum covering experiment-centered MSE, from traditional DOE to AI-era self-driving labs.
      </p>

      <div className="space-y-4">
        {[
          { num: '01', title: 'Why Re-understand Experiment', route: '/foundations' },
          { num: '02', title: 'MSE Experiment Taxonomy & Catalog', route: '/foundations' },
          { num: '03', title: 'Data, Error & Measurability', route: '/foundations' },
          { num: '04', title: 'Traditional Methods I: Heuristics & Trial-and-Error', route: '/foundations' },
          { num: '05', title: 'Traditional Methods II: DOE', route: '/methods' },
          { num: '06', title: 'Experimental Hardware & Workflows', route: '/foundations' },
          { num: '07', title: 'SDL Methodology', route: '/foundations' },
          { num: '08', title: 'A-Lab: Real System Analysis', route: '/a-lab' },
          { num: '09', title: 'Case Studio', route: '/case-studio' },
          { num: '10', title: 'Research Design Studio', route: '/design-studio' },
        ].map((lecture) => (
          <a
            key={lecture.num}
            href={lecture.route}
            className="flex items-center gap-4 glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)] hover:border-[#00f5d4] transition-colors no-underline"
          >
            <span className="text-[#00f5d4] font-mono text-xs w-8">{lecture.num}</span>
            <span className="text-sm text-[#d0d4dc]">{lecture.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
