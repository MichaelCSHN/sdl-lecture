export default function MethodsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#5a6377] font-mono text-xs tracking-widest mb-3">课程扩展</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[#d0d4dc]">方法实验室</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed text-sm mb-8">
        本模块为完整课程的扩展内容，不在本次讲座范围内。将提供 DOE 方法对比、
        贝叶斯优化采集函数对比、探索与利用权衡以及噪声影响的交互式方法比较。
      </p>

      <div className="glass-panel p-6 rounded-lg border border-[rgba(67,97,238,0.1)]">
        <div className="text-xs text-[#5a6377] font-mono mb-2">课程扩展 — 后续版本提供</div>
        <p className="text-xs text-[#8a92a3] leading-relaxed">
          方法实验室将提供以下交互内容：全因子设计、部分因子设计、拉丁超立方和 Sobol 序列的对比；
          Expected Improvement、Upper Confidence Bound 和 Thompson Sampling 在不同噪声条件下的收敛表现；
          Pareto 前沿可视化用于多目标优化场景。
        </p>
      </div>

      <p className="text-[10px] text-[#8a92a3] mt-6 leading-relaxed">
        本次讲座中，DOE 与 SDL 的方法对比请参阅「基础」页面的第 C 节：实验设计（DOE）与 SDL——连续性，不是替代。
      </p>
    </div>
  );
}
