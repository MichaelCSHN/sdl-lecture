import { Link } from 'react-router';
import {
  ArrowRight,
  Beaker,
  BookOpen,
  DraftingCompass,
  FlaskConical,
  Network,
} from 'lucide-react';
import { getLecturePathLectures } from '@/content/courseStructure';

const lecturePathLectures = getLecturePathLectures();

const PRIMARY_PATHS = [
  {
    to: '/course',
    title: '课程地图',
    eyebrow: 'Course Map',
    icon: BookOpen,
    body: '先看整门讲座的结构、模块分工和推荐路径，再决定从哪一条线进入。',
    accent: '#00f5d4',
  },
  {
    to: '/methods',
    title: '8 步实验工作流',
    eyebrow: 'Workflow',
    icon: Network,
    body: '把“问题定义 → 设计 → 执行 → 数据 → 统计 → 报告”压成一条可落地的研究主线。',
    accent: '#7c7cff',
  },
  {
    to: '/design-studio',
    title: '研究设计工作室',
    eyebrow: 'Studio',
    icon: DraftingCompass,
    body: '把你自己的课题重写成一份可执行的实验设计，而不是停留在“想做 SDL”。',
    accent: '#f97316',
  },
  {
    to: '/a-lab',
    title: '真实案例与演示',
    eyebrow: 'Case + Demo',
    icon: FlaskConical,
    body: '从 A-Lab 看真实自治实验系统，再到 Case Studio 看最小闭环如何运行。',
    accent: '#22c55e',
  },
];

const ENTRY_SCENARIOS = [
  {
    title: '第一次听这场讲座',
    body: '先走“课程地图 → Foundations → A-Lab → Case Studio”，建立完整叙事。',
    links: [
      { to: '/course', label: '先看课程地图' },
      { to: '/foundations', label: '进入 Foundations' },
    ],
  },
  {
    title: '你正在做自己的实验课题',
    body: '直接走“8 步工作流 → 研究设计工作室 → 资源页”，把方法论翻译成你的问题。',
    links: [
      { to: '/methods', label: '打开 8 步工作流' },
      { to: '/design-studio', label: '进入研究设计工作室' },
    ],
  },
  {
    title: '你想看 AI 时代实验系统长什么样',
    body: '先看真实 SDL 系统怎样被搭起来，再看一个可解释、可复位的小型闭环演示。',
    links: [
      { to: '/a-lab', label: '看 A-Lab 案例' },
      { to: '/case-studio', label: '看 Case Studio' },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] mb-12">
        <div>
          <div className="inline-flex items-center gap-2.5 glass-panel px-3 py-1.5 rounded mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
            <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">
              2026.06 | 研究生专题讲座与线上讲义站
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-1.5px] leading-[1.08] mb-5 text-[#f3f6fb]">
            AI 时代的材料科学实验
          </h1>
          <p className="text-lg md:text-xl text-[#d0d4dc] max-w-3xl leading-relaxed mb-4">
            从 DOE 到 Self-Driving Labs，但主角始终不是算法，而是实验如何被重新组织。
          </p>
          <p className="text-sm text-[#8a92a3] max-w-3xl leading-7">
            这不是一份“AI 工具清单”，而是一条围绕实验展开的叙事主线：为什么实验仍是中心，
            传统方法论做了什么，AI 时代又在哪些决策节点上改写了实验工作流。
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-[rgba(0,245,212,0.14)] p-6">
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-3">WHAT IS NEW</div>
          <h2 className="text-lg font-semibold text-[#f3f6fb] mb-3">本轮新增的核心内容</h2>
          <ul className="space-y-3 text-sm text-[#8a92a3] leading-7">
            <li>把实验史、DOE、SDL 和 MSE 范式真正串成了一条主叙事。</li>
            <li>新增完整的 8 步实验研究工作流，不再只讲概念，不落流程。</li>
            <li>新增研究设计工作室，把方法论直接转写到个人课题设计。</li>
            <li>资源页改成了分层阅读轨，不再是链接堆砌。</li>
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs text-[#00f5d4] font-mono tracking-widest mb-2">PRIMARY ENTRY POINTS</div>
            <h2 className="text-2xl font-semibold text-[#f3f6fb]">从这里进入，不要再把新内容藏在二级页面里</h2>
          </div>
          <Link
            to="/course"
            className="hidden md:inline-flex items-center gap-2 text-xs font-mono text-[#00f5d4] no-underline"
          >
            先看整体课程结构 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PRIMARY_PATHS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.14)] p-5 no-underline transition-colors hover:border-[rgba(0,245,212,0.28)] group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono tracking-[0.18em]" style={{ color: item.accent }}>
                    {item.eyebrow}
                  </span>
                  <Icon className="w-4 h-4" style={{ color: item.accent }} />
                </div>
                <h3 className="text-lg font-semibold text-[#f3f6fb] mb-2 group-hover:text-[#00f5d4] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-[#8a92a3] leading-6 mb-4">{item.body}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00f5d4]">
                  进入 <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3 mb-14">
        {ENTRY_SCENARIOS.map((scenario) => (
          <div key={scenario.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
            <h3 className="text-base font-semibold text-[#f3f6fb] mb-2">{scenario.title}</h3>
            <p className="text-sm text-[#8a92a3] leading-6 mb-4">{scenario.body}</p>
            <div className="flex flex-wrap gap-2">
              {scenario.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center gap-1 rounded-full border border-[rgba(0,245,212,0.18)] px-3 py-1.5 text-[11px] font-mono text-[#00f5d4] no-underline hover:bg-[rgba(0,245,212,0.08)] transition-colors"
                >
                  {link.label}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] mb-14">
        <div className="glass-panel rounded-2xl border border-[rgba(124,124,255,0.18)] p-6">
          <div className="text-[10px] text-[#7c7cff] font-mono tracking-[0.18em] mb-2">WORKFLOW FIRST</div>
          <h2 className="text-xl font-semibold text-[#f3f6fb] mb-3">这次讲座不再只给概念，也给工作流</h2>
          <p className="text-sm text-[#8a92a3] leading-7 mb-5">
            新增的 8 步实验工作流，不是本科实验课 checklist，也不是把 DOE 和统计学拆开的流程图。
            它的作用是把研究问题、设计、执行、数据、统计和报告重新接成一条能落到真实课题上的线。
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/methods"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(124,124,255,0.28)] bg-[rgba(124,124,255,0.08)] px-4 py-3 text-sm font-mono text-[#c8c8ff] no-underline hover:bg-[rgba(124,124,255,0.12)] transition-colors"
            >
              打开 8 步工作流
              <Network className="w-4 h-4" />
            </Link>
            <Link
              to="/design-studio"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(249,115,22,0.28)] bg-[rgba(249,115,22,0.08)] px-4 py-3 text-sm font-mono text-[#fdba74] no-underline hover:bg-[rgba(249,115,22,0.12)] transition-colors"
            >
              进入研究设计工作室
              <DraftingCompass className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-6">
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">LECTURE PATH</div>
          <h2 className="text-xl font-semibold text-[#f3f6fb] mb-4">
            本次讲座精选路径（{lecturePathLectures.length} 讲）
          </h2>
          <div className="space-y-2">
            {lecturePathLectures.map((lecture) => (
              <Link
                key={lecture.id}
                to={lecture.route}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 no-underline hover:bg-[rgba(67,97,238,0.05)] transition-colors group"
              >
                <span className="w-8 flex-shrink-0 text-xs font-mono text-[#00f5d4]">{lecture.num}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[#d0d4dc] group-hover:text-[#00f5d4] transition-colors">
                    {lecture.titleCn}
                  </div>
                  <div className="text-xs text-[#5a6377] mt-0.5">{lecture.description}</div>
                </div>
                <span className="hidden sm:inline text-[10px] font-mono text-[#8a92a3]">
                  模块 {lecture.module}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/case-studio"
          className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5 no-underline hover:border-[rgba(0,245,212,0.28)] transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Beaker className="w-5 h-5 text-[#00f5d4]" />
            <h3 className="text-base font-semibold text-[#f3f6fb] group-hover:text-[#00f5d4] transition-colors">
              Case Studio：把闭环讲明白
            </h3>
          </div>
          <p className="text-sm text-[#8a92a3] leading-6">
            不是只看 RGB LED 的颜色变化，而是看“目标 → 观测 → 更新 → 推荐”这条最小闭环怎样真实运转。
          </p>
        </Link>

        <Link
          to="/resources"
          className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5 no-underline hover:border-[rgba(0,245,212,0.28)] transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <FlaskConical className="w-5 h-5 text-[#00f5d4]" />
            <h3 className="text-base font-semibold text-[#f3f6fb] group-hover:text-[#00f5d4] transition-colors">
              Resources：把讲座拉长成阅读轨
            </h3>
          </div>
          <p className="text-sm text-[#8a92a3] leading-6">
            从实验哲学、DOE、MSE、计算材料到 SDL 综述，资源页已经按“先读什么、后读什么”整理好了。
          </p>
        </Link>
      </section>
    </div>
  );
}
