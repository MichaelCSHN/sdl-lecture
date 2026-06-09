import { Link } from 'react-router';
import {
  ArrowRight,
  Beaker,
  BookOpen,
  BrainCircuit,
  DraftingCompass,
  FlaskConical,
  Network,
  Sparkles,
} from 'lucide-react';
import { getLecturePathLectures } from '@/content/courseStructure';

const lecturePathLectures = getLecturePathLectures();

const PRIMARY_PATHS = [
  {
    to: '/course',
    title: '课程地图',
    eyebrow: '课程地图（Course Map）',
    icon: BookOpen,
    body: '先理解讲座路线和网站扩展路线的关系，再按自己的学习目标选择入口。',
    accent: '#00f5d4',
  },
  {
    to: '/ai-methods',
    title: 'AI/ML 方法全景',
    eyebrow: '方法全景（AI/ML Landscape）',
    icon: BrainCircuit,
    body: '把 GP、RF、GNN、生成模型（Generative Models）、LLM 代理（LLM Agents）和机器人系统放回同一个 SDL 闭环。',
    accent: '#38bdf8',
  },
  {
    to: '/frontiers',
    title: 'SOTA/前沿',
    eyebrow: '前沿系统（SOTA Systems）',
    icon: Sparkles,
    body: '用 A-Lab、GNoME、Coscientist 等系统训练你区分真实能力、工程边界和宣传口径。',
    accent: '#fee440',
  },
  {
    to: '/methods',
    title: '8 步实验工作流',
    eyebrow: '工作流（Workflow）',
    icon: Network,
    body: '把“问题定义 → 设计 → 执行 → 数据 → 统计 → 报告”压成一条可落地的研究主线。',
    accent: '#7c7cff',
  },
  {
    to: '/design-studio',
    title: '研究设计工作室',
    eyebrow: '工作室（Studio）',
    icon: DraftingCompass,
    body: '把自己的课题重写成可执行的实验设计，而不是停留在“想做 SDL”的口号。',
    accent: '#f97316',
  },
  {
    to: '/case-studio',
    title: '案例工作台',
    eyebrow: '案例与演示（Case Studio）',
    icon: FlaskConical,
    body: '通过 Branin、LED calibration、Optical Thin-Film 三个统一案例，观察闭环优化如何推荐下一次实验。',
    accent: '#22c55e',
  },
];

const LEARNING_OUTCOMES = [
  '判断一个实验问题是否适合 DOE、Bayesian Optimization 或完整 SDL。',
  '读懂代理模型（Surrogate Model）、采集函数（Acquisition Function）和不确定度在闭环中的位置。',
  '批判性分析 A-Lab、GNoME、Coscientist 等前沿案例的证据链与局限。',
  '把自己的研究课题拆成目标、变量、约束、测量、验证和风险。',
];

const ENTRY_SCENARIOS = [
  {
    title: '第一次进入这门讲座',
    body: '按“课程地图 → Foundations → AI/ML 方法 → SOTA/前沿 → A-Lab → Case Studio”建立完整叙事。',
    links: [
      { to: '/course', label: '先看课程地图' },
      { to: '/foundations', label: '进入基础（Foundations）' },
    ],
  },
  {
    title: '正在设计自己的实验课题',
    body: '直接走“8 步工作流 → 研究设计工作室 → 资源页”，把方法论翻译成具体实验方案。',
    links: [
      { to: '/methods', label: '打开 8 步工作流' },
      { to: '/design-studio', label: '进入研究设计工作室' },
    ],
  },
  {
    title: '想看 AI 时代的实验系统',
    body: '先看 AI/ML 方法全景和 SOTA 系统，再回到可解释、可复现的小型闭环演示。',
    links: [
      { to: '/ai-methods', label: '看 AI/ML 方法' },
      { to: '/frontiers', label: '看 SOTA/前沿' },
      { to: '/case-studio', label: '看案例工作台（Case Studio）' },
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
              研究生专题讲座与课后学习网站
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-1.5px] leading-[1.08] mb-5 text-[#f3f6fb]">
            AI 时代的材料科学实验
          </h1>
          <p className="text-lg md:text-xl text-[#d0d4dc] max-w-3xl leading-relaxed mb-4">
            从实验设计（DOE）到 Self-Driving Labs，核心问题始终是：怎样组织实验，才能产生可信、可复核、可继续学习的证据。
          </p>
          <p className="text-sm text-[#8a92a3] max-w-3xl leading-7">
            这个网站服务于一次研究生讲座，也服务于课后继续学习。它不是 AI 工具清单，而是一张实验方法地图：
            你将看到传统实验方法如何演化为闭环实验，AI/ML 在闭环中具体负责什么，以及真实系统的声明应该如何被审查。
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-[rgba(0,245,212,0.14)] p-6">
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-3">
            你将学会（Learning Outcomes）
          </div>
          <h2 className="text-lg font-semibold text-[#f3f6fb] mb-3">把 SDL 当成实验方法，而不是科技新闻</h2>
          <ul className="space-y-3 text-sm text-[#8a92a3] leading-7">
            {LEARNING_OUTCOMES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs text-[#00f5d4] font-mono tracking-widest mb-2">主要入口（Primary Entry Points）</div>
            <h2 className="text-2xl font-semibold text-[#f3f6fb]">按你的问题选择入口</h2>
          </div>
          <Link
            to="/course"
            className="hidden md:inline-flex items-center gap-2 text-xs font-mono text-[#00f5d4] no-underline"
          >
            查看整体课程结构 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <div className="text-[10px] text-[#7c7cff] font-mono tracking-[0.18em] mb-2">
            工作流优先（Workflow First）
          </div>
          <h2 className="text-xl font-semibold text-[#f3f6fb] mb-3">概念必须落到实验动作</h2>
          <p className="text-sm text-[#8a92a3] leading-7 mb-5">
            8 步实验工作流不是本科实验课 checklist，也不是把 DOE 和统计学拆散的流程图。它的作用是把研究问题、
            实验设计、执行纪律、数据留痕、统计判断和报告规范重新接成一条能落到真实课题上的线。
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
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">
            讲座路线（Lecture Path）
          </div>
          <h2 className="text-xl font-semibold text-[#f3f6fb] mb-4">
            本次讲座精选路线（{lecturePathLectures.length} 讲）
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
              案例工作台（Case Studio）：看懂最小闭环
            </h3>
          </div>
          <p className="text-sm text-[#8a92a3] leading-6">
            这里不只看 RGB LED 颜色变化，而是看“目标 → 观测 → 更新 → 推荐”怎样在不同优化任务中真实运转。
          </p>
        </Link>

        <Link
          to="/resources"
          className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5 no-underline hover:border-[rgba(0,245,212,0.28)] transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <FlaskConical className="w-5 h-5 text-[#00f5d4]" />
            <h3 className="text-base font-semibold text-[#f3f6fb] group-hover:text-[#00f5d4] transition-colors">
              资源页（Resources）：把讲座延长成阅读轨
            </h3>
          </div>
          <p className="text-sm text-[#8a92a3] leading-6">
            按 2 小时、2 周、2 个月的节奏补实验哲学、DOE、MSE、计算材料和 SDL 工具链。
          </p>
        </Link>
      </section>
    </div>
  );
}
