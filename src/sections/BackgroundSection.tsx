import { useRef, useState, lazy, Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { experimentTimeline } from '../data/experiment_timeline';
import { mseWorkflow } from '../data/mse_workflow';
import KnowledgeGraph from '../components/KnowledgeGraph';

const MermaidDiagram = lazy(() => import('../components/MermaidDiagram'));

const CATEGORY_COLORS: Record<string, string> = {
  observation: '#8a92a3',
  methodology: '#00f5d4',
  institution: '#4361ee',
  technology: '#fee440',
  paradigm: '#ff6b6b',
};

const CATEGORY_LABELS: Record<string, string> = {
  observation: '观察',
  methodology: '方法论',
  institution: '机构',
  technology: '技术',
  paradigm: '范式',
};

export default function BackgroundSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState<string | null>(null);

  return (
    <section id="background" ref={sectionRef} className="relative py-32 md:py-40" style={{ background: '#000d1d' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16">
          <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">02 — BACKGROUND</div>
          <h2 className="text-3xl md:text-[32px] font-semibold tracking-[-0.96px] mb-4">背景知识：实验的知识框架</h2>
          <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
            在进入自主实验室之前，我们需要回答两个根本问题：实验是什么？材料科学中的实验有哪些类型？本节构建一个开放、可探索的知识框架，让学习者对"实验"这一研究方法有清晰的整体认知。
          </p>
        </motion.div>

        {/* Sub-module A: Experiment History Timeline */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs text-[#fee440] font-mono tracking-wider">A</span>
            <h3 className="text-xl font-semibold font-mono text-[#d0d4dc]">实验的前世今生</h3>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setActiveCategory(null)} className={`px-3 py-1 text-xs font-mono rounded border transition-all ${activeCategory === null ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'}`}>全部</button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                className={`px-3 py-1 text-xs font-mono rounded border transition-all flex items-center gap-1.5 ${activeCategory === key ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'}`}>
                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[key] }} />{label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[rgba(67,97,238,0.2)] md:-translate-x-px" />
            <div className="space-y-8">
              {experimentTimeline.filter((e) => !activeCategory || e.category === activeCategory).map((event, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                  className={`relative flex items-start gap-4 md:gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="absolute left-4 md:left-1/2 top-2 w-3 h-3 rounded-full border-2 -translate-x-1/2 z-10" style={{ borderColor: CATEGORY_COLORS[event.category], background: '#000d1d' }} />
                  <div className={`ml-10 md:ml-0 md:w-[45%] ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="glass-panel p-4 hover:border-[rgba(0,245,212,0.2)] transition-colors cursor-default group">
                      <div className="flex items-center gap-2 mb-1 justify-start">
                        <span className="text-[10px] font-mono" style={{ color: CATEGORY_COLORS[event.category] }}>{event.year}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(67,97,238,0.1)] text-[#8a92a3] font-mono">{CATEGORY_LABELS[event.category]}</span>
                      </div>
                      <div className="text-sm text-[#d0d4dc] font-medium mb-1">{event.label}</div>
                      <div className="text-xs text-[#8a92a3] leading-relaxed">{event.description}</div>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-[45%]" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Four Paradigms */}
          <div className="mt-12 glass-panel p-6">
            <h4 className="text-sm font-semibold font-mono text-[#d0d4dc] mb-4">Jim Gray 的科学四范式 → 第五范式</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { num: '1st', name: '实验科学', nameEn: 'Experimental', desc: '经验观察与受控实验', color: '#8a92a3' },
                { num: '2nd', name: '理论科学', nameEn: 'Theoretical', desc: '数学模型与解析推导', color: '#4361ee' },
                { num: '3rd', name: '计算科学', nameEn: 'Computational', desc: '数值模拟与仿真', color: '#fee440' },
                { num: '4th', name: '数据科学', nameEn: 'Data-driven', desc: '大数据挖掘与机器学习', color: '#00f5d4' },
                { num: '5th', name: 'AI 自主科学', nameEn: 'AI Autonomous', desc: '自主假设-实验-发现', color: '#ff6b6b' },
              ].map((p) => (
                <div key={p.num} className="p-3 rounded border text-center transition-all hover:border-[rgba(0,245,212,0.3)]" style={{ borderColor: `${p.color}30`, background: `${p.color}08` }}>
                  <div className="text-lg font-mono-title mb-1" style={{ color: p.color }}>{p.num}</div>
                  <div className="text-xs text-[#d0d4dc] font-medium">{p.name}</div>
                  <div className="text-[9px] text-[#8a92a3] font-mono">{p.nameEn}</div>
                  <div className="text-[10px] text-[#8a92a3] mt-1 leading-tight">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sub-module B: MSE Workflow */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }} className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs text-[#fee440] font-mono tracking-wider">B</span>
            <h3 className="text-xl font-semibold font-mono text-[#d0d4dc]">MSE 实验工序谱</h3>
          </div>

          <div className="glass-panel p-6 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {mseWorkflow.map((step, i) => (
                <button key={step.id} onClick={() => setWorkflowStep(workflowStep === step.id ? null : step.id)}
                  className={`group flex items-center gap-1 transition-all ${workflowStep === step.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                  <span className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${workflowStep === step.id ? 'border-[#00f5d4] text-[#00f5d4] bg-[rgba(0,245,212,0.1)]' : 'border-[rgba(67,97,238,0.2)] text-[#d0d4dc]'}`}>{step.label}</span>
                  {i < mseWorkflow.length - 1 && (
                    <svg className="w-3 h-3 text-[#8a92a3] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  )}
                </button>
              ))}
            </div>

            {workflowStep && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-[rgba(67,97,238,0.15)] pt-4">
                {(() => {
                  const step = mseWorkflow.find((s) => s.id === workflowStep)!;
                  return (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-sm font-semibold font-mono text-[#00f5d4]">{step.label} — {step.labelEn}</h4>
                        <span className="text-xs text-[#8a92a3]">{step.description}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {step.methods.map((m) => (
                          <div key={m.name} className={`p-2 rounded border text-xs ${m.automated ? 'border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.05)]' : 'border-[rgba(138,146,163,0.2)] bg-[rgba(138,146,163,0.05)]'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${m.automated ? 'bg-[#00f5d4]' : 'bg-[#8a92a3]'}`} />
                              <span className="text-[#d0d4dc] font-mono">{m.name}</span>
                              <span className="text-[#8a92a3]">({m.nameEn})</span>
                            </div>
                            <div className="text-[10px] text-[#8a92a3]">{m.desc}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#8a92a3] font-mono">
                        <span>数据产出：</span>
                        {step.dataTypes.map((dt) => <span key={dt} className="px-2 py-0.5 rounded bg-[rgba(67,97,238,0.1)]">{dt}</span>)}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            <div className="flex items-center gap-4 mt-4 text-[10px] font-mono text-[#8a92a3]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00f5d4]" />已被 SDL 自动化</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8a92a3]" />尚未自动化</span>
            </div>
          </div>
        </motion.div>

        {/* Sub-module C: Knowledge Graph (d3-force) */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-[#fee440] font-mono tracking-wider">C</span>
            <h3 className="text-xl font-semibold font-mono text-[#d0d4dc]">交互式知识图谱</h3>
            <span className="text-[10px] text-[#8a92a3] font-mono ml-2">d3-force · Wikipedia API · 拖拽/缩放/搜索</span>
          </div>
          <KnowledgeGraph />
        </motion.div>

        {/* Mermaid: DMTA-L Loop */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.5 }} className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-[#00f5d4] font-mono tracking-wider">DMTA-L</span>
            <h3 className="text-sm font-semibold font-mono text-[#d0d4dc]">自主实验室闭环流程（Mermaid）</h3>
          </div>
          <Suspense fallback={<div className="glass-panel p-6 text-center text-xs text-[#8a92a3]">Loading Mermaid...</div>}>
            <MermaidDiagram chart={`
graph TD
    A[Design<br/>AI Planner<br/>LLM + DFT 预筛选] --> B[Make<br/>Robotic Arm<br/>自动合成]
    B --> C[Test<br/>In-situ XRD<br/>实时表征]
    C --> D[Analyze<br/>数据解析<br/>GP 模型更新]
    D --> E[Learn<br/>BO 推荐<br/>采集函数]
    E --> A
    style A fill:#00f5d420,stroke:#00f5d4,color:#d0d4dc
    style B fill:#fee44020,stroke:#fee440,color:#d0d4dc
    style C fill:#4361ee20,stroke:#4361ee,color:#d0d4dc
    style D fill:#ff6b6b20,stroke:#ff6b6b,color:#d0d4dc
    style E fill:#c77dff20,stroke:#c77dff,color:#d0d4dc
            `} />
          </Suspense>
        </motion.div>

        {/* Bridge */}
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 1 }} className="mt-12 text-center">
          <p className="text-sm text-[#8a92a3] max-w-xl mx-auto leading-relaxed mb-4">
            从古典时代的观察思辨，到今天的 AI 自主实验——"实验"这一科学方法经历了两千年的演进。现在，让我们进入自主实验室的核心世界。
          </p>
          <button onClick={() => document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-glow px-6 py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded transition-all">进入 SDL 核心概念 →</button>
        </motion.div>
      </div>
      <div className="section-divider mt-32" />
    </section>
  );
}
