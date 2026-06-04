import { Link } from 'react-router';
import { LEARNING_OBJECTIVES, getLecturesByModule } from '@/content/courseStructure';

const MODULE_INFO = {
  A: { label: 'Experiment & MSE', color: '#00f5d4', desc: 'The nature of experiment in materials science.' },
  B: { label: 'Traditional Methodology', color: '#4361ee', desc: 'From heuristics to DOE — the foundations.' },
  C: { label: 'AI-Era Experiments', color: '#f59e0b', desc: 'SDL, real systems, cases, and research design.' },
} as const;

export default function CoursePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">COURSE</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">Course Map</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8">
        A structured 10-lecture curriculum organized into three modules.
        Follow the sequence for the full course, or use the <Link to="/" className="text-[#00f5d4] hover:underline">Lecture MVP path</Link> for the 3-hour compressed version.
      </p>

      {/* Learning objectives summary */}
      <div className="mb-10">
        <h2 className="text-xs text-[#4361ee] font-mono tracking-widest mb-3">LEARNING OBJECTIVES</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(LEARNING_OBJECTIVES).map((lo) => (
            <div key={lo.id} className="flex items-start gap-2 px-3 py-2 rounded border border-[rgba(67,97,238,0.08)]">
              <span className="text-[10px] font-mono text-[#00f5d4] mt-0.5 flex-shrink-0">{lo.id}</span>
              <span className="text-xs text-[#8a92a3]">{lo.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Module A */}
      {(['A', 'B', 'C'] as const).map((mod) => {
        const lectures = getLecturesByModule(mod);
        const info = MODULE_INFO[mod];
        return (
          <div key={mod} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: info.color }}
              />
              <div>
                <h2 className="text-sm font-semibold text-[#d0d4dc]">
                  Module {mod}: {info.label}
                </h2>
                <p className="text-xs text-[#8a92a3]">{info.desc}</p>
              </div>
            </div>

            <div className="space-y-2">
              {lectures.map((lec) => (
                <Link
                  key={lec.id}
                  to={lec.route}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[rgba(67,97,238,0.1)] hover:border-[rgba(0,245,212,0.3)] transition-colors no-underline group"
                >
                  <span className="text-[#00f5d4] font-mono text-xs w-8 flex-shrink-0">{lec.num}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#d0d4dc] group-hover:text-[#00f5d4] transition-colors">
                        {lec.title}
                      </span>
                      {lec.lecturePath && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.1)] text-[#00f5d4] font-mono flex-shrink-0">
                          LECTURE MVP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8a92a3] mt-0.5">{lec.description}</p>
                  </div>
                  <span className="text-[10px] text-[#8a92a3] font-mono hidden md:inline flex-shrink-0">
                    {lec.learningObjectives.join(', ')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {/* Lecture vs Full Course distinction */}
      <div className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.15)] mt-8">
        <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">
          Lecture MVP vs Full Course
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-[#00f5d4] font-mono mb-1">LECTURE MVP (6 lectures)</div>
            <p className="text-xs text-[#8a92a3]">
              Lectures 01, 02, 05, 07, 08, 09. The essential narrative arc for a 3-hour graduate lecture.
              Covers experiment history, taxonomy, DOE vs SDL, methodology, A-Lab, and live demo.
            </p>
          </div>
          <div>
            <div className="text-[10px] text-[#4361ee] font-mono mb-1">FULL COURSE (10 lectures)</div>
            <p className="text-xs text-[#8a92a3]">
              Adds lectures 03, 04, 06, 10. Deep coverage of data/error analysis, traditional heuristics,
              experimental hardware/workflows, and the Research Design Studio capstone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
