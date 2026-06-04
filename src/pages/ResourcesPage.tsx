export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#5a6377] font-mono text-xs tracking-widest mb-3">课程扩展</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[#d0d4dc]">资源与参考</h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed text-sm mb-8">
        本模块为完整课程的扩展内容，不在本次讲座范围内。将提供阅读路径、工具清单、
        基准案例目录、术语表和 MSE 实验目录学参考入口。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: '阅读路径', desc: '按主题组织的论文与教材推荐。后续版本提供。' },
          { title: '工具清单', desc: 'SDL 相关软件库、平台与硬件参考。后续版本提供。' },
          { title: '基准案例目录', desc: '标准 SDL benchmark 问题及其特征。后续版本提供。' },
          { title: '术语表', desc: 'SDL、DOE 和 MSE 实验相关关键术语。后续版本提供。' },
          { title: 'MSE 实验目录学参考', desc: '完整的 MSE 实验类型目录及定义。后续版本提供。' },
          { title: '外部参考链接', desc: '实验室、平台、相关课程链接汇总。后续版本提供。' },
        ].map((item) => (
          <div key={item.title} className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.08)]">
            <h3 className="text-sm font-semibold text-[#8a92a3] mb-1">{item.title}</h3>
            <p className="text-xs text-[#5a6377]">{item.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#8a92a3] mt-6 leading-relaxed">
        本次讲座的核心参考文献可在 A-Lab 案例档案页（第 05 节）找到，包括 Nature 2023 原论文 DOI 和 ChemRxiv 2024 再分析链接。
      </p>
    </div>
  );
}
