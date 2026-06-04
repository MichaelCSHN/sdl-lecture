import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { experimentTimeline, type TimelineEvent } from '@/data/experiment_timeline';

// ============================================================
// Scroll-to-hash on mount (fixes react-router hash navigation)
// ============================================================

function useHashScroll() {
  const location = useLocation();
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      // Delay to let React render the DOM first
      const tryScroll = () => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      // Multiple attempts: React may not have rendered yet on first load
      setTimeout(tryScroll, 80);
      setTimeout(tryScroll, 300);
      setTimeout(tryScroll, 600);
    }
  }, [location.hash]);
}

// ============================================================
// Constants
// ============================================================

const CATEGORY_COLORS: Record<string, string> = {
  observation: '#8a92a3',
  methodology: '#00f5d4',
  institution: '#4361ee',
  technology: '#fee440',
  paradigm: '#ff6b6b',
};

const CATEGORY_LABELS: Record<string, string> = {
  observation: '观察',
  methodology: '方法论',
  institution: '机构',
  technology: '技术',
  paradigm: '范式',
};

const TAXONOMY_CATEGORIES = [
  {
    name: '合成实验',
    definition: '通过物理或化学过程，在受控条件下制备目标材料样品。',
    typicalQuestion: '如何以指定组成、结构和形态获得目标材料？',
    representative: '固相反应、溶胶-凝胶、水热/溶剂热合成、CVD、PVD、共沉淀、熔融法',
    dataType: '温度曲线、反应时间、前驱体配比、气氛参数、产率',
    sdlRelation: 'SDl 可自动执行合成条件搜索；多步合成路径规划仍是开放挑战。合成是 SDL 闭环中"执行"环节的核心。',
  },
  {
    name: '加工与调控实验',
    definition: '对合成后的材料进行物理加工或后处理，以调控微观组织或宏观形态。',
    typicalQuestion: '如何通过热处理、变形或表面处理获得目标微观结构和性能？',
    representative: '退火、淬火、回火、热压、轧制、表面涂层、离子注入',
    dataType: '温度-时间曲线、冷却速率、变形量、表面粗糙度',
    sdlRelation: '退火和热处理参数优化是 SDL 最直接适用的场景之一；微观组织演化预测需要与相场或晶体塑性模型耦合。',
  },
  {
    name: '成分与结构表征实验',
    definition: '确定材料的元素组成、晶体结构、微观形貌和化学状态。',
    typicalQuestion: '这个材料是什么？组成、结构、形貌是怎样的？',
    representative: 'XRD、SEM、TEM、AFM、XPS、Raman、NMR、FTIR、EDS、EELS',
    dataType: '衍射图谱、显微图像、光谱、元素映射、晶格参数',
    sdlRelation: '自动 XRD 是 A-Lab 闭环的关键环节；ML 辅助谱图解析使高通量表征成为可能；自动 SEM/EDS 正在快速发展。',
  },
  {
    name: '物性测量实验',
    definition: '在受控条件下测量材料的物理性质（力学、电学、热学、磁学、光学等）。',
    typicalQuestion: '这个材料的具体性能参数是多少？它们如何随温度、频率或环境变化？',
    representative: '电导率/阻抗谱、应力-应变测试、DSC/TGA、SQUID/VSM、紫外-可见光谱、荧光光谱',
    dataType: '性能-温度/频率曲线、数值指标、各向异性数据',
    sdlRelation: '性能测量通常是 SDL 的目标函数来源；自动化电学和光学测量已较成熟；力学测试自动化仍在发展中。',
  },
  {
    name: '功能与器件性能实验',
    definition: '在接近实际应用条件下，评价材料或器件的综合性能。',
    typicalQuestion: '这个材料在器件中的真实表现如何？能否满足工程指标？',
    representative: '电池充放电循环、催化活性测试、光伏 I-V 曲线、传感器响应、忆阻器开关',
    dataType: '循环曲线、效率数据、寿命数据、响应时间',
    sdlRelation: '器件性能测试的自动化程度差异大；电池测试的 SDL 应用较成熟；催化高通量筛选已有多个成功案例。',
  },
  {
    name: '稳定性与失效实验',
    definition: '评价材料在长期使用、极端环境或加速老化条件下的稳定性与失效模式。',
    typicalQuestion: '这个材料能用多久？在什么条件下会失效？失效模式是什么？',
    representative: '加速老化、热循环、湿热测试、盐雾腐蚀、疲劳测试、蠕变测试',
    dataType: '寿命曲线、失效时间、退化速率、失效模式分类',
    sdlRelation: '长期稳定性测试的时间尺度挑战是 SDL 的核心难题之一；加速老化的 SDL 加速策略正在探索中。',
  },
  {
    name: '计量与校准实验',
    definition: '确保测量结果的准确性、可追溯性和可比性。包括仪器校准、标准物质验证和实验室间比对。',
    typicalQuestion: '我的测量结果可信吗？不同实验室的结果是否可比？',
    representative: '标准参考物质（SRM）验证、仪器校准、实验室间比对、不确定度评估',
    dataType: '校准曲线、不确定度预算、比对报告',
    sdlRelation: 'SDL 产生的大量数据需要自动化的质量控制；校准漂移的自动检测和补偿是 SDL 稳健运行的关键保障。',
  },
  {
    name: '高通量与闭环实验',
    definition: '以高通量方式并行执行大量实验，或在闭环自治模式下由算法决策实验序列。',
    typicalQuestion: '如何以最高效率探索巨大的参数空间？如何在无人干预下持续优化？',
    representative: '组合材料芯片、并行合成、高通量 XRD、自动化实验平台、闭环 SDL',
    dataType: '多维参数-性能矩阵、实验序列日志、模型更新历史',
    sdlRelation: '这是 SDL 的直接载体。高通量提供数据量，闭环提供自适应智能。两者结合构成 SDL 的完整实现形态。',
  },
];

// ============================================================
// Page
// ============================================================

export default function FoundationsPage() {
  useHashScroll();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filteredTimeline = activeCategory
    ? experimentTimeline.filter((e) => e.category === activeCategory)
    : experimentTimeline;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">基础知识</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        基础：实验中心的材料科学
      </h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed mb-10 text-sm">
        在讨论自驱动实验室之前，我们需要回答两个根本问题：<strong>实验是什么？</strong>以及<strong>材料科学中有哪些类型的实验？</strong>
      </p>

      {/* ================================================================ */}
      {/* Section A: 科学范式演化 + 实验的角色 */}
      {/* ================================================================ */}

      <div className="mb-16" id="sec-experiment-history">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#fee440] font-mono tracking-wider">A</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">范式演化：从观察到自治实验</h2>
        </div>

        {/* 范式演化概览 */}
        <div className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.1)] mb-8">
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-4">
            科学研究的知识生产方式经历了数次根本性转变。理解这一演化脉络，是理解 SDL 为何出现在
            今天——以及它改变了什么、没改变什么——的前提。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { era: '古代–16 世纪', paradigm: '经验观察', feature: '以感官观察和思辨理解自然。实验是零散的、非系统的。知识来自权威和归纳。' },
              { era: '17–19 世纪', paradigm: '理论科学', feature: '系统实验方法确立。数学与实验结合。可重复、可验证成为科学标准。实验室成为制度化场所。' },
              { era: '20 世纪中后期', paradigm: '计算科学', feature: '数值模拟成为"第三范式"。DFT、分子动力学、有限元等使预测成为可能。计算与实验互补。' },
              { era: '21 世纪–现在', paradigm: '数据密集 + AI 自治', feature: '高通量产生海量数据。ML 从数据中学习模式。SDL 将实验设计、执行和决策闭环自动化。' },
            ].map((p) => (
              <div key={p.paradigm} className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
                <div className="text-[10px] text-[#00f5d4] font-mono mb-1">{p.era}</div>
                <div className="text-xs text-[#d0d4dc] font-semibold mb-1">{p.paradigm}</div>
                <div className="text-[10px] text-[#8a92a3] leading-relaxed">{p.feature}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#8a92a3] mt-4 leading-relaxed">
            关键转变不在"旧方法被淘汰"，而在<strong>知识生产方式的层次叠加</strong>。SDL 不是替代实验，
            而是将实验设计、执行和数据分析的<strong>决策权</strong>部分移交给算法——但实验本身仍然是
            知识生产的最终检验环节。
          </p>
        </div>

        {/* 实验的角色 */}
        <div className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.1)] mb-8">
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-3">实验在 MSE 中的六重角色</h3>
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
            实验不是理论的附庸或计算的验证工具。在材料科学中，实验承担着不可替代的六种功能：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { role: '发现', desc: '新相、新结构、新现象的主要来源。大多数材料发现始于实验观察——孟德列夫周期表和石墨烯都来自实验，不是计算。' },
              { role: '制备', desc: '将理论设计转化为实际样品。合成的可重复性和可放大性是工程化的基础——没有实验制备，就没有后续一切。' },
              { role: '表征', desc: '确定"我们做了什么"。组成、结构、形貌——表征是将材料从假想变为实物后的身份确认。' },
              { role: '测量', desc: '量化材料在特定条件下的行为。性能数据是理论与应用之间的桥梁——没有测量就没有工程。' },
              { role: '评价', desc: '判断材料是否满足需求。性能是否达标？寿命是否足够？评价决定了材料能否从实验室走向应用。' },
              { role: '纠错', desc: '发现理论预测与测量结果的偏差。异常结果常常是重要发现的起点。实验是理论自我修正的最后防线。' },
            ].map((item) => (
              <div key={item.role} className="p-3 rounded border border-[rgba(67,97,238,0.06)]">
                <div className="text-xs text-[#d0d4dc] font-semibold mb-1">{item.role}</div>
                <div className="text-[10px] text-[#8a92a3] leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 实验史时间轴 */}
        <h3 className="text-sm font-semibold text-[#d0d4dc] mb-4">实验史时间轴</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
              activeCategory === null
                ? 'border-[#00f5d4] text-[#00f5d4]'
                : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
            }`}
          >
            全部
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all flex items-center gap-1.5 ${
                activeCategory === key
                  ? 'border-[#00f5d4] text-[#00f5d4]'
                  : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[key] }} />
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[rgba(67,97,238,0.15)]" />
          <div className="space-y-1">
            {filteredTimeline.map((event: TimelineEvent) => (
              <div key={event.year + event.labelEn} className="relative pl-12 py-3 group">
                <span
                  className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full border-2 border-[#000d1d]"
                  style={{ background: CATEGORY_COLORS[event.category] }}
                />
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs font-mono text-[#00f5d4] w-20 flex-shrink-0">{event.year}</span>
                  <span className="text-sm font-medium text-[#d0d4dc]">{event.label}</span>
                  <span className="text-[10px] text-[#8a92a3]">{event.labelEn}</span>
                </div>
                <p className="text-xs text-[#8a92a3] mt-1 leading-relaxed max-w-2xl">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Section B: MSE 实验图谱与目录学 */}
      {/* ================================================================ */}

      <div className="mb-16" id="sec-taxonomy">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">B</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">MSE 实验图谱与目录学</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-6 max-w-2xl">
          以实验目的（而非材料类别）为组织框架，将 MSE 实验分为八大类。
          这种分类法本身就是本课程的核心原创资产，帮助学生建立"实验视角"而非"材料视角"。
        </p>

        <div className="space-y-4">
          {TAXONOMY_CATEGORIES.map((cat) => (
            <details key={cat.name} className="glass-panel rounded-lg border border-[rgba(67,97,238,0.1)] group">
              <summary className="p-4 cursor-pointer hover:bg-[rgba(67,97,238,0.03)] transition-colors list-none">
                <div className="flex items-center gap-3">
                  <span className="text-[#00f5d4] font-mono text-[10px] transition-transform group-open:rotate-90">▶</span>
                  <span className="text-sm font-semibold text-[#d0d4dc]">{cat.name}</span>
                  <span className="text-[10px] text-[#8a92a3] hidden sm:inline">{cat.definition}</span>
                </div>
              </summary>
              <div className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                    <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">典型问题</div>
                    <div className="text-xs text-[#d0d4dc]">{cat.typicalQuestion}</div>
                  </div>
                  <div className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                    <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">代表性实验</div>
                    <div className="text-xs text-[#d0d4dc]">{cat.representative}</div>
                  </div>
                  <div className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                    <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">输出数据形态</div>
                    <div className="text-xs text-[#d0d4dc]">{cat.dataType}</div>
                  </div>
                  <div className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                    <div className="text-[10px] text-[#00f5d4] font-mono mb-0.5">与 SDL 的关系</div>
                    <div className="text-xs text-[#8a92a3] leading-relaxed">{cat.sdlRelation}</div>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* Section C: DOE vs SDL — 连续性，不是替代 */}
      {/* ================================================================ */}

      <div className="mb-16" id="doe-vs-sdl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#4361ee] font-mono tracking-wider">C</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">实验设计（DOE）与 SDL：连续性，不是替代</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-6 max-w-3xl">
          本课程的核心立场是：SDL 不是 DOE 的"高级替代品"，而是实验方法论在新技术条件下的
          <strong>连续演化</strong>。理解 DOE 的逻辑和边界，是理解 SDL 为何如此设计的前提。
        </p>

        {/* DOE 解决什么 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">DOE 解决什么</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
              DOE 的核心问题是：给定有限资源，如何<strong>策略性选择</strong>实验点，以最大化信息获取？
            </p>
            <ul className="text-xs text-[#8a92a3] space-y-1 list-disc list-inside">
              <li>识别哪些因子对响应有显著影响（筛选）</li>
              <li>量化因子间的交互作用</li>
              <li>用最少的实验次数建立响应面模型</li>
              <li>保证统计推断的有效性（随机化、重复、区组）</li>
            </ul>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">DOE 的边界</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
              DOE 假设你知道哪些因子重要。对于探索性实验，这个假设常常不成立。
            </p>
            <ul className="text-xs text-[#8a92a3] space-y-1 list-disc list-inside">
              <li>维数灾难：全因子实验点数随因子数指数增长</li>
              <li>设计固定：实验计划在数据收集前完全确定，无法自适应调整</li>
              <li>对多峰、非平滑响应面缺乏处理能力</li>
              <li>无法表达"我们不知道什么"——即不确定度不是核心输出</li>
            </ul>
          </div>
        </div>

        {/* 对比表 */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(67,97,238,0.15)]">
                <th className="text-left py-2.5 px-3 text-[#8a92a3] font-mono text-[10px]">维度</th>
                <th className="text-left py-2.5 px-3 text-[#8a92a3] font-mono text-[10px]">试错法</th>
                <th className="text-left py-2.5 px-3 text-[#8a92a3] font-mono text-[10px]">DOE</th>
                <th className="text-left py-2.5 px-3 text-[#00f5d4] font-mono text-[10px]">SDL</th>
              </tr>
            </thead>
            <tbody className="text-[#8a92a3]">
              {[
                ['策略', '直觉驱动', '统计设计', '模型驱动，自适应'],
                ['数据效率', '低', '中（预设设计）', '高（针对性采样）'],
                ['参数空间', '窄（1–3 个因子）', '中等（3–8 个因子）', '可处理高维空间'],
                ['不确定度处理', '隐式 / 忽略', 'ANOVA、残差分析', '显式（GP 后验方差）'],
                ['迭代速度', '慢（人在环中）', '中等（批次）', '快（完全闭环）'],
                ['最适合', '早期探索', '筛选与主效应估计', '复杂、昂贵实验'],
                ['关键局限', '无统计保证', '维数灾难、设计固定', '需要合理的先验和准确测量'],
              ].map(([dim, trial, doe, sdl]) => (
                <tr key={dim} className="border-b border-[rgba(67,97,238,0.06)]">
                  <td className="py-2.5 px-3 text-[#d0d4dc] font-semibold text-[11px]">{dim}</td>
                  <td className="py-2.5 px-3 text-[12px]">{trial}</td>
                  <td className="py-2.5 px-3 text-[12px]">{doe}</td>
                  <td className="py-2.5 px-3 text-[#d0d4dc] text-[12px]">{sdl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 为什么 SDL 不是简单"更高级 DOE" */}
        <div className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.1)]">
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-3">
            为什么 SDL 不只是"更高级的 DOE"
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: '决策方式不同', desc: 'DOE 在设计阶段一次性确定所有实验点。SDL 每步实验后更新模型，重新决定下一步——这是"学习"和"执行计划"的本质区别。' },
              { title: '信息对象不同', desc: 'DOE 关注因子效应的统计显著性。SDL 关注代理模型在参数空间中的不确定度分布——即明确回答"我们哪里还不确定"。' },
              { title: '工程复杂度不同', desc: 'SDL 需要物理自动化（机器人、仪表）和计算自动化（模型更新、推荐生成）的深度耦合。DOE 可以完全手算。' },
            ].map((item) => (
              <div key={item.title} className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
                <div className="text-xs text-[#d0d4dc] font-semibold mb-1">{item.title}</div>
                <div className="text-[10px] text-[#8a92a3] leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Section D: SDL 核心概念 */}
      {/* ================================================================ */}

      <div id="sec-sdl-concepts">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#f59e0b] font-mono tracking-wider">D</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">SDL 核心概念</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-6 max-w-2xl">
          以下六个概念构成了理解 SDL 闭环的基础。不需要深数学推导，但研究生应当能够解释每个概念
          <strong>解决什么问题</strong>以及<strong>它在闭环中的位置</strong>。
        </p>

        {/* 四个核心 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            {
              title: '代理模型（Surrogate Model）',
              problem: '实验很昂贵，无法在每个可能条件下都做实验。需要一种"廉价近似"。',
              concept: '高斯过程（Gaussian Process, GP）是最常用的代理模型。它不直接给出一个函数值，而是给出一个<strong>概率分布</strong>——在参数空间的每一点，既预测结果，也给出对预测的不确定度。',
              place: '在闭环中，代理模型是"知识"的载体——它记住了所有已做实验的结果，并推断未做实验的地方可能是什么样子。',
            },
            {
              title: '不确定度（Uncertainty）',
              problem: '预测值本身不足以做决策。我们需要知道预测有多可靠。',
              concept: 'GP 的后验方差告诉我们：模型在这个区域有多不确定。数据稠密的区域方差低（模型很确定），数据稀疏的区域方差高（模型不知道）。不确定度是<strong>探索驱动力</strong>。',
              place: '采集函数的输入之一。高不确定度 = 有可能值得去探索——即使预测值不高。',
            },
            {
              title: '采集函数（Acquisition Function）',
              problem: '有了预测值和不确定度后，如何选择下一个实验点？',
              concept: '采集函数将"好"量化为一个可优化的标量。Expected Improvement (EI) 是最常用的：它计算在每一点做实验后，有多大可能以及多大程度改进当前最佳结果。EI 自动平衡：预测好且确定 → 利用；不确定度高 → 探索。',
              place: '采集函数是"决策者"。它接收代理模型的预测和不确定度，输出"下一步去哪"。',
            },
            {
              title: '闭环（Closed Loop）',
              problem: '如何将建模、决策、执行和评估自动化地连成一体？',
              concept: '闭环 = 推荐下一个实验点 → 执行实验 → 获得观测 → 更新代理模型 → 重新推荐。每一轮迭代都是"从数据中学习，用学习指导下一步"。关键是<strong>闭环速度</strong>：传统 DOE 的一个循环可能以周/月计，SDL 的理想循环以小时/分钟计。',
              place: '闭环是 SDL 的顶层组织逻辑。代理模型、不确定度和采集函数都是闭环的组件，而非独立的算法。',
            },
          ].map((concept) => (
            <div key={concept.title} className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
              <h3 className="text-sm font-semibold text-[#00f5d4] mb-2">{concept.title}</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">解决的问题</div>
                  <div className="text-xs text-[#d0d4dc]">{concept.problem}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">核心思想</div>
                  <div className="text-xs text-[#8a92a3] leading-relaxed" dangerouslySetInnerHTML={{ __html: concept.concept }} />
                </div>
                <div>
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">闭环中的位置</div>
                  <div className="text-xs text-[#8a92a3] leading-relaxed" dangerouslySetInnerHTML={{ __html: concept.place }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 额外两个概念 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">人在环路中（Human-in-the-Loop）</h3>
            <div className="space-y-2 text-xs text-[#8a92a3] leading-relaxed">
              <p>SDL 不是"无人"实验室——至少在可预见的未来不是。人在 SDL 闭环中的角色从<strong>执行者</strong>
                转变为<strong>设计者、监督者和仲裁者</strong>。</p>
              <p>具体职责包括：定义研究目标和约束条件、选择参数空间和测量指标、判断推荐是否合理、
                识别异常结果并决定是否干预、最终解释和验证发现。</p>
              <p>本课程强调<strong>拥抱 AI 但也质疑 AI</strong>：工具越强大，人对目标设定和结果验证的责任就越大。</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">目标 / 约束 / 测量</h3>
            <div className="space-y-2 text-xs text-[#8a92a3] leading-relaxed">
              <p>任何 SDL 任务都可以分解为三个定义：</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>目标（Objective）</strong>：我们优化什么？产率最大化？颜色距离最小化？导电率最大化？目标定义了"好"是什么。</li>
                <li><strong>约束（Constraint）</strong>：什么不能违反？温度上限、预算、安全限制。约束定义了搜索空间的合法区域。</li>
                <li><strong>测量（Measurement）</strong>：如何评估结果？什么仪器、什么精度、什么频率？测量决定了观测的可靠性——这是 SDL 中最容易被低估的环节。</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#8a92a3] mt-6 leading-relaxed">
          以上内容的数学推导和完整方法对比将在完整课程的方法论模块中展开。本次讲座聚焦于"理解每个概念解决什么问题、
          在闭环中扮演什么角色"——这是研究生能够批判性阅读 SDL 文献所需的最小概念工具。
        </p>
      </div>
    </div>
  );
}
