import { Link } from 'react-router';
import { ArrowRight, BookOpen, DraftingCompass, Network, Route } from 'lucide-react';
import { LEARNING_OBJECTIVES, getLecturesByModule } from '@/content/courseStructure';

const MODULE_INFO = {
  A: {
    label: '实验与 MSE',
    color: '#00f5d4',
    desc: '先把实验放回科学史与材料科学的中心位置，再谈 DOE 和 SDL。',
  },
  B: {
    label: '传统方法论',
    color: '#4361ee',
    desc: '从试错法到 DOE，再把实验问题翻译成变量、对照、约束与设计结构。',
  },
  C: {
    label: 'AI 时代的实验',
    color: '#f59e0b',
    desc: '把 SDL 放回真实系统、真实工作流与真实研究设计，而不是悬空讲算法。',
  },
} as const;

const RECOMMENDED_PATHS = [
  {
    title: '3 小时讲座路径',
    eyebrow: 'Lecture Path',
    body: '适合第一次进入这套内容。按“实验史 → 分类学 → DOE vs SDL → SDL 方法 → A-Lab → Case Studio”走完主叙事。',
    links: [
      { to: '/foundations', label: '从 Foundations 开始' },
      { to: '/a-lab', label: '进入 A-Lab 案例' },
    ],
    accent: '#00f5d4',
    icon: BookOpen,
  },
  {
    title: '8 步工作流路径',
    eyebrow: 'Workflow Path',
    body: '适合已经在做实验或课题的人。先用工作流把方法论落到“问题、设计、执行、数据、统计、报告”。',
    links: [
      { to: '/methods', label: '打开 8 步工作流' },
      { to: '/resources', label: '补方法阅读轨' },
    ],
    accent: '#7c7cff',
    icon: Network,
  },
  {
    title: '研究设计工作室路径',
    eyebrow: 'Studio Path',
    body: '适合准备把自己的课题重写成实验设计草案的人。目标不是看懂概念，而是暴露你的设计漏洞。',
    links: [
      { to: '/design-studio', label: '进入 Design Studio' },
      { to: '/foundations#doe-vs-sdl', label: '回看 DOE 与 SDL 边界' },
    ],
    accent: '#f97316',
    icon: DraftingCompass,
  },
];

export default function CoursePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-10">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">COURSE STRUCTURE</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[#f3f6fb]">课程地图</h1>
        <p className="text-[#d0d4dc] max-w-3xl leading-7 mb-3 text-sm">
          这不是一张“10 讲目录表”而已，而是三条可切换的进入路径：
          一条讲座叙事路径，一条实验工作流路径，一条把个人课题改写成研究设计的工作室路径。
        </p>
        <p className="text-[#8a92a3] max-w-3xl leading-7 text-sm">
          因此你不需要从第一页顺序点到最后一页。先确定你要解决的问题，再选择最合适的路线进入。
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-3 mb-12">
        {RECOMMENDED_PATHS.map((path) => {
          const Icon = path.icon;
          return (
            <div
              key={path.title}
              className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.14)] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-[0.18em]" style={{ color: path.accent }}>
                  {path.eyebrow}
                </span>
                <Icon className="w-4 h-4" style={{ color: path.accent }} />
              </div>
              <h2 className="text-lg font-semibold text-[#f3f6fb] mb-2">{path.title}</h2>
              <p className="text-sm text-[#8a92a3] leading-6 mb-4">{path.body}</p>
              <div className="flex flex-wrap gap-2">
                {path.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-[11px] font-mono text-[#d0d4dc] no-underline hover:border-[rgba(0,245,212,0.22)] hover:text-[#00f5d4] transition-colors"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="glass-panel rounded-2xl border border-[rgba(124,124,255,0.18)] p-6 mb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[10px] text-[#7c7cff] font-mono tracking-[0.18em] mb-2">NEW CORE PATH</div>
            <h2 className="text-2xl font-semibold text-[#f3f6fb] mb-3">新增核心路径：8 步实验工作流</h2>
            <p className="text-sm text-[#8a92a3] leading-7 mb-4">
              过去这门站点更像“讲座的扩展阅读”。现在它多了一条真正可操作的主线：
              你可以不先背术语，而是先沿着 8 步工作流检查自己的研究到底卡在问题定义、实验设计、
              执行纪律、数据留痕，还是统计与报告环节。
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[rgba(67,97,238,0.12)] px-4 py-4">
                <div className="text-xs font-semibold text-[#d0d4dc] mb-1">Methods</div>
                <div className="text-xs text-[#8a92a3] leading-6">
                  看完整 8 步结构，知道每一步要做什么、最容易错在哪里。
                </div>
              </div>
              <div className="rounded-xl border border-[rgba(67,97,238,0.12)] px-4 py-4">
                <div className="text-xs font-semibold text-[#d0d4dc] mb-1">Design Studio</div>
                <div className="text-xs text-[#8a92a3] leading-6">
                  把工作流翻译成你的课题设计，不再停留在“想做智能实验”。
                </div>
              </div>
              <div className="rounded-xl border border-[rgba(67,97,238,0.12)] px-4 py-4">
                <div className="text-xs font-semibold text-[#d0d4dc] mb-1">Resources</div>
                <div className="text-xs text-[#8a92a3] leading-6">
                  按你卡住的步骤补方法论背景，而不是整页资源无差别扫过去。
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-[220px] space-y-3">
            <Link
              to="/methods"
              className="flex items-center justify-between rounded-xl border border-[rgba(124,124,255,0.24)] bg-[rgba(124,124,255,0.08)] px-4 py-3 text-sm font-mono text-[#c8c8ff] no-underline hover:bg-[rgba(124,124,255,0.12)] transition-colors"
            >
              打开工作流
              <Network className="w-4 h-4" />
            </Link>
            <Link
              to="/design-studio"
              className="flex items-center justify-between rounded-xl border border-[rgba(249,115,22,0.24)] bg-[rgba(249,115,22,0.08)] px-4 py-3 text-sm font-mono text-[#fdba74] no-underline hover:bg-[rgba(249,115,22,0.12)] transition-colors"
            >
              进入工作室
              <DraftingCompass className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xs text-[#4361ee] font-mono tracking-widest mb-3">LEARNING OBJECTIVES</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(LEARNING_OBJECTIVES).map((objective) => (
            <div
              key={objective.id}
              className="flex items-start gap-2 rounded-xl border border-[rgba(67,97,238,0.08)] px-3 py-3"
            >
              <span className="text-[10px] font-mono text-[#00f5d4] mt-0.5 flex-shrink-0">{objective.id}</span>
              <span className="text-xs text-[#8a92a3] leading-6">{objective.text}</span>
            </div>
          ))}
        </div>
      </section>

      {(['A', 'B', 'C'] as const).map((module) => {
        const lectures = getLecturesByModule(module);
        const info = MODULE_INFO[module];
        return (
          <section key={module} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: info.color }} />
              <div>
                <h2 className="text-sm font-semibold text-[#f3f6fb]">
                  模块 {module}：{info.label}
                </h2>
                <p className="text-xs text-[#8a92a3]">{info.desc}</p>
              </div>
            </div>

            <div className="space-y-2">
              {lectures.map((lecture) => (
                <Link
                  key={lecture.id}
                  to={lecture.route}
                  className="flex items-center gap-3 rounded-2xl border border-[rgba(67,97,238,0.1)] px-4 py-3 no-underline transition-colors hover:border-[rgba(0,245,212,0.3)] group"
                >
                  <span className="text-[#00f5d4] font-mono text-xs w-8 flex-shrink-0">{lecture.num}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-[#d0d4dc] group-hover:text-[#00f5d4] transition-colors">
                        {lecture.titleCn}
                      </span>
                      {lecture.lecturePath && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.1)] text-[#00f5d4] font-mono flex-shrink-0">
                          讲座路径
                        </span>
                      )}
                      {(lecture.id === 'lecture-05' || lecture.id === 'lecture-10') && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(124,124,255,0.12)] text-[#c8c8ff] font-mono flex-shrink-0">
                          工作流相关
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8a92a3] mt-0.5 leading-6">{lecture.description}</p>
                  </div>
                  <span className="hidden md:inline text-[10px] text-[#8a92a3] font-mono flex-shrink-0">
                    {lecture.learningObjectives.join(', ')}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="grid gap-4 lg:grid-cols-2 mt-8">
        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.15)] p-5">
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">LECTURE DELIVERY</div>
          <h3 className="text-lg font-semibold text-[#f3f6fb] mb-2">如果你现在只准备听这场讲座</h3>
          <p className="text-sm text-[#8a92a3] leading-7">
            重点走 6 讲精选路径。它足够建立“实验为什么重要、DOE 和 SDL 如何相连、真实系统该如何判断”的核心框架。
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.15)] p-5">
          <div className="text-[10px] text-[#7c7cff] font-mono tracking-[0.18em] mb-2">RESEARCH TRANSFER</div>
          <h3 className="text-lg font-semibold text-[#f3f6fb] mb-2">如果你要把内容迁移到自己的课题</h3>
          <p className="text-sm text-[#8a92a3] leading-7 mb-3">
            不要停在“学过 SDL”这一层。更有效的顺序是：先用 8 步工作流暴露漏洞，再回看 DOE/SDL 的边界，最后补阅读轨。
          </p>
          <Link
            to="/methods"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#00f5d4] no-underline"
          >
            跳到工作流入口 <Route className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
