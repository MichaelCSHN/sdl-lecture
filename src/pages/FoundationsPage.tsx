import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowRight, Beaker, BrainCircuit, FlaskConical, Network, Sigma } from 'lucide-react';

const HISTORY_STEPS = [
  {
    year: '17-19 世纪',
    title: '实验成为现代科学的裁决机制',
    body: '从自然哲学走向可重复实验，实验不再只是展示现象，而是成为决定理论能否站住脚的公共程序。',
  },
  {
    year: '20 世纪',
    title: '实验被工程化与统计化',
    body: 'DOE、标准化测量、仪器平台与实验室制度，使实验逐渐成为可设计、可管理、可比较的生产系统。',
  },
  {
    year: '21 世纪',
    title: '实验进入数据化与自动化阶段',
    body: '高通量、机器人、LIMS、在线表征与 ML 模型把实验从“手工流程”推向“可编排闭环”。',
  },
  {
    year: '现在',
    title: 'SDL 重新组织实验决策',
    body: 'Self-Driving Labs 不是替代实验，而是把“做哪一次实验”这件事交给模型辅助决策，再由系统执行与回写。',
  },
];

const INTERVENTION_CARDS = [
  {
    title: '观察（Observation）',
    body: '观察回答“世界已经怎样发生”。它适合发现现象、建立分类、积累经验，但天然容易受混杂因素影响。',
  },
  {
    title: '干预（Intervention）',
    body: '干预回答“如果我改变某个条件，会发生什么”。现代实验的核心，就是通过人为设置条件让自然对问题作答。',
  },
  {
    title: '对照（Control）',
    body: '对照让结论有比较基线。没有对照，很多“效果”只是时间、批次、仪器漂移或样品差异造成的错觉。',
  },
];

const FISHER_PRINCIPLES = [
  {
    title: '随机化（Randomization）',
    body: '把不可控偏倚尽量变成可统计处理的随机变异，而不是让隐性顺序或批次效应支配结论。',
  },
  {
    title: '重复（Replication）',
    body: '通过重复估计噪声和不确定度。对 SDL 来说，重复也决定代理模型能否区分真实信号与测量波动。',
  },
  {
    title: '区组化（Blocking）',
    body: '把已知但不关心的差异显式分组，例如炉次、批次、仪器、操作者或环境窗口，避免它们污染主效应判断。',
  },
];

const TAXONOMY = [
  {
    title: '合成实验',
    question: '如何制备目标材料？',
    examples: '固相反应、Sol-Gel、CVD、PVD、水热合成',
    relation: 'SDL 最容易切入的执行环节之一，适合用来优化温度、时间、配比等连续参数。',
  },
  {
    title: '加工与调控实验',
    question: '如何通过后处理改变结构与性能？',
    examples: '退火、淬火、热压、表面处理、掺杂',
    relation: '常见于“工艺窗口”搜索，适合与代理模型和约束优化结合。',
  },
  {
    title: '表征实验',
    question: '这个材料到底是什么样？',
    examples: 'XRD、SEM、TEM、XPS、Raman',
    relation: '表征不是辅助环节，而是闭环中的观测函数；观测质量直接决定模型能学到什么。',
  },
  {
    title: '性能测量实验',
    question: '这个材料的性能数值是多少？',
    examples: '电导率、光谱、磁性、力学、热学测试',
    relation: '通常直接定义优化目标，也是 GP-BO 里最常见的黑盒输出。',
  },
  {
    title: '器件与功能测试',
    question: '材料放进真实器件后表现如何？',
    examples: '电池循环、催化活性、I-V 曲线、传感器响应',
    relation: '更接近真实应用，但成本更高、时延更大，也更需要任务定义与样本效率。',
  },
  {
    title: '稳定性与失效实验',
    question: '它能稳定多久，在哪里失效？',
    examples: '老化、热循环、湿热、疲劳、蠕变',
    relation: '这类任务非常重要，但时间尺度长，往往逼迫我们重新设计观测与代理目标。',
  },
];

const COMPARISON_ROWS = [
  ['策略', '经验与直觉', '预先设计试验矩阵', '模型辅助的逐轮决策'],
  ['数据使用方式', '做完再看', '批次分析', '边做边学'],
  ['参数空间', '低维更稳妥', '中等维度可控', '更适合高维且昂贵的问题'],
  ['不确定度处理', '通常隐含', '统计上显式分析', '模型中显式表示'],
  ['实验节奏', '人主导串行推进', '分批推进', '闭环快速迭代'],
  ['典型风险', '局部最优与遗漏', '设计固化', '先验偏置与测量误差放大'],
];

const CORE_CONCEPTS = [
  {
    title: '代理模型（Surrogate Model）',
    body: '当每一次实验都昂贵时，我们需要一个可更新的近似模型，用有限样本去推断“哪里可能更好”。',
  },
  {
    title: '不确定度（Uncertainty）',
    body: '只知道预测均值不够。模型还需要告诉我们：哪些区域它很确定，哪些区域它其实没把握。',
  },
  {
    title: '采集函数（Acquisition Function）',
    body: '采集函数把“预测值”和“不确定度”组合成一个决策指标，用来决定下一次实验该做哪里。',
  },
  {
    title: '闭环（Closed Loop）',
    body: '推荐下一点、执行实验、获得观测、更新模型、再次推荐，这五步循环构成 SDL 的基本组织结构。',
  },
];

const AUTONOMY_LEVELS = [
  ['L0', '手动实验', '人决定每一步，系统只提供仪器或记录工具。'],
  ['L1', '自动执行', '固定流程自动化，但下一次做什么仍由人决定。'],
  ['L2', '辅助推荐', '模型给出候选或排序，人审核后执行。'],
  ['L3', '闭环优化', '系统根据观测更新模型并推荐下一轮实验。'],
  ['L4', '受约束自主', '系统可在预设目标、约束和安全边界内连续运行。'],
  ['L5', '开放式科学代理', '系统能提出问题、设计实验、解释结果并更新研究计划；目前更多是愿景而非成熟现实。'],
];

function useHashScroll() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const scroll = () => {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    setTimeout(scroll, 80);
    setTimeout(scroll, 260);
  }, [location.hash]);
}

export default function FoundationsPage() {
  useHashScroll();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <section id="intro" className="mb-12">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">基础（Foundations）</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#f3f6fb] mb-4">
          从实验史到 SDL：一条面向研究生的基础主线
        </h1>
        <p className="text-sm text-[#d0d4dc] leading-7 max-w-3xl mb-3">
          这页不是数学推导总览，而是帮助你回答三个更基本的问题：为什么实验仍然是科学中心，传统方法论到底解决了什么，
          以及 SDL 在哪里延续了 DOE，又在哪里改变了实验决策的结构。
        </p>
        <p className="text-sm text-[#8a92a3] leading-7 max-w-3xl">
          如果你只想抓住讲座主线，就按这页的顺序往下看；如果你已经在做课题，就把它当作站内概念地图，按锚点跳读。
        </p>
      </section>

      <section id="sec-experiment-history" className="mb-12">
        <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.22em] mb-2">历史作为方法（History As Method）</div>
        <h2 className="text-2xl font-semibold text-[#f3f6fb] mb-4">为什么要先讲实验史</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {HISTORY_STEPS.map((item) => (
            <div key={item.year} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
              <div className="text-[10px] font-mono text-[#00f5d4] mb-2">{item.year}</div>
              <h3 className="text-base font-semibold text-[#f3f6fb] mb-2">{item.title}</h3>
              <p className="text-sm text-[#8a92a3] leading-6">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="experiment-logic" className="mb-12">
        <div className="text-[10px] text-[#fee440] font-mono tracking-[0.22em] mb-2">实验逻辑（Logic Of Experiment）</div>
        <h2 className="text-2xl font-semibold text-[#f3f6fb] mb-4">观察、干预与 Fisher 三原则</h2>
        <p className="text-sm text-[#8a92a3] leading-7 mb-5 max-w-3xl">
          SDL 的“自动决策”不能绕开传统实验逻辑。真正可靠的闭环，仍然要回答：什么被干预了，什么作为对照，
          随机化、重复和区组化如何进入数据生成过程。
        </p>
        <div className="grid gap-4 md:grid-cols-3 mb-5">
          {INTERVENTION_CARDS.map((item) => (
            <div key={item.title} className="glass-panel rounded-2xl border border-[rgba(254,228,64,0.12)] p-5">
              <h3 className="text-base font-semibold text-[#f3f6fb] mb-2">{item.title}</h3>
              <p className="text-sm text-[#8a92a3] leading-6">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FISHER_PRINCIPLES.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[rgba(67,97,238,0.12)] bg-[rgba(255,255,255,0.02)] p-5">
              <div className="text-[10px] text-[#00f5d4] font-mono mb-2">Fisher 原则</div>
              <h3 className="text-base font-semibold text-[#f3f6fb] mb-2">{item.title}</h3>
              <p className="text-sm text-[#8a92a3] leading-6">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="mse-map" className="mb-4">
        <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.22em] mb-2">MSE 桥接（MSE Bridge）</div>
        <h2 id="sec-taxonomy" className="text-2xl font-semibold text-[#f3f6fb] mb-4">MSE 实验图谱：按实验目的来理解实验</h2>
        <p className="text-sm text-[#8a92a3] leading-7 mb-5">
          对研究生来说，最常见的问题不是“不知道 SDL 是什么”，而是“不知道自己的实验属于哪一类，目标函数究竟来自哪里”。
          把实验按目的而不是按材料门类分类，有助于你更快定位黑盒、观测和约束。
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {TAXONOMY.map((item) => (
            <div key={item.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
              <h3 className="text-base font-semibold text-[#f3f6fb] mb-2">{item.title}</h3>
              <p className="text-xs text-[#d0d4dc] mb-2">核心问题：{item.question}</p>
              <p className="text-xs text-[#8a92a3] leading-6 mb-2">常见例子：{item.examples}</p>
              <p className="text-xs text-[#5a6377] leading-6">与 SDL 的关系：{item.relation}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ofat-to-sdl" className="mt-12 mb-12">
        <div className="text-[10px] text-[#7c7cff] font-mono tracking-[0.18em] mb-2">路径比较（From OFAT To SDL）</div>
        <h2 id="doe-vs-sdl" className="text-2xl font-semibold text-[#f3f6fb] mb-4">从试错法到 DOE，再到 SDL</h2>
        <p className="text-sm text-[#8a92a3] leading-7 mb-5">
          SDL 不是把 DOE 废掉，而是在 DOE 之上增加了“逐轮更新模型并实时改写下一次实验”的能力。
          真正的分界点不在于有没有算法，而在于实验设计是预先一次性展开，还是在观测后持续重写。
        </p>
        <div className="overflow-x-auto">
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
              {COMPARISON_ROWS.map(([dim, trial, doe, sdl]) => (
                <tr key={dim} className="border-b border-[rgba(67,97,238,0.06)]">
                  <td className="py-2.5 px-3 text-[#d0d4dc] font-semibold text-[11px]">{dim}</td>
                  <td className="py-2.5 px-3">{trial}</td>
                  <td className="py-2.5 px-3">{doe}</td>
                  <td className="py-2.5 px-3 text-[#d0d4dc]">{sdl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="interactive-loop" className="mb-12">
        <div className="text-[10px] text-[#f59e0b] font-mono tracking-[0.18em] mb-2">闭环演示（Interactive Loop）</div>
        <h2 className="text-2xl font-semibold text-[#f3f6fb] mb-4">SDL 最小闭环到底包含什么</h2>
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { icon: FlaskConical, title: '定义目标', body: '先说清楚你优化什么、不能违反什么。' },
            { icon: Beaker, title: '执行实验', body: '系统按当前推荐点完成一次真实观测。' },
            { icon: Sigma, title: '记录结果', body: '把观测值与元数据留痕，而不是只保留最佳点。' },
            { icon: BrainCircuit, title: '更新模型', body: '代理模型吸收新数据，更新均值与不确定度。' },
            { icon: Network, title: '再次推荐', body: '采集函数决定下一次实验去哪做。' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-4">
                <Icon className="w-5 h-5 text-[#00f5d4] mb-3" />
                <div className="text-sm font-semibold text-[#f3f6fb] mb-2">{item.title}</div>
                <div className="text-xs text-[#8a92a3] leading-6">{item.body}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/sdl-demo"
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,245,212,0.22)] bg-[rgba(0,245,212,0.06)] px-4 py-2 text-sm font-mono text-[#00f5d4] no-underline"
          >
            进入 GP-BO 演示页 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/case-studio"
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(67,97,238,0.18)] px-4 py-2 text-sm font-mono text-[#d0d4dc] no-underline"
          >
            打开案例工作台（Case Studio） <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section id="sec-sdl-concepts" className="mb-4">
        <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">SDL 概念（SDL Concepts）</div>
        <h2 id="sdl-concepts" className="text-2xl font-semibold text-[#f3f6fb] mb-4">理解 SDL，至少要抓住这四个概念</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {CORE_CONCEPTS.map((item) => (
            <div key={item.title} className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
              <h3 className="text-base font-semibold text-[#f3f6fb] mb-2">{item.title}</h3>
              <p className="text-sm text-[#8a92a3] leading-6">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="autonomy-levels" className="mt-12 mb-4">
        <div className="text-[10px] text-[#38bdf8] font-mono tracking-[0.18em] mb-2">自主等级（Autonomy Levels）</div>
        <h2 className="text-2xl font-semibold text-[#f3f6fb] mb-4">不要把自动化、闭环和“自主科学家”混为一谈</h2>
        <p className="text-sm text-[#8a92a3] leading-7 mb-5 max-w-3xl">
          评价一个 SDL 系统时，先问它处在哪个自主等级。能自动加样不等于能自主优化，能推荐下一点也不等于能提出可靠的新科学问题。
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {AUTONOMY_LEVELS.map(([level, title, body]) => (
            <div key={level} className="flex gap-4 rounded-2xl border border-[rgba(56,189,248,0.12)] bg-[rgba(56,189,248,0.03)] p-4">
              <div className="text-sm font-mono text-[#38bdf8] w-8 flex-shrink-0">{level}</div>
              <div>
                <h3 className="text-sm font-semibold text-[#f3f6fb] mb-1">{title}</h3>
                <p className="text-xs text-[#8a92a3] leading-6">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="interactive-af" className="mt-12">
        <div className="text-[10px] text-[#f59e0b] font-mono tracking-[0.18em] mb-2">采集函数（Acquisition Function）</div>
        <h2 className="text-2xl font-semibold text-[#f3f6fb] mb-4">为什么下一次推荐点不是“预测值最高处”</h2>
        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-6">
          <p className="text-sm text-[#d0d4dc] leading-7 mb-3">
            GP-BO 的核心不在于“拟合一条曲线”，而在于同时利用预测均值与不确定度。
            采集函数（如 EI、UCB）真正解决的问题是：下一次实验究竟该去“看起来最好”的地方，还是去“最值得确认”的地方。
          </p>
          <p className="text-sm text-[#8a92a3] leading-7 mb-4">
            对研究生来说，最关键的不是把公式背下来，而是能解释每一次推荐背后的理由：
            它是在做 exploitation，还是在做 exploration，还是两者之间的折中。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/sdl-demo"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,245,212,0.22)] px-4 py-2 text-sm font-mono text-[#00f5d4] no-underline"
            >
              去看 GP-BO 解释与演示 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(67,97,238,0.18)] px-4 py-2 text-sm font-mono text-[#d0d4dc] no-underline"
            >
              转到资源页（Resources） <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
