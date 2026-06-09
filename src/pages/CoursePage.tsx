import { Link } from 'react-router';
import { ArrowRight, BookOpen, BrainCircuit, DraftingCompass, Network, Route, Sparkles } from 'lucide-react';
import { COURSE_LECTURES, LEARNING_OBJECTIVES, getLecturesByModule } from '@/content/courseStructure';

const MODULE_INFO = {
  A: {
    label: '实验与 MSE',
    color: '#00f5d4',
    desc: '先把实验放回科学史与材料科学的中心位置，再讨论 DOE 和 SDL。',
  },
  B: {
    label: '传统方法论',
    color: '#4361ee',
    desc: '从试错法到 DOE，把实验问题翻译成变量、响应、对照、约束与设计结构。',
  },
  C: {
    label: 'AI 时代的实验',
    color: '#f59e0b',
    desc: '把 SDL 放回真实系统、真实工作流与真实研究设计，而不是悬空讲算法。',
  },
} as const;

const RECOMMENDED_PATHS = [
  {
    title: '讲座主线',
    eyebrow: 'PPT 路线（Lecture Route）',
    body: 'PPT 是一次 10 段主讲座，适合在现场建立“实验为何重要、DOE 如何进入 SDL、AI/ML 方法如何落到闭环、真实案例如何被审查”的骨架。',
    links: [
      { to: '/foundations', label: '从基础（Foundations）开始' },
      { to: '/a-lab', label: '进入 A-Lab 案例' },
    ],
    accent: '#00f5d4',
    icon: BookOpen,
  },
  {
    title: '网站扩展学习线',
    eyebrow: '扩展地图（Extended Map）',
    body: '网站保留 12 讲学习地图，覆盖更多背景、练习和资源。它不是 PPT 的逐页目录，而是课后继续学习的导航。',
    links: [
      { to: '/ai-methods', label: 'AI/ML 方法全景' },
      { to: '/frontiers', label: 'SOTA/前沿' },
    ],
    accent: '#38bdf8',
    icon: BrainCircuit,
  },
  {
    title: '工作流练习线',
    eyebrow: '实践路线（Practice Route）',
    body: '适合已经有课题的学生。先用 8 步工作流暴露问题定义、测量、执行、统计和报告环节的漏洞，再回到自己的实验设计。',
    links: [
      { to: '/methods', label: '打开 8 步工作流' },
      { to: '/design-studio', label: '进入研究设计工作室' },
    ],
    accent: '#7c7cff',
    icon: Network,
  },
  {
    title: '案例与演示线',
    eyebrow: 'Demo Route',
    body: '通过 GP-BO 演示和 Case Studio，把代理模型、采集函数、单目标、多目标线性组合与 Pareto 任务放到可观察的闭环里。',
    links: [
      { to: '/sdl-demo', label: 'GP-BO 演示' },
      { to: '/case-studio', label: 'Case Studio' },
    ],
    accent: '#f97316',
    icon: Sparkles,
  },
];

export default function CoursePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-10">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">
          课程结构（Course Structure）
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[#f3f6fb]">课程地图</h1>
        <p className="text-[#d0d4dc] max-w-3xl leading-7 mb-3 text-sm">
          这页首先区分两件事：PPT 是一次讲座路线，网站是课后扩展学习地图。现场讲座需要主线清晰；
          网站则允许你按问题回看、补课、练习和继续阅读。
        </p>
        <p className="text-[#8a92a3] max-w-3xl leading-7 text-sm">
          如果你只是准备听讲座，优先走 PPT 主线；如果你要把内容迁移到自己的研究课题，优先走工作流练习线；
          如果你想理解 AI 方法，先看 AI/ML 方法全景，再进入 Case Studio。
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-4 mb-12">
        {RECOMMENDED_PATHS.map((path) => {
          const Icon = path.icon;
          return (
            <div key={path.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.14)] p-5">
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
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="text-[10px] text-[#7c7cff] font-mono tracking-[0.18em] mb-2">
              路线边界（Route Boundary）
            </div>
            <h2 className="text-2xl font-semibold text-[#f3f6fb] mb-3">不要把网站 12 讲误读为 PPT 目录</h2>
            <p className="text-sm text-[#8a92a3] leading-7 mb-4">
              PPT 保留主讲座与附录边界：现场重点讲主线、关键案例和判断方法，附录承接资源、工具和延伸阅读。
              网站的 12 讲结构则用于课后学习，允许把 Foundations、Methods、Resources、Case Studio 拆得更细。
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/ai-methods"
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(56,189,248,0.24)] bg-[rgba(56,189,248,0.08)] px-4 py-3 text-sm font-mono text-[#bae6fd] no-underline hover:bg-[rgba(56,189,248,0.12)] transition-colors"
              >
                打开 AI/ML 方法
                <BrainCircuit className="w-4 h-4" />
              </Link>
              <Link
                to="/methods"
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(124,124,255,0.24)] bg-[rgba(124,124,255,0.08)] px-4 py-3 text-sm font-mono text-[#c8c8ff] no-underline hover:bg-[rgba(124,124,255,0.12)] transition-colors"
              >
                打开工作流
                <Network className="w-4 h-4" />
              </Link>
              <Link
                to="/design-studio"
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(249,115,22,0.24)] bg-[rgba(249,115,22,0.08)] px-4 py-3 text-sm font-mono text-[#fdba74] no-underline hover:bg-[rgba(249,115,22,0.12)] transition-colors"
              >
                进入工作室
                <DraftingCompass className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ['PPT 主讲座', '10 段主线，重在现场叙事、关键判断和课堂讨论。'],
              ['PPT 附录', '承接资源、工具、GP-BO 页面和三案例统一 Case Studio 的课后入口。'],
              ['网站扩展地图', '12 讲学习结构，方便按问题补充方法、案例和资源。'],
              ['练习与演示', 'GP-BO 和 Case Studio 用于把抽象概念转成可观察决策。'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-[rgba(67,97,238,0.12)] px-4 py-4">
                <div className="text-xs font-semibold text-[#d0d4dc] mb-1">{title}</div>
                <div className="text-xs text-[#8a92a3] leading-6">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xs text-[#4361ee] font-mono tracking-widest mb-3">
          学习目标（Learning Objectives）
        </h2>
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
                          讲座路线
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
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">
            讲授场景（Lecture Delivery）
          </div>
          <h3 className="text-lg font-semibold text-[#f3f6fb] mb-2">如果你现在只准备听这场讲座</h3>
          <p className="text-sm text-[#8a92a3] leading-7">
            重点走讲座精选路线。它足够建立“实验为什么重要、DOE 和 SDL 如何相连、AI/ML 方法如何进入闭环、
            真实系统该如何判断”的核心框架。
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.15)] p-5">
          <div className="text-[10px] text-[#7c7cff] font-mono tracking-[0.18em] mb-2">
            研究迁移（Research Transfer）
          </div>
          <h3 className="text-lg font-semibold text-[#f3f6fb] mb-2">如果你要把内容迁移到自己的课题</h3>
          <p className="text-sm text-[#8a92a3] leading-7 mb-3">
            不要停在“学过 SDL”这一层。更有效的顺序是：先用 8 步工作流暴露漏洞，再回看 DOE/SDL 的边界，
            最后补阅读轨。
          </p>
          <Link to="/methods" className="inline-flex items-center gap-2 text-xs font-mono text-[#00f5d4] no-underline">
            跳到工作流入口 <Route className="w-3 h-3" />
          </Link>
        </div>
      </section>

      <div className="sr-only">
        网站扩展讲座数量：{COURSE_LECTURES.length}
      </div>
    </div>
  );
}
