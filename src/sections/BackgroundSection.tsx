import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { experimentTimeline } from '../data/experiment_timeline';
import { mseWorkflow } from '../data/mse_workflow';
import { kgNodes, kgEdges, kgNodePositions, type KGNode } from '../data/knowledge_graph';

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

const TYPE_COLORS: Record<string, string> = {
  concept: '#00f5d4',
  method: '#fee440',
  person: '#4361ee',
  tool: '#ff6b6b',
  process: '#8a92a3',
  theory: '#c77dff',
};

const TYPE_LABELS: Record<string, string> = {
  concept: '概念',
  method: '方法',
  person: '人物',
  tool: '工具',
  process: '工序',
  theory: '理论',
};

export default function BackgroundSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const [kgFilter, setKgFilter] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState<string | null>(null);

  const filteredNodes = kgFilter
    ? kgNodes.filter((n) => n.type === kgFilter)
    : kgNodes;

  return (
    <section
      id="background"
      ref={sectionRef}
      className="relative py-32 md:py-40"
      style={{ background: '#000d1d' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">
            02 — BACKGROUND
          </div>
          <h2 className="text-3xl md:text-[32px] font-semibold tracking-[-0.96px] mb-4">
            背景知识：实验的知识框架
          </h2>
          <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
            在进入自主实验室之前，我们需要回答两个根本问题：实验是什么？材料科学中的实验有哪些类型？
            本节构建一个开放、可探索的知识框架，让学习者对"实验"这一研究方法有清晰的整体认知。
          </p>
        </motion.div>

        {/* Sub-module A: Experiment History Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs text-[#fee440] font-mono tracking-wider">A</span>
            <h3 className="text-xl font-semibold font-mono text-[#d0d4dc]">
              实验的前世今生
            </h3>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                activeCategory === null ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
              }`}
            >
              全部
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                className={`px-3 py-1 text-xs font-mono rounded border transition-all flex items-center gap-1.5 ${
                  activeCategory === key ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[key] }} />
                {label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Center line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[rgba(67,97,238,0.2)] md:-translate-x-px" />

            <div className="space-y-8">
              {experimentTimeline
                .filter((e) => !activeCategory || e.category === activeCategory)
                .map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                    className={`relative flex items-start gap-4 md:gap-8 ${
                      i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 top-2 w-3 h-3 rounded-full border-2 -translate-x-1/2 z-10"
                      style={{ borderColor: CATEGORY_COLORS[event.category], background: '#000d1d' }}
                    />

                    {/* Content */}
                    <div className={`ml-10 md:ml-0 md:w-[45%] ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="glass-panel p-4 hover:border-[rgba(0,245,212,0.2)] transition-colors cursor-default group">
                        <div className="flex items-center gap-2 mb-1 justify-start">
                          <span className="text-[10px] font-mono" style={{ color: CATEGORY_COLORS[event.category] }}>
                            {event.year}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(67,97,238,0.1)] text-[#8a92a3] font-mono">
                            {CATEGORY_LABELS[event.category]}
                          </span>
                        </div>
                        <div className="text-sm text-[#d0d4dc] font-medium mb-1">{event.label}</div>
                        <div className="text-xs text-[#8a92a3] leading-relaxed">{event.description}</div>
                      </div>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block md:w-[45%]" />
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Four Paradigms */}
          <div className="mt-12 glass-panel p-6">
            <h4 className="text-sm font-semibold font-mono text-[#d0d4dc] mb-4">
              Jim Gray 的科学四范式 → 第五范式
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { num: '1st', name: '实验科学', nameEn: 'Experimental', desc: '经验观察与受控实验', color: '#8a92a3' },
                { num: '2nd', name: '理论科学', nameEn: 'Theoretical', desc: '数学模型与解析推导', color: '#4361ee' },
                { num: '3rd', name: '计算科学', nameEn: 'Computational', desc: '数值模拟与仿真', color: '#fee440' },
                { num: '4th', name: '数据科学', nameEn: 'Data-driven', desc: '大数据挖掘与机器学习', color: '#00f5d4' },
                { num: '5th', name: 'AI 自主科学', nameEn: 'AI Autonomous', desc: '自主假设-实验-发现', color: '#ff6b6b' },
              ].map((p) => (
                <div
                  key={p.num}
                  className="p-3 rounded border text-center transition-all hover:border-[rgba(0,245,212,0.3)]"
                  style={{ borderColor: `${p.color}30`, background: `${p.color}08` }}
                >
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs text-[#fee440] font-mono tracking-wider">B</span>
            <h3 className="text-xl font-semibold font-mono text-[#d0d4dc]">
              MSE 实验工序谱
            </h3>
          </div>

          {/* Horizontal workflow */}
          <div className="glass-panel p-6 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {mseWorkflow.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => setWorkflowStep(workflowStep === step.id ? null : step.id)}
                  className={`group flex items-center gap-1 transition-all ${
                    workflowStep === step.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <span
                    className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${
                      workflowStep === step.id
                        ? 'border-[#00f5d4] text-[#00f5d4] bg-[rgba(0,245,212,0.1)]'
                        : 'border-[rgba(67,97,238,0.2)] text-[#d0d4dc]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {i < mseWorkflow.length - 1 && (
                    <svg className="w-3 h-3 text-[#8a92a3] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Selected step detail */}
            {workflowStep && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-[rgba(67,97,238,0.15)] pt-4"
              >
                {(() => {
                  const step = mseWorkflow.find((s) => s.id === workflowStep)!;
                  return (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-sm font-semibold font-mono text-[#00f5d4]">
                          {step.label} — {step.labelEn}
                        </h4>
                        <span className="text-xs text-[#8a92a3]">{step.description}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {step.methods.map((m) => (
                          <div
                            key={m.name}
                            className={`p-2 rounded border text-xs ${
                              m.automated
                                ? 'border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.05)]'
                                : 'border-[rgba(138,146,163,0.2)] bg-[rgba(138,146,163,0.05)]'
                            }`}
                          >
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
                        {step.dataTypes.map((dt) => (
                          <span key={dt} className="px-2 py-0.5 rounded bg-[rgba(67,97,238,0.1)]">{dt}</span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-[10px] font-mono text-[#8a92a3]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00f5d4]" />
                已被 SDL 自动化
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8a92a3]" />
                尚未自动化
              </span>
            </div>
          </div>
        </motion.div>

        {/* Sub-module C: Knowledge Graph */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-[#fee440] font-mono tracking-wider">C</span>
            <h3 className="text-xl font-semibold font-mono text-[#d0d4dc]">
              交互式知识图谱
            </h3>
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setKgFilter(null)}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                kgFilter === null ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
              }`}
            >
              全部 ({kgNodes.length})
            </button>
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = kgNodes.filter((n) => n.type === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setKgFilter(kgFilter === key ? null : key)}
                  className={`px-3 py-1 text-xs font-mono rounded border transition-all flex items-center gap-1.5 ${
                    kgFilter === key ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[key] }} />
                  {label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Graph visualization */}
            <div className="flex-1 glass-panel p-4 relative" style={{ minHeight: 500 }}>
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                {/* Edges */}
                {kgEdges.map((edge, i) => {
                  const fromPos = kgNodePositions[edge.source];
                  const toPos = kgNodePositions[edge.target];
                  if (!fromPos || !toPos) return null;
                  const sourceVisible = filteredNodes.some((n) => n.id === edge.source);
                  const targetVisible = filteredNodes.some((n) => n.id === edge.target);
                  if (!sourceVisible || !targetVisible) return null;
                  return (
                    <line
                      key={i}
                      x1={fromPos.x * 100}
                      y1={fromPos.y * 100}
                      x2={toPos.x * 100}
                      y2={toPos.y * 100}
                      stroke="rgba(67,97,238,0.2)"
                      strokeWidth="0.2"
                    />
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const pos = kgNodePositions[node.id];
                  if (!pos) return null;
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(isSelected ? null : node)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={pos.x * 100}
                        cy={pos.y * 100}
                        r={isSelected ? 2.5 : 1.8}
                        fill={TYPE_COLORS[node.type]}
                        opacity={isSelected ? 1 : 0.7}
                        stroke={isSelected ? '#fff' : 'none'}
                        strokeWidth="0.3"
                      />
                      <text
                        x={pos.x * 100 + 3}
                        y={pos.y * 100 + 1}
                        fontSize="2.5"
                        fill={isSelected ? '#00f5d4' : '#d0d4dc'}
                        fontFamily="monospace"
                        opacity={isSelected ? 1 : 0.6}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Detail panel */}
            <div className="w-full lg:w-80 flex-shrink-0">
              {selectedNode ? (
                <div className="glass-panel p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ background: TYPE_COLORS[selectedNode.type] }} />
                    <span className="text-[10px] text-[#8a92a3] font-mono">{TYPE_LABELS[selectedNode.type]}</span>
                  </div>
                  <h4 className="text-lg font-semibold font-mono text-[#d0d4dc] mb-1">
                    {selectedNode.label}
                  </h4>
                  <p className="text-xs text-[#8a92a3] font-mono mb-3">{selectedNode.labelEn}</p>
                  <p className="text-sm text-[#d0d4dc] leading-relaxed mb-3">{selectedNode.description}</p>
                  <p className="text-xs text-[#8a92a3] leading-relaxed mb-4">{selectedNode.descriptionEn}</p>

                  {/* Related edges */}
                  {(() => {
                    const related = kgEdges.filter(
                      (e) => e.source === selectedNode.id || e.target === selectedNode.id
                    );
                    if (related.length === 0) return null;
                    return (
                      <div className="border-t border-[rgba(67,97,238,0.15)] pt-3">
                        <div className="text-[10px] text-[#8a92a3] font-mono mb-2">RELATED</div>
                        <div className="space-y-1.5">
                          {related.map((edge, i) => {
                            const isSource = edge.source === selectedNode.id;
                            const otherId = isSource ? edge.target : edge.source;
                            const other = kgNodes.find((n) => n.id === otherId);
                            if (!other) return null;
                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedNode(other)}
                                className="flex items-center gap-2 text-left w-full group"
                              >
                                <span className="text-[10px] text-[#8a92a3]">{isSource ? '→' : '←'}</span>
                                <span className="text-xs text-[#00f5d4] font-mono group-hover:underline">{other.label}</span>
                                <span className="text-[10px] text-[#8a92a3]">({edge.relation})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Wiki links */}
                  {(selectedNode.wikiUrl || selectedNode.wikiUrlEn) && (
                    <div className="border-t border-[rgba(67,97,238,0.15)] pt-3 mt-3">
                      <div className="text-[10px] text-[#8a92a3] font-mono mb-2">EXTERNAL LINKS</div>
                      <div className="space-y-1">
                        {selectedNode.wikiUrl && (
                          <a href={selectedNode.wikiUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#00f5d4] hover:underline">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            中文维基百科
                          </a>
                        )}
                        {selectedNode.wikiUrlEn && (
                          <a href={selectedNode.wikiUrlEn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#00f5d4] hover:underline">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            English Wikipedia
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-panel p-6 flex items-center justify-center min-h-[200px]">
                  <p className="text-[#8a92a3] font-mono text-sm text-center">
                    点击图谱中的节点<br />查看详细定义与关联
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bridge to next module */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[#8a92a3] max-w-xl mx-auto leading-relaxed mb-4">
            从古典时代的观察思辨，到今天的 AI 自主实验——"实验"这一科学方法经历了两千年的演进。
            现在，让我们进入自主实验室的核心世界。
          </p>
          <button
            onClick={() => document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-glow px-6 py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded transition-all"
          >
            进入 SDL 核心概念 →
          </button>
        </motion.div>
      </div>

      <div className="section-divider mt-32" />
    </section>
  );
}
