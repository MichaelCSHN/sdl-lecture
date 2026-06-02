import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import TermTooltip from '../components/TermTooltip';

const NODES = [
  {
    id: 'planner',
    label: 'AI Planner',
    description: '基于大语言模型和材料数据库的实验规划模块。接收研究目标，分解为可执行的合成步骤，并预测最优实验条件。',
    params: ['LLM Reasoning', 'DFT Pre-screening', 'Bayesian Opt.'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    id: 'robot',
    label: 'Robotic Arm',
    description: '六轴协作机械臂，配备力反馈传感器和视觉识别系统。精确执行称量、混合、转移等操作，误差 < 0.1mg。',
    params: ['6-DoF Arm', 'Force Feedback', 'Vision System'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
  },
  {
    id: 'synthesis',
    label: 'Synthesis Furnace',
    description: '多温区管式炉，支持最高 1200°C 的固态反应。配备气氛控制和快速淬火系统，实现精确的热力学路径控制。',
    params: ['1200°C Max', 'Multi-zone', 'Gas Control'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    ),
  },
  {
    id: 'analysis',
    label: 'X-ray Analysis',
    description: '原位 XRD 和 XRF 表征系统。实时监测相纯度、晶格参数和元素组成，数据直接回传至 AI 决策模块。',
    params: ['XRD / XRF', 'In-situ', 'Auto-feedback'],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L18.75 14.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const SDL_MILESTONES = [
  { year: '2016', event: 'ChemOS 1.0 发布', desc: '首个学术级 SDL 编排软件' },
  { year: '2018', event: 'Science Robotics 论文', desc: 'Aspuru-Guzik 组发表 ChemOS 原始论文' },
  { year: '2020', event: 'Olympus 基准框架', desc: 'SDL 实验数据集与基准测试平台' },
  { year: '2021', event: 'BayBE 开源', desc: 'Merck 发布材料科学专用 BO 工具箱' },
  { year: '2022', event: 'Honegumi 上线', desc: 'BO 代码生成器，专为实验科学设计' },
  { year: '2023', event: 'A-Lab Nature', desc: '17天41种新材料，SDL里程碑' },
  { year: '2023', event: 'Coscientist Nature', desc: 'LLM驱动自主化学研究' },
  { year: '2024', event: 'Atlas 发布', desc: 'SDL的"大脑"，新一代BO库' },
  { year: '2025', event: 'AC 微课程', desc: '多伦多大学SDL认证课程' },
  { year: '2026', event: '全球 SDL 网络', desc: '12+实验室接入，开放标准形成' },
];

export default function ConceptSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section
      id="concept"
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
            03 — SDL CORE CONCEPTS
          </div>
          <h2 className="text-3xl md:text-[32px] font-semibold tracking-[-0.96px] mb-4">
            SDL 核心概念
          </h2>
          <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
            自主实验室的核心是一个数据驱动的闭环系统：
            <TermTooltip term="AI">AI Planner</TermTooltip> 规划 → 
            <TermTooltip term="Robotic Arm">机器人</TermTooltip> 执行 → 
            自动 <TermTooltip term="Synthesis">合成</TermTooltip> → 
            <TermTooltip term="XRD">实时表征</TermTooltip> → 
            <TermTooltip term="BO">反馈优化</TermTooltip>。
            每个环节紧密耦合，形成自我进化的实验循环。
          </p>
        </motion.div>

        {/* Interactive loop diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Diagram */}
            <div className="flex-1 w-full max-w-md mx-auto">
              <div className="relative aspect-square">
                {/* Center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center border cursor-pointer"
                    style={{
                      borderColor: 'rgba(0, 245, 212, 0.4)',
                      background: 'radial-gradient(circle, rgba(0,245,212,0.08), rgba(6,22,42,0.95))',
                    }}
                  >
                    <span className="text-[#00f5d4] font-mono text-[10px] text-center leading-tight">
                      A-Lab<br />Core
                    </span>
                  </div>
                </div>

                {/* Orbiting nodes */}
                {NODES.map((node, i) => {
                  const angle = (i * 360) / NODES.length - 90;
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.cos(rad) * 42;
                  const y = Math.sin(rad) * 42;
                  const isActive = activeNode === node.id;

                  return (
                    <motion.div
                      key={node.id}
                      className="absolute"
                      style={{ left: `${50 + x}%`, top: `${50 + y}%`, transform: 'translate(-50%, -50%)' }}
                      whileHover={{ scale: 1.08 }}
                      onClick={() => setActiveNode(isActive ? null : node.id)}
                    >
                      <div
                        className={`w-[72px] h-[72px] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all border ${
                          isActive ? 'border-[#00f5d4] bg-[rgba(0,245,212,0.08)]' : 'border-[rgba(67,97,238,0.25)] bg-[rgba(6,22,42,0.85)]'
                        }`}
                        style={{ boxShadow: isActive ? '0 0 20px rgba(0,245,212,0.15)' : 'none' }}
                      >
                        <span className={isActive ? 'text-[#00f5d4]' : 'text-[#8a92a3]'}>{node.icon}</span>
                        <span className="text-[8px] text-[#d0d4dc] font-mono text-center leading-tight mt-1 px-1">
                          {node.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {[0, 1, 2, 3].map((i) => {
                    const fromAngle = (i * 360) / 4 - 90;
                    const toAngle = (((i + 1) % 4) * 360) / 4 - 90;
                    const fromRad = (fromAngle * Math.PI) / 180;
                    const toRad = (toAngle * Math.PI) / 180;
                    const x1 = 50 + Math.cos(fromRad) * 42;
                    const y1 = 50 + Math.sin(fromRad) * 42;
                    const x2 = 50 + Math.cos(toRad) * 42;
                    const y2 = 50 + Math.sin(toRad) * 42;
                    return (
                      <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                        stroke="rgba(67,97,238,0.25)" strokeWidth="1" strokeDasharray="3 3">
                        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.5s" repeatCount="indefinite" />
                      </line>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Detail panel */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              {activeNode ? (
                <motion.div key={activeNode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5">
                  {(() => {
                    const node = NODES.find((n) => n.id === activeNode)!;
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={activeNode ? 'text-[#00f5d4]' : 'text-[#8a92a3]'}>{node.icon}</span>
                          <h4 className="text-base font-semibold font-mono text-[#00f5d4]">{node.label}</h4>
                        </div>
                        <p className="text-sm text-[#8a92a3] leading-relaxed mb-4">{node.description}</p>
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-[#8a92a3] font-mono tracking-wider">KEY PARAMETERS</div>
                          {node.params.map((p) => (
                            <div key={p} className="flex items-center gap-2 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4]" />
                              <span className="text-[#d0d4dc] font-mono">{p}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <div className="glass-panel p-6 flex items-center justify-center min-h-[180px]">
                  <p className="text-[#8a92a3] font-mono text-sm">点击节点探索闭环组件</p>
                </div>
              )}

              {/* Keywords */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['Bayesian Optimization', 'Closed-loop', 'High-throughput', 'In-situ', 'DMTA-L'].map((kw) => (
                  <span key={kw} className="px-2.5 py-1 text-[10px] font-mono border border-[rgba(67,97,238,0.2)] rounded text-[#8a92a3] hover:border-[#00f5d4] hover:text-[#00f5d4] transition-colors cursor-default">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* SDL Development Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold font-mono text-[#d0d4dc] mb-4">
            SDL 发展里程碑
          </h3>
          <div className="glass-panel p-5 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {SDL_MILESTONES.map((ms, i) => (
                <div key={i} className="relative flex-1 min-w-[100px] px-2 first:pl-0">
                  {i > 0 && <div className="absolute left-0 top-[10px] w-full h-px bg-[rgba(67,97,238,0.15)] -translate-x-1/2" />}
                  <div className="relative">
                    <div className={`w-2.5 h-2.5 rounded-full mb-2 ${i >= 7 ? 'bg-[#fee440]' : 'bg-[#00f5d4]'}`} style={{ boxShadow: i >= 7 ? '0 0 8px rgba(254,228,64,0.3)' : '0 0 8px rgba(0,245,212,0.3)' }} />
                    <div className="text-[10px] text-[#8a92a3] font-mono">{ms.year}</div>
                    <div className="text-[11px] text-[#d0d4dc] leading-tight mt-0.5">{ms.event}</div>
                    <div className="text-[9px] text-[#8a92a3] leading-tight mt-0.5">{ms.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="section-divider mt-20" />
    </section>
  );
}
