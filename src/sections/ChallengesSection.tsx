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

interface AnalysisResult {
  scores: { dim: string; score: number; desc: string }[];
  overall: number;
  suggestion: string;
  tools: string[];
}

function sdlOfflineAnalysis(topic: string): AnalysisResult {
  const p = topic.toLowerCase();
  const scores = [
    { dim: '实验可自动化', score: p.includes('合成') || p.includes('烧结') || p.includes('沉积') ? 85 : p.includes('电镜') || p.includes('tem') ? 40 : 65, desc: '合成步骤标准化程度' },
    { dim: '参数空间明确', score: p.includes('温度') || p.includes('时间') || p.includes('比例') ? 90 : 70, desc: '参数是否连续可量化' },
    { dim: '目标可量化', score: p.includes('导电') || p.includes('产率') || p.includes('效率') || p.includes('强度') ? 95 : 75, desc: '性能指标是否可数值化' },
    { dim: '数据可闭环', score: p.includes('xrd') || p.includes('电导') || p.includes('光谱') ? 90 : 60, desc: '表征→数据→AI 反馈可行性' },
    { dim: '改造成本可控', score: p.includes('高温') || p.includes('高压') || p.includes('真空') ? 50 : 80, desc: '设备与环境要求复杂度' },
  ];
  const overall = Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length);
  let suggestion = '';
  let tools: string[] = [];

  if (overall >= 80) {
    suggestion = '你的课题非常适合 SDL 化！建议直接搭建全自动化闭环，使用 BayBE 或 Honegumi 生成 BO 代码框架。';
    tools = ['BayBE', 'Honegumi', 'A-Lab（硬件参考）', 'ChemOS（编排软件）'];
  } else if (overall >= 60) {
    suggestion = '课题具备 SDL 化潜力，建议从半自动化开始：先实现自动取样+手动分析，逐步集成表征设备和 AI 决策。';
    tools = ['Honegumi', 'self-driving-lab-demo', 'Olympus（基准框架）'];
  } else {
    suggestion = '当前课题的 SDL 化难度较高，建议先聚焦数据标准化和参数量化，等实验流程成熟后再考虑自动化。';
    tools = ['EDBO+（多目标优化）', '手动记录 + 后处理'];
  }

  return { scores, overall, suggestion, tools };
}

function SDLAnalysisPanel() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (topic.trim().length < 10) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult(sdlOfflineAnalysis(topic));
      setAnalyzing(false);
    }, 800);
  };

  const getColor = (score: number) => score >= 80 ? '#00f5d4' : score >= 60 ? '#fee440' : '#ff6b6b';

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-[#fee440]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        <h3 className="text-base font-semibold font-mono text-[#d0d4dc]">你的课题如何 SDL 化？</h3>
      </div>
      <p className="text-xs text-[#8a92a3] mb-4">用一段话描述你的研究方向（≥10 字），AI 将评估 SDL 适用性。</p>

      {!result ? (
        <div className="space-y-3">
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：我正在研究钙钛矿太阳能电池中电子传输层的优化，需要调节退火温度和掺杂比例..."
            rows={3}
            className="w-full bg-[#0a1628] border border-[rgba(67,97,238,0.2)] rounded-lg px-4 py-3 text-sm text-[#d0d4dc] font-mono placeholder:text-[#8a92a3]/50 focus:border-[#00f5d4] outline-none resize-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8a92a3] font-mono">{topic.length} 字 {topic.length > 0 && topic.length < 10 ? '（还需 ' + (10 - topic.length) + ' 字）' : ''}</span>
            <button onClick={handleAnalyze} disabled={topic.trim().length < 10 || analyzing}
              className="btn-glow px-5 py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-sm font-mono rounded-lg disabled:opacity-40">
              {analyzing ? '分析中...' : '分析'}
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Overall score */}
          <div className="flex items-center gap-4 mb-4 p-3 rounded-lg border border-[rgba(0,245,212,0.15)] bg-[rgba(0,245,212,0.03)]">
            <div className="text-center">
              <div className="text-2xl font-mono-title" style={{ color: getColor(result.overall) }}>{result.overall}</div>
              <div className="text-[9px] text-[#8a92a3] font-mono">综合评分</div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#d0d4dc] leading-relaxed">{result.suggestion}</div>
            </div>
          </div>

          {/* Dimension scores */}
          <div className="space-y-2 mb-4">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-2">五维度评估</div>
            {result.scores.map((s) => (
              <div key={s.dim}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#d0d4dc]">{s.dim}</span>
                  <span className="font-mono" style={{ color: getColor(s.score) }}>{s.score}</span>
                </div>
                <div className="h-1.5 bg-[rgba(67,97,238,0.1)] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 0.8 }}
                    className="h-full rounded-full" style={{ background: getColor(s.score) }} />
                </div>
                <div className="text-[9px] text-[#8a92a3] mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Recommended tools */}
          <div className="border-t border-[rgba(67,97,238,0.1)] pt-3">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-2">推荐工具</div>
            <div className="flex flex-wrap gap-2">
              {result.tools.map((tool) => (
                <span key={tool} className="px-2 py-1 text-[10px] font-mono border border-[rgba(0,245,212,0.2)] rounded text-[#00f5d4] bg-[rgba(0,245,212,0.05)]">{tool}</span>
              ))}
            </div>
          </div>

          <button onClick={() => { setResult(null); setTopic(''); }}
            className="mt-4 text-xs text-[#8a92a3] hover:text-[#d0d4dc] font-mono transition-colors">← 重新输入</button>
        </motion.div>
      )}
    </div>
  );
}

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

        {/* SDL-ization Analysis Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.7 }}>
          <SDLAnalysisPanel />
        </motion.div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}
