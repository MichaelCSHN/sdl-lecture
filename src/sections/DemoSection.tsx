import { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { GaussianProcess, liveCases, expectedImprovement, upperConfidenceBound, computeGPGrid, gaussianRandom, type LiveCase } from '../lib/bo_engine';
import { generateRandom, generateLHS, generateSobol, generateFullFactorial, runRace, type RaceResult } from '../lib/doe_engine';
import { quizQuestions } from '../data/quiz_data';
const Plot = lazy(() => import('../components/PlotlyChart'));

// ===================== Archived AI streaming demo =====================
// This legacy section is not rendered. Do not expose direct provider API
// endpoints in public learning resources; route through a server-side proxy
// and official documentation if this demo is restored.

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function* streamDeepseek(apiKey: string, messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
  try {
    const resp = await fetch('/api/ai-chat-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });
    if (!resp.ok) { yield `\n[Error: ${resp.status} ${resp.statusText}]`; return; }
    const reader = resp.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (!line.trim() || line === 'data: [DONE]') continue;
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch { /* ignore */ }
        }
      }
    }
  } catch (e: any) {
    yield `\n[Error: ${e.message}]`;
  }
}

const DEEPSEEK_SYSTEM_PROMPT = `你是一位材料科学领域的 AI 实验规划助手，专精于自主实验室（Self-driving Labs）和贝叶斯优化（Bayesian Optimization）。

当用户提出实验课题时，你需要：
1. 分析研究目标的实验可行性
2. 推荐具体的合成路线和实验条件
3. 建议合适的表征方法和性能指标
4. 给出 Bayesian Optimization 的目标函数设计和参数空间建议
5. 推荐相关的开源工具（BayBE、Honegumi、Ax 等）

回复使用 Markdown 格式，保持专业但易懂的风格。`;

const SDL_SYSTEM_PROMPT = `你是一位 Self-driving Lab (SDL) 系统设计专家。当用户输入一个研究课题时，你需要将其分解为完整的 SDL 组件：

## 输出格式

### 1. 研究目标 (Objective)
- 明确的主要目标
- 可量化的评价指标

### 2. 实验参数 (Parameters)
| 参数名 | 类型 | 搜索范围 | 说明 |
列出所有可调参数

### 3. 约束条件 (Constraints)
- 物理/化学约束
- 安全约束
- 资源约束

### 4. 建议方法 (Method)
- 推荐的 BO 策略
- 初始实验数量建议
- 采集函数推荐

### 5. 推荐工具 (Tools)
- 开源框架推荐
- 硬件平台建议

保持专业、结构化、可操作的输出风格。`;

function offlineResponse(prompt: string): string {
  const kw = prompt.toLowerCase();
  if (/bo|bayesian|贝叶斯|优化|实验设计/.test(kw)) {
    return `## 贝叶斯优化实验方案建议

1. **定义搜索空间**：确定关键实验参数及其范围
2. **初始采样**：使用 LHS 选取 5-10 个初始点
3. **构建代理模型**：用 GP 拟合已有数据
4. **选择采集函数**：推荐 Expected Improvement (EI)
5. **迭代优化**：每轮根据采集函数推荐新实验点

**推荐工具**：BayBE（材料科学专用）、scikit-optimize、Ax/BoTorch

*（离线模式 — 配置 Deepseek API Key 以启用在线 AI）*`;
  }
  if (/sdl|自主|闭环|自驱动|实验室/.test(kw)) {
    return `## 课题 SDL 化分析

**适合 SDL 的条件**：
- 实验可自动化（称量、混合、加热等标准操作）
- 参数空间明确（≤10 个连续/离散变量）
- 评价指标可量化（产率、导电率、硬度等）
- 单次实验耗时 < 24h

**建议路线**：从最标准化的表征环节开始自动化，逐步扩展至合成。

*（离线模式 — 配置 Deepseek API Key 以启用在线 AI）*`;
  }
  if (/钙钛矿|perovskite|太阳能|光伏/.test(kw)) {
    return `## 钙钛矿研究 BO 建议

**典型参数空间**：前体浓度、溶剂配比、退火温度/时间、添加剂种类

**目标函数**：光电转换效率 (PCE) 或稳定性指标

**推荐方案**：使用 BayBE 处理混合参数（分类+连续），10 个初始实验 + 20 轮 BO

*（离线模式 — 配置 Deepseek API Key 以启用在线 AI）*`;
  }
  if (/电池|battery|电解|锂|lithium/.test(kw)) {
    return `## 电池材料优化建议

**关键参数**：电解液组成（EC/DMC/EMC 配比）、盐浓度、添加剂

**目标**：离子电导率、电化学窗口、循环稳定性

**多目标建议**：使用 Pareto 优化同时考虑电导率和稳定性

*（离线模式 — 配置 Deepseek API Key 以启用在线 AI）*`;
  }
  // Default fallback
  return `## 实验设计建议

我可以帮你将这个课题转化为 Self-driving Lab 的工作流。请告诉我更多细节，例如：
- 目标材料/体系
- 可调参数范围
- 评价指标

或配置 Deepseek API Key 获取 AI 深度分析。`;
}

// SDL decomposition offline response
function sdlOfflineResponse(prompt: string): string {
  const kw = prompt.toLowerCase();
  if (/钙钛矿|perovskite/.test(kw)) {
    return `## SDL 分解：钙钛矿材料优化

### 1. 研究目标
- **主要目标**：最大化光电转换效率 (PCE)
- **次要目标**：提升湿热稳定性 (T80 > 1000h)
- **评价指标**：PCE (%)、Voc (V)、Jsc (mA/cm²)、FF (%)

### 2. 实验参数
| 参数 | 类型 | 搜索范围 | 说明 |
|------|------|----------|------|
| PbI₂ 浓度 | 连续 | 1.0–1.5 M | 前体溶液浓度 |
| FAI 比例 | 连续 | 0.8–1.2 eq | 有机阳离子配比 |
| 退火温度 | 连续 | 100–180 °C | 热退火条件 |
| 退火时间 | 连续 | 10–60 min | |
| 添加剂 | 分类 | MACl/PEAI/无 | 结晶调控剂 |
| 溶剂配比 | 连续 | DMF:DMSO 4:1–8:1 | |

### 3. 约束条件
- PbI₂ 有毒，需在通风橱中操作
- 退火温度 ≤ 200°C（基底限制）
- 单次实验时间 < 4h

### 4. 建议方法
- **初始采样**：LHS 12 个点
- **采集函数**：EI（纯探索）→ 后期切换 UCB
- **批量大小**：每轮 3 个并行实验
- **迭代次数**：30 轮

### 5. 推荐工具
- **框架**：BayBE、Honegumi
- **自动化**：Chemotion ELN + 液体处理机器人
- **表征**：太阳模拟器 + 自动换样器`;
  }
  if (/电池|battery|电解|锂|固态/.test(kw)) {
    return `## SDL 分解：固态电池电解质优化

### 1. 研究目标
- **主要目标**：最大化离子电导率 (σ > 10⁻³ S/cm)
- **次要目标**：最小化界面阻抗
- **评价指标**：σ (S/cm)、电化学窗口 (V)、迁移数 t⁺

### 2. 实验参数
| 参数 | 类型 | 搜索范围 | 说明 |
|------|------|----------|------|
| LLZO 掺杂量 | 连续 | 0–15% | Al/Ta 掺杂 |
| 烧结温度 | 连续 | 1000–1300°C | |
| 烧结时间 | 连续 | 2–24 h | |
| 压强 | 连续 | 100–500 MPa | 冷等静压 |

### 3. 约束条件
- 烧结温度受炉体限制
- 锂空气敏感，需 Ar 气氛
- 片厚 0.5–1.5 mm

### 4. 建议方法
- **初始采样**：Full Factorial 混合 LHS
- **采集函数**：logEI（处理高动态范围）
- **迭代**：20 轮

### 5. 推荐工具
- **框架**：Ax/BoTorch（支持分类变量）
- **硬件**：压片机 + 管式炉自动系统`;
  }
  if (/催化|catalyst|co2|co₂|还原/.test(kw)) {
    return `## SDL 分解：CO₂ 还原催化剂

### 1. 研究目标
- **主要目标**：最大化 CO 选择性 (> 90%)
- **次要目标**：最小化过电位 (< 300 mV)
- **评价指标**：FE_CO (%)、j_CO (mA/cm²)、过电位 η

### 2. 实验参数
| 参数 | 类型 | 搜索范围 | 说明 |
|------|------|----------|------|
| 金属配比 | 连续 | Cu:Ag 1:0–1:1 | 双金属催化剂 |
| 负载量 | 连续 | 0.1–2.0 mg/cm² | |
| 电解液浓度 | 连续 | 0.1–1.0 M | KHCO₃ |
| 施加电位 | 连续 | -0.4 to -1.0 V | vs RHE |

### 3. 约束条件
- 电解液 pH 8–9（缓冲能力）
- CO₂ 流量 20–100 sccm
- 单池运行时间 < 6h（积碳问题）

### 4. 建议方法
- **多目标 BO**：Pareto 前沿搜索
- **采集函数**：EHVI (Expected Hypervolume Improvement)
- **批量**：每轮 4 个电位同时测试

### 5. 推荐工具
- **框架**：BoTorch (多目标)、Emukit
- **在线分析**：GC 联用自动进样`;
  }
  return `## SDL 分解：通用框架

### 1. 研究目标
- 请明确你的核心优化指标（产量、效率、选择性等）

### 2. 实验参数
- 列出所有可调参数及其物理可行范围

### 3. 约束条件
- 安全、成本、时间限制

### 4. 建议方法
- **初始设计**：LHS 或 Sobol 序列
- **采集函数**：推荐 EI 或 UCB
- **迭代预算**：通常 20–50 轮

### 5. 推荐工具
- BayBE、Honegumi、Ax、HEBO

*配置 Deepseek API Key 获取针对该课题的深度 SDL 分解。*`;
}

// ===================== Quiz Panel =====================

function QuizPanel() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = quizQuestions[currentQ];

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    if (idx === q.correct) setScore((s) => s + 1);
  };
  const handleNext = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowAnswer(false);
    } else setFinished(true);
  };

  if (finished) return (
    <div className="glass-panel p-6 text-center">
      <div className="text-3xl font-mono-title text-[#00f5d4] mb-2">{Math.round((score / quizQuestions.length) * 100)}%</div>
      <div className="text-sm text-[#d0d4dc] mb-1">答对 {score} / {quizQuestions.length} 题</div>
      <div className="text-xs text-[#8a92a3] mb-4">{score === quizQuestions.length ? '完美！' : score >= 3 ? '不错！' : '建议回顾前面内容'}</div>
      <button onClick={() => { setCurrentQ(0); setSelected(null); setShowAnswer(false); setScore(0); setFinished(false); }}
        className="btn-glow px-4 py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded">重新测试</button>
    </div>
  );

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-[#00f5d4] font-mono tracking-wider">QUIZ — {currentQ + 1}/{quizQuestions.length}</span>
        <div className="flex gap-1">{quizQuestions.map((_, i) => (
          <div key={i} className={`w-4 h-1 rounded-full ${i < currentQ ? 'bg-[#00f5d4]' : i === currentQ ? 'bg-[#fee440]' : 'bg-[rgba(67,97,238,0.2)]'}`} />
        ))}</div>
      </div>
      <p className="text-sm text-[#d0d4dc] mb-4 leading-relaxed">{q.question}</p>
      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleSelect(i)} disabled={showAnswer}
            className={`w-full text-left px-4 py-2.5 rounded border text-xs transition-all ${
              showAnswer ? (i === q.correct ? 'border-[#00f5d4] bg-[rgba(0,245,212,0.1)] text-[#00f5d4]' : i === selected ? 'border-[#ff6b6b] bg-[rgba(255,107,107,0.1)] text-[#ff6b6b]' : 'border-[rgba(67,97,238,0.1)] text-[#8a92a3]')
              : 'border-[rgba(67,97,238,0.2)] text-[#d0d4dc] hover:border-[#00f5d4]'
            }`}>{opt}</button>
        ))}
      </div>
      <AnimatePresence>
        {showAnswer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mb-4">
            <div className="p-3 rounded bg-[rgba(0,245,212,0.05)] border border-[rgba(0,245,212,0.15)]">
              <div className="text-[10px] text-[#00f5d4] font-mono mb-1">EXPLANATION</div>
              <p className="text-xs text-[#d0d4dc] leading-relaxed">{q.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showAnswer && (
        <button onClick={handleNext} className="btn-glow px-4 py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded w-full">
          {currentQ < quizQuestions.length - 1 ? '下一题 →' : '查看结果'}
        </button>
      )}
    </div>
  );
}

// ===================== BO Simulator Panel =====================

function BOSimulatorPanel() {
  const [activeCase, setActiveCase] = useState<LiveCase>(liveCases[0]);
  const [paramValues, setParamValues] = useState<number[]>(liveCases[0].params.map((p) => p.default));
  const [experiments, setExperiments] = useState<{ id: number; params: number[]; result: number }[]>([]);
  const [gp, setGp] = useState<GaussianProcess | null>(null);
  const [acqType, setAcqType] = useState<'ei' | 'ucb'>('ei');
  const [kappa, setKappa] = useState(2.0);
  const [xi, setXi] = useState(0.01);
  const [lengthScale, setLengthScale] = useState(1.0);
  const [showHyperPanel, setShowHyperPanel] = useState(false);
  const [gridData, setGridData] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize GP on case change
  useEffect(() => {
    const newGp = new GaussianProcess(lengthScale, 1.0, 0.01);
    setGp(newGp);
    setExperiments([]);
    setParamValues(activeCase.params.map((p) => p.default));
    setGridData(null);
  }, [activeCase]);

  // Update grid visualization
  useEffect(() => {
    if (!gp || experiments.length < 2) { setGridData(null); return; }
    const X = experiments.map((e) => e.params);
    const y = experiments.map((e) => e.result);
    const gpCopy = new GaussianProcess(lengthScale, 1.0, 0.01);
    gpCopy.fit(X, y);

    // Use first 2 params for visualization
    const grid = computeGPGrid(gpCopy, activeCase, paramValues, 0, 1, 25);
    setGridData(grid);
  }, [experiments, activeCase, paramValues, lengthScale]);

  const runExperiment = () => {
    if (!gp || isRunning) return;
    setIsRunning(true);
    setTimeout(() => {
      const result = activeCase.objectiveFn(paramValues) + gaussianRandom(0, activeCase.noise);
      const newExp = { id: experiments.length + 1, params: [...paramValues], result: Math.round(result * 100) / 100 };
      const newExps = [...experiments, newExp];
      setExperiments(newExps);

      // Re-fit GP
      const X = newExps.map((e) => e.params);
      const y = newExps.map((e) => e.result);
      const newGp = new GaussianProcess(lengthScale, 1.0, 0.01);
      newGp.fit(X, y);
      setGp(newGp);

      // Find next point via acquisition function
      let bestVal = -Infinity;
      let bestParams = [...paramValues];
      const yBest = Math.max(...y);

      // Grid search over parameter space
      const grids = activeCase.params.map((p) => {
        const pts: number[] = [];
        for (let i = 0; i <= 10; i++) pts.push(p.min + (i / 10) * (p.max - p.min));
        return pts;
      });

      if (activeCase.params.length === 2) {
        for (const v1 of grids[0]) {
          for (const v2 of grids[1]) {
            const pred = newGp.predict([v1, v2]);
            const acq = acqType === 'ei' ? expectedImprovement(pred.mean, pred.std, yBest, xi) : upperConfidenceBound(pred.mean, pred.std, kappa);
            if (acq > bestVal) { bestVal = acq; bestParams = [v1, v2]; }
          }
        }
      } else {
        // Random sampling for higher dimensions
        for (let i = 0; i < 500; i++) {
          const candidate = activeCase.params.map((p) => p.min + Math.random() * (p.max - p.min));
          const pred = newGp.predict(candidate);
          const acq = acqType === 'ei' ? expectedImprovement(pred.mean, pred.std, yBest) : upperConfidenceBound(pred.mean, pred.std, kappa);
          if (acq > bestVal) { bestVal = acq; bestParams = candidate; }
        }
      }

      setParamValues(bestParams.map((v, i) => Math.round(v / activeCase.params[i].step) * activeCase.params[i].step));
      setIsRunning(false);
    }, 300);
  };

  const reset = () => {
    const newGp = new GaussianProcess(lengthScale, 1.0, 0.01);
    setGp(newGp);
    setExperiments([]);
    setParamValues(activeCase.params.map((p) => p.default));
    setGridData(null);
  };

  const bestExp = experiments.length > 0 ? experiments.reduce((a, b) => (a.result > b.result ? a : b)) : null;

  // Plotly data
  const plotData = useMemoPlotly(gridData, experiments, activeCase);

  return (
    <div className="space-y-4">
      {/* Case selector */}
      <div className="glass-panel p-4">
        <div className="text-[10px] text-[#00f5d4] font-mono tracking-wider mb-3">SELECT LIVE CASE ({liveCases.length} available)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {liveCases.map((c) => (
            <button key={c.id} onClick={() => setActiveCase(c)}
              className={`p-2.5 rounded border text-left transition-all ${
                activeCase.id === c.id ? 'border-[#00f5d4] bg-[rgba(0,245,212,0.08)]' : 'border-[rgba(67,97,238,0.15)] hover:border-[rgba(67,97,238,0.3)]'
              }`}>
              <div className={`text-xs font-mono ${activeCase.id === c.id ? 'text-[#00f5d4]' : 'text-[#d0d4dc]'}`}>{c.name}</div>
              <div className="text-[9px] text-[#8a92a3] font-mono">{c.nameEn}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-[#8a92a3] mt-3 leading-relaxed">{activeCase.description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Controls */}
        <div className="w-full lg:w-[320px] flex-shrink-0 space-y-3">
          {/* Params */}
          <div className="glass-panel p-4">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-3">PARAMETERS — {activeCase.unit}</div>
            {activeCase.params.map((p, i) => (
              <div key={p.nameEn} className="mb-3">
                <div className="flex justify-between text-xs text-[#8a92a3] font-mono mb-1">
                  <span>{p.name} ({p.nameEn})</span>
                  <span className="text-[#00f5d4]">{paramValues[i]?.toFixed(p.step < 1 ? 1 : 0)} {p.unit}</span>
                </div>
                <input type="range" min={p.min} max={p.max} step={p.step} value={paramValues[i] || p.default}
                  onChange={(e) => setParamValues((prev) => { const n = [...prev]; n[i] = parseFloat(e.target.value); return n; })}
                  className="w-full h-1 bg-[rgba(67,97,238,0.2)] rounded-full appearance-none cursor-pointer accent-[#00f5d4]" />
                <div className="flex justify-between text-[9px] text-[#8a92a3] font-mono mt-0.5">
                  <span>{p.min}</span><span>{p.max} {p.unit}</span>
                </div>
              </div>
            ))}

            {/* Acquisition function */}
            <div className="mb-3">
              <div className="text-[10px] text-[#8a92a3] font-mono mb-1">ACQUISITION FUNCTION</div>
              <div className="flex gap-2">
                <button onClick={() => setAcqType('ei')} className={`flex-1 px-2 py-1 text-[10px] font-mono rounded border ${acqType === 'ei' ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'}`}>EI</button>
                <button onClick={() => setAcqType('ucb')} className={`flex-1 px-2 py-1 text-[10px] font-mono rounded border ${acqType === 'ucb' ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'}`}>UCB</button>
              </div>
            </div>

            {acqType === 'ucb' && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[#8a92a3] font-mono mb-1">
                  <span>κ (exploration)</span><span className="text-[#00f5d4]">{kappa.toFixed(1)}</span>
                </div>
                <input type="range" min="0.1" max="5" step="0.1" value={kappa} onChange={(e) => setKappa(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[rgba(67,97,238,0.2)] rounded-full appearance-none cursor-pointer accent-[#00f5d4]" />
              </div>
            )}

            {/* Hyperparameter panel (collapsible) */}
            <div className="border-t border-[rgba(67,97,238,0.1)] pt-3 mt-3">
              <button onClick={() => setShowHyperPanel(!showHyperPanel)} className="flex items-center gap-2 text-[10px] text-[#8a92a3] font-mono hover:text-[#d0d4dc] transition-colors">
                <span className={`transition-transform ${showHyperPanel ? 'rotate-90' : ''}`}>▶</span>
                超参数面板
              </button>
              {showHyperPanel && (
                <div className="mt-2 space-y-2">
                  {acqType === 'ei' && (
                    <div>
                      <div className="flex justify-between text-[10px] text-[#8a92a3] font-mono mb-0.5">
                        <span>xi (EI exploration)</span><span className="text-[#00f5d4]">{xi.toFixed(2)}</span>
                      </div>
                      <input type="range" min="0" max="0.5" step="0.01" value={xi} onChange={(e) => setXi(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[rgba(67,97,238,0.2)] rounded-full appearance-none cursor-pointer accent-[#00f5d4]" />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-[10px] text-[#8a92a3] font-mono mb-0.5">
                      <span>length scale (kernel)</span><span className="text-[#00f5d4]">{lengthScale.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0.1" max="5.0" step="0.1" value={lengthScale} onChange={(e) => setLengthScale(parseFloat(e.target.value))}
                      className="w-full h-1 bg-[rgba(67,97,238,0.2)] rounded-full appearance-none cursor-pointer accent-[#00f5d4]" />
                  </div>
                  <p className="text-[9px] text-[#8a92a3] leading-tight">
                    kappa 越大，UCB 越倾向探索未知区域；length scale 越大，GP 假设函数越平滑。
                  </p>
                  {/* GP lengthScale sensitivity visualization */}
                  {experiments.length >= 2 && (
                    <GPSensitivityViz experiments={experiments} activeCase={activeCase} />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={runExperiment} disabled={isRunning}
                className="flex-1 btn-glow py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded disabled:opacity-40">
                {isRunning ? 'Computing GP...' : `Run Experiment #${experiments.length + 1}`}
              </button>
              <button onClick={reset} className="px-3 py-2 border border-[rgba(67,97,238,0.2)] text-[#8a92a3] text-xs font-mono rounded hover:text-[#d0d4dc]">Reset</button>
            </div>
          </div>

          {/* Stats */}
          <div className="glass-panel p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-[#8a92a3] font-mono">EXPERIMENTS</div>
                <div className="text-xl text-[#00f5d4] font-mono-title">{experiments.length}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a92a3] font-mono">BEST</div>
                <div className="text-xl text-[#fee440] font-mono-title">{bestExp ? bestExp.result.toFixed(1) : '—'} <span className="text-xs text-[#8a92a3]">{activeCase.unit}</span></div>
              </div>
            </div>
            {experiments.length > 0 && (
              <div className="mt-3 max-h-[140px] overflow-y-auto">
                <table className="w-full text-[10px] font-mono">
                  <thead><tr className="text-[#8a92a3]"><th className="text-left py-0.5">#</th>{activeCase.params.slice(0, 2).map((p, i) => <th key={i} className="text-left">{p.nameEn.slice(0, 4)}</th>)}<th className="text-right">{activeCase.unit}</th></tr></thead>
                  <tbody>{[...experiments].reverse().map((exp) => (
                    <tr key={exp.id} className="border-t border-[rgba(67,97,238,0.08)]">
                      <td className="py-1 text-[#00f5d4]">{exp.id}</td>
                      {exp.params.slice(0, 2).map((v, i) => <td key={i} className="text-[#d0d4dc]">{v.toFixed(activeCase.params[i].step < 1 ? 1 : 0)}</td>)}
                      <td className={`text-right ${exp.result === bestExp?.result ? 'text-[#fee440]' : 'text-[#d0d4dc]'}`}>{exp.result.toFixed(1)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>

          {/* GP explanation */}
          <div className="glass-panel p-3">
            <div className="text-[10px] text-[#8a92a3] font-mono mb-1">ABOUT THIS ALGORITHM</div>
            <p className="text-[10px] text-[#8a92a3] leading-relaxed">
              使用真实的高斯过程（GP）代理模型，RBF 核函数。采集函数：{acqType === 'ei' ? 'Expected Improvement (EI)' : `Upper Confidence Bound (UCB, κ=${kappa})`}。每次实验后重新拟合 GP 并建议下一个采样点。
            </p>
          </div>
        </div>

        {/* Plotly chart */}
        <div className="flex-1 glass-panel p-3" style={{ minHeight: 450 }}>
          {experiments.length < 2 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-[#8a92a3] font-mono mb-2">运行至少 2 次实验以激活 GP 可视化</div>
                <div className="text-xs text-[#8a92a3]">GP 后验分布需要 ≥2 个观测点</div>
              </div>
            </div>
          ) : (
            <Suspense fallback={<div className="h-full flex items-center justify-center text-[#8a92a3] text-xs">Loading Plotly...</div>}>
              <Plot data={plotData.data} layout={plotData.layout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%', height: 450 }} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

// Build Plotly traces from GP grid data
function useMemoPlotly(gridData: any, experiments: any[], activeCase: LiveCase) {
  return useMemo(() => {
    if (!gridData) return { data: [], layout: {} };
    const p1 = activeCase.params[0];
    const p2 = activeCase.params[1];

    const data: any[] = [
      // GP Mean surface
      {
        type: 'contour',
        x: gridData.x,
        y: gridData.y,
        z: gridData.zMean,
        colorscale: 'Viridis',
        name: 'GP Mean',
        showscale: true,
        colorbar: { title: { text: 'Mean', font: { size: 10, color: '#8a92a3' } }, tickfont: { size: 9, color: '#8a92a3' } },
        contours: { coloring: 'heatmap' },
        opacity: 0.8,
      },
      // Observed points
      {
        type: 'scatter',
        mode: 'markers+text',
        x: experiments.map((e) => e.params[0]),
        y: experiments.map((e) => e.params[1]),
        text: experiments.map((e) => `${e.result.toFixed(1)}`),
        textposition: 'top center',
        marker: {
          size: 12,
          color: experiments.map((_, i) => i),
          colorscale: [[0, '#fee440'], [1, '#00f5d4']],
          line: { color: '#fff', width: 1 },
        },
        name: 'Experiments',
        hovertemplate: `${p1.nameEn}: %{x:.1f}<br>${p2.nameEn}: %{y:.1f}<br>Result: %{text}<extra></extra>`,
      },
    ];

    // Acquisition function contour overlay (optional)
    if (gridData.zEI) {
      data.push({
        type: 'contour',
        x: gridData.x,
        y: gridData.y,
        z: gridData.zEI,
        colorscale: [[0, 'rgba(0,0,0,0)'], [1, 'rgba(255,107,107,0.15)']],
        showscale: false,
        contours: { coloring: 'none', showlabels: false },
        line: { color: 'rgba(255,107,107,0.3)', width: 0.5 },
        name: 'Acquisition',
      });
    }

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#d0d4dc', size: 11, family: 'JetBrains Mono, monospace' },
      xaxis: { title: { text: `${p1.name} (${p1.unit})`, font: { size: 10 } }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)', tickfont: { size: 9 } },
      yaxis: { title: { text: `${p2.name} (${p2.unit})`, font: { size: 10 } }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)', tickfont: { size: 9 } },
      margin: { t: 30, r: 30, b: 50, l: 60 },
      legend: { font: { size: 9 }, x: 0.02, y: 0.98, bgcolor: 'rgba(6,22,42,0.7)' },
      hoverlabel: { bgcolor: 'rgba(6,22,42,0.95)', bordercolor: 'rgba(0,245,212,0.3)', font: { size: 10 } },
    };

    return { data, layout };
  }, [gridData, experiments, activeCase]);
}

// ===================== LLM Planner Panel =====================

function LLMPlannerPanel() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('deepseek_api_key') || '');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [sdlMode, setSdlMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = async () => {
    if (!query.trim() || streaming) return;

    const userMsg = { role: 'user', content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setQuery('');
    setStreaming(true);

    // Offline mode: no API key
    if (!apiKey) {
      const offlineReply = sdlMode ? sdlOfflineResponse(query) : offlineResponse(query);
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      // Typewriter effect for offline response
      let displayed = '';
      const chars = offlineReply.split('');
      for (let i = 0; i < chars.length; i++) {
        displayed += chars[i];
        setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: displayed }; return u; });
        await new Promise((r) => setTimeout(r, 15));
      }
      setStreaming(false);
      return;
    }

    // Online mode: Deepseek API
    const systemPrompt = sdlMode ? SDL_SYSTEM_PROMPT : DEEPSEEK_SYSTEM_PROMPT;
    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...newMessages,
    ];

    let assistantContent = '';
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      for await (const chunk of streamDeepseek(apiKey, allMessages as ChatMessage[])) {
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
    }
  };

  const saveKey = () => {
    localStorage.setItem('deepseek_api_key', apiKey);
    setShowKeyInput(false);
  };

  const chatPresets = ['寻找更高导电率的钙钛矿', '优化锂电池固态电解质', '探索CO2还原用高效催化剂', '设计宽带隙半导体材料'];
  const sdlPresets = ['钙钛矿太阳能电池效率优化', '固态锂电池电解质设计', 'CO2电还原催化剂筛选', 'SnAr反应产率最大化'];
  const presets = sdlMode ? sdlPresets : chatPresets;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {showKeyInput && (
        <div className="glass-panel p-4 border border-[#fee440]">
          <div className="text-xs text-[#fee440] font-mono mb-2">API KEY REQUIRED</div>
          <p className="text-xs text-[#8a92a3] mb-3">
            请输入你的 Deepseek API Key。Key 仅存储在本地浏览器中，不会发送到任何第三方服务器。
            获取地址：<a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-[#00f5d4] hover:underline">platform.deepseek.com</a>
          </p>
          <div className="flex gap-2">
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 bg-[#0a1628] border border-[rgba(67,97,238,0.2)] rounded px-3 py-2 text-sm text-[#d0d4dc] font-mono focus:border-[#00f5d4] outline-none" />
            <button onClick={saveKey} className="btn-glow px-4 py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded">保存</button>
          </div>
        </div>
      )}

      {/* Chat history */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="glass-panel p-4 max-h-[400px] overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-[rgba(0,245,212,0.15)] border border-[rgba(0,245,212,0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[8px] text-[#00f5d4]">AI</span>
                </div>
              )}
              <div className={`max-w-[80%] p-3 rounded-lg text-xs leading-relaxed ${
                msg.role === 'user' ? 'bg-[rgba(67,97,238,0.15)] text-[#d0d4dc]' : 'bg-[rgba(0,245,212,0.05)] border border-[rgba(0,245,212,0.1)] text-[#d0d4dc]'
              }`}>
                {msg.role === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                ) : (
                  msg.content
                )}
                {msg.role === 'assistant' && !msg.content && streaming && (
                  <span className="inline-block w-3 h-3 border border-[#00f5d4] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        {[
          { mode: false, label: 'Chat Mode' },
          { mode: true, label: 'SDL Decompose' },
        ].map((b) => (
          <button key={String(b.mode)} onClick={() => { setSdlMode(b.mode); setMessages([]); }}
            className={`flex-1 py-2 text-xs font-mono rounded border transition-all ${sdlMode === b.mode ? 'border-[#00f5d4] text-[#00f5d4] bg-[rgba(0,245,212,0.05)]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'}`}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={sdlMode ? '输入研究课题进行 SDL 分解...' : '输入实验课题...'}
            disabled={streaming}
            className="w-full bg-[#0a1628] border border-[rgba(67,97,238,0.2)] rounded-lg px-4 py-3 text-sm text-[#d0d4dc] font-mono placeholder:text-[#8a92a3]/50 focus:border-[#00f5d4] outline-none disabled:opacity-50" />
        </div>
        <button onClick={handleSend} disabled={!query.trim() || streaming}
          className="btn-glow px-6 py-3 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-sm font-mono rounded-lg disabled:opacity-40 flex items-center gap-2">
          {streaming ? <span className="w-3 h-3 border border-[#00f5d4] border-t-transparent rounded-full animate-spin" /> : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          )}
          Send
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p} onClick={() => { setQuery(p); }}
            className="px-3 py-1.5 text-xs font-mono border border-[rgba(67,97,238,0.2)] rounded text-[#8a92a3] hover:border-[#00f5d4] hover:text-[#00f5d4] transition-all">
            {p}
          </button>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { icon: '🤖', title: 'Deepseek V3', desc: '接入真实大语言模型' },
          { icon: '💬', title: '流式输出', desc: '实时响应，打字机效果' },
          { icon: '🔒', title: '本地存储', desc: 'API Key 仅存在浏览器' },
        ].map((f) => (
          <div key={f.title} className="glass-panel p-3 hover:border-[rgba(0,245,212,0.3)] transition-colors">
            <div className="text-lg mb-1">{f.icon}</div>
            <div className="text-xs font-medium text-[#d0d4dc] font-mono">{f.title}</div>
            <div className="text-[10px] text-[#8a92a3]">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  // 先 escape 所有 HTML 标签，防止 XSS
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // 再做 Markdown 转换（这些转换引入的 HTML 是安全的）
  return safe
    .replace(/&lt;h4&gt;(.*?)&lt;\/h4&gt;/g, '<h4 class="text-[#00f5d4] font-mono text-xs mt-2 mb-1">$1</h4>')
    .replace(/## (.*)/g, '<h4 class="text-[#00f5d4] font-mono text-xs mt-2 mb-1">$1</h4>')
    .replace(/### (.*)/g, '<h5 class="text-[#fee440] font-mono text-[10px] mt-1 mb-0.5">$1</h5>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#d0d4dc]">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-[rgba(0,245,212,0.1)] px-1 rounded text-[#00f5d4] text-[10px]">$1</code>')
    .replace(/- (.*)/g, '<li class="flex items-start gap-1"><span class="text-[#00f5d4] mt-0.5">•</span><span>$1</span></li>')
    .replace(/\n/g, '<br/>');
}

// ===================== DOE Panel =====================

const BRANIN_OPTIMAL = 0.3979;

function DOEComparisonPanel() {
  const [n, setN] = useState(30);

  // Sampling data for visualization
  const randomPts = generateRandom(n, 2);
  const lhsPts = generateLHS(n, 2);
  const sobolPts = generateSobol(n, 2);
  const ffPts = generateFullFactorial(n, 2);

  const makeScatter = (pts: number[][], name: string, color: string): any => ({
    type: 'scatter', mode: 'markers', x: pts.map((p) => p[0]), y: pts.map((p) => p[1]),
    name, marker: { size: 6, color, opacity: 0.8, line: { color: '#fff', width: 0.5 } },
    hovertemplate: 'x: %{x:.3f}<br>y: %{y:.3f}<extra></extra>',
  });

  const samplingData = [
    makeScatter(randomPts, 'Random', '#8a92a3'),
    makeScatter(lhsPts, 'LHS', '#00f5d4'),
    makeScatter(sobolPts, 'Sobol', '#fee440'),
    makeScatter(ffPts, 'Full Factorial', '#4361ee'),
  ];

  const samplingLayout = {
    grid: { rows: 2, columns: 2, pattern: 'independent' },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#d0d4dc', size: 10, family: 'JetBrains Mono, monospace' },
    xaxis: { domain: [0, 0.45], title: { text: 'x₁' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    yaxis: { domain: [0.55, 1], title: { text: 'x₂' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    xaxis2: { domain: [0.55, 1], title: { text: 'x₁' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    yaxis2: { domain: [0.55, 1], anchor: 'x2', title: { text: 'x₂' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    xaxis3: { domain: [0, 0.45], title: { text: 'x₁' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    yaxis3: { domain: [0, 0.4], anchor: 'x3', title: { text: 'x₂' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    xaxis4: { domain: [0.55, 1], title: { text: 'x₁' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    yaxis4: { domain: [0, 0.4], anchor: 'x4', title: { text: 'x₂' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    annotations: [
      { x: 0.22, y: 1.0, xref: 'paper', yref: 'paper', text: '<b>Random</b>', showarrow: false, font: { size: 11, color: '#8a92a3' } },
      { x: 0.78, y: 1.0, xref: 'paper', yref: 'paper', text: '<b>LHS</b>', showarrow: false, font: { size: 11, color: '#00f5d4' } },
      { x: 0.22, y: 0.45, xref: 'paper', yref: 'paper', text: '<b>Sobol</b>', showarrow: false, font: { size: 11, color: '#fee440' } },
      { x: 0.78, y: 0.45, xref: 'paper', yref: 'paper', text: '<b>Full Factorial</b>', showarrow: false, font: { size: 11, color: '#4361ee' } },
    ],
    margin: { t: 20, r: 20, b: 40, l: 50 },
    hoverlabel: { bgcolor: 'rgba(6,22,42,0.95)', bordercolor: 'rgba(0,245,212,0.3)', font: { size: 10 } },
  };

  return (
    <div className="space-y-6">
      {/* Sampling comparison */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-wider">SAMPLING COMPARISON</div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8a92a3] font-mono">n = {n}</span>
            <input type="range" min="10" max="100" step="5" value={n} onChange={(e) => setN(parseInt(e.target.value))}
              className="w-32 h-1 bg-[rgba(67,97,238,0.2)] rounded-full appearance-none cursor-pointer accent-[#00f5d4]" />
          </div>
        </div>
        <Suspense fallback={<div className="text-xs text-[#8a92a3] text-center py-12">Loading Plotly...</div>}>
          <Plot data={samplingData} layout={samplingLayout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%', height: 400 }} />
        </Suspense>
        <p className="text-[10px] text-[#8a92a3] mt-2 leading-relaxed">
          观察：LHS 和 Sobol 更均匀地覆盖参数空间，Random 容易出现聚集和空白区域。在实验预算有限时，空间填充设计优于随机采样。
        </p>
      </div>
    </div>
  );
}

// ===================== Race Panel =====================

function RacePanel() {
  const [raceIters, setRaceIters] = useState(30);
  const [raceResults, setRaceResults] = useState<RaceResult[] | null>(null);
  const [racing, setRacing] = useState(false);

  const startRace = () => {
    setRacing(true);
    setRaceResults(null);
    setTimeout(() => {
      const strategies: { name: string; key: 'bo' | 'random' | 'lhs' | 'sobol'; color: string }[] = [
        { name: 'BO (EI)', key: 'bo', color: '#00f5d4' },
        { name: 'Random', key: 'random', color: '#8a92a3' },
        { name: 'LHS', key: 'lhs', color: '#fee440' },
        { name: 'Sobol', key: 'sobol', color: '#4361ee' },
      ];
      const results: RaceResult[] = strategies.map((s) => {
        const bestValues = runRace(s.key, raceIters);
        return { name: s.name, color: s.color, bestValues, finalBest: bestValues[bestValues.length - 1] };
      });
      results.sort((a, b) => b.finalBest - a.finalBest);
      setRaceResults(results);
      setRacing(false);
    }, 100);
  };

  const racePlotData = raceResults
    ? raceResults.map((r) => ({
        type: 'scatter', mode: 'lines', x: Array.from({ length: r.bestValues.length }, (_, i) => i + 1),
        y: r.bestValues, name: r.name, line: { color: r.color, width: 2 },
      }))
    : [];

  const racePlotLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#d0d4dc', size: 11, family: 'JetBrains Mono, monospace' },
    xaxis: { title: { text: '实验次数' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    yaxis: { title: { text: '累计最优值' }, gridcolor: 'rgba(67,97,238,0.1)', zerolinecolor: 'rgba(67,97,238,0.15)' },
    shapes: raceResults ? [{
      type: 'line' as const, x0: 1, x1: raceIters, y0: BRANIN_OPTIMAL, y1: BRANIN_OPTIMAL,
      line: { color: 'rgba(255,107,107,0.5)', width: 1, dash: 'dash' as const },
    }] : [],
    annotations: raceResults ? [{
      x: raceIters, y: BRANIN_OPTIMAL, xref: 'x', yref: 'y', text: `Global optimum ${BRANIN_OPTIMAL}`,
      showarrow: false, ax: 0, ay: -10, font: { size: 9, color: '#ff6b6b' },
    }] : [],
    legend: { font: { size: 9 }, x: 0.02, y: 0.98, bgcolor: 'rgba(6,22,42,0.7)' },
    margin: { t: 30, r: 20, b: 50, l: 60 },
    hoverlabel: { bgcolor: 'rgba(6,22,42,0.95)', bordercolor: 'rgba(0,245,212,0.3)', font: { size: 10 } },
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] text-[#00f5d4] font-mono tracking-wider">CONVERGENCE RACE</div>
          <div className="text-[10px] text-[#8a92a3] font-mono">Branin 函数 — BO (EI) vs Random vs LHS vs Sobol</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8a92a3] font-mono">n = {raceIters}</span>
          <input type="range" min="15" max="60" step="5" value={raceIters} onChange={(e) => setRaceIters(parseInt(e.target.value))}
            className="w-24 h-1 bg-[rgba(67,97,238,0.2)] rounded-full appearance-none cursor-pointer accent-[#00f5d4]" />
          <button onClick={startRace} disabled={racing}
            className="btn-glow px-4 py-1.5 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded disabled:opacity-40">
            {racing ? 'Running...' : '开始比赛'}
          </button>
        </div>
      </div>
      {raceResults ? (
        <>
          <Suspense fallback={<div className="text-xs text-[#8a92a3] text-center py-12">Loading Plotly...</div>}>
            <Plot data={racePlotData} layout={racePlotLayout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%', height: 350 }} />
          </Suspense>
          <div className="mt-3 flex flex-wrap gap-3">
            {raceResults.map((r, i) => (
              <div key={r.name} className="flex items-center gap-2 glass-panel px-3 py-1.5">
                <span className="text-xs font-mono" style={{ color: r.color }}>#{i + 1}</span>
                <span className="text-xs text-[#d0d4dc] font-mono">{r.name}</span>
                <span className="text-xs text-[#fee440] font-mono">{r.finalBest.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-xs text-[#8a92a3] font-mono">
          点击"开始比赛"运行 Branin 函数上的策略对比
        </div>
      )}
    </div>
  );
}

// ===================== Main Demo Section =====================

// GP Sensitivity Visualization — shows how different lengthScale affects GP fit
function GPSensitivityViz({ experiments, activeCase }: { experiments: { params: number[]; result: number }[]; activeCase: LiveCase }) {
  const data = useMemo(() => {
    const p0 = activeCase.params[0];
    const fixedParams = activeCase.params.map((p) => p.default);
    const xGrid = Array.from({ length: 50 }, (_, i) => p0.min + (i / 49) * (p0.max - p0.min));

    const lengthScales = [0.3, 1.0, 3.0];
    const colors = ['#ff6b6b', '#00f5d4', '#4361ee'];

    const traces: any[] = [];
    lengthScales.forEach((ls, idx) => {
      const gp = new GaussianProcess(ls, 1.0, 0.01);
      const X = experiments.map((e) => e.params);
      const y = experiments.map((e) => e.result);
      gp.fit(X, y);

      const means: number[] = [];
      const upper: number[] = [];
      const lower: number[] = [];
      xGrid.forEach((x) => {
        const vec = [...fixedParams];
        vec[0] = x;
        const pred = gp.predict(vec);
        means.push(pred.mean);
        upper.push(pred.mean + 2 * pred.std);
        lower.push(pred.mean - 2 * pred.std);
      });

      traces.push({
        x: xGrid, y: means, type: 'scatter', mode: 'lines', name: `LS=${ls}`,
        line: { color: colors[idx], width: 2 },
        hovertemplate: `x: %{x:.1f}<br>mean: %{y:.2f}<extra>lengthScale=${ls}</extra>`,
      });
      traces.push({
        x: [...xGrid, ...xGrid.slice().reverse()], y: [...upper, ...lower.slice().reverse()],
        type: 'scatter', mode: 'lines', fill: 'toself', fillcolor: `${colors[idx]}15`, line: { width: 0 },
        showlegend: false, hoverinfo: 'skip',
      });
    });

    // Observed points projection on param 0
    traces.push({
      x: experiments.map((e) => e.params[0]), y: experiments.map((e) => e.result),
      type: 'scatter', mode: 'markers', name: 'Observed',
      marker: { size: 8, color: '#fee440', line: { color: '#fff', width: 1 } },
    });

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#8a92a3', size: 9, family: 'JetBrains Mono, monospace' },
      xaxis: { title: { text: `${p0.name} (${p0.unit})`, font: { size: 9 } }, gridcolor: 'rgba(67,97,238,0.08)', tickfont: { size: 8 } },
      yaxis: { title: { text: activeCase.unit, font: { size: 9 } }, gridcolor: 'rgba(67,97,238,0.08)', tickfont: { size: 8 } },
      margin: { t: 10, r: 10, b: 35, l: 45 },
      legend: { font: { size: 8 }, x: 0.02, y: 0.98, bgcolor: 'rgba(6,22,42,0.7)' },
      height: 180,
    };

    return { traces, layout };
  }, [experiments, activeCase]);

  return (
    <div className="mt-2">
      <div className="text-[9px] text-[#8a92a3] font-mono mb-1">LENGTHSCALE SENSITIVITY (1D slice)</div>
      <Suspense fallback={<div className="text-[9px] text-[#8a92a3] text-center py-4">Loading...</div>}>
        <Plot data={data.traces} layout={data.layout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%', height: 180 }} />
      </Suspense>
    </div>
  );
}

export default function DemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const [activeTab, setActiveTab] = useState<'bo' | 'doe' | 'race' | 'llm' | 'quiz'>('bo');

  return (
    <section id="demos" ref={sectionRef} className="relative py-32 md:py-40" style={{ background: '#000d1d' }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-10">
          <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">05 — INTERACTIVE DEMOS</div>
          <h2 className="text-3xl md:text-[32px] font-semibold tracking-[-0.96px] mb-4">互动演示</h2>
          <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
            7 个真实 Live Cases 的贝叶斯优化仿真，接入 Deepseek V3 的 AI 实验规划助手，以及知识测试。
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="flex gap-2 mb-8">
          {[
            { key: 'bo' as const, label: 'BO 模拟器', labelEn: 'Bayesian Optimization · 7 Cases' },
            { key: 'doe' as const, label: 'DOE 对比', labelEn: 'Design of Experiments' },
            { key: 'race' as const, label: 'BO vs DOE', labelEn: 'Convergence Race' },
            { key: 'llm' as const, label: 'AI 规划助手', labelEn: 'Deepseek V3 · Streaming' },
            { key: 'quiz' as const, label: '知识测试', labelEn: 'Quiz · 5 Questions' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 glass-panel p-3 text-left transition-all ${activeTab === tab.key ? 'border-[rgba(0,245,212,0.4)] bg-[rgba(0,245,212,0.05)]' : ''}`}>
              <div className={`text-sm font-mono ${activeTab === tab.key ? 'text-[#00f5d4]' : 'text-[#d0d4dc]'}`}>{tab.label}</div>
              <div className="text-[9px] text-[#8a92a3] font-mono">{tab.labelEn}</div>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'bo' && <motion.div key="bo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><BOSimulatorPanel /></motion.div>}
          {activeTab === 'doe' && <motion.div key="doe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><DOEComparisonPanel /></motion.div>}
          {activeTab === 'race' && <motion.div key="race" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><RacePanel /></motion.div>}
          {activeTab === 'llm' && <motion.div key="llm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><LLMPlannerPanel /></motion.div>}
          {activeTab === 'quiz' && <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto"><QuizPanel /></motion.div>}
        </AnimatePresence>
      </div>
      <div className="section-divider mt-24" />
    </section>
  );
}
