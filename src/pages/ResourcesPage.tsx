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
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">课程延伸</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[#f3f6fb]">
          资源与参考
        </h1>
        <p className="text-[#8a92a3] max-w-3xl leading-relaxed text-sm mb-6">
          这一页不是“附录书单”，而是课程结构的一部分。它回答三个问题：讲座后先读什么，
          如果要把自己的课题真正放进方法论框架里该沿哪条线深入，以及哪些资源最适合把
          MSE、DOE、计算与 SDL 串起来。
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: '先抓框架，再追细节',
              body: '优先理解实验为何重要、DOE 改变了什么、SDL 又改变了哪一层，而不是一开始就陷进算法名词表。',
            },
            {
              title: '按问题而不是按书名阅读',
              body: '每条资源都标了它最适合回答什么问题，这比堆砌权威书单更适合研究生快速建立方法论判断。',
            },
            {
              title: '网站与未来 PPT 共用同一套内容骨架',
              body: '这页的阅读轨、历史节点和 MSE 桥接内容，后续可以直接转成幻灯片结构，不需要重新起草。',
            },
          ].map((item) => (
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
          <h2 className="text-lg font-semibold text-[#d0d4dc]">讲座后先读这五项</h2>
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
          <h2 className="text-lg font-semibold text-[#d0d4dc]">按四条阅读轨进入，而不是漫无目的搜资料</h2>
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

      <section className="rounded-2xl border border-[rgba(67,97,238,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-[#ff6b6b] font-mono tracking-wider">04</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">这页如何反哺讲座与 PPT</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            '时间轴内容可以直接拆成“实验史的 9 个节点”幻灯片，或压缩成“3 次跃迁 + 1 条主轴”。',
            '阅读轨可以直接改造成讲座结尾的“课后行动清单”，避免只给一堆书名不告诉学生怎么开始。',
            '资源卡里的“为什么值得读”和“和课程的关系”两段，正好可以成为 PPT 备注或讲稿补充句。',
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
