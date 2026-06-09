import { Link } from 'react-router';
import { ArrowRight, Bot, BrainCircuit, Database, FlaskConical, Network, Sparkles } from 'lucide-react';

const METHOD_GROUPS = [
  {
    title: '预测代理模型（Predictive Surrogates）',
    icon: BrainCircuit,
    accent: '#00f5d4',
    body: '用已有实验或计算数据预测未测条件下的响应，是 GP-BO 和多数 SDL 闭环的核心。',
    items: ['GP：小数据、低维、需要不确定度时首选。', 'Random Forest：抗噪声、表格数据稳健，但不确定度解释较弱。', 'GNN：晶体、分子和图结构输入，适合结构-性质预测。'],
  },
  {
    title: '生成模型（Generative Models）',
    icon: Sparkles,
    accent: '#f59e0b',
    body: '从“筛选已有候选”转向“生成新候选”，但生成结果仍必须接受物理约束、可合成性与实验验证。',
    items: ['扩散模型（Diffusion Model）：用于结构或谱图生成。', '变分自编码器（VAE）：把材料表示压缩到可搜索潜空间。', '生成候选不是发现，实验验证才是发现链条的一部分。'],
  },
  {
    title: 'LLM 代理（LLM Agents）',
    icon: Bot,
    accent: '#7c7cff',
    body: '把自然语言、文献、工具调用和实验规划连接起来，适合做编排层，但不应替代科学判断。',
    items: ['Coscientist：展示 LLM 多代理规划与实验执行的可能性。', 'ChemCrow / LLaMP：用专业工具减少纯 LLM 的幻觉。', '关键风险：安全边界、工具调用错误、不可复现推理链。'],
  },
  {
    title: '机器人与实验基础设施',
    icon: FlaskConical,
    accent: '#22c55e',
    body: 'SDL 的瓶颈常常不在算法，而在样品处理、仪器接口、数据留痕和异常恢复。',
    items: ['液体处理成熟度较高，粉末操控仍难。', '在线表征决定闭环速度，也决定误差传播速度。', 'LIMS / ELN / 元数据标准是闭环可复现的底层设施。'],
  },
];

const SELECTION_ROWS = [
  ['GP', '样本 < 500、参数 < 20、实验昂贵', '不确定度质量高；维度上升后吃力'],
  ['Random Forest', '噪声大、表格特征、快速基线', '稳健但后验解释不如 GP 清晰'],
  ['GNN', '晶体/分子/图结构性质预测', '需要高质量结构表示与较大数据'],
  ['Diffusion / VAE', '生成候选结构或配方空间', '生成结果必须经物理与实验筛查'],
  ['LLM Agent', '文献检索、工具编排、SOP 草拟', '不能替代目标定义和最终解释'],
];

const PIPELINE_STEPS = [
  '用数据库和文献限定候选空间',
  '用代理模型评估性能或成功概率',
  '用采集函数选择下一次实验',
  '用机器人和仪器执行并观测',
  '把结果、失败和元数据全部回写',
];

export default function AIMethodsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-10">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">AI/ML 方法全景（Method Landscape）</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#f3f6fb] mb-4">
          从 GP 到 LLM 代理：哪些 AI 方法真正进入了实验闭环
        </h1>
        <p className="text-sm text-[#8a92a3] leading-7 max-w-3xl">
          学习 AI/ML for SDL 时，不要先背算法名。先问每类方法在闭环中负责什么：预测、生成、决策、编排、
          执行还是数据留痕。再判断它是否适合你的样本量、变量维度、测量成本和验证条件。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 mb-12">
        {METHOD_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
              <div className="flex items-start gap-3 mb-3">
                <Icon className="w-5 h-5 flex-shrink-0" style={{ color: group.accent }} />
                <div>
                  <h2 className="text-base font-semibold text-[#f3f6fb]">{group.title}</h2>
                  <p className="text-xs text-[#8a92a3] leading-6 mt-1">{group.body}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-xs text-[#8a92a3] leading-6">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] mb-12">
        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-3">模型选择（Model Choice）</div>
          <h2 className="text-xl font-semibold text-[#f3f6fb] mb-4">不要先选算法，先判断任务条件</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(67,97,238,0.16)]">
                  <th className="text-left py-2.5 pr-3 text-[#8a92a3] font-mono">方法</th>
                  <th className="text-left py-2.5 pr-3 text-[#8a92a3] font-mono">适合场景</th>
                  <th className="text-left py-2.5 text-[#8a92a3] font-mono">边界</th>
                </tr>
              </thead>
              <tbody>
                {SELECTION_ROWS.map(([method, fit, limit]) => (
                  <tr key={method} className="border-b border-[rgba(67,97,238,0.07)]">
                    <td className="py-2.5 pr-3 text-[#d0d4dc] font-mono">{method}</td>
                    <td className="py-2.5 pr-3 text-[#8a92a3]">{fit}</td>
                    <td className="py-2.5 text-[#8a92a3]">{limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-[rgba(0,245,212,0.14)] p-5">
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-3">闭环位置（Loop Position）</div>
          <h2 className="text-xl font-semibold text-[#f3f6fb] mb-4">AI 方法必须落到实验链条里</h2>
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, index) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-6 flex-shrink-0 text-[10px] text-[#00f5d4] font-mono">{String(index + 1).padStart(2, '0')}</span>
                <p className="text-xs text-[#8a92a3] leading-6">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/sdl-demo" className="glass-panel rounded-2xl border border-[rgba(0,245,212,0.14)] p-5 no-underline">
          <BrainCircuit className="w-5 h-5 text-[#00f5d4] mb-3" />
          <h3 className="text-sm font-semibold text-[#f3f6fb] mb-2">去看 GP-BO 演示</h3>
          <p className="text-xs text-[#8a92a3] leading-6 mb-3">把 GP、EI、UCB、Pareto 的抽象概念放进可交互任务里。</p>
          <span className="inline-flex items-center gap-1 text-[10px] text-[#00f5d4] font-mono">进入演示 <ArrowRight className="w-3 h-3" /></span>
        </Link>
        <Link to="/frontiers" className="glass-panel rounded-2xl border border-[rgba(245,158,11,0.14)] p-5 no-underline">
          <Network className="w-5 h-5 text-[#f59e0b] mb-3" />
          <h3 className="text-sm font-semibold text-[#f3f6fb] mb-2">转到 SOTA/前沿</h3>
          <p className="text-xs text-[#8a92a3] leading-6 mb-3">看 A-Lab、GNoME、CAMEO、Coscientist 等系统如何落地。</p>
          <span className="inline-flex items-center gap-1 text-[10px] text-[#f59e0b] font-mono">查看前沿 <ArrowRight className="w-3 h-3" /></span>
        </Link>
        <Link to="/resources" className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.14)] p-5 no-underline">
          <Database className="w-5 h-5 text-[#7c7cff] mb-3" />
          <h3 className="text-sm font-semibold text-[#f3f6fb] mb-2">补阅读与工具</h3>
          <p className="text-xs text-[#8a92a3] leading-6 mb-3">从 BoTorch、Materials Project 到 HELAO，把方法落到工具链。</p>
          <span className="inline-flex items-center gap-1 text-[10px] text-[#7c7cff] font-mono">打开资源 <ArrowRight className="w-3 h-3" /></span>
        </Link>
      </section>
    </div>
  );
}
