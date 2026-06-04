export default function DesignStudioPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#5a6377] font-mono text-xs tracking-widest mb-3">课程扩展</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[#d0d4dc]">研究设计工作室</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed text-sm mb-8">
        本模块为完整课程的扩展内容，不在本次讲座范围内。将提供结构化向导，
        帮助学生将个人研究课题转写为最小 SDL 设计草案。
      </p>

      <div className="glass-panel p-6 rounded-lg border border-[rgba(67,97,238,0.1)]">
        <div className="text-xs text-[#5a6377] font-mono mb-2">课程扩展 — 后续版本提供</div>
        <div className="space-y-3">
          {['目标（Objective）', '参数（Parameters）', '约束（Constraints）', '测量（Measurements）', '建议策略（Suggested Strategy）', '风险（Risks）', '需要人工判断（Human Judgment Needed）', '验证计划（Validation Plan）'].map((field) => (
            <div key={field} className="flex items-center gap-3 p-2 rounded border border-[rgba(67,97,238,0.05)]">
              <span className="text-xs text-[#8a92a3] font-mono w-48">{field}</span>
              <span className="text-[10px] text-[#5a6377]">后续版本提供</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-[#8a92a3] mt-6 leading-relaxed">
        本次讲座中，SDL 核心概念的「目标 / 约束 / 测量」小节（「基础」页面第 D 节）已覆盖研究设计的基本框架。
      </p>
    </div>
  );
}
