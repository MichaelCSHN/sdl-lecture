import { useState, useCallback } from 'react';
import { Link } from 'react-router';
import { Copy, RotateCcw, CheckCheck } from 'lucide-react';

const studioFields = [
  {
    name: '研究问题',
    nameEn: 'Research Question',
    prompt: '用一句不带“和”字的陈述写清你的问题，明确你想解释、比较或优化的对象。',
    placeholder: '例如：在 300–500°C 范围内，沉积温度如何影响 TiO2 薄膜的光催化活性？',
  },
  {
    name: '目标与结果变量',
    nameEn: 'Objective & Output Variable',
    prompt: '说明主要结果变量是什么，用什么仪器、什么单位、什么精度测量。',
    placeholder: '例如：光催化降解率（%），UV-Vis 分光光度计，精度 ±0.5%，目标：最大化。',
  },
  {
    name: '因素与约束',
    nameEn: 'Factors & Constraints',
    prompt: '列出你真正打算操控的因素、必须固定的变量，以及不能突破的安全或成本边界。',
    placeholder: '例如：自变量为沉积温度（300–500°C）和气压（0.1–10 Pa）；固定基底材料；约束为粗糙度 < 5 nm。',
  },
  {
    name: '实验设计方案',
    nameEn: 'Experimental Design',
    prompt: '解释为什么选择 OFAT、析因设计、RSM，还是贝叶斯优化 / SDL 闭环，并说明实验次数估计。',
    placeholder: '例如：参数连续且昂贵，选贝叶斯优化。初始 5 个 seed 点，EI 策略，预计 20 次内收敛。',
  },
  {
    name: '执行与记录',
    nameEn: 'Execution & Record-keeping',
    prompt: '谁来随机化、谁来盲标、如何记录原始值、如何保证 SOP 被真正执行。',
    placeholder: '例如：实验顺序随机化（Python random.shuffle），原始数据记录到 ELN，每批次附仪器校准记录。',
  },
  {
    name: '数据与分析计划',
    nameEn: 'Data & Analysis Plan',
    prompt: '异常值处理规则、统计检验、敏感性分析，都应在采集数据前写明，而不是结果出来后倒推。',
    placeholder: '例如：按 3σ 原则剔除异常值；GP 模型更新后检查后验覆盖度；用独立验证集验证最优点。',
  },
  {
    name: '风险与验证',
    nameEn: 'Risks & Validation',
    prompt: '指出最可能失败的步骤，并说明如何用预实验、对照或独立重复验证关键结论。',
    placeholder: '例如：最大风险是高温导致薄膜脱落（T > 560°C）；先用预实验确定失效边界；最优点做三次重复验证。',
  },
  {
    name: '哪些判断必须由人完成',
    nameEn: 'Required Human Judgment',
    prompt: '明确哪些环节可以交给自动化，哪些环节仍需要研究者做机制判断与边界设定。',
    placeholder: '例如：参数边界定义、失败判据认定、最终相结构解读均不能委托给算法。算法负责推荐，人负责验证。',
  },
];

const EMPTY = studioFields.map(() => '');

export default function DesignStudioPage() {
  const [values, setValues] = useState<string[]>(EMPTY);
  const [copied, setCopied] = useState(false);

  const setValue = useCallback((index: number, val: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    if (window.confirm('清空所有内容？')) setValues(EMPTY);
  }, []);

  const copyAll = useCallback(async () => {
    const text = [
      '# SDL 研究设计草案',
      '',
      ...studioFields.map((field, index) => `## ${String(index + 1).padStart(2, '0')} ${field.name}\n${values[index].trim() || '（未填写）'}`),
    ].join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [values]);

  const filledCount = values.filter((v) => v.trim().length > 0).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">研究设计工作室（Research Design Studio）</div>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 text-[#f3f6fb]">
              把自己的课题重写成一份可执行实验设计
            </h1>
            <p className="text-[#8a92a3] max-w-3xl leading-7 text-sm">
              承接 8 步实验工作流。目标不是“写得漂亮”，而是让你真正暴露问题：哪里还没有变量定义，哪里还没有对照，哪里只是口号式地说“想用 SDL”。
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-[#8a92a3]">{filledCount}/{studioFields.length} 已填</span>
            <button
              onClick={copyAll}
              disabled={filledCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-mono transition-colors border-[rgba(0,245,212,0.25)] text-[#00f5d4] hover:bg-[rgba(0,245,212,0.08)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制全文'}
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-mono border-[rgba(255,107,107,0.2)] text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.06)]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 清空
            </button>
          </div>
        </div>
      </div>

      <div className="h-1 rounded-full bg-[rgba(67,97,238,0.12)] mb-8 overflow-hidden">
        <div className="h-full rounded-full bg-[#00f5d4] transition-all duration-500" style={{ width: `${(filledCount / studioFields.length) * 100}%` }} />
      </div>

      <div className="grid gap-5 md:grid-cols-2 mb-10">
        {studioFields.map((field, index) => {
          const filled = values[index].trim().length > 0;
          return (
            <div
              key={field.name}
              className="glass-panel rounded-2xl border p-5 transition-colors"
              style={{ borderColor: filled ? 'rgba(0,245,212,0.25)' : 'rgba(67,97,238,0.12)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-mono flex-shrink-0 transition-colors"
                  style={{
                    borderColor: filled ? 'rgba(0,245,212,0.4)' : 'rgba(67,97,238,0.2)',
                    background: filled ? 'rgba(0,245,212,0.1)' : 'rgba(0,245,212,0.04)',
                    color: filled ? '#00f5d4' : '#8a92a3',
                  }}
                >
                  {filled ? '✓' : String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[#d0d4dc] leading-tight">{field.name}</h2>
                  <span className="text-[10px] font-mono text-[#5a6377]">（{field.nameEn}）</span>
                </div>
              </div>
              <p className="text-[11px] text-[#8a92a3] leading-5 mb-3 pl-10">{field.prompt}</p>
              <textarea
                value={values[index]}
                onChange={(e) => setValue(index, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full rounded-xl border bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[#d0d4dc] placeholder-[#3a3f4a] resize-none leading-7 focus:outline-none transition-colors"
                style={{ borderColor: filled ? 'rgba(0,245,212,0.2)' : 'rgba(67,97,238,0.15)' }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(0,245,212,0.4)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = filled ? 'rgba(0,245,212,0.2)' : 'rgba(67,97,238,0.15)';
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-2xl border border-[rgba(67,97,238,0.12)] p-5">
          <div className="text-[10px] text-[#fee440] font-mono tracking-[0.18em] mb-2">自检清单（Self-Check）</div>
          <h2 className="text-lg font-semibold text-[#f3f6fb] mb-3">提交设计草案前先问自己</h2>
          <ul className="space-y-3">
            {[
              '如果把 “AI” 两个字删掉，这个设计本身是否依然成立？',
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
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.18em] mb-2">站内路径（Route Map）</div>
          <h2 className="text-lg font-semibold text-[#f3f6fb] mb-3">在站内继续往下走</h2>
          <div className="space-y-3">
            {[
              {
                to: '/methods',
                title: '回到 8 步实验工作流',
                desc: '如果你发现自己答不上来，回到完整流程页面，检查到底卡在了哪一步。',
              },
              {
                to: '/foundations#ofat-to-sdl',
                title: '重看 DOE 与 SDL 的边界',
                desc: '很多课题不是“缺一个算法”，而是还没完成实验设计与测量框架的收束。',
              },
              {
                to: '/resources',
                title: '进入阅读轨与资源页',
                desc: '如果你想补某一段方法论背景，这里已经按主题和阶段整理好了入口。',
              },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-xl border border-[rgba(67,97,238,0.12)] px-4 py-3 no-underline hover:border-[#00f5d4] transition-colors"
              >
                <div className="text-sm font-semibold text-[#d0d4dc] mb-1">{link.title}</div>
                <div className="text-xs text-[#8a92a3] leading-5">{link.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
