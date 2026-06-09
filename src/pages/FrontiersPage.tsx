import { Link } from 'react-router';
import { ArrowRight, Database, FlaskConical, Gauge, Network, ShieldCheck, Sparkles } from 'lucide-react';

const FRONTIER_EVENTS = [
  {
    year: '2023',
    title: 'A-Lab：固态无机合成的自动化样本',
    body: '把数据库筛选、机器人执行、自动 XRD 与结果判断连成系统，也暴露了“表征可靠性”这一核心瓶颈。',
    route: '/a-lab',
  },
  {
    year: '2023',
    title: 'GNoME：计算预测规模跃迁',
    body: '用 graph networks 与 DFT scale-up 扩展稳定晶体候选空间；它不是扩散模型案例。',
    route: '/frontiers#gno-me',
  },
  {
    year: '2023',
    title: 'Coscientist：LLM 代理进入实验规划',
    body: '展示自然语言、工具调用和实验执行之间的编排潜力，同时强化了安全边界和责任归属问题。',
    route: '/ai-methods',
  },
  {
    year: '2024-2025',
    title: 'CAMEO、HELAO 与开放平台',
    body: '同步辐射、主动学习和开源实验操作系统推动 SDL 从单点展示走向可复用基础设施。',
    route: '/resources',
  },
];

const REALITY_CHECKS = [
  ['速度', '机器人和在线表征能提升实验节奏', '速度会同步放大测量误差和错误判断'],
  ['自主性', 'L0-L5 框架帮助描述自动化程度', '当前系统多数仍依赖人类定义目标和边界'],
  ['新颖性', '数据库与生成模型能扩大候选空间', '“新结构”不等于“新材料”，更不等于“已验证发现”'],
  ['可复现性', '开源代码和自动日志让复核更可行', '硬件差异、样品制备和表征判读仍会改变结论'],
];

const TRL_ITEMS = [
  { name: '液体处理自动化', level: 'TRL 7-8', note: '成熟度高，适合微流控、配方筛选和有机/胶体体系。' },
  { name: '粉末与固态合成机器人', level: 'TRL 4-6', note: '称量、混合、静电、团聚和炉体差异仍是工程瓶颈。' },
  { name: '在线 XRD / 光谱表征', level: 'TRL 5-7', note: '速度优势明显，但结构解释和多模态验证仍需要谨慎。' },
  { name: 'LLM 实验代理', level: 'TRL 3-5', note: '适合规划和编排，距离可靠自主科研仍有安全与验证距离。' },
  { name: '多中心 SDL 网络', level: 'TRL 3-5', note: '潜力大，但标准接口、数据协议和跨平台复现尚未稳定。' },
];

const DATABASES = [
  ['Materials Project', 'A-Lab 候选材料来源，DFT 结果与 API 生态成熟。'],
  ['AFLOW', '高通量计算数据库，适合大规模候选筛选与结构检索。'],
  ['Materials Cloud', '更偏开放数据与复现实验记录，适合结果发布与共享。'],
  ['Citrination', '材料信息学平台思路，可作为工业数据基础设施案例。'],
];

export default function FrontiersPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-10">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">SOTA/前沿（Frontiers）</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#f3f6fb] mb-4">
          2023-2025：材料 SDL 的爆发、修正与现实边界
        </h1>
        <p className="text-sm text-[#8a92a3] leading-7 max-w-3xl">
          读前沿系统时，最重要的不是记住系统名，而是判断它推进了哪一层能力，又在哪些环节仍依赖人类定义目标、
          审查证据和承担责任。本页按“系统事件 + 现实校验 + 技术成熟度”训练这种判断。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 mb-12">
        {FRONTIER_EVENTS.map((event) => (
          <Link key={event.title} to={event.route} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5 no-underline">
            <div className="text-[10px] text-[#00f5d4] font-mono mb-2">{event.year}</div>
            <h2 className="text-base font-semibold text-[#f3f6fb] mb-2">{event.title}</h2>
            <p className="text-xs text-[#8a92a3] leading-6 mb-3">{event.body}</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#00f5d4] font-mono">展开相关内容 <ArrowRight className="w-3 h-3" /></span>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] mb-12">
        <div className="glass-panel rounded-2xl border border-[rgba(245,158,11,0.16)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-[#f59e0b]" />
            <div className="text-[10px] text-[#f59e0b] font-mono tracking-[0.18em]">炒作曲线 vs 现实（Hype vs Reality）</div>
          </div>
          <h2 className="text-xl font-semibold text-[#f3f6fb] mb-4">前沿系统的价值在于暴露边界</h2>
          <div className="space-y-3">
            {REALITY_CHECKS.map(([axis, promise, risk]) => (
              <div key={axis} className="border-b border-[rgba(67,97,238,0.08)] pb-3">
                <div className="text-xs text-[#d0d4dc] font-semibold mb-1">{axis}</div>
                <p className="text-xs text-[#8a92a3] leading-6">{promise}；但{risk}。</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-5 h-5 text-[#00f5d4]" />
            <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em]">TRL 评估（Technology Readiness）</div>
          </div>
          <div className="space-y-3">
            {TRL_ITEMS.map((item) => (
              <div key={item.name} className="grid gap-2 sm:grid-cols-[1fr_90px] border-b border-[rgba(67,97,238,0.08)] pb-3">
                <div>
                  <div className="text-xs text-[#d0d4dc] font-semibold">{item.name}</div>
                  <div className="text-xs text-[#8a92a3] leading-6 mt-1">{item.note}</div>
                </div>
                <div className="text-[10px] text-[#00f5d4] font-mono sm:text-right">{item.level}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 mb-12">
        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
          <FlaskConical className="w-5 h-5 text-[#00f5d4] mb-3" />
          <h3 className="text-sm font-semibold text-[#f3f6fb] mb-2">“三快”适用性评估</h3>
          <p className="text-xs text-[#8a92a3] leading-6">合成快、表征快、分析快同时成立时，SDL 的收益最大；任何一环慢，闭环都会被拉长。</p>
        </div>
        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
          <ShieldCheck className="w-5 h-5 text-[#f59e0b] mb-3" />
          <h3 className="text-sm font-semibold text-[#f3f6fb] mb-2">负责任的 SDL</h3>
          <p className="text-xs text-[#8a92a3] leading-6">科学声明的责任仍在人类研究者。AI 生成、机器人执行和自动表征都不能替代透明报告。</p>
        </div>
        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
          <Sparkles className="w-5 h-5 text-[#7c7cff] mb-3" />
          <h3 className="text-sm font-semibold text-[#f3f6fb] mb-2">生成式 AI 的位置</h3>
          <p className="text-xs text-[#8a92a3] leading-6">生成模型适合扩展候选空间，但必须与数据库、物理约束和实验验证共同工作。</p>
        </div>
      </section>

      <section id="gno-me" className="glass-panel rounded-2xl border border-[rgba(0,245,212,0.14)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-[#00f5d4]" />
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em]">数据库（Databases）</div>
        </div>
        <h2 className="text-xl font-semibold text-[#f3f6fb] mb-4">数据库是 SDL 的知识地基</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {DATABASES.map(([name, note]) => (
            <div key={name} className="rounded-xl border border-[rgba(67,97,238,0.1)] p-4">
              <div className="text-sm font-semibold text-[#d0d4dc] mb-1">{name}</div>
              <p className="text-xs text-[#8a92a3] leading-6">{note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
