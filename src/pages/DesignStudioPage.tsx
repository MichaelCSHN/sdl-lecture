import { Link } from 'react-router';

const studioFields = [
  {
    name: '研究问题',
    prompt: '用一句不带“和”的话写清你的问题，明确你想解释、比较或优化的对象。',
  },
  {
    name: '目标与结果变量',
    prompt: '说明主要结果变量是什么，用什么仪器、什么单位、什么精度测量。',
  },
  {
    name: '因素与约束',
    prompt: '列出你真正打算操控的因素、必须固定的变量，以及不能突破的安全/成本边界。',
  },
  {
    name: '实验设计方案',
    prompt: '解释为什么是 OFAT、析因设计、RSM，还是更适合做小规模筛选后再闭环优化。',
  },
  {
    name: '执行与记录',
    prompt: '谁来随机化、谁来盲标、如何记录原始值、如何保证 SOP 被真正执行。',
  },
  {
    name: '数据与分析',
    prompt: '异常值规则、元数据结构、统计检验和敏感性分析计划要在采集前就写明。',
  },
  {
    name: '风险与验证',
    prompt: '指出最可能失败的步骤，并说明你如何用预实验、对照或独立重复验证关键结论。',
  },
  {
    name: '哪些判断必须由人完成',
    prompt: '明确哪些环节可以交给自动化，哪些环节仍需要实验者做机制判断与边界设定。',
  },
];

export default function DesignStudioPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">RESEARCH DESIGN STUDIO</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[#f3f6fb]">
          把自己的课题重写成一份可执行实验设计
        </h1>
        <p className="text-[#8a92a3] max-w-3xl leading-7 text-sm">
          这一页承接前面的 8 步实验工作流。
          它不是再讲一遍理论，而是把理论压缩成一张研究设计草案。目标不是“写得漂亮”，
          而是让你真正暴露问题：哪里还没有变量定义，哪里还没有对照，哪里只是口号式地说“想用 SDL”。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {studioFields.map((field, index) => (
          <div key={field.name} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-xl border border-[rgba(0,245,212,0.16)] bg-[rgba(0,245,212,0.08)] flex items-center justify-center text-[10px] font-mono text-[#00f5d4]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="text-base font-semibold text-[#d0d4dc]">{field.name}</h2>
            </div>
            <p className="text-xs text-[#8a92a3] leading-6 mb-4">{field.prompt}</p>
            <div className="rounded-xl border border-dashed border-[rgba(67,97,238,0.16)] bg-[rgba(255,255,255,0.01)] px-4 py-5 text-xs text-[#5a6377]">
              在这里写下你自己的版本
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
          <div className="text-[10px] text-[#fee440] font-mono tracking-[0.18em] mb-2">SELF-CHECK</div>
          <h2 className="text-lg font-semibold text-[#f3f6fb] mb-3">提交设计草案前先问自己</h2>
          <ul className="space-y-3">
            {[
              '如果把“AI”两个字删掉，这个设计本身是否仍然成立？',
              '如果结果不显著，我是否仍然知道该怎么解释、怎么报告？',
              '如果让另一个实验者按文档复现，他会不会在第 03 或第 05 步就卡住？',
              '我是否已经把最关键的偏差来源显式写出来，而不是默认“大家都懂”？',
              '这个问题到底需要 DOE、需要闭环优化，还是只需要更严谨的常规实验？',
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-7 text-[#8a92a3]">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#fee440] flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel rounded-2xl border border-[rgba(0,245,212,0.14)] p-5">
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">ROUTE MAP</div>
          <h2 className="text-lg font-semibold text-[#f3f6fb] mb-3">在站内继续往下走</h2>
          <div className="space-y-3">
            <Link
              to="/methods"
              className="block rounded-xl border border-[rgba(67,97,238,0.12)] px-4 py-4 no-underline hover:border-[#00f5d4] transition-colors"
            >
              <div className="text-sm font-semibold text-[#d0d4dc] mb-1">回到 8 步实验工作流</div>
              <div className="text-xs text-[#8a92a3] leading-6">
                如果你发现自己答不上来，就回到完整流程页面检查到底卡在哪一步。
              </div>
            </Link>
            <Link
              to="/foundations#doe-vs-sdl"
              className="block rounded-xl border border-[rgba(67,97,238,0.12)] px-4 py-4 no-underline hover:border-[#00f5d4] transition-colors"
            >
              <div className="text-sm font-semibold text-[#d0d4dc] mb-1">重看 DOE 与 SDL 的边界</div>
              <div className="text-xs text-[#8a92a3] leading-6">
                很多课题不是“缺一个算法”，而是还没完成实验设计与测量框架的收束。
              </div>
            </Link>
            <Link
              to="/resources"
              className="block rounded-xl border border-[rgba(67,97,238,0.12)] px-4 py-4 no-underline hover:border-[#00f5d4] transition-colors"
            >
              <div className="text-sm font-semibold text-[#d0d4dc] mb-1">进入阅读轨与资源库</div>
              <div className="text-xs text-[#8a92a3] leading-6">
                如果你想补某一段方法论背景，这页已经按主题和阶段整理好了入口。
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
