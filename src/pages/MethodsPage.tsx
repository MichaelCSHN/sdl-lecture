import { Link } from 'react-router';
import ResearchWorkflowExplorer from '@/components/ResearchWorkflowExplorer';
import { researchWorkflowSteps } from '@/data/researchWorkflow';

const FAILURE_PATTERNS = [
  {
    title: '问题没有收敛',
    body: '目标、材料体系、性能指标和约束没有收紧，导致后面所有设计都只是在“泛泛探索”。',
  },
  {
    title: '变量与对照不清楚',
    body: '控制变量、干预变量、测量变量混在一起，最后无法判断结果来自材料本身、工艺条件还是批次差异。',
  },
  {
    title: 'SOP 与预实验缺位',
    body: '直接进入正式实验，忽略仪器稳定性、样品制备窗口、测量动态范围和失败模式摸底。',
  },
  {
    title: '数据与元数据事后补',
    body: '只保存最终数值，不记录原始谱图、时间戳、批次、仪器状态、失败样本和排除理由。',
  },
  {
    title: '只报告正结果',
    body: '把失败点、重复性和不确定度从叙事中删掉，导致结论看起来漂亮但无法复现或迁移。',
  },
];

export default function MethodsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <ResearchWorkflowExplorer
        steps={researchWorkflowSteps}
        eyebrow="研究工作流（Method Workflow）"
        title="实验研究工作流：从问题定义到解释与报告"
        intro="这不是给本科实验课背诵的流程图，也不是把 DOE 和统计学割裂开的检查清单。它是一条可以承载真实研究的工作流：每一步都对应一种常见失败方式，也都对应一类可以被 SDL、DOE 或自动化系统增强的决策节点。"
      />

      <div className="grid gap-4 md:grid-cols-3 mt-10">
        {[
          {
            title: '它和 DOE 的关系',
            body: 'DOE 主要嵌在第 02 到第 04 步之间，负责把问题转成可推断的设计结构；但如果没有前后的问题定义、数据管理和报告纪律，再好的 DOE 也会失效。',
          },
          {
            title: '它和 SDL 的关系',
            body: 'SDL 不是替代这 8 步，而是重写其中若干决策节点，尤其是 02、04、05、06、07 之间的闭环更新速度。',
          },
          {
            title: '它对 MSE 的意义',
            body: 'MSE 的实验往往跨越制备、表征、性能和失效分析，多步耦合比单次测量更常见，因此更需要把流程逻辑显式化。',
          },
        ].map((card) => (
          <div key={card.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
            <h2 className="text-sm font-semibold text-[#d0d4dc] mb-2">{card.title}</h2>
            <p className="text-xs text-[#8a92a3] leading-6">{card.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-[rgba(245,158,11,0.16)] bg-[rgba(245,158,11,0.04)] p-6">
        <div className="text-[10px] text-[#f59e0b] font-mono tracking-[0.18em] mb-2">失败点（Failure Patterns）</div>
        <h2 className="text-xl font-semibold text-[#f3f6fb] mb-3">做实验最常见的 5 个断点</h2>
        <p className="text-sm text-[#8a92a3] leading-7 mb-5 max-w-3xl">
          这 5 项是把 PPT 方法论迁移到真实课题时最容易暴露的问题。它们不是额外要求，而是 8 步工作流为什么必须存在的原因。
        </p>
        <div className="grid gap-3 md:grid-cols-5">
          {FAILURE_PATTERNS.map((item, index) => (
            <div key={item.title} className="rounded-xl border border-[rgba(245,158,11,0.12)] bg-[rgba(6,22,42,0.55)] p-4">
              <div className="text-[10px] text-[#f59e0b] font-mono mb-2">{`0${index + 1}`}</div>
              <h3 className="text-sm font-semibold text-[#f3f6fb] mb-2">{item.title}</h3>
              <p className="text-xs text-[#8a92a3] leading-6">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="glass-panel rounded-2xl border border-[rgba(0,245,212,0.14)] p-5 mt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">下一步（Next Step）</div>
            <h2 className="text-lg font-semibold text-[#f3f6fb] mb-1">把这条工作流应用到你自己的课题</h2>
            <p className="text-xs text-[#8a92a3] leading-6 max-w-2xl">
              如果你已经能看懂这 8 步，下一步就不是背诵，而是把自己的研究问题按同样结构重写一遍。
            </p>
          </div>
          <Link
            to="/design-studio"
            className="inline-flex items-center justify-center rounded-xl border border-[rgba(0,245,212,0.18)] bg-[rgba(0,245,212,0.08)] px-4 py-3 text-sm font-mono text-[#00f5d4] no-underline hover:bg-[rgba(0,245,212,0.12)] transition-colors"
          >
            进入研究设计工作室（Research Design Studio） →
          </Link>
        </div>
      </div>
    </div>
  );
}
