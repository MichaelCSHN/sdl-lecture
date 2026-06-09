import { useState } from 'react';
import { curatedResources, readingTracks } from '@/data/experimentNarrative';

const CATEGORY_META = {
  all: { label: '全部', accent: '#8a92a3' },
  philosophy: { label: '实验哲学', accent: '#8b5cf6' },
  design: { label: '实验设计', accent: '#f59e0b' },
  mse: { label: 'MSE 核心', accent: '#ef4444' },
  computation: { label: '计算材料', accent: '#3b82f6' },
  informatics: { label: '材料信息学', accent: '#10b981' },
  online: { label: '在线资源', accent: '#94a3b8' },
} as const;

const STAGE_META = {
  lecture: '讲座后先读',
  course: '课程推进',
  deep: '深入扩展',
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

const TIMEBOXED_TRACKS = [
  {
    title: '2 小时：抓住主线',
    body: '只处理三个问题：实验为什么不是理论附庸；DOE 解决什么；SDL 在哪里改变了“下一步做什么”的决策。',
  },
  {
    title: '2 周：建立方法语言',
    body: '补 DOE、Bayesian Optimization、材料数据库和真实 SDL 案例，能看懂一篇相关论文的主张与证据链。',
  },
  {
    title: '2 个月：迁移到自己的课题',
    body: '用工作流检查自己的研究设计，形成目标、变量、约束、测量、数据留痕和验证计划。',
  },
];

const APPENDIX_RESOURCE_GROUPS = [
  {
    title: 'GP-BO 与代理模型',
    items: [
      'Shahriari et al.：Bayesian Optimization 综述',
      'Rasmussen & Williams：Gaussian Processes for Machine Learning',
      'BoTorch / Ax：现代 BO 工程工具链',
    ],
  },
  {
    title: '材料数据库与数据基础设施',
    items: [
      'Materials Project：计算材料数据库入口',
      'AFLOW：高通量材料数据与筛选',
      'Materials Cloud：开放计算数据与工作流归档',
    ],
  },
  {
    title: 'SDL 系统与实验编排',
    items: [
      'ChemOS：自主实验软件栈代表',
      'Olympus：优化算法与实验基准平台',
      'HELAO / CAMEO：材料与化学实验室自动化案例',
    ],
  },
  {
    title: '开放科学与可复现性',
    items: [
      'FAIR 原则：让数据可发现、可访问、可互操作、可复用',
      'OSF / Zenodo：项目、数据和代码归档',
      '元数据规范：记录失败、异常和边界条件',
    ],
  },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  const filteredResources =
    activeCategory === 'all'
      ? curatedResources
      : curatedResources.filter((resource) => resource.category === activeCategory);

  const quickStartResources = curatedResources.filter((resource) => resource.stage === 'lecture').slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">学习资源（Resources）</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[#f3f6fb]">
          课后阅读、工具与事实来源
        </h1>
        <p className="text-[#8a92a3] max-w-3xl leading-relaxed text-sm mb-6">
          这页回答三个问题：讲座后先读什么，怎样把自己的课题放进方法论框架，
          以及哪些来源适合核实 A-Lab、GNoME、Coscientist、Materials Project 等事实。
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {TIMEBOXED_TRACKS.map((item) => (
            <div key={item.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
              <h2 className="text-sm font-semibold text-[#d0d4dc] mb-2">{item.title}</h2>
              <p className="text-xs text-[#8a92a3] leading-6">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-[#fee440] font-mono tracking-wider">01</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">讲座后优先读这五项</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {quickStartResources.map((resource) => (
            <div
              key={resource.title}
              className="rounded-2xl border border-[rgba(0,245,212,0.12)] bg-[linear-gradient(180deg,rgba(0,245,212,0.05),rgba(6,22,42,0.78))] p-4"
            >
              <div className="text-[10px] font-mono tracking-[0.16em] text-[#00f5d4] mb-2">
                {CATEGORY_META[resource.category].label}
              </div>
              <h3 className="text-sm font-semibold text-[#f3f6fb] leading-5 mb-2">{resource.title}</h3>
              <div className="text-[10px] text-[#5a6377] mb-2">
                {resource.author} · {resource.year}
              </div>
              <p className="text-[11px] text-[#8a92a3] leading-5">{resource.whyRead}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-[#4361ee] font-mono tracking-wider">02</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">按问题进入，而不是漫无目的搜索资料</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {readingTracks.map((track, index) => (
            <div
              key={track.title}
              className="rounded-2xl border p-5"
              style={{
                borderColor:
                  index % 2 === 0 ? 'rgba(67,97,238,0.14)' : 'rgba(0,245,212,0.14)',
                background:
                  index % 2 === 0
                    ? 'linear-gradient(180deg, rgba(67,97,238,0.05), rgba(6,22,42,0.82))'
                    : 'linear-gradient(180deg, rgba(0,245,212,0.04), rgba(6,22,42,0.82))',
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold text-[#f3f6fb] mb-1">{track.title}</h3>
                  <div className="text-[10px] font-mono text-[#5a6377]">{track.audience}</div>
                </div>
                <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-2.5 py-1 text-[10px] font-mono text-[#8a92a3]">
                  阅读路径
                </span>
              </div>
              <p className="text-xs text-[#8a92a3] leading-6 mb-4">{track.description}</p>
              <div className="space-y-2">
                {track.steps.map((step, stepIndex) => (
                  <div key={step} className="flex gap-3 rounded-xl border border-[rgba(67,97,238,0.08)] p-3">
                    <span className="mt-0.5 text-[10px] font-mono text-[#00f5d4]">{`0${stepIndex + 1}`}</span>
                    <p className="text-[11px] leading-5 text-[#d8e0ec]">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-[#00f5d4] font-mono tracking-wider">03</span>
              <h2 className="text-lg font-semibold text-[#d0d4dc]">精选资源库</h2>
            </div>
            <p className="text-xs text-[#8a92a3] max-w-2xl leading-6">
              这里不追求“全”，而追求能支撑课程叙事的关键节点：实验哲学、设计方法、MSE 核心教材、计算、
              材料信息学和在线基础设施。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_META) as CategoryKey[]).map((key) => {
              const meta = CATEGORY_META[key];
              const active = key === activeCategory;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className="rounded-full border px-3 py-1.5 text-[10px] font-mono transition-colors"
                  style={{
                    borderColor: active ? meta.accent : 'rgba(67,97,238,0.18)',
                    color: active ? meta.accent : '#8a92a3',
                    background: active ? `${meta.accent}12` : 'transparent',
                  }}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <article
              key={`${resource.title}-${resource.author}`}
              className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.1)] p-5 flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span
                  className="rounded-full border px-2.5 py-1 text-[10px] font-mono"
                  style={{
                    color: CATEGORY_META[resource.category].accent,
                    borderColor: `${CATEGORY_META[resource.category].accent}44`,
                    background: `${CATEGORY_META[resource.category].accent}12`,
                  }}
                >
                  {CATEGORY_META[resource.category].label}
                </span>
                <span className="text-[10px] font-mono text-[#5a6377]">{STAGE_META[resource.stage]}</span>
              </div>

              <h3 className="text-base font-semibold text-[#f3f6fb] mb-1 leading-6">{resource.title}</h3>
              <div className="text-[11px] text-[#8a92a3] mb-3">
                {resource.author} · {resource.year}
              </div>

              <div className="rounded-xl border border-[rgba(67,97,238,0.08)] bg-[rgba(255,255,255,0.02)] p-3 mb-3">
                <div className="text-[10px] font-mono tracking-[0.16em] text-[#5a6377] mb-1">为什么值得读</div>
                <p className="text-[11px] text-[#d8e0ec] leading-5">{resource.whyRead}</p>
              </div>

              <div className="mt-auto rounded-xl border border-[rgba(0,245,212,0.08)] bg-[rgba(0,245,212,0.03)] p-3">
                <div className="text-[10px] font-mono tracking-[0.16em] text-[#5a6377] mb-1">和本课程的关系</div>
                <p className="text-[11px] text-[#8a92a3] leading-5">{resource.relevance}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12 rounded-2xl border border-[rgba(0,245,212,0.14)] bg-[rgba(0,245,212,0.03)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">04</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">工具与延伸阅读组</h2>
        </div>
        <p className="text-xs text-[#8a92a3] max-w-3xl leading-6 mb-5">
          这组资源用于承接讲座主线之后的自学：从 GP-BO 演示、Case Studio 到真实 SDL 系统，
          重点是让学生知道下一步该查什么、练什么、核实什么。
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {APPENDIX_RESOURCE_GROUPS.map((group) => (
            <div key={group.title} className="rounded-2xl border border-[rgba(0,245,212,0.1)] bg-[rgba(6,22,42,0.55)] p-4">
              <h3 className="text-sm font-semibold text-[#f3f6fb] mb-3">{group.title}</h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item} className="text-[11px] text-[#8a92a3] leading-5 rounded-xl border border-[rgba(67,97,238,0.08)] px-3 py-2">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(67,97,238,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-[#ff6b6b] font-mono tracking-wider">05</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">事实来源优先级</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            '论文事实优先使用 DOI、Nature、PubMed、APS、官方文档或机构页面。',
            '新闻报道只用于争议背景和社会反应，不作为核心事实的唯一来源。',
            '数据、趋势和技术成熟度判断必须标注为当前记录、争议记录或讲者判断。',
          ].map((item) => (
            <div key={item} className="rounded-xl border border-[rgba(67,97,238,0.08)] p-4">
              <p className="text-xs leading-6 text-[#8a92a3]">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
