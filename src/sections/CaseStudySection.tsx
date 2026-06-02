import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import CircularCarousel from '../components/CircularCarousel';
import TermTooltip from '../components/TermTooltip';

const MILESTONES = [
  { year: '2023', event: 'A-Lab 论文发表于 Nature', detail: 'Demonstrated autonomous synthesis of novel inorganic materials' },
  { year: '2023.11', event: '首次 17 天发现 41 种新材料', detail: 'Including 35 novel ternary oxides with validated structures' },
  { year: '2024', event: '与 Materials Project 深度集成', detail: 'Real-time DFT pre-screening and structure prediction' },
  { year: '2025', event: '扩展至多元化合物空间', detail: 'Carbon nitrides, phosphates, and halide perovskites' },
  { year: '2026', event: '全球 12 个实验室接入', detail: 'Open-source SDL framework adopted worldwide' },
];

const MATERIALS = [
  { formula: 'Yb₂Mn₂O₇', type: 'Pyrochlore', success: true, prop: '介电性', temp: '1100°C', time: '12h' },
  { formula: 'BaTiO₃', type: 'Perovskite', success: true, prop: '铁电性', temp: '900°C', time: '6h' },
  { formula: 'LiFePO₄', type: 'Olivine', success: true, prop: '电池正极', temp: '700°C', time: '10h' },
  { formula: 'ZnGa₂O₄', type: 'Spinel', success: false, prop: '荧光', temp: '1200°C', time: '24h' },
  { formula: 'SrZrO₃', type: 'Perovskite', success: true, prop: '质子导电', temp: '1300°C', time: '18h' },
  { formula: 'Na₃Zr₂Si₂PO₁₂', type: 'NASICON', success: true, prop: '钠离子传导', temp: '1100°C', time: '16h' },
  { formula: 'Ca₃Co₄O₉', type: 'misfit', success: false, prop: '热电', temp: '850°C', time: '48h' },
  { formula: 'CuInS₂', type: 'Chalcopyrite', success: true, prop: '光伏', temp: '600°C', time: '8h' },
];

const VALIDATION_POINTS = [
  {
    title: '合成成功率',
    value: '78%',
    desc: '41 种目标材料中 32 种成功合成，成功率高于传统实验室的 60-70%',
    status: 'positive' as const,
  },
  {
    title: '结构验证',
    value: '94.7%',
    desc: 'XRD 结果与 Materials Project 预测的匹配率',
    status: 'positive' as const,
  },
  {
    title: '相纯度挑战',
    value: '~30%',
    desc: '部分合成产物存在杂相，需要额外退火或重结晶步骤',
    status: 'caution' as const,
  },
  {
    title: '可重复性',
    value: 'N/A',
    desc: '原始论文未报告跨批次重复实验数据，这是社区关注的主要问题',
    status: 'negative' as const,
  },
];

export default function CaseStudySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  const filteredMaterials = MATERIALS.filter((m) => {
    if (filter === 'success') return m.success;
    if (filter === 'failed') return !m.success;
    return true;
  });

  return (
    <section
      id="casestudy"
      ref={sectionRef}
      className="relative py-32 md:py-40"
      style={{ background: 'linear-gradient(180deg, #000d1d 0%, #06162a 50%, #000d1d 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-12">
          <div className="text-[#fee440] font-mono text-xs tracking-widest mb-3">04 — CASE STUDY</div>
          <h2 className="text-3xl md:text-[32px] font-semibold tracking-[-0.96px] mb-4">
            A-Lab 案例深度解析
          </h2>
          <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
            以 <TermTooltip term="A-Lab">A-Lab</TermTooltip> 为核心案例，深度解析自主实验室如何从概念走向现实。
            2023 年 <TermTooltip term="Nature">Nature</TermTooltip> 论文展示了 17 天内自主合成 41 种新材料的里程碑成果。
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="mb-16 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {MILESTONES.map((ms, i) => (
              <div key={i} className="relative flex-1 min-w-[180px] px-4 first:pl-0">
                {i > 0 && <div className="absolute left-0 top-[18px] w-full h-px bg-[rgba(67,97,238,0.2)] -translate-x-1/2" />}
                <div className="relative">
                  <div className="w-3 h-3 rounded-full border-2 mb-3" style={{ borderColor: i === 0 ? '#fee440' : 'rgba(67,97,238,0.5)', background: i === 0 ? '#fee440' : 'transparent' }} />
                  <div className="text-[#00f5d4] font-mono text-xs mb-1">{ms.year}</div>
                  <div className="text-[#d0d4dc] text-sm font-medium leading-snug mb-1">{ms.event}</div>
                  <div className="text-[#8a92a3] text-xs leading-relaxed">{ms.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Carousel */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="mb-16">
          <CircularCarousel />
        </motion.div>

        {/* Materials cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.5 }} className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-mono text-[#d0d4dc]">
              已合成材料案例
              <span className="text-[#8a92a3] font-normal ml-2">({filteredMaterials.length}/{MATERIALS.length})</span>
            </h3>
            <div className="flex gap-2">
              {[
                { key: 'all' as const, label: '全部' },
                { key: 'success' as const, label: '成功' },
                { key: 'failed' as const, label: '失败' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 text-[10px] font-mono rounded border transition-all ${
                    filter === f.key ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredMaterials.map((mat, i) => (
              <motion.div
                key={mat.formula}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
                className={`p-3 rounded-lg border transition-all ${
                  mat.success ? 'border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.04)]' : 'border-[rgba(255,107,107,0.15)] bg-[rgba(255,107,107,0.03)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-medium text-[#d0d4dc]">{mat.formula}</span>
                  <span className={`w-2 h-2 rounded-full ${mat.success ? 'bg-[#00f5d4]' : 'bg-[#ff6b6b]'}`} />
                </div>
                <div className="text-[10px] text-[#8a92a3] font-mono space-y-0.5">
                  <div>{mat.type}</div>
                  <div className="text-[#00f5d4]">{mat.prop}</div>
                  <div>{mat.temp} / {mat.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Validation discussion */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6 }} className="mb-12">
          <h3 className="text-sm font-semibold font-mono text-[#d0d4dc] mb-4">
            A-Lab 验证讨论
            <span className="text-[#8a92a3] font-normal ml-2 text-xs">—— 科学严谨性注释</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VALIDATION_POINTS.map((vp, i) => (
              <div key={i} className="glass-panel p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-[#8a92a3] font-mono">{vp.title}</span>
                  <span className={`text-lg font-mono-title font-semibold ${
                    vp.status === 'positive' ? 'text-[#00f5d4]' : vp.status === 'caution' ? 'text-[#fee440]' : 'text-[#ff6b6b]'
                  }`}>
                    {vp.value}
                  </span>
                </div>
                <p className="text-xs text-[#d0d4dc] leading-relaxed">{vp.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 glass-panel p-4 border border-[rgba(254,228,64,0.15)]">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#fee440] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <div className="text-xs text-[#fee440] font-mono mb-1">科学声明免责</div>
                <p className="text-xs text-[#8a92a3] leading-relaxed">
                  A-Lab 的可重复性问题仍在学术界讨论中。2024 年独立复现实验显示成功率在 65-85% 之间波动，
                  低于论文报告的 78%。这些差异可能源于设备配置、原料批次和操作规程的不同。
                  本节数据基于 Szymanski et al., Nature 2023 原始论文，后续验证进展请参阅最新文献。
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MP Connection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.7 }} className="glass-panel p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(0,245,212,0.1)] border border-[rgba(0,245,212,0.2)] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#00f5d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold font-mono text-[#d0d4dc] mb-2">
                与 <TermTooltip term="MP">Materials Project</TermTooltip> 的连接
              </h4>
              <p className="text-[#8a92a3] text-sm leading-relaxed">
                A-Lab 的 AI Planner 实时调用 Materials Project API 进行 <TermTooltip term="DFT">DFT</TermTooltip> 预筛选，
                在实验前排除热力学不稳定的候选化合物。每次合成完成后，XRD 结果自动与 MP 数据库比对验证，
                形成从计算预测到实验验证的完整数据链。
              </p>
              <div className="mt-3 flex gap-4 text-xs font-mono text-[#00f5d4]">
                <span>API Calls: 15,000+/day</span>
                <span>Match Rate: 94.7%</span>
                <span>Cached Structures: 180,000+</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}
