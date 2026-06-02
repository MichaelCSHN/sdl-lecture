import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const CARDS = [
  {
    id: 'limits',
    title: 'Current Limits',
    subtitle: '当前局限',
    color: '#8a92a3',
    items: [
      '合成化学空间的覆盖仍有限（以氧化物为主）',
      '复杂多步反应路径的自动化难度高',
      '实验失败时的根因分析依赖人工',
      '跨尺度表征（原子→宏观）的数据整合挑战',
    ],
  },
  {
    id: 'scaling',
    title: 'Scaling Issues',
    subtitle: '规模化难题',
    color: '#fee440',
    items: [
      '设备成本高昂，单个 A-Lab 站点 > $2M',
      '化学品供应链管理复杂',
      '实验室间数据标准化尚未统一',
      '维护与校准需要专业技术人员',
    ],
  },
  {
    id: 'future',
    title: 'Future Trends',
    subtitle: '未来趋势',
    color: '#00f5d4',
    items: [
      'LLM + Multi-Agent 系统协同规划',
      '云端分布式自主实验室网络',
      '数字孪生实现完全虚拟预实验',
      '开放科学：全球 SDL 数据共享协议',
    ],
  },
];

const FUTURE_ROADMAP = [
  { year: '2026', title: '标准化接口', desc: '统一 SDL 数据格式与 API 规范', status: 'current' },
  { year: '2027', title: '多智能体协同', desc: '多个 LLM Agent 分工执行复杂实验', status: 'planned' },
  { year: '2028', title: '数字孪生集成', desc: '虚实结合的完全仿真预实验', status: 'planned' },
  { year: '2029', title: '云端网络', desc: '全球分布式 SDL 协同发现', status: 'planned' },
  { year: '2030', title: '自主发现', desc: 'AI 自主提出假设并验证新范式', status: 'vision' },
];

export default function ChallengesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const [brainstorm, setBrainstorm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <section
      id="challenges"
      ref={sectionRef}
      className="relative py-32 md:py-40"
      style={{ background: '#000d1d' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">
            06 — CHALLENGES & HORIZON
          </div>
          <h2 className="text-3xl md:text-[32px] font-semibold tracking-[-0.96px] mb-4">
            挑战与未来视界
          </h2>
          <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
            自主实验室正处于快速发展期。了解当前的技术边界和规模化挑战，有助于我们更清晰地规划未来的研究方向。
          </p>
        </motion.div>

        {/* Limitations table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-sm font-semibold font-mono text-[#d0d4dc] mb-4">
            SDL 局限性对比
          </h3>
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[rgba(67,97,238,0.2)]">
                  <th className="text-left p-3 text-[#8a92a3] font-mono">维度</th>
                  <th className="text-left p-3 text-[#00f5d4] font-mono">传统实验室</th>
                  <th className="text-left p-3 text-[#fee440] font-mono">自主实验室</th>
                  <th className="text-left p-3 text-[#8a92a3] font-mono">差距</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { dim: '实验通量', trad: '1-10 样品/天', sdl: '100-1000 样品/天', gap: 'SDL 优势明显，但受设备限制' },
                  { dim: '可重复性', trad: '依赖操作者经验', sdl: '标准化流程，但跨批次验证不足', gap: '复现性仍是学术争议焦点' },
                  { dim: '探索空间', trad: '人工选择窄', sdl: '算法可探索高维空间', gap: '化学直觉的替代尚不成熟' },
                  { dim: '失败诊断', trad: '专家现场分析', sdl: '自动化报告，根因分析有限', gap: '复杂失败模式仍需人工介入' },
                  { dim: '成本效益', trad: '人力为主，设备简单', sdl: '设备昂贵，边际成本递减', gap: '初期投入高，长期收益大' },
                  { dim: '数据质量', trad: '手动记录，易出错', sdl: '自动采集，元数据丰富', gap: '数据标准化和互操作待解决' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[rgba(67,97,238,0.08)] hover:bg-[rgba(67,97,238,0.03)]">
                    <td className="p-3 text-[#d0d4dc] font-mono font-medium">{row.dim}</td>
                    <td className="p-3 text-[#d0d4dc]">{row.trad}</td>
                    <td className="p-3 text-[#d0d4dc]">{row.sdl}</td>
                    <td className="p-3 text-[#8a92a3]">{row.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              className="glass-panel p-5 cursor-pointer transition-all hover:border-[rgba(0,245,212,0.15)]"
              onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border flex items-center justify-center" style={{ borderColor: `${card.color}30` }}>
                  {card.id === 'limits' && <svg className="w-4 h-4" style={{ color: card.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>}
                  {card.id === 'scaling' && <svg className="w-4 h-4" style={{ color: card.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>}
                  {card.id === 'future' && <svg className="w-4 h-4" style={{ color: card.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                </div>
                <div>
                  <h4 className="text-sm font-semibold font-mono" style={{ color: card.color }}>{card.title}</h4>
                  <span className="text-[10px] text-[#8a92a3]">{card.subtitle}</span>
                </div>
              </div>
              <ul className="space-y-2">
                {card.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-[#d0d4dc] leading-relaxed">
                    <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: card.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Future roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-sm font-semibold font-mono text-[#d0d4dc] mb-4">
            未来趋势时间轴：2026-2030 路线图
          </h3>
          <div className="glass-panel p-5">
            <div className="flex flex-wrap gap-4">
              {FUTURE_ROADMAP.map((item, i) => (
                <div key={i} className="flex-1 min-w-[140px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      item.status === 'current' ? 'bg-[#00f5d4]' : item.status === 'planned' ? 'bg-[#fee440]' : 'bg-[#8a92a3]'
                    }`} />
                    <span className="text-xs text-[#00f5d4] font-mono">{item.year}</span>
                  </div>
                  <div className="text-xs text-[#d0d4dc] font-medium mb-1">{item.title}</div>
                  <div className="text-[10px] text-[#8a92a3] leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* SDL-ization brainstorm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#fee440]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <h3 className="text-base font-semibold font-mono text-[#d0d4dc]">
                你的课题如何 SDL 化？
              </h3>
            </div>
            <p className="text-xs text-[#8a92a3] mb-4">
              简要描述你的研究方向，AI 将分析 SDL 适用性并给出关键建议。
            </p>
            {!submitted ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={brainstorm}
                  onChange={(e) => setBrainstorm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && brainstorm.trim() && setSubmitted(true)}
                  placeholder="例如：我正在研究固态电池电解质..."
                  className="flex-1 bg-[#0a1628] border border-[rgba(67,97,238,0.2)] rounded-lg px-4 py-2.5 text-sm text-[#d0d4dc] font-mono placeholder:text-[#8a92a3]/50 focus:border-[#00f5d4] outline-none"
                />
                <button
                  onClick={() => brainstorm.trim() && setSubmitted(true)}
                  className="btn-glow px-5 py-2.5 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-sm font-mono rounded-lg"
                >
                  分析
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a1628] border border-[rgba(0,245,212,0.15)] rounded-lg p-4">
                <div className="text-xs text-[#00f5d4] font-mono mb-2">SDL 适用性分析</div>
                <p className="text-sm text-[#d0d4dc] leading-relaxed mb-3">
                  基于「{brainstorm}」，以下是 SDL 化的关键切入点：
                </p>
                <ul className="space-y-2 text-xs text-[#8a92a3]">
                  {[
                    '识别可自动化的实验步骤（称量、混合、加热等）',
                    '定义明确的性能目标函数用于 Bayesian Optimization',
                    '调研开源工具（A-Lab、Honegumi、BayBE）进行适配',
                    '评估数据流闭环的可行性（合成→表征→AI决策）',
                    '考虑与 Materials Project 等数据库的集成',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#00f5d4] mt-0.5">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setSubmitted(false); setBrainstorm(''); }}
                  className="mt-4 text-xs text-[#8a92a3] hover:text-[#d0d4dc] font-mono transition-colors"
                >
                  ← 重新输入
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}
