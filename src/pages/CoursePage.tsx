import { Link } from 'react-router';
import { LEARNING_OBJECTIVES, getLecturesByModule } from '@/content/courseStructure';

const MODULE_INFO = {
  A: { label: '实验与 MSE', color: '#00f5d4', desc: '实验的本质与材料科学中的实验分类。' },
  B: { label: '传统实验方法论', color: '#4361ee', desc: '从试错法到实验设计——实验方法论的基础。' },
  C: { label: 'AI 时代的实验', color: '#f59e0b', desc: 'SDL、真实系统分析、案例工作台与研究设计。' },
} as const;

export default function CoursePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">课程结构</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">课程地图</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-2 text-sm">
        10 讲内容，分三个模块。本次讲座为其中的精选路径（6 讲标注「讲座」）。
      </p>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-8 text-xs">
        讲座结束后，本线上站将继续扩展为完整的 10 讲研究生课程平台。
      </p>

      {/* Learning objectives */}
      <div className="mb-10">
        <h2 className="text-xs text-[#4361ee] font-mono tracking-widest mb-3">学习目标</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(LEARNING_OBJECTIVES).map((lo) => (
            <div key={lo.id} className="flex items-start gap-2 px-3 py-2 rounded border border-[rgba(67,97,238,0.08)]">
              <span className="text-[10px] font-mono text-[#00f5d4] mt-0.5 flex-shrink-0">{lo.id}</span>
              <span className="text-xs text-[#8a92a3]">{lo.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Three modules */}
      {(['A', 'B', 'C'] as const).map((mod) => {
        const lectures = getLecturesByModule(mod);
        const info = MODULE_INFO[mod];
        return (
          <div key={mod} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: info.color }} />
              <div>
                <h2 className="text-sm font-semibold text-[#d0d4dc]">
                  模块 {mod}：{info.label}
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
                        {lec.titleCn}
                      </span>
                      {lec.lecturePath && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.1)] text-[#00f5d4] font-mono flex-shrink-0">
                          讲座
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
          讲座路径与完整课程
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-[#00f5d4] font-mono mb-1">讲座路径（6 讲）</div>
            <p className="text-xs text-[#8a92a3]">
              第 01, 02, 05, 07, 08, 09 讲。覆盖实验史、分类学、DOE vs SDL、
              SDL 方法论、A-Lab 案例与现场演示。适合 3 小时研究生讲座。
            </p>
          </div>
          <div>
            <div className="text-[10px] text-[#4361ee] font-mono mb-1">完整课程（10 讲）</div>
            <p className="text-xs text-[#8a92a3]">
              增加第 03, 04, 06, 10 讲。深入数据与误差分析、传统试错法、
              实验硬件与工作流、研究设计工作室等专题。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
