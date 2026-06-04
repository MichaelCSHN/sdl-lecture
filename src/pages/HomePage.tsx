import { Link } from 'react-router';
import { BookOpen, Beaker, FlaskConical, ArrowRight } from 'lucide-react';
import { getLecturePathLectures } from '@/content/courseStructure';

const lecturePathLectures = getLecturePathLectures();

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2.5 glass-panel px-3 py-1.5 rounded mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
          <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">
            2026.06 — 材料科学研究生专题讲座
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-[-1.5px] leading-[1.08] mb-5">
          AI 时代的材料科学实验
        </h1>
        <p className="text-lg md:text-xl text-[#8a92a3] max-w-2xl leading-relaxed mb-3">
          从实验设计（DOE）到自驱动实验室（Self-Driving Labs）
        </p>
        <p className="text-sm text-[#8a92a3] max-w-xl leading-relaxed">
          一门以"实验"为中心的讲座课程。覆盖传统实验方法论到 AI 时代闭环自治实验的完整弧线。
          本次讲座为完整课程的精选路径，课后可访问线上站独立浏览全部内容。
        </p>
      </div>

      {/* Target audience */}
      <div className="mb-12">
        <h2 className="text-xs text-[#00f5d4] font-mono tracking-widest mb-3">面向对象</h2>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-mono border border-[rgba(67,97,238,0.2)] text-[#8a92a3]">
            材料/化学/物理方向研究生
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-mono border border-[rgba(67,97,238,0.2)] text-[#8a92a3]">
            有实验室经验的高年级本科生
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-mono border border-[rgba(67,97,238,0.2)] text-[#8a92a3]">
            想理解 SDL 工作流的研究人员
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-mono border border-[rgba(67,97,238,0.2)] text-[#8a92a3]">
            讲座助教与实验室培训人员
          </span>
        </div>
      </div>

      {/* 本次讲座说明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.15)]">
          <div className="text-[#00f5d4] font-mono text-[10px] tracking-widest mb-2">本次讲座</div>
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">3 小时研究生专题讲座</h3>
          <p className="text-xs text-[#8a92a3] leading-relaxed">
            6 讲精选内容：实验史与演变、MSE 实验分类学、DOE 与 SDL 对比、
            SDL 方法论核心、A-Lab 案例档案、现场闭环演示。
          </p>
        </div>
        <div className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.08)]">
          <div className="text-[#5a6377] font-mono text-[10px] tracking-widest mb-2">课后延伸</div>
          <h3 className="text-sm font-semibold text-[#8a92a3] mb-1">完整课程（后续扩展至 10 讲）</h3>
          <p className="text-xs text-[#5a6377] leading-relaxed">
            讲座后将增加数据与误差分析、传统试错法、实验硬件与工作流、研究设计工作室等专题。
          </p>
        </div>
      </div>

      {/* Three entry points */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        <Link
          to="/course"
          className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline group"
        >
          <BookOpen className="w-5 h-5 text-[#00f5d4] mb-3" />
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1 group-hover:text-[#00f5d4] transition-colors">
            浏览课程
          </h3>
          <p className="text-xs text-[#8a92a3] mb-3">
            查看本次讲座的完整结构与推荐路径，了解每讲核心内容。
          </p>
          <span className="text-[10px] text-[#00f5d4] font-mono inline-flex items-center gap-1">
            课程地图 <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          to="/case-studio"
          className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline group"
        >
          <Beaker className="w-5 h-5 text-[#00f5d4] mb-3" />
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1 group-hover:text-[#00f5d4] transition-colors">
            现场演示
          </h3>
          <p className="text-xs text-[#8a92a3] mb-3">
            观看 SDL 闭环优化：参数→观测→推荐→再实验。RGB LED 颜色匹配 live demo。
          </p>
          <span className="text-[10px] text-[#00f5d4] font-mono inline-flex items-center gap-1">
            案例工作台 <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          to="/a-lab"
          className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline group"
        >
          <FlaskConical className="w-5 h-5 text-[#00f5d4] mb-3" />
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1 group-hover:text-[#00f5d4] transition-colors">
            A-Lab 案例档案
          </h3>
          <p className="text-xs text-[#8a92a3] mb-3">
            深度阅读 A-Lab 系统：问题定义、系统组成、关键结果、学术争议与教学启示。
          </p>
          <span className="text-[10px] text-[#00f5d4] font-mono inline-flex items-center gap-1">
            阅读案例 <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Lecture path preview */}
      <div>
        <h2 className="text-xs text-[#00f5d4] font-mono tracking-widest mb-4">
          讲座路径（{lecturePathLectures.length} 讲）
        </h2>
        <div className="space-y-2">
          {lecturePathLectures.map((lec) => (
            <Link
              key={lec.id}
              to={lec.route}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[rgba(67,97,238,0.04)] transition-colors no-underline group"
            >
              <span className="text-[#00f5d4] font-mono text-xs w-6">{lec.num}</span>
              <span className="text-sm text-[#d0d4dc] group-hover:text-[#00f5d4] transition-colors">
                {lec.titleCn}
              </span>
              <span className="text-[10px] text-[#8a92a3] font-mono ml-auto hidden sm:inline">
                模块 {lec.module}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
