import { useState } from 'react';
import { ExternalLink, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import CircularCarousel from '@/components/CircularCarousel';

/**
 * A-Lab 案例档案
 *
 * 来源：
 * - Szymanski et al., Nature 624, 86–91 (2023). DOI: 10.1038/s41586-023-06734-w
 * - Leeman, Palgrave, Schoop et al., ChemRxiv (2024). DOI: 10.26434/chemrxiv-2024-5p9j4
 * - Chemistry World (2024)
 * - C&EN (Jan 2026)
 */

// ============================================================
// 论文原始数据
// ============================================================

const PAPER = {
  citation: 'Szymanski NJ, Rendy B, Fei Y, et al. Nature 624, 86–91 (2023).',
  doi: '10.1038/s41586-023-06734-w',
  durationDays: 17,
  targetsAttempted: 58,
  claimedSuccesses: 41,
  claimedSuccessRatePct: 71,
  totalExperiments: 355,
  elementsCovered: 33,
  perRecipeSuccessPct: 37,
  furnaceTemp: '600–1000 °C',
};

// ============================================================
// 争议与修正
// ============================================================

const REANALYSIS = {
  ref: 'Leeman, Palgrave, Schoop et al., ChemRxiv (2024).',
  doi: '10.26434/chemrxiv-2024-5p9j4',
  chemistryWorldUrl: 'https://www.chemistryworld.com/news/new-analysis-raises-doubts-over-autonomous-labs-materials-discoveries/4018791.article',
  issues: [
    {
      label: '成分无序被忽略',
      detail: 'AI 将所有结构视为完全有序。约三分之二的"新"化合物是有序化的已知无序相变体——不是真正的新材料。',
    },
    {
      label: 'AI 驱动的 Rietveld 精修不可靠',
      detail: '独立评审认为自动 XRD 分析无法可靠区分纯相与混合相。有经验的研究人员对同一数据得出了不同结论。',
    },
    {
      label: '掺杂/替换被误判为新化合物',
      detail: 'AI 将掺杂或替换变体视为全新化合物，因为它没有考虑位点混合保持了晶体结构不变。',
    },
  ],
  communityResponse:
    'Ceder 团队欢迎审查，公开了完整实验日志和原始数据。Nature 随后发表了勘误（C&EN, 2026 年 1 月报道）。多中心复现研究正在进行中。[注意：具体多中心研究的规模和结果尚未在同行评审文献中公开，此处基于 C&EN 报道。]',
};

// ============================================================
// 可展开的争议详解面板
// ============================================================

function ValidationPanel() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-4 p-5 border-l-2 border-[#f59e0b]" style={{ background: 'rgba(6,22,42,0.6)' }}>
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full text-left">
        <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0" />
        <h4 className="text-sm font-mono text-[#f59e0b]">争议详情</h4>
        <span className="ml-auto text-[10px] text-[#8a92a3] font-mono">
          {expanded ? '收起' : '展开'}
        </span>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-[#8a92a3]" />
          : <ChevronRight className="w-4 h-4 text-[#8a92a3]" />
        }
      </button>

      <p className="text-xs text-[#8a92a3] leading-relaxed mt-2">
        2024 年初，Palgrave（University College London / 伦敦大学学院）和 Schoop（Princeton / 普林斯顿大学）合作的独立团队
        在 ChemRxiv 上发表了再分析，认为 A-Lab 的声称无法在更严格的专家审查下得到验证。
        Nature 论文随后被勘误（C&EN, 2026 年 1 月报道）。这一过程本身不是科学丑闻——它是科学自我纠正的正常运作。
      </p>

      <div className="mt-2">
        <a href={REANALYSIS.chemistryWorldUrl} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-[#f59e0b] font-mono hover:underline inline-flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Chemistry World 报道 →
        </a>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[rgba(245,158,11,0.15)] space-y-3">
          {REANALYSIS.issues.map((item) => (
            <div key={item.label}>
              <div className="text-[10px] text-[#f59e0b] font-mono mb-1">{item.label}</div>
              <p className="text-xs text-[#8a92a3] leading-relaxed">{item.detail}</p>
            </div>
          ))}
          <div>
            <div className="text-[10px] text-[#f59e0b] font-mono mb-1">社群回应</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">{REANALYSIS.communityResponse}</p>
          </div>
          <div className="text-[10px] text-[#8a92a3] font-mono">
            参考：{REANALYSIS.ref} DOI: {REANALYSIS.doi}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 页面
// ============================================================

export default function ALabPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">案例档案</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-1">
        A-Lab：一个自治材料实验室
      </h1>
      <p className="text-sm text-[#8a92a3] mb-8">
        {PAPER.citation}{' '}
        <a href={`https://doi.org/${PAPER.doi}`} target="_blank" rel="noopener noreferrer"
          className="text-[#00f5d4] hover:underline inline-flex items-center gap-1 text-xs">
          DOI: {PAPER.doi} <ExternalLink className="w-3 h-3" />
        </a>
      </p>

      {/* ================================================================ */}
      {/* 01 — A-Lab 是什么 */}
      {/* ================================================================ */}
      <section className="mb-14" id="what">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">01</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">A-Lab 是什么</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          A-Lab（Autonomous Laboratory）是由 Lawrence Berkeley National Laboratory（劳伦斯伯克利国家实验室，
          LBNL）和 University of California, Berkeley（加州大学伯克利分校）的 Gerbrand Ceder（杨振宁）课题组
          主导开发的一个自治材料合成平台。其核心论文发表于 {PAPER.citation.split('.')[0]}。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <div className="text-[10px] text-[#00f5d4] font-mono mb-1">目标</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              [论文声称] 在无需每步人工干预的情况下，自主合成新的无机固态材料。
              系统自行选择目标、生成合成配方、执行实验并解读结果。
            </p>
          </div>
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <div className="text-[10px] text-[#00f5d4] font-mono mb-1">范围</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              [论文声称] 三元氧化物和磷酸盐空间。从 Materials Project（材料计划）数据库中约 42,000 个热力学稳定的
              化合物中筛选出 58 个目标——筛选标准包括空气稳定性、前驱体可得性和安全性。
            </p>
          </div>
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <div className="text-[10px] text-[#00f5d4] font-mono mb-1">评价指标</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              [论文声称] 成功 = 目标晶相经自动 XRD 与 ML 解析确认。
              声称成功率 {PAPER.claimedSuccessRatePct}%（{PAPER.claimedSuccesses}/{PAPER.targetsAttempted} 个目标）。
              单配方成功率 {PAPER.perRecipeSuccessPct}%。
            </p>
          </div>
        </div>

        <p className="text-[10px] text-[#f59e0b] mt-3 leading-relaxed">
          ⚠ 注意：上述数字为论文原始声称。后续独立再分析对这些声称提出了重要质疑——见下文第 04 节。
        </p>
      </section>

      {/* ================================================================ */}
      {/* 02 — 系统由哪些层组成 */}
      {/* ================================================================ */}
      <section className="mb-14" id="system">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">02</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">系统由哪些层组成</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          理解 A-Lab 不能只看算法——它是一个集成了机器人操作、热工控制、自动表征和 AI 决策的多层系统。
          以下四层架构基于论文描述。
        </p>

        <CircularCarousel />

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '机器人配料', desc: '自动粉末处理，多前驱体槽位。从商用可得的前驱体库中选择配方原料。' },
            { label: '混合与加热', desc: `可编程炉，操作温度 ${PAPER.furnaceTemp}。加热步骤间自动研磨和混合。` },
            { label: 'XRD 表征', desc: '自动 X 射线衍射，两个 ML 模型协同进行物相识别。' },
            { label: 'AI 规划器', desc: '使用 Materials Project 和 Google DeepMind 的 DFT 数据进行目标预筛选。主动学习使用成对反应热力学分析指导实验选择。' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
              <div className="text-xs text-[#d0d4dc] font-semibold mb-0.5">{item.label}</div>
              <div className="text-[10px] text-[#8a92a3] leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 03 — 论文原始声称 */}
      {/* ================================================================ */}
      <section className="mb-14" id="claims">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">03</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">
            论文原始声称
            <span className="text-[#8a92a3] font-normal text-xs ml-2">—— 以论文自身报告为准</span>
          </h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-5 max-w-3xl">
          以下内容全部来自 Nature 2023 论文的自身报告。本节不附加本课程的评价或解读——仅如实呈现论文的声称。
        </p>

        {/* 关键数字 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {[
            ['17 天', '连续运行时间'],
            ['58', '尝试合成的目标数'],
            [`${PAPER.claimedSuccesses} (${PAPER.claimedSuccessRatePct}%)`, '论文声称的成功数'],
            ['355', '执行的实验总数'],
            ['33', '覆盖的元素数'],
            [PAPER.furnaceTemp, '炉温范围'],
            [`${PAPER.perRecipeSuccessPct}% (130/355)`, '单配方成功率'],
            ['< 10 meV/atom', '热力学稳定性阈值'],
          ].map(([value, label]) => (
            <div key={label} className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
              <div className="text-sm font-mono text-[#00f5d4]">{value}</div>
              <div className="text-[10px] text-[#8a92a3]">{label}</div>
            </div>
          ))}
        </div>

        {/* 目标筛选 pipeline */}
        <div className="mb-6">
          <h4 className="text-xs text-[#d0d4dc] font-semibold mb-2">目标筛选流程（基于论文方法部分）</h4>
          <div className="space-y-1.5">
            {[
              '起点：Materials Project 中约 42,000 个热力学稳定化合物',
              '筛选 1：经 Google DeepMind 数据库确认稳定（> 100 万相）',
              '筛选 2：在空气中稳定（不与 CO₂ 或 H₂O 反应）',
              '筛选 3：未被 ICSD 或文献收录',
              '筛选 4：不含稀有、有毒或不安全元素',
              '筛选 5：前驱体可商用获得',
              '终点：58 个目标化合物进入实验验证',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#8a92a3]">
                <span className="text-[#00f5d4] font-mono text-[10px] mt-0.5">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 论文自身报告的四类失败模式 */}
        <div>
          <h4 className="text-xs text-[#d0d4dc] font-semibold mb-2">论文自身报告的四类失败模式（17 个未命中目标）</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(67,97,238,0.15)]">
                  <th className="text-left py-2 px-3 text-[#8a92a3] font-mono text-[10px]">失败原因</th>
                  <th className="text-left py-2 px-3 text-[#8a92a3] font-mono text-[10px]">影响范围</th>
                </tr>
              </thead>
              <tbody className="text-[#8a92a3]">
                {[
                  ['反应动力学缓慢（热力学驱动力 < 50 meV/atom）', '17 个目标中的 11 个'],
                  ['前驱体挥发损失', '若干个目标'],
                  ['合成过程中的非晶化', '若干个目标'],
                  ['计算误差（稳定性预测有误）', '若干个目标'],
                ].map(([cause, count]) => (
                  <tr key={cause} className="border-b border-[rgba(67,97,238,0.06)]">
                    <td className="py-2.5 px-3">{cause}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px]">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 04 — 后续争议与修正 */}
      {/* ================================================================ */}
      <section className="mb-14" id="controversy">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#f59e0b] font-mono tracking-wider">04</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">
            后续争议与修正
            <span className="text-[#8a92a3] font-normal text-xs ml-2">—— 科学自我纠错的过程</span>
          </h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          A-Lab 的故事中比"它做了什么"更值得课堂讨论的是<strong>"它之后发生了什么"</strong>。
          以下按时间顺序梳理从发表到争议到修正的过程。这不是"丑闻"——这是科学社群通过独立审查、
          公开辩论和期刊勘误来修正错误的正常机制。
        </p>

        {/* 时间线 */}
        <div className="relative mb-6">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[rgba(67,97,238,0.15)]" />
          <div className="space-y-1">
            {[
              { date: '2023.11', event: 'Nature 发表', detail: 'Szymanski 等报告在 17 天内自主合成 58 个目标中的 41 个，论文经同行评审发表于 Nature。' },
              { date: '2023.12', event: 'Palgrave 在社交媒体提出质疑', detail: 'Robert Palgrave (UCL / 伦敦大学学院) 在社交平台上对声称的发现提出了初步关切，随后与 Leslie Schoop (Princeton / 普林斯顿大学) 合作启动了正式的再分析。' },
              { date: '2024', event: 'ChemRxiv 再分析预印本', detail: 'Leeman, Palgrave, Schoop 等在 ChemRxiv 发表再分析，认为 A-Lab 的 XRD 分析和成分无序处理存在系统性错误，"没有真正的新材料被发现"。' },
              { date: '2026.01', event: 'Nature 勘误（C&EN 报道）', detail: 'Nature 发表了勘误。部分问题得到修正，但关于自治工作流可靠性的讨论仍在继续。[来源：C&EN 2026 年 1 月报道]' },
            ].map((item, i) => (
              <div key={i} className="relative pl-12 py-3">
                <span className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full border-2 border-[#000d1d]"
                  style={{ background: i <= 1 ? '#00f5d4' : i === 2 ? '#f59e0b' : 'rgba(67,97,238,0.5)' }} />
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xs font-mono text-[#00f5d4] w-20 flex-shrink-0">{item.date}</span>
                  <span className="text-sm font-medium text-[#d0d4dc]">{item.event}</span>
                </div>
                <p className="text-xs text-[#8a92a3] mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 三方对照 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 border-l-2 border-[#f59e0b]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <div className="text-[10px] text-[#f59e0b] font-mono mb-1.5">论文原始声称</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              A-Lab 在 {PAPER.durationDays} 天内发现了 {PAPER.claimedSuccesses} 种新型无机材料——
              声称的发现速率远超传统人工方式。
            </p>
            <div className="mt-2 text-[10px] text-[#f59e0b] font-mono">
              来源：Nature (2023)
            </div>
          </div>
          <div className="p-4 border-l-2 border-[#ff6b6b]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <div className="text-[10px] text-[#ff6b6b] font-mono mb-1.5">后续独立争议</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              独立再分析认为：AI 驱动的 XRD 解读和成分无序处理均存在不足——
              未被确认为真正的新材料。
            </p>
            <div className="mt-2 text-[10px] text-[#ff6b6b] font-mono">
              来源：ChemRxiv (2024)
            </div>
          </div>
          <div className="p-4 border-l-2 border-[#4361ee]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <div className="text-[10px] text-[#4361ee] font-mono mb-1.5">勘误与修正</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              Nature 发表勘误（2026）。Ceder 组公开了实验日志和原始数据。
              多中心复现研究正在进行中。
            </p>
            <div className="mt-2 text-[10px] text-[#4361ee] font-mono">
              来源：C&EN (Jan 2026)
            </div>
          </div>
        </div>

        <ValidationPanel />
      </section>

      {/* ================================================================ */}
      {/* 05 — 本讲采用什么审慎口径 */}
      {/* ================================================================ */}
      <section className="mb-14" id="stance">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#4361ee] font-mono tracking-wider">05</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">本讲采用什么审慎口径</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.15)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <div className="text-[10px] text-[#4361ee] font-mono mb-2">本课程在课堂上的立场</div>
            <ul className="text-xs text-[#8a92a3] space-y-2 list-disc list-inside">
              <li>将 A-Lab 呈现为一个<strong>重要的技术成就</strong>——它展示了在 17 天内执行 355 次自主实验是工程上可行的</li>
              <li>将"发现了 41 种新材料"的声称呈现为<strong>论文自身的声称</strong>，而非课程作者的确认——同时呈现后续争议的全部信息</li>
              <li>将后续争议呈现为<strong>科学自我纠错机制的正常运作</strong>，而不是 SDL 或该研究团队的"失败"</li>
              <li>承认：关于 A-Lab 具体发现了多少种"真正的新材料"，目前<strong>尚未有定论</strong>——这不是本课程能够或应当裁决的问题</li>
              <li>建议学生阅读双方文献（Nature 原论文 + ChemRxiv 再分析）后再形成自己的判断</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-dashed border-[rgba(255,107,107,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <div className="text-[10px] text-[#ff6b6b] font-mono mb-2">本课程不会做的事</div>
            <ul className="text-xs text-[#8a92a3] space-y-1 list-disc list-inside">
              <li>不会使用"A-Lab 发现了 XX 种新材料"作为无条件的陈述——始终标注"论文声称"</li>
              <li>不会将 A-Lab 宣传为"已解决材料发现问题的系统"——工程与科学层面均有悬而未决的问题</li>
              <li>不会回避争议——争议恰恰是这一案例最有教学价值的部分</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 06 — 对 SDL 教学的启示 */}
      {/* ================================================================ */}
      <section className="mb-14" id="lessons">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">06</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">
            对 SDL 教学的启示
            <span className="text-[#8a92a3] font-normal text-xs ml-2">—— [课程解读]</span>
          </h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-5 max-w-3xl">
          以下四条是<strong>本课程的解读</strong>，不是 A-Lab 论文的结论，不是 Palgrave-Schoop 再分析的结论，
          也不是科学社群的共识。它们是本课程作者基于上述信息为研究生课堂教学目的而综合的教学要点。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">1. SDL 是系统工程</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              A-Lab 不只是贝叶斯优化算法。它集成了机器人、炉控、自动 XRD 和 ML 相识别。
              任何一个组件的可靠性问题都会影响全局。理解 SDL 意味着理解整个系统——不只是理解算法。
            </p>
          </div>
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">2. 先定义"成功"，再运行自治系统</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              A-Lab 争议的核心是定义问题。什么算"新材料"？获得目标相即算成功？需要纯相？
              需要完整的性能表征？需要独立复现？这些定义必须在自治实验开始前确立——
              不能等到有人质疑了再去补。
            </p>
          </div>
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">3. 人工验证不能跳过</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              自动 XRD 解读和 ML 相识别是强大工具——但它们不能替代专家的晶体学分析。
              Palgrave-Schoop 再分析最值得注意的发现之一是：有人类经验的研究人员
              从同样的衍射数据中得出了与 AI 不同的结论。SDL 的自动化越高，人工验证越不可省略。
            </p>
          </div>
          <div className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1.5">4. 科学自我纠错——如果我们允许它发生</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed">
              2024 年的再分析不是 A-Lab 或 SDL 的"失败"——它是科学正常运行的体现。
              公开数据、开放方法、社群审查和期刊勘误是科学的保障机制，不是障碍。
              启示不是"不要相信 SDL"，而是"相信——但要验证——并把数据公开"。
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 07 — 与 Materials Project 的连接 */}
      {/* ================================================================ */}
      <section className="mb-14" id="mp">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">07</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">计算基础：Materials Project（材料计划）</h2>
        </div>

        <div className="p-6 rounded-lg border border-[rgba(67,97,238,0.15)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
          <p className="text-sm text-[#8a92a3] leading-relaxed mb-3">
            A-Lab 的目标筛选依赖于 Materials Project 数据库和 Google DeepMind 的 GNoME 数据集。
            基于 DFT 计算的生成能用于预测哪些成分在热力学上是稳定的（位于或接近凸包，距凸包 &lt; 10 meV/atom）。
            这一预筛选步骤至关重要：系统只尝试合成被计算预测为有利的实验。
          </p>
          <p className="text-xs text-[#8a92a3] leading-relaxed">
            [注意：论文未说明具体的 API 调用量或数据库大小。Materials Project 是一个公开数据库，
            截至 2024 年有超过 15 万注册用户，但 A-Lab 的具体集成指标需从原始来源核实。]
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 课堂讨论建议 */}
      {/* ================================================================ */}
      <div className="p-5 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
        <div className="text-xs text-[#8a92a3] font-mono mb-2">课堂讨论建议</div>
        <p className="text-xs text-[#8a92a3] leading-relaxed">
          本页为课堂教学目的而编写。建议将 A-Lab 案例作为一个<strong>讨论练习</strong>来使用：
          你需要看到什么证据才会相信"一个自治实验室发现了一种新材料"？
          让学生先写下自己的标准，然后对照 Nature 论文和 ChemRxiv 再分析的证据进行检验。
          目标不是"判断谁对谁错"，而是培养对自治系统产出的<strong>批判性评估能力</strong>。
        </p>
      </div>
    </div>
  );
}
