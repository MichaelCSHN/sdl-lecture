import { useState } from 'react';
import type { WorkflowStep } from '@/data/researchWorkflow';

interface ResearchWorkflowExplorerProps {
  steps: WorkflowStep[];
  eyebrow?: string;
  title?: string;
  intro?: string;
}

export default function ResearchWorkflowExplorer({
  steps,
  eyebrow,
  title,
  intro,
}: ResearchWorkflowExplorerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex];

  const goPrev = () => setActiveIndex((current) => Math.max(0, current - 1));
  const goNext = () => setActiveIndex((current) => Math.min(steps.length - 1, current + 1));

  return (
    <section className="space-y-6">
      {(eyebrow || title || intro) && (
        <div className="max-w-3xl">
          {eyebrow && <div className="text-[#00f5d4] font-mono text-[10px] tracking-[0.22em] mb-2">{eyebrow}</div>}
          {title && <h2 className="text-2xl md:text-3xl font-semibold text-[#f3f6fb] mb-3">{title}</h2>}
          {intro && <p className="text-sm text-[#8a92a3] leading-7">{intro}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={step.id}
              onClick={() => setActiveIndex(index)}
              className="rounded-2xl border p-4 text-left transition-all"
              style={{
                borderColor: isActive ? step.accent : 'rgba(67,97,238,0.18)',
                boxShadow: isActive ? `0 0 0 1px ${step.accent} inset` : 'none',
                background: isActive ? `${step.accent}12` : 'rgba(255,255,255,0.01)',
              }}
            >
              <div className="text-[11px] font-mono mb-2" style={{ color: isActive ? step.accent : '#5a6377' }}>
                {step.number}
              </div>
              <div className="text-lg font-semibold text-[#d0d4dc] leading-tight mb-1">{step.titleCn}</div>
              <div className="text-xs font-mono text-[#8a92a3]">{step.titleEn}</div>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[rgba(67,97,238,0.16)] bg-[#030a14]">
        <div className="border-b border-[rgba(67,97,238,0.12)] bg-[#f1eee6] px-5 py-6 md:px-7">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-3">
            <span className="text-3xl md:text-4xl font-semibold text-[#111111]">{activeStep.number}.</span>
            <h3 className="text-3xl md:text-4xl font-semibold text-[#111111] leading-tight">{activeStep.titleCn}</h3>
            <span className="text-2xl md:text-3xl text-[#7a7a73] leading-tight">{activeStep.titleEn}</span>
          </div>
          <p className="max-w-5xl text-lg leading-9 text-[#4a4a44]">{activeStep.summary}</p>
        </div>

        <div className="grid lg:grid-cols-2">
          {[
            { title: '核心任务', items: activeStep.coreTasks, accent: activeStep.accent },
            { title: '关键决策问题', items: activeStep.keyQuestions, accent: activeStep.accent },
            { title: '常见陷阱', items: activeStep.pitfalls, accent: activeStep.accent },
            { title: '工具与资源', items: activeStep.tools, accent: '#d6daf0', chips: true },
          ].map((section, index) => (
            <div
              key={section.title}
              className={[
                'min-h-[280px] border-[rgba(67,97,238,0.12)] p-5 md:p-7',
                index < 2 ? 'border-b' : '',
                index % 2 === 0 ? 'lg:border-r' : '',
              ].join(' ')}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-lg font-mono text-[#d0d4dc]">□</span>
                <h4 className="text-xl font-semibold text-[#d0d4dc]">{section.title}</h4>
              </div>
              {section.chips ? (
                <div className="flex flex-wrap gap-3">
                  {section.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-xl border px-3 py-2 text-sm md:text-base leading-6"
                      style={{
                        borderColor: `${activeStep.accent}99`,
                        background: `${activeStep.accent}14`,
                        color: section.accent,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <ul className="space-y-4">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-base md:text-[17px] leading-8 text-[#8f918d]">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: activeStep.accent }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[rgba(67,97,238,0.12)] px-5 py-5 md:px-7">
          <button
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="rounded-2xl border border-[rgba(67,97,238,0.16)] px-5 py-3 text-xl font-semibold text-[#8a92a3] transition-colors disabled:opacity-30"
          >
            ← 上一步
          </button>
          <div className="text-lg font-mono text-[#8a92a3]">
            {activeIndex + 1} / {steps.length}
          </div>
          <button
            onClick={goNext}
            disabled={activeIndex === steps.length - 1}
            className="rounded-2xl border border-[rgba(67,97,238,0.16)] px-5 py-3 text-xl font-semibold text-[#8a92a3] transition-colors disabled:opacity-30"
          >
            下一步 →
          </button>
        </div>
      </div>
    </section>
  );
}
