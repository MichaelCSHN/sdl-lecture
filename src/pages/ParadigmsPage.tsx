import { ExternalLink } from 'lucide-react';

// ============================================================
// Page: 科学范式 — 从概念到争议
// ============================================================

export default function ParadigmsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">科学基础</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        科学范式：概念、框架与争论
      </h1>
      <p className="text-[#8a92a3] max-w-2xl leading-relaxed text-sm mb-8">
        理解科学知识的产生方式如何演化，是讨论 AI 时代实验方法的前提。
        本单元梳理"范式"和"科学范式"的基本概念、Kuhn 与 Popper 的经典理论、
        Jim Gray 的四范式框架，以及正在展开的第五范式之争。
      </p>

      {/* ================================================================ */}
      {/* 1. 概念基础：什么是"范式" */}
      {/* ================================================================ */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-[#fee440] font-mono tracking-wider">01</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">什么是"范式"和"科学范式"</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">范式（Paradigm）</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
              "范式"（paradigm）一词源自希腊语 <em>paradeigma</em>，意为"模式"或"范例"。在日常语言中，
              范式指某一领域中被广泛接受的基本框架——包括核心假设、方法论、典型问题和评价标准。
            </p>
            <ul className="text-xs text-[#8a92a3] space-y-1 list-disc list-inside">
              <li>一个范式告诉实践者：<strong>什么问题值得问</strong>、<strong>什么方法可以用来回答</strong>、<strong>什么算作"好"的答案</strong></li>
              <li>范式不是永恒真理——它是特定历史条件下科学共同体的共识框架，会随时间推移而被挑战和更替</li>
              <li>一个人可能身处某个范式中而不自知——因为范式决定了"显而易见"的边界</li>
            </ul>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">科学范式（Scientific Paradigm）</h3>
            <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
              科学范式特指在科学研究领域中占据主导地位的理论框架和方法论体系。
              它不仅包含具体理论，还包含：
            </p>
            <ul className="text-xs text-[#8a92a3] space-y-1 list-disc list-inside">
              <li><strong>本体论假设</strong>：世界由什么构成？什么实体是真实存在的？</li>
              <li><strong>认识论标准</strong>：什么算作"知识"？我们如何知道我们知道什么？</li>
              <li><strong>方法论规范</strong>：什么方法是合法的？什么证据是可接受的？</li>
              <li><strong>范例问题</strong>：哪些问题是"好"的科学问题？哪些不算？</li>
              <li><strong>制度安排</strong>：期刊、评审、资助体系如何维护和强化范式？</li>
            </ul>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">为什么用"范式"概念来理解 SDL？</h3>
          <p className="text-xs text-[#8a92a3] leading-relaxed">
            将 SDL（自驱动实验室）置于范式框架下讨论，不是为了贴标签，而是为了回答一组更根本的问题：
            当实验的<strong>决策权</strong>从人类科学家转移到算法时，这是否改变了科学研究的基本定义？
            它是否改变了"什么算实验"、"谁（或什么）在做实验"和"实验的可靠性如何评估"这些底层预设？
            这些问题无法通过技术性能指标来回答——它们需要范式的分析框架。
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. Thomas Kuhn：范式转移 */}
      {/* ================================================================ */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-md bg-[rgba(254,68,0,0.1)] border border-[rgba(254,68,0,0.2)] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#fee440]">K</span>
          </div>
          <div>
            <span className="text-xs text-[#fee440] font-mono tracking-wider">02</span>
            <h2 className="text-lg font-semibold text-[#d0d4dc] mt-0.5">
              Thomas Kuhn（托马斯·库恩）—— 范式转移
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)] md:col-span-2">
            <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
              库恩（1922–1996）在《科学革命的结构》（<em>The Structure of Scientific Revolutions</em>，1962）中
              提出，科学史不是线性积累的，而是通过<strong>范式转移</strong>（Paradigm Shift）跳跃式前进的。
              这一理论深刻改变了人们对科学进步方式的理解。
            </p>
            <div className="border-l-2 border-[#fee440] pl-3 space-y-2">
              {[
                { phase: '前范式阶段（Pre-paradigm）', desc: '多个学派共存，没有统一的理论框架。不同研究者对"什么是基本问题"没有共识。材料科学在 19 世纪前大致处于此阶段。' },
                { phase: '常规科学（Normal Science）', desc: '一个范式确立。科学家在范式内"解谜"——回答范式定义的问题，使用范式认可的方法。大多数科学事业发生在此阶段。' },
                { phase: '反常与危机（Anomaly & Crisis）', desc: '积累的现象无法被现有范式解释。起初被视为"测量误差"或"特例"，但当反常积累到动摇范式核心时，危机出现。' },
                { phase: '革命与范式转移（Revolution & Shift）', desc: '新范式取代旧范式。这不是渐进改良——新旧范式之间可能存在"不可通约性"（incommensurability），即基本术语和评价标准的根本变化。' },
              ].map((item) => (
                <div key={item.phase} className="pl-2">
                  <div className="text-[10px] text-[#fee440] font-mono mb-0.5">{item.phase}</div>
                  <div className="text-xs text-[#8a92a3] leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h4 className="text-xs text-[#d0d4dc] font-semibold mb-2">对 SDL 的启示</h4>
            <p className="text-[10px] text-[#8a92a3] leading-relaxed">
              从"人工实验"到"自治实验"是否构成一次范式转移？如果是，那么它改变的不只是工具效率，
              而是"什么是实验"和"谁在做实验"的基本定义。如果答案是否定的，那么 SDL 更像是
              "常规科学"阶段更高效的操作工具，而非科学认识论的变革。
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3. Karl Popper：可证伪性 */}
      {/* ================================================================ */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-md bg-[rgba(67,97,238,0.1)] border border-[rgba(67,97,238,0.2)] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#4361ee]">P</span>
          </div>
          <div>
            <span className="text-xs text-[#4361ee] font-mono tracking-wider">03</span>
            <h2 className="text-lg font-semibold text-[#d0d4dc] mt-0.5">
              Karl Popper（卡尔·波普尔）—— 可证伪性
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)] md:col-span-2">
            <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
              波普尔（1902–1994）在《科学发现的逻辑》（<em>Logik der Forschung</em>，1934/英译 1959）中提出，
              科学与非科学的划界标准不是"可证实"，而是<strong>可证伪</strong>（Falsifiability）。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {[
                { title: '核心论证', desc: '一个理论如果不可能被任何可能的观察所反驳，它就不是科学。"万物都有原因"无法被证伪——它是哲学；"所有金属加热后膨胀"可以被反例推翻——它是科学。' },
                { title: '猜想与反驳', desc: '科学进步通过"猜想与反驳"循环：提出大胆假说 → 设计严格检验 → 如果被推翻，提出新假说。科学的态度不是"寻找支持自己理论的证据"，而是"试图推翻自己的理论"。' },
                { title: '逼真度（Verisimilitude）', desc: '没有最终真理——科学理论只能接近真实。一个理论比另一个好，不是因为它"被证实了"，而是因为它通过了更多严格的证伪尝试，且尚未被推翻。' },
                { title: '可证伪性与伪科学', desc: '可证伪性是对科学知识的最低门槛——不是充分条件，但是必要条件。不可证伪不等于没有价值（逻辑、数学、哲学都是不可证伪但极其重要的），不等于"科学"。' },
              ].map((item) => (
                <div key={item.title} className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                  <div className="text-[10px] text-[#4361ee] font-mono mb-0.5">{item.title}</div>
                  <div className="text-[10px] text-[#8a92a3] leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-4 rounded-lg border border-[rgba(67,97,238,0.1)]">
            <h4 className="text-xs text-[#d0d4dc] font-semibold mb-2">对 SDL 的启示</h4>
            <p className="text-[10px] text-[#8a92a3] leading-relaxed">
              SDL 的产出——无论是"新材料"还是"最优条件"——是否可被独立验证和潜在推翻？
              A-Lab 争议（参见 A-Lab 案例档案）本质上是一个可证伪性问题：SDL 的声称是否
              通过了独立实验室的严格检验？如果 SDL 的结果无法被独立复现或证伪，
              那么它们在科学上的地位是可疑的——无论算法多么精巧。
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. Jim Gray：四范式框架 */}
      {/* ================================================================ */}
      <section className="mb-16" id="jim-gray">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-md bg-[rgba(0,245,212,0.1)] border border-[rgba(0,245,212,0.2)] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#00f5d4]">G</span>
          </div>
          <div>
            <span className="text-xs text-[#00f5d4] font-mono tracking-wider">04</span>
            <h2 className="text-lg font-semibold text-[#d0d4dc] mt-0.5">
              Jim Gray —— 科学四范式框架
            </h2>
          </div>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-5 max-w-3xl">
          Jim Gray（吉姆·格雷，1944–2012），图灵奖得主、数据库与事务处理领域的奠基人。
          2007 年，他在 NRC-CSTB 会议上提出了科学研究的<strong>四种方法论范式</strong>，
          这一框架已成为科学方法论讨论的核心参照。
        </p>

        {/* 四范式详解 */}
        <div className="space-y-4 mb-6">
          {[
            {
              num: '一',
              title: '实验科学（Empirical Science）',
              era: '古代–现在',
              desc: '通过对自然现象的直接观察和受控实验来获取知识。知识来自感官经验和归纳推理。',
              examples: '伽利略的斜面实验、拉瓦锡的燃烧实验、居里夫人的放射实验。Millikan 油滴实验测定电子电荷——单个精心设计的实验可以回答一个根本问题。',
              role: '实验至今仍是知识生产的<strong>最终检验环节</strong>。理论必须被实验验证；计算必须被实验标定。后续范式不是替代实验，而是改变实验的组织和执行方式。',
            },
            {
              num: '二',
              title: '理论科学（Theoretical Science）',
              era: '17 世纪–现在',
              desc: '用数学模型和理论框架描述和预测自然规律。知识来自逻辑推导和数学形式化。',
              examples: '牛顿力学、麦克斯韦方程、量子力学、热力学定律。在 MSE 中：位错理论、相变热力学、能带理论——理论告诉我们"什么材料为什么具有什么性质"。',
              role: '理论使<strong>预测</strong>成为可能——可以在不做实验的情况下预判某些材料是否值得尝试。但理论预测必须被实验检验，否则只是数学假说。',
            },
            {
              num: '三',
              title: '计算科学（Computational Science）',
              era: '20 世纪中后期–现在',
              desc: '用数值模拟解决无法解析求解的复杂问题。知识来自大规模计算和数值近似。',
              examples: '密度泛函理论（DFT）计算材料性质、分子动力学模拟、有限元分析、相场模拟。Materials Project 数据库通过 DFT 计算预测数十万种化合物的稳定性。',
              role: '计算在理论和实验之间架起了<strong>桥梁</strong>：当理论模型太复杂无法手算时，计算提供了近似解；当实验太昂贵无法穷举时，计算提供了预筛选。A-Lab 的成功在很大程度上依赖于 Materials Project 的 DFT 预筛选。',
            },
            {
              num: '四',
              title: '数据密集科学（Data-Intensive Science）',
              era: '21 世纪–现在',
              desc: '以数据采集、管理和挖掘为中心。知识来自从海量数据中发现统计模式和关联。',
              examples: 'Materials Project（60 万+ 用户）、高通量筛选、机器学习势函数（MLIP）、从文献中自动提取合成配方。A-Lab 的初始合成配方来源于对合成文献的 NLP 分析。',
              role: '数据不再是实验的副产品——数据本身成为科学探索的<strong>主体对象</strong>。关键的转变：从"假设驱动"（先有理论再做实验）到"数据驱动"（从数据中发现假设）。这改变了科学发现的因果逻辑。',
            },
          ].map((p) => (
            <div key={p.num} className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.08)]">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-md bg-[rgba(0,245,212,0.08)] border border-[rgba(0,245,212,0.15)] flex items-center justify-center text-xs font-mono text-[#00f5d4] flex-shrink-0">
                  {p.num}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#d0d4dc]">{p.title}</h3>
                  <span className="text-[10px] text-[#5a6377]">{p.era}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">知识生产方式</div>
                  <div className="text-xs text-[#d0d4dc] leading-relaxed">{p.desc}</div>
                </div>
                <div className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">代表性案例</div>
                  <div className="text-xs text-[#8a92a3] leading-relaxed">{p.examples}</div>
                </div>
                <div className="p-2 rounded border border-[rgba(67,97,238,0.06)]">
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-0.5">在当代科学中的地位</div>
                  <div className="text-xs text-[#8a92a3] leading-relaxed" dangerouslySetInnerHTML={{ __html: p.role }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel p-4 rounded-lg border border-[rgba(0,245,212,0.1)]">
          <h4 className="text-sm font-semibold text-[#d0d4dc] mb-2">Gray 框架的核心洞见</h4>
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
            Gray 的框架本质上是在回答一个问题：<strong>科学研究的方法论如何随着我们处理信息的能力而演化？</strong>
          </p>
          <ul className="text-xs text-[#8a92a3] space-y-1 list-disc list-inside">
            <li><strong>范式叠加而非替代</strong>：后出现的范式并不取代先前的范式——实验科学在今天比以往任何时候都更重要，而不是更不重要</li>
            <li><strong>数据量的质变</strong>：当数据量增长到"不可能由一个人穷尽"时，科学发现的方法论发生了质变——从"找数据支持我的理论"变为"让数据告诉我们有什么模式"</li>
            <li><strong>基础设施化</strong>：第四范式要求科学数据成为共享基础设施（数据库、标准、API）——就像望远镜是天文的基础设施、加速器是物理的基础设施</li>
          </ul>
          <div className="flex gap-3 text-[10px] font-mono mt-3 pt-3 border-t border-[rgba(67,97,238,0.08)]">
            <span className="text-[#5a6377]">参考：</span>
            <a href="https://en.wikipedia.org/wiki/Jim_Gray_(computer_scientist)" target="_blank" rel="noopener noreferrer"
              className="text-[#00f5d4] hover:underline inline-flex items-center gap-1">
              Jim Gray（Wikipedia）<ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#5a6377]">|</span>
            <a href="https://en.wikipedia.org/wiki/E-Science" target="_blank" rel="noopener noreferrer"
              className="text-[#00f5d4] hover:underline inline-flex items-center gap-1">
              eScience<ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. 第五范式：正在展开的争论 */}
      {/* ================================================================ */}
      <section id="fifth-paradigm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-md bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.2)] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#ff6b6b]">5</span>
          </div>
          <div>
            <span className="text-xs text-[#ff6b6b] font-mono tracking-wider">05</span>
            <h2 className="text-lg font-semibold text-[#d0d4dc] mt-0.5">
              第五范式？—— 正在展开的争论
            </h2>
          </div>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-6 max-w-3xl">
          近年来 AI for Science 的兴起催生了关于是否存在<strong>"第五范式"</strong>的活跃讨论。
          目前尚无学术共识——以下三种观点应作为课堂讨论材料，而非定论。
        </p>

        <div className="space-y-4 mb-6">
          {[
            {
              view: 'AI 驱动的科学发现是独立的第五范式',
              proponents: '多项 AI for Science 研究报告、部分计算科学家',
              detail: '核心主张：AI 不仅是工具，它改变了科学发现的基本逻辑。当 AI 自主生成假说、设计实验、分析结果并决定下一步时，整个科学研究循环由 AI 驱动——这与人类科学家设计实验、AI 辅助执行的模式有本质区别。',
              evidence: 'A-Lab（可以自行决定合成下一个化合物）、Coscientist（GPT-4 规划并执行化学实验）、GNoME（发现 220 万种新材料候选）。这些系统展示了"AI 作为研究者"的雏形。',
              counterpoint: '这些系统目前高度依赖人类预设的目标和约束。A-Lab 的合成目标由人类选择的空间决定；Coscientist 的实验方案仍在人类设定的安全边界内。AI 是否真的"自主"，还是高度自动化的人类预设？',
            },
            {
              view: 'AI 不是独立范式，而是第四范式的自然延续',
              proponents: '部分科学哲学家、科学史学者',
              detail: 'AI/Machine Learning 本质上是处理大规模数据的高级工具。它们应被视为第四范式（数据密集科学）的自然演进——就像 Monte Carlo 方法没有创造"第三点五范式"，更强的计算工具也不需要新的范式标签。',
              evidence: '深度学习本质上是从数据中学习模式——这正是 Gray 所描述的第四范式的核心特征。GPU 加速没有改变范式的定义。AI 提高的是数据处理规模和效率，不是改变科学知识生产的基本方法论。',
              counterpoint: '但"规模可以产生质变"。如果 AI 系统从数据中发现的模式是人类无法通过任何其他方式发现的（例如 AlphaFold 的蛋白质结构预测），这是否超出了第四范式的定义范围？',
            },
            {
              view: '范式框架本身可能需要重构',
              proponents: 'STS（科学技术研究）学者、科学知识社会学研究者',
              detail: '四范式框架隐含了两个未经检验的假设：一是"后出现的范式更高级"的线性进步叙事；二是"范式可以清晰区分"。但科学史表明，实验、理论、计算和数据从来不是独立运作的——牛顿既是实验家也是理论家；Materials Project 的四范式交织在一起。',
              evidence: '实际科研实践中没有人只在一个范式中工作——材料科学家同时做实验、用 DFT 计算、查询 Materials Project 数据库、用 ML 分析数据。范式之间的边界是模糊的。',
              counterpoint: '但分析框架的价值不在于"精确映射现实"——就像"食物金字塔"不等于每个人的真实饮食。范式框架的价值在于帮助我们<strong>理解变化的方向和性质</strong>。框架不必是完美的描述性工具，可以是有效的启发性工具。',
            },
          ].map((item, i) => (
            <div key={i} className="glass-panel p-5 rounded-lg border border-[rgba(255,107,107,0.08)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-[#ff6b6b] font-mono bg-[rgba(255,107,107,0.06)] px-1.5 py-0.5 rounded">
                  观点 {i + 1}
                </span>
                <h3 className="text-sm font-semibold text-[#d0d4dc]">{item.view}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-1">论证</div>
                  <p className="text-xs text-[#8a92a3] leading-relaxed mb-2">{item.detail}</p>
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-1">支持证据</div>
                  <p className="text-xs text-[#8a92a3] leading-relaxed">{item.evidence}</p>
                </div>
                <div className="p-3 rounded border border-dashed border-[rgba(255,107,107,0.1)]">
                  <div className="text-[10px] text-[#ff6b6b] font-mono mb-1">反驳与讨论</div>
                  <p className="text-xs text-[#8a92a3] leading-relaxed">{item.counterpoint}</p>
                  <div className="text-[9px] text-[#5a6377] mt-2">
                    此观点的支持者包括：{item.proponents}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.15)]">
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">本课程的立场</h3>
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
            本课程<strong>不预设</strong>"新技术必然创造新范式"的结论，但承认 AI/SDL 在知识生产方式上带来的变化
            值得认真对待——不是在贴标签的层面，而是在<strong>分析变化的性质、范围与方向</strong>的层面。
          </p>
          <p className="text-xs text-[#8a92a3] leading-relaxed">
            建议课堂讨论方式：将上述三种观点作为讨论材料。要求学生为<strong>其中一种观点进行最佳辩护</strong>，
            然后转向反对立场——这比"选择你认为正确的观点"更有利于培养学生对方法论问题的批判性思考能力。
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 连接 */}
      {/* ================================================================ */}
      <div className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.15)]">
        <h3 className="text-sm font-semibold text-[#d0d4dc] mb-3">在课程中的关联内容</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <a href="/foundations#sec-experiment-history" className="p-3 rounded border border-[rgba(67,97,238,0.08)] hover:border-[#00f5d4] transition-colors no-underline">
            <div className="text-[#00f5d4] font-mono text-[10px] mb-1">基础 → A 节</div>
            <div className="text-[#d0d4dc]">范式演化概览与实验史时间轴</div>
          </a>
          <a href="/foundations#sec-sdl-concepts" className="p-3 rounded border border-[rgba(67,97,238,0.08)] hover:border-[#00f5d4] transition-colors no-underline">
            <div className="text-[#00f5d4] font-mono text-[10px] mb-1">基础 → D 节</div>
            <div className="text-[#d0d4dc]">SDL 核心概念：目标 / 约束 / 测量</div>
          </a>
          <a href="/a-lab#controversy" className="p-3 rounded border border-[rgba(67,97,238,0.08)] hover:border-[#00f5d4] transition-colors no-underline">
            <div className="text-[#00f5d4] font-mono text-[10px] mb-1">A-Lab → 05 节</div>
            <div className="text-[#d0d4dc]">争议与可证伪性：SDL 声称的独立验证</div>
          </a>
        </div>
      </div>
    </div>
  );
}
