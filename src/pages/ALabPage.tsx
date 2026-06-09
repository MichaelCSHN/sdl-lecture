import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import CircularCarousel from '@/components/CircularCarousel';

const PAPER = {
  citation: 'Szymanski NJ, Rendy B, Fei Y, et al. Nature 624, 86-91 (2023).',
  doi: '10.1038/s41586-023-06734-w',
  durationDays: 17,
  originalTargets: 58,
  originalSuccesses: 41,
  correctedTargets: 57,
  correctedSuccesses: 36,
  totalExperiments: 355,
  elementsCovered: 33,
  perRecipeSuccessPct: 37,
  furnaceTemp: '600-1000 °C',
};

const REANALYSIS = {
  ref: 'Leeman, Palgrave, Schoop et al., ChemRxiv / PRX Energy (2024); Nature Author Correction (2026).',
  doi: '10.26434/chemrxiv-2024-5p9j4',
  prxUrl: 'https://link.aps.org/doi/10.1103/PRXEnergy.3.011002',
  correctionUrl: 'https://www.nature.com/articles/s41586-025-09992-y',
  cenUrl: 'https://cen.acs.org/research-integrity/Nature-robot-chemist-paper-corrected/104/web/2026/01',
  issues: [
    {
      label: '结构判读可能过度乐观',
      detail: '后续再分析认为，自动化 XRD 与 AI 辅助判相对“是否为新材料”的判断可能给出了过强结论。',
    },
    {
      label: '无序、掺杂与替代相可能被误判',
      detail: '如果默认结构完全有序，已知相的变体、固溶体或杂相就可能被误认为全新化合物。',
    },
    {
      label: '自动化会放大验证环节的重要性',
      detail: '系统执行速度越快，测量、表征或解释误差被快速积累和传播的风险也越高。',
    },
  ],
  summary:
    'A-Lab 的教学价值不只在于它做成了自动化闭环，也在于它触发了再分析、质疑与修正。对研究生来说，这正是学习如何审查 SDL 证据链的好案例。',
};

function ValidationPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4 p-5 border-l-2 border-[#f59e0b]" style={{ background: 'rgba(6,22,42,0.6)' }}>
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full text-left">
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
        这场争议适合放进课堂，因为它迫使我们把注意力从“自动化很酷”转向“证据链是否足够扎实”。
        学生真正需要学会的，不是为某个系统站队，而是判断一个 SDL 结果是否经得起独立验证。
      </p>

      <div className="mt-2">
        <a
          href={REANALYSIS.prxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[#f59e0b] font-mono hover:underline inline-flex items-center gap-1 mr-3"
        >
          <ExternalLink className="w-3 h-3" />
          PRX Energy / 再分析
        </a>
        <a
          href={REANALYSIS.correctionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[#f59e0b] font-mono hover:underline inline-flex items-center gap-1 mr-3"
        >
          <ExternalLink className="w-3 h-3" />
          Nature Author Correction
        </a>
        <a
          href={REANALYSIS.cenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[#f59e0b] font-mono hover:underline inline-flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          C&EN 报道
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
            <div className="text-[10px] text-[#f59e0b] font-mono mb-1">课堂意义</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed">{REANALYSIS.summary}</p>
          </div>
          <div className="text-[10px] text-[#8a92a3] font-mono">
            参考：{REANALYSIS.ref} ChemRxiv DOI: {REANALYSIS.doi}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ALabPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">案例档案（Case Archive）</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-1 text-[#f3f6fb]">
        A-Lab：一个 Autonomous Laboratory 案例
      </h1>
      <p className="text-sm text-[#8a92a3] mb-8">
        {PAPER.citation}{' '}
        <a
          href={`https://doi.org/${PAPER.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00f5d4] hover:underline inline-flex items-center gap-1 text-xs"
        >
          DOI: {PAPER.doi} <ExternalLink className="w-3 h-3" />
        </a>
      </p>

      <section className="mb-14" id="problem">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">01</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">A-Lab 想解决什么问题</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          A-Lab 的核心野心，是把“提出候选材料 → 设计合成路线 → 执行实验 → 自动表征 → 判断结果”
          串成一个尽量少依赖人工逐步介入的闭环。它不是一个 BO 算法 demo，而是一个真实系统工程样本。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['研究目标', '在尽量自动化的条件下，探索无机固态材料候选，并验证它们是否能被稳定合成。'],
            ['任务范围', '围绕多元无机化合物空间展开，从数据库筛出候选，再由自动化系统执行合成与表征。'],
            ['关键难点', '难点不只是做实验，而是让目标定义、执行稳定性、表征判读与结果验证在同一闭环内协同。'],
          ].map(([title, body]) => (
            <div key={title} className="p-4 rounded-lg border border-[rgba(67,97,238,0.1)]" style={{ background: 'rgba(6,22,42,0.6)' }}>
              <div className="text-[10px] text-[#00f5d4] font-mono mb-1">{title}</div>
              <p className="text-xs text-[#8a92a3] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14" id="system">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">02</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">系统由哪些层组成</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          A-Lab 真正重要的地方，是把数据库筛选、机器人操作、热处理、自动表征与结果解释连成实验基础设施。
          判断它时，不能只问“算法是什么”，还要问“样品、仪器、数据和解释如何闭环”。
        </p>

        <CircularCarousel />

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '目标筛选', desc: '从计算数据库中提出值得尝试的候选，避免从完全盲目的空间起步。' },
            { label: '样品执行', desc: '自动配料、混合、加热与中间处理，尽量保证执行流程一致。' },
            { label: '自动表征', desc: '通过 XRD 等手段获取观测结果，再进入后续解释环节。' },
            { label: '结果解释', desc: '把判相、成功判定与下一步行动连接起来，形成可继续推进的研究闭环。' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded border border-[rgba(67,97,238,0.08)]">
              <div className="text-xs text-[#d0d4dc] font-semibold mb-0.5">{item.label}</div>
              <div className="text-[10px] text-[#8a92a3] leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14" id="results">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">03</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">结果数字必须分清口径</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-5 max-w-3xl">
          课堂上不再把原始 41/58 声称当作单独结论使用。更稳妥的讲法是并列三种口径：
          原论文原始声称、Nature 当前修正记录，以及后续再分析提出的争议解释。
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-[rgba(0,245,212,0.12)] bg-[rgba(0,245,212,0.03)] p-5">
            <div className="text-[10px] text-[#00f5d4] font-mono mb-2">原始声称（Original Claim）</div>
            <div className="text-2xl font-mono text-[#f3f6fb] mb-1">
              {PAPER.originalSuccesses} / {PAPER.originalTargets}
            </div>
            <p className="text-xs text-[#8a92a3] leading-6">
              这是原论文发表时最醒目的目标级成功口径，只能用于说明“作者最初声称命中的目标数”。
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(245,158,11,0.14)] bg-[rgba(245,158,11,0.04)] p-5">
            <div className="text-[10px] text-[#f59e0b] font-mono mb-2">Nature 修正记录（Corrected Record）</div>
            <div className="text-2xl font-mono text-[#f3f6fb] mb-1">
              {PAPER.correctedSuccesses} / {PAPER.correctedTargets}
            </div>
            <p className="text-xs text-[#8a92a3] leading-6">
              Nature 论文页和 2026 Author Correction 后应采用的当前记录。讲座与网站以此作为修正口径。
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(248,113,113,0.14)] bg-[rgba(248,113,113,0.04)] p-5">
            <div className="text-[10px] text-[#f87171] font-mono mb-2">争议解释（Contested Interpretation）</div>
            <div className="text-2xl font-mono text-[#f3f6fb] mb-1">2024-2026</div>
            <p className="text-xs text-[#8a92a3] leading-6">
              再分析和勘误提示：是否构成“新材料发现”取决于结构判读、独立验证和报告透明度。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {[
            [`${PAPER.durationDays} 天`, '连续运行时间'],
            [String(PAPER.totalExperiments), '总实验数'],
            [String(PAPER.elementsCovered), '覆盖元素数'],
            [PAPER.furnaceTemp, '炉温范围'],
            [`${PAPER.perRecipeSuccessPct}%`, '单配方成功率'],
            ['XRD', '关键自动表征'],
            ['Materials Project', '候选来源之一'],
            ['自动闭环', '系统定位'],
          ].map(([value, label]) => (
            <div key={label} className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
              <div className="text-sm font-mono text-[#00f5d4]">{value}</div>
              <div className="text-[10px] text-[#8a92a3]">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
            <div className="text-[10px] text-[#00f5d4] font-mono mb-2">可以怎样理解这些数字</div>
            <p className="text-xs text-[#8a92a3] leading-6">
              从系统工程角度看，A-Lab 已经能在较长时间尺度上自动推进真实实验序列，而不是一次性展示某个仪器动作。
            </p>
          </div>
          <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
            <div className="text-[10px] text-[#00f5d4] font-mono mb-2">为什么仍不能直接下结论</div>
            <p className="text-xs text-[#8a92a3] leading-6">
              因为“实验跑起来了”不等于“新材料发现结论成立了”。真正高门槛在表征可信度、判相稳健性与独立复核。
            </p>
          </div>
        </div>
      </section>

      <section className="mb-14" id="controversy">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#f59e0b] font-mono tracking-wider">04</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">后续争议为什么同样重要</h2>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          A-Lab 最值得课堂讨论的，不只是它做成了什么，更是它在发表之后如何被共同体重新审查。
          对 SDL 来说，自动化越强，验证与再分析的重要性就越高。
        </p>

        <ValidationPanel />
      </section>

      <div className="p-5 rounded-lg border border-dashed border-[rgba(67,97,238,0.2)]">
        <div className="text-xs text-[#8a92a3] font-mono mb-2">课堂讨论建议</div>
        <p className="text-xs text-[#8a92a3] leading-relaxed">
          这页适合训练研究生的判断力。可以先让学生写下：要相信“一个 Autonomous Laboratory 发现了新材料”，
          他们需要看到哪些证据；再回头对照原论文、Nature 修正记录与再分析文本。目标不是快速站队，
          而是建立对 SDL 结果的批判性评价能力。
        </p>
      </div>
    </div>
  );
}
