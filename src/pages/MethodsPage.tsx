import { Link } from 'react-router';
import ResearchWorkflowExplorer from '@/components/ResearchWorkflowExplorer';
import { researchWorkflowSteps } from '@/data/researchWorkflow';

export default function MethodsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <ResearchWorkflowExplorer
        steps={researchWorkflowSteps}
        eyebrow="METHOD WORKFLOW"
        title="实验研究工作流：从问题定义到解释与报告"
        intro={
          '这不是给本科实验课的流程图，也不是把 DOE 和统计学割裂开的 checklist。' +
          '它是一条可以承载真实研究的工作流：每一步都对应一种常见失败方式，也都对应一类可以被 SDL、DOE 或自动化系统增强的决策节点。'
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mt-10">
        {[
          {
            title: '它和 DOE 的关系',
            body: 'DOE 主要嵌在第 02 到第 04 步之间，负责把问题转成可推断的设计结构；但没有前后的问题定义、数据管理和报告纪律，再好的 DOE 也会失效。',
          },
          {
            title: '它和 SDL 的关系',
            body: 'SDL 不是替代这 8 步，而是重写其中的若干决策节点，尤其是 02、04、05、06、07 之间的闭环更新速度。',
          },
          {
            title: '它对 MSE 的意义',
            body: 'MSE 的实验往往跨越制备、表征、性能和失效分析，多步骤耦合比单次测量更常见，因此更需要把流程逻辑显式化。',
          },
        ].map((card) => (
          <div key={card.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
            <h2 className="text-sm font-semibold text-[#d0d4dc] mb-2">{card.title}</h2>
            <p className="text-xs text-[#8a92a3] leading-6">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl border border-[rgba(0,245,212,0.14)] p-5 mt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">NEXT STEP</div>
            <h2 className="text-lg font-semibold text-[#f3f6fb] mb-1">把这条流程应用到你自己的课题</h2>
            <p className="text-xs text-[#8a92a3] leading-6 max-w-2xl">
              如果你已经能看懂这 8 步，下一步不是背诵，而是把自己的研究问题按同样结构重写一遍。
            </p>
          </div>
          <Link
            to="/design-studio"
            className="inline-flex items-center justify-center rounded-xl border border-[rgba(0,245,212,0.18)] bg-[rgba(0,245,212,0.08)] px-4 py-3 text-sm font-mono text-[#00f5d4] no-underline hover:bg-[rgba(0,245,212,0.12)] transition-colors"
          >
            进入 Research Design Studio →
          </Link>
        </div>
      </div>
    </div>
  );
}
