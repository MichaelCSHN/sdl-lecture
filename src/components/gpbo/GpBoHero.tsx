import { Link } from 'react-router';

export default function GpBoHero() {
  return (
    <section className="mb-6 rounded-2xl border border-[rgba(67,97,238,0.16)] bg-[linear-gradient(135deg,rgba(6,22,42,0.96),rgba(3,11,24,0.92))] p-5 md:p-6">
      <div className="mb-3 text-xs font-mono tracking-[0.24em] text-[#00f5d4]">GP-BO 实验台（GP-BO Lab）</div>
      <div className="grid gap-5 lg:grid-cols-[1.55fr_0.95fr]">
        <div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#f3f6fb] md:text-3xl">
            高斯过程（Gaussian Process）与贝叶斯优化（Bayesian Optimization）
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[#8a92a3]">
            这是一个浏览器原生的教学实验台，用来理解高斯过程代理模型（GP surrogate）、不确定度（uncertainty）与采集函数（acquisition
            function）如何驱动单目标、线性组合与 Pareto 优化。目标不只是展示闭环本身，更要把“任务定义”显式呈现出来。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/foundations#interactive-af"
              className="rounded-full border border-[rgba(0,245,212,0.28)] px-3 py-1.5 text-[11px] font-mono text-[#00f5d4] transition-colors hover:bg-[rgba(0,245,212,0.08)]"
            >
              回到采集函数直觉模块
            </Link>
            <Link
              to="/case-studio"
              className="rounded-full border border-[rgba(67,97,238,0.24)] px-3 py-1.5 text-[11px] font-mono text-[#d0d4dc] transition-colors hover:border-[rgba(0,245,212,0.24)] hover:text-[#00f5d4]"
            >
              跳转到统一案例
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            {
              title: 'GP 直觉（GP Intuition）',
              body: '先验（prior）、后验（posterior）、噪声（noise）与置信带（confidence band）应当可以直接拖动和观察，而不应只停留在公式解释。',
            },
            {
              title: '决策逻辑（Decision Logic）',
              body: 'EI、PI 与 UCB 不应只是吐出一个候选点，而应解释“为什么下一个点移动到了这里”。',
            },
            {
              title: '任务家族（Task Families）',
              body: '同一套引擎应把单目标、标量化多目标与 Pareto 优化明确暴露为不同任务选择，而不是隐藏在实现细节里。',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[rgba(67,97,238,0.12)] bg-[rgba(255,255,255,0.02)] p-3"
            >
              <div className="mb-1 text-[11px] font-mono tracking-[0.08em] text-[#fee440]">{item.title}</div>
              <p className="text-[11px] leading-5 text-[#8a92a3]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
