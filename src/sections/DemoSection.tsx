import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import SinePlotShader from '../components/SinePlotShader';
import TerminalTypewriter from '../components/TerminalTypewriter';
import { quizQuestions } from '../data/quiz_data';

// === BO Simulator Logic ===
interface Experiment {
  id: number;
  temp: number;
  time: number;
  conductivity: number;
}

function gaussianRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

function objectiveFn(temp: number, time: number): number {
  const tNorm = (temp - 100) / 200;
  const timeNorm = time / 48;
  const peak1 = Math.exp(-((tNorm - 0.6) ** 2 + (timeNorm - 0.4) ** 2) / 0.05);
  const peak2 = Math.exp(-((tNorm - 0.3) ** 2 + (timeNorm - 0.7) ** 2) / 0.08);
  return peak1 * 85 + peak2 * 60 + gaussianRandom(0, 5);
}

// === Quiz Component ===
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
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="glass-panel p-6 text-center">
        <div className="text-3xl font-mono-title text-[#00f5d4] mb-2">{Math.round((score / quizQuestions.length) * 100)}%</div>
        <div className="text-sm text-[#d0d4dc] mb-1">
          答对 {score} / {quizQuestions.length} 题
        </div>
        <div className="text-xs text-[#8a92a3] mb-4">
          {score === quizQuestions.length ? '完美！你对 SDL 已有了深入理解' : score >= 3 ? '不错！继续深入探索' : '建议回顾前面的内容'}
        </div>
        <button
          onClick={() => { setCurrentQ(0); setSelected(null); setShowAnswer(false); setScore(0); setFinished(false); }}
          className="btn-glow px-4 py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded"
        >
          重新测试
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-[#00f5d4] font-mono tracking-wider">QUIZ — {currentQ + 1}/{quizQuestions.length}</span>
        <div className="flex gap-1">
          {quizQuestions.map((_, i) => (
            <div key={i} className={`w-4 h-1 rounded-full ${i < currentQ ? 'bg-[#00f5d4]' : i === currentQ ? 'bg-[#fee440]' : 'bg-[rgba(67,97,238,0.2)]'}`} />
          ))}
        </div>
      </div>

      <p className="text-sm text-[#d0d4dc] mb-4 leading-relaxed">{q.question}</p>

      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={showAnswer}
            className={`w-full text-left px-4 py-2.5 rounded border text-xs transition-all ${
              showAnswer
                ? i === q.correct
                  ? 'border-[#00f5d4] bg-[rgba(0,245,212,0.1)] text-[#00f5d4]'
                  : i === selected
                  ? 'border-[#ff6b6b] bg-[rgba(255,107,107,0.1)] text-[#ff6b6b]'
                  : 'border-[rgba(67,97,238,0.1)] text-[#8a92a3]'
                : 'border-[rgba(67,97,238,0.2)] text-[#d0d4dc] hover:border-[#00f5d4]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showAnswer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
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

// === Main Demo Section ===
export default function DemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const [activeTab, setActiveTab] = useState<'bo' | 'llm' | 'quiz'>('bo');

  // BO state
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [kappa, setKappa] = useState(2.0);
  const [nextTemp, setNextTemp] = useState(180);
  const [nextTime, setNextTime] = useState(24);
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);

  const runExperiment = () => {
    if (isRunning) return;
    setIsRunning(true);
    setStep((s) => s + 1);
    setTimeout(() => {
      const conductivity = objectiveFn(nextTemp, nextTime);
      const newExp: Experiment = {
        id: experiments.length + 1,
        temp: nextTemp,
        time: nextTime,
        conductivity: Math.round(conductivity * 10) / 10,
      };
      setExperiments((prev) => [...prev, newExp]);
      // Suggest next
      let bestScore = -Infinity, bestT = 150, bestTm = 20;
      for (let t = 100; t <= 300; t += 10) {
        for (let tm = 4; tm <= 48; tm += 4) {
          const dist = [...experiments, newExp].reduce((min, e) => Math.min(min, Math.sqrt((e.temp - t) ** 2 + (e.time - tm) ** 2)), Infinity);
          const nearest = [...experiments, newExp].reduce((best, e) => {
            const d = Math.sqrt((e.temp - t) ** 2 + (e.time - tm) ** 2);
            return d < Math.sqrt((best.temp - t) ** 2 + (best.time - tm) ** 2) ? e : best;
          });
          const score = nearest.conductivity + kappa * Math.sqrt(dist);
          if (score > bestScore) { bestScore = score; bestT = t; bestTm = tm; }
        }
      }
      setNextTemp(bestT);
      setNextTime(bestTm);
      setIsRunning(false);
    }, 800);
  };

  const resetBO = () => { setExperiments([]); setStep(0); setNextTemp(180); setNextTime(24); };
  const bestExp = experiments.length > 0 ? experiments.reduce((a, b) => (a.conductivity > b.conductivity ? a : b)) : null;

  return (
    <section id="demos" ref={sectionRef} className="relative py-32 md:py-40" style={{ background: '#000d1d' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-10">
          <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">05 — INTERACTIVE DEMOS</div>
          <h2 className="text-3xl md:text-[32px] font-semibold tracking-[-0.96px] mb-4">互动演示</h2>
          <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
            亲手体验贝叶斯优化的决策过程，与 AI 实验规划助手对话，测试你对 SDL 的理解。
          </p>
        </motion.div>

        {/* Tab navigation */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="flex gap-2 mb-8">
          {[
            { key: 'bo' as const, label: 'BO 模拟器', labelEn: 'Bayesian Optimization' },
            { key: 'llm' as const, label: 'AI 规划助手', labelEn: 'LLM Planner' },
            { key: 'quiz' as const, label: '知识测试', labelEn: 'Quiz' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 glass-panel p-3 text-left transition-all ${
                activeTab === tab.key ? 'border-[rgba(0,245,212,0.4)] bg-[rgba(0,245,212,0.05)]' : ''
              }`}
            >
              <div className={`text-sm font-mono ${activeTab === tab.key ? 'text-[#00f5d4]' : 'text-[#d0d4dc]'}`}>{tab.label}</div>
              <div className="text-[9px] text-[#8a92a3] font-mono">{tab.labelEn}</div>
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'bo' && (
            <motion.div key="bo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Shader + overlay */}
                <div className="flex-1">
                  <div className="relative h-[400px] rounded-lg overflow-hidden border border-[rgba(67,97,238,0.2)]">
                    <SinePlotShader />
                    <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between pointer-events-none">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-[10px] text-[#8a92a3] font-mono mb-1">SIMULATION</div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#fee440] animate-pulse' : 'bg-[#00f5d4]'}`} />
                            <span className="text-xs text-[#d0d4dc] font-mono">{isRunning ? 'Running...' : 'Ready'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-[#8a92a3] font-mono">ITERATION</div>
                          <div className="text-2xl text-[#00f5d4] font-mono-title">{step}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] text-[#8a92a3] font-mono">BEST</div>
                          <div className="text-xl text-[#fee440] font-mono-title">{bestExp ? `${bestExp.conductivity}` : '—'} S/cm</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-[#8a92a3] font-mono">EXPERIMENTS</div>
                          <div className="text-xl text-[#d0d4dc] font-mono-title">{experiments.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="w-full lg:w-[300px] flex-shrink-0 glass-panel p-5 space-y-5">
                  <div className="text-[10px] text-[#00f5d4] font-mono tracking-wider">CONTROL PANEL</div>
                  <div>
                    <div className="flex justify-between text-xs text-[#8a92a3] font-mono mb-2">
                      <span>Exploration (κ)</span><span className="text-[#00f5d4]">{kappa.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0.1" max="5.0" step="0.1" value={kappa}
                      onChange={(e) => setKappa(parseFloat(e.target.value))}
                      className="w-full h-1 bg-[rgba(67,97,238,0.2)] rounded-full appearance-none cursor-pointer accent-[#00f5d4]" />
                    <div className="flex justify-between text-[9px] text-[#8a92a3] mt-1"><span>Exploit</span><span>Explore</span></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-[#8a92a3] font-mono block mb-1">Temp (°C)</label>
                      <input type="number" value={nextTemp} onChange={(e) => setNextTemp(Number(e.target.value))}
                        className="w-full bg-[#0a1628] border border-[rgba(67,97,238,0.2)] rounded px-3 py-2 text-sm text-[#d0d4dc] font-mono focus:border-[#00f5d4] outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-[#8a92a3] font-mono block mb-1">Time (h)</label>
                      <input type="number" value={nextTime} onChange={(e) => setNextTime(Number(e.target.value))}
                        className="w-full bg-[#0a1628] border border-[rgba(67,97,238,0.2)] rounded px-3 py-2 text-sm text-[#d0d4dc] font-mono focus:border-[#00f5d4] outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={runExperiment} disabled={isRunning}
                      className="flex-1 btn-glow py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-sm font-mono rounded disabled:opacity-40">
                      {isRunning ? 'Running...' : 'Run Next'}
                    </button>
                    <button onClick={resetBO} className="px-3 py-2 border border-[rgba(67,97,238,0.2)] text-[#8a92a3] text-sm font-mono rounded hover:text-[#d0d4dc]">Reset</button>
                  </div>
                  {experiments.length > 0 && (
                    <div>
                      <div className="text-[10px] text-[#8a92a3] font-mono mb-1">LOG</div>
                      <div className="max-h-[120px] overflow-y-auto">
                        <table className="w-full text-[10px] font-mono">
                          <thead><tr className="text-[#8a92a3]"><th className="text-left py-0.5">#</th><th className="text-left">T</th><th className="text-left">t</th><th className="text-right">S/cm</th></tr></thead>
                          <tbody>{[...experiments].reverse().map((exp) => (
                            <tr key={exp.id} className="border-t border-[rgba(67,97,238,0.1)]">
                              <td className="py-1 text-[#00f5d4]">{exp.id}</td><td className="text-[#d0d4dc]">{exp.temp}</td>
                              <td className="text-[#d0d4dc]">{exp.time}</td>
                              <td className={`text-right ${exp.conductivity > 70 ? 'text-[#fee440]' : 'text-[#d0d4dc]'}`}>{exp.conductivity}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'llm' && (
            <motion.div key="llm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LLMPlannerTab />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
              <QuizPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="section-divider mt-24" />
    </section>
  );
}

// === LLM Planner Sub-component ===
const PRESETS = ['寻找更高导电率的钙钛矿', '优化锂电池固态电解质', '探索CO2还原用高效催化剂', '设计宽带隙半导体材料'];

function LLMPlannerTab() {
  const [query, setQuery] = useState('');
  const [started, setStarted] = useState(false);
  const typewriterKey = useRef(0);

  const handleSubmit = () => { if (!query.trim()) return; setStarted(true); typewriterKey.current += 1; };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="输入实验课题，如：寻找更高导电率的钙钛矿..."
            className="w-full bg-[#0a1628] border border-[rgba(67,97,238,0.2)] rounded-lg px-4 py-3 text-sm text-[#d0d4dc] font-mono placeholder:text-[#8a92a3]/50 focus:border-[#00f5d4] outline-none" />
        </div>
        <button onClick={handleSubmit} disabled={!query.trim() || started}
          className="btn-glow px-6 py-3 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-sm font-mono rounded-lg disabled:opacity-40 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          Send
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((p) => (
          <button key={p} onClick={() => { setQuery(p); setStarted(false); }}
            className={`px-3 py-1.5 text-xs font-mono border rounded transition-all ${query === p ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'}`}>
            {p}
          </button>
        ))}
      </div>
      {started && <TerminalTypewriter key={typewriterKey.current} />}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { icon: '📚', title: '知识图谱驱动', desc: '超过 150,000 种已知材料的结构化数据库' },
          { icon: '🔮', title: 'DFT 预筛选', desc: '实验前自动计算热力学稳定性' },
          { icon: '🔄', title: '闭环反馈', desc: '实验结果自动回传持续优化' },
        ].map((f) => (
          <div key={f.title} className="glass-panel p-4 hover:border-[rgba(0,245,212,0.3)] transition-colors">
            <div className="text-xl mb-2">{f.icon}</div>
            <div className="text-xs font-medium text-[#d0d4dc] mb-1 font-mono">{f.title}</div>
            <div className="text-[10px] text-[#8a92a3]">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
