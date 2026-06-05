import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { GaussianProcess, upperConfidenceBound } from '@/lib/bo_engine';
import { experimentTimeline, type TimelineEvent } from '@/data/experiment_timeline';
import ExperimentHistorySpine from '@/components/ExperimentHistorySpine';
import {
  curatedResources,
  historicalMilestones,
  methodShifts,
  mseBridgeCards,
} from '@/data/experimentNarrative';

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

// ─────────────────────────────────────────────────────────────────────────
// INTERACTIVE BLOCK 1: SDL 闭环步进演示
// ─────────────────────────────────────────────────────────────────────────

function toSvg(px: number, py: number): [number, number] {
  return [40 + (px / 100) * 320, 220 - (py / 100) * 200];
}

const HEATMAP = (() => {
  const rows: Array<{ c: number; r: number; x: number; y: number; v: number }> = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 12; c++) {
      const px = (c + 0.5) * (100 / 12);
      const py = (9 - r + 0.5) * (100 / 10);
      const v = Math.exp(-((px - 70) ** 2 + (py - 80) ** 2) / 1400);
      rows.push({ c, r, x: 40 + c * (320 / 12), y: 20 + r * 20, v });
    }
  }
  return rows;
})();

interface StepPoint { px: number; py: number; obs: number; isNew?: boolean }
interface StepData {
  phase: string; phaseColor: string; desc: string;
  points: StepPoint[]; rec: [number, number]; recLabel: string;
}

const SDL_STEPS: StepData[] = [
  { phase: '初始状态', phaseColor: '#8a92a3',
    desc: '3 个种子实验点覆盖参数空间对角线。GP 此时没有数据，先验分布平坦。推荐点由准随机采样生成。',
    points: [{ px: 20, py: 70, obs: 22 }, { px: 80, py: 30, obs: 31 }, { px: 50, py: 50, obs: 45 }],
    rec: [65, 75], recLabel: '(65, 75) 初始探索' },
  { phase: '探索阶段', phaseColor: '#4361ee',
    desc: '第 4 次实验 (65,75) 观测到 78，是目前最好的结果。GP 发现右上角可能有高值区域。',
    points: [{ px: 20, py: 70, obs: 22 }, { px: 80, py: 30, obs: 31 }, { px: 50, py: 50, obs: 45 }, { px: 65, py: 75, obs: 78, isNew: true }],
    rec: [73, 84], recLabel: '(73, 84) EI 最高——探索高值区域' },
  { phase: '探索+利用', phaseColor: '#fee440',
    desc: '第 5 次实验 (73,84) 观测到 91。模型开始利用这一信息，同时保留对未知区域的探索冲动。',
    points: [{ px: 20, py: 70, obs: 22 }, { px: 80, py: 30, obs: 31 }, { px: 50, py: 50, obs: 45 }, { px: 65, py: 75, obs: 78 }, { px: 73, py: 84, obs: 91, isNew: true }],
    rec: [30, 25], recLabel: '(30, 25) 探索——此区域不确定度高' },
  { phase: '确认与精炼', phaseColor: '#f59e0b',
    desc: '第 6 次实验 (30,25) 观测到 8，证实左下角不是好区域。GP 对参数空间有了更完整的理解。',
    points: [{ px: 20, py: 70, obs: 22 }, { px: 80, py: 30, obs: 31 }, { px: 50, py: 50, obs: 45 }, { px: 65, py: 75, obs: 78 }, { px: 73, py: 84, obs: 91 }, { px: 30, py: 25, obs: 8, isNew: true }],
    rec: [71, 81], recLabel: '(71, 81) 利用——精炼最优区域' },
  { phase: '收敛', phaseColor: '#00f5d4',
    desc: '第 7 次实验 (71,81) 观测到 97，接近真实最优点 (70,80)。7 次实验找到最优，穷举 100×100 网格需 10,000 次。',
    points: [{ px: 20, py: 70, obs: 22 }, { px: 80, py: 30, obs: 31 }, { px: 50, py: 50, obs: 45 }, { px: 65, py: 75, obs: 78 }, { px: 73, py: 84, obs: 91 }, { px: 30, py: 25, obs: 8 }, { px: 71, py: 81, obs: 97, isNew: true }],
    rec: [70, 80], recLabel: '(70, 80) 精确命中真实最优点' },
];

function SDLLoopStepper() {
  const [step, setStep] = useState(0);
  const s = SDL_STEPS[step];
  const bestObs = Math.max(...s.points.map((p) => p.obs));
  const bestPt = s.points.find((p) => p.obs === bestObs)!;
  const [rx, ry] = toSvg(s.rec[0], s.rec[1]);
  return (
    <div className="rounded-lg border border-dashed border-[rgba(0,245,212,0.3)] overflow-hidden" style={{ background: 'rgba(0,13,29,0.8)' }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(67,97,238,0.15)]">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-[#8a92a3] tracking-widest">可交互 · SDL 闭环步进演示</span>
          <span className="text-[9px] px-2 py-0.5 rounded font-mono" style={{ background: s.phaseColor + '22', color: s.phaseColor }}>{s.phase}</span>
        </div>
        <div className="flex items-center gap-1">
          {SDL_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className="rounded-full transition-all"
              style={{ width: i === step ? 20 : 7, height: 7, background: i === step ? '#00f5d4' : i < step ? 'rgba(0,245,212,0.4)' : 'rgba(67,97,238,0.25)' }} />
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-0">
        <div className="flex-shrink-0">
          <svg width="400" height="260" viewBox="0 0 400 260" style={{ display: 'block' }}>
            {HEATMAP.map((cell) => (
              <rect key={`${cell.c}-${cell.r}`} x={cell.x} y={cell.y} width={320 / 12} height={20}
                fill={`rgba(0,245,212,${(cell.v * 0.45).toFixed(3)})`} />
            ))}
            <line x1="40" y1="220" x2="360" y2="220" stroke="rgba(138,146,163,0.4)" strokeWidth="1" />
            <line x1="40" y1="20" x2="40" y2="220" stroke="rgba(138,146,163,0.4)" strokeWidth="1" />
            <text x="200" y="242" textAnchor="middle" fontSize="10" fill="#8a92a3" fontFamily="monospace">参数 X</text>
            <text x="14" y="120" textAnchor="middle" fontSize="10" fill="#8a92a3" fontFamily="monospace" transform="rotate(-90,14,120)">参数 Y</text>
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <text x={40 + (v / 100) * 320} y="232" textAnchor="middle" fontSize="9" fill="#5a6377" fontFamily="monospace">{v}</text>
                <text x="36" y={220 - (v / 100) * 200 + 3} textAnchor="end" fontSize="9" fill="#5a6377" fontFamily="monospace">{v}</text>
              </g>
            ))}
            <circle cx={toSvg(70, 80)[0]} cy={toSvg(70, 80)[1]} r="14" fill="none" stroke="rgba(0,245,212,0.15)" strokeWidth="1" strokeDasharray="3 2" />
            {s.points.map((pt, i) => {
              const [sx, sy] = toSvg(pt.px, pt.py);
              const isBest = pt.obs === bestObs;
              return (
                <g key={i}>
                  <circle cx={sx} cy={sy} r={pt.isNew ? 7 : 5} fill={isBest ? '#276749' : pt.isNew ? '#4361ee' : 'rgba(138,146,163,0.7)'} stroke={pt.isNew ? 'rgba(67,97,238,0.5)' : 'none'} strokeWidth="2" />
                  <text x={sx + 8} y={sy - 6} fontSize="9" fill={isBest ? '#00f5d4' : '#8a92a3'} fontFamily="monospace">{pt.obs}</text>
                </g>
              );
            })}
            {step < SDL_STEPS.length - 1 && (
              <g>
                <circle cx={rx} cy={ry} r="6" fill="none" stroke="#fee440" strokeWidth="2" strokeDasharray="3 2" />
                <circle cx={rx} cy={ry} r="2.5" fill="#fee440" />
              </g>
            )}
            <g transform="translate(44,232)">
              <circle cx="0" cy="0" r="4" fill="rgba(138,146,163,0.7)" /><text x="7" y="3" fontSize="8" fill="#8a92a3" fontFamily="monospace">已探索</text>
              <circle cx="55" cy="0" r="4" fill="#276749" /><text x="62" y="3" fontSize="8" fill="#8a92a3" fontFamily="monospace">最优</text>
              <circle cx="100" cy="0" r="4" fill="none" stroke="#fee440" strokeWidth="1.5" strokeDasharray="2 1.5" /><circle cx="100" cy="0" r="1.5" fill="#fee440" />
              <text x="107" y="3" fontSize="8" fill="#8a92a3" fontFamily="monospace">推荐</text>
              <circle cx="155" cy="0" r="4" fill="#4361ee" /><text x="162" y="3" fontSize="8" fill="#8a92a3" fontFamily="monospace">本步新增</text>
            </g>
          </svg>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="text-[10px] font-mono text-[#8a92a3] mb-1">第 {step === 0 ? '0' : step + 3} 次实验 · {s.points.length} 个观测点</div>
            <p className="text-xs text-[#8a92a3] leading-relaxed mb-4">{s.desc}</p>
            <div className="space-y-2 text-[10px] font-mono mb-4">
              <div className="flex justify-between gap-2">
                <span className="text-[#8a92a3]">当前最优</span>
                <span className="text-[#00f5d4] font-semibold">{bestObs} @ ({bestPt.px}, {bestPt.py})</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#8a92a3]">下一推荐</span>
                <span className="text-[#fee440]">{s.recLabel}</span>
              </div>
            </div>
            {step === SDL_STEPS.length - 1 && (
              <div className="p-2.5 rounded border border-[rgba(0,245,212,0.2)] text-[10px] text-[#00f5d4] leading-relaxed">
                ✓ 7 次实验找到最优点 (70,80)，观测值 97。穷举需要 10,000 次——贝叶斯优化只用了 0.07%。
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0}
              className="flex-1 py-1.5 rounded border text-[10px] font-mono transition-colors border-[rgba(67,97,238,0.2)] text-[#8a92a3] hover:border-[#00f5d4] hover:text-[#00f5d4] disabled:opacity-30 disabled:cursor-not-allowed">← 上一步</button>
            <button onClick={() => setStep((n) => Math.min(SDL_STEPS.length - 1, n + 1))} disabled={step === SDL_STEPS.length - 1}
              className="flex-1 py-1.5 rounded border text-[10px] font-mono transition-colors border-[rgba(0,245,212,0.3)] text-[#00f5d4] hover:bg-[rgba(0,245,212,0.08)] disabled:opacity-30 disabled:cursor-not-allowed">下一步 →</button>
            <button onClick={() => setStep(0)} className="px-3 py-1.5 rounded border text-[10px] font-mono border-[rgba(67,97,238,0.15)] text-[#5a6377] hover:text-[#8a92a3] transition-colors">重置</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// INTERACTIVE BLOCK 2: Acquisition Function 探索器
// ─────────────────────────────────────────────────────────────────────────

const AF_GP = (() => {
  const gp = new GaussianProcess(0.18, 1.0, 1e-4);
  gp.fit([[0.1], [0.38], [0.62], [0.85], [0.22]], [0.32, 0.91, 0.55, 0.28, 0.48]);
  return gp;
})();

const N_GRID = 120;
const AF_XS = Array.from({ length: N_GRID }, (_, i) => i / (N_GRID - 1));
const AF_PREDS = AF_XS.map((x) => AF_GP.predict([x]));
const AF_TRAIN = [{ x: 0.1, y: 0.32 }, { x: 0.38, y: 0.91 }, { x: 0.62, y: 0.55 }, { x: 0.85, y: 0.28 }, { x: 0.22, y: 0.48 }];
const AF_Y_BEST = Math.max(...AF_TRAIN.map((p) => p.y));

function makePath(xs: number[], ys: number[]): string {
  return xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
}
function makeArea(xs: number[], yTop: number[], yBot: number[]): string {
  const fwd = xs.map((x, i) => `${x.toFixed(1)},${yTop[i].toFixed(1)}`).join(' L ');
  const rev = [...xs].reverse().map((x, i) => `${x.toFixed(1)},${yBot[xs.length - 1 - i].toFixed(1)}`).join(' L ');
  return `M ${fwd} L ${rev} Z`;
}

function AcquisitionExplorer() {
  const [beta, setBeta] = useState(2);
  const { svgXs, svgMeans, svgUpper, svgLower, svgUCB, recIdx } = useMemo(() => {
    const means = AF_PREDS.map((p) => p.mean);
    const stds = AF_PREDS.map((p) => p.std);
    const ucbs = AF_PREDS.map((p) => upperConfidenceBound(p.mean, p.std, beta));
    const mMin = Math.min(...means) - 0.1, mMax = Math.max(...means) + 0.1;
    const uMin = Math.min(...ucbs, 0), uMax = Math.max(...ucbs) * 1.1;
    const svgXs = AF_XS.map((x) => 40 + x * 400);
    const toY = (v: number, vMin: number, vMax: number, yTop: number, yBot: number) =>
      yBot - ((v - vMin) / (vMax - vMin)) * (yBot - yTop);
    return {
      svgXs,
      svgMeans: means.map((m) => toY(m, mMin, mMax, 20, 165)),
      svgUpper: means.map((m, i) => toY(m + 2 * stds[i], mMin, mMax, 20, 165)),
      svgLower: means.map((m, i) => toY(Math.max(mMin, m - 2 * stds[i]), mMin, mMax, 20, 165)),
      svgUCB: ucbs.map((u) => toY(u, uMin, uMax, 185, 255)),
      recIdx: ucbs.indexOf(Math.max(...ucbs)),
    };
  }, [beta]);
  const recX = svgXs[recIdx];
  return (
    <div className="rounded-lg border border-dashed border-[rgba(254,228,64,0.3)] overflow-hidden" style={{ background: 'rgba(0,13,29,0.8)' }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(67,97,238,0.15)]">
        <span className="text-[9px] font-mono text-[#8a92a3] tracking-widest">可交互 · Acquisition Function 探索器</span>
        <span className="text-[9px] font-mono text-[#fee440]">UCB · β = {beta.toFixed(1)} · 推荐 x = {AF_XS[recIdx].toFixed(2)}</span>
      </div>
      <svg width="100%" viewBox="0 0 480 270" style={{ display: 'block' }}>
        <text x="38" y="13" fontSize="9" fill="#8a92a3" fontFamily="monospace" textAnchor="end">均值</text>
        <text x="38" y="179" fontSize="9" fill="#8a92a3" fontFamily="monospace" textAnchor="end">UCB</text>
        <path d={makeArea(svgXs, svgUpper, svgLower)} fill="rgba(67,97,238,0.12)" />
        <path d={makePath(svgXs, svgMeans)} fill="none" stroke="#4361ee" strokeWidth="1.5" />
        {AF_TRAIN.map((pt, i) => {
          const sx = 40 + pt.x * 400;
          const mMin = Math.min(...AF_PREDS.map((p) => p.mean)) - 0.1;
          const mMax = Math.max(...AF_PREDS.map((p) => p.mean)) + 0.1;
          const sy = 165 - ((pt.y - mMin) / (mMax - mMin)) * 145;
          return <circle key={i} cx={sx} cy={sy} r="4" fill={pt.y === AF_Y_BEST ? '#276749' : '#9B9B9B'} />;
        })}
        <line x1={recX} y1="20" x2={recX} y2="165" stroke="#fee440" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="40" y1="165" x2="440" y2="165" stroke="rgba(67,97,238,0.2)" strokeWidth="0.5" />
        <line x1="40" y1="20" x2="40" y2="165" stroke="rgba(67,97,238,0.2)" strokeWidth="0.5" />
        <path d={makeArea(svgXs, svgUCB, Array(N_GRID).fill(255))} fill="rgba(254,228,64,0.1)" />
        <path d={makePath(svgXs, svgUCB)} fill="none" stroke="#fee440" strokeWidth="1.5" />
        <line x1={recX} y1="185" x2={recX} y2="255" stroke="#fee440" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx={recX} cy={svgUCB[recIdx]} r="4" fill="#fee440" />
        <line x1="40" y1="255" x2="440" y2="255" stroke="rgba(67,97,238,0.2)" strokeWidth="0.5" />
        <line x1="40" y1="185" x2="40" y2="255" stroke="rgba(67,97,238,0.2)" strokeWidth="0.5" />
        <line x1="40" y1="185" x2="440" y2="185" stroke="rgba(67,97,238,0.2)" strokeWidth="0.5" />
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <text key={v} x={40 + v * 400} y="268" textAnchor="middle" fontSize="9" fill="#5a6377" fontFamily="monospace">{v.toFixed(2)}</text>
        ))}
        <g transform="translate(44,175)">
          <circle cx="0" cy="0" r="4" fill="#9B9B9B" /><text x="7" y="3" fontSize="8" fill="#8a92a3" fontFamily="monospace">已探索</text>
          <circle cx="55" cy="0" r="4" fill="#276749" /><text x="62" y="3" fontSize="8" fill="#8a92a3" fontFamily="monospace">最优</text>
          <line x1="100" y1="-4" x2="100" y2="4" stroke="#fee440" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="107" y="3" fontSize="8" fill="#8a92a3" fontFamily="monospace">推荐点</text>
        </g>
      </svg>
      <div className="px-5 pb-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-[#8a92a3] whitespace-nowrap">β = {beta.toFixed(1)}</span>
          <input type="range" min={0} max={5} step={0.1} value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))} className="flex-1" />
          <span className="text-[10px] font-mono text-[#fee440] whitespace-nowrap">
            {beta < 1 ? '强利用' : beta > 3 ? '强探索' : '均衡'}
          </span>
        </div>
        <p className="text-[10px] text-[#8a92a3] mt-2 leading-relaxed">
          UCB(x) = μ(x) + β·σ(x)。拖动 β 观察黄色虚线（推荐点）移动：β 大 → 倾向高不确定度区域（探索），β 小 → 倾向高均值区域（利用）。
        </p>
      </div>
    </div>
  );
}

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
      {/* Section A: 实验的历史地位与角色 */}
      {/* ================================================================ */}

      <div className="mb-16" id="intro">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#fee440] font-mono tracking-wider">A</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">实验的历史地位与角色</h2>
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

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {methodShifts.map((shift, index) => (
            <div
              key={shift.title}
              className="rounded-2xl border p-5"
              style={{
                borderColor:
                  index === 0
                    ? 'rgba(0,245,212,0.16)'
                    : index === 1
                      ? 'rgba(254,228,64,0.18)'
                      : 'rgba(255,107,107,0.16)',
                background:
                  index === 0
                    ? 'linear-gradient(180deg, rgba(0,245,212,0.06), rgba(6,22,42,0.84))'
                    : index === 1
                      ? 'linear-gradient(180deg, rgba(254,228,64,0.05), rgba(6,22,42,0.84))'
                      : 'linear-gradient(180deg, rgba(255,107,107,0.05), rgba(6,22,42,0.84))',
              }}
            >
              <div className="text-[10px] font-mono tracking-[0.18em] text-[#5a6377] mb-2">{shift.title}</div>
              <h3 className="text-sm font-semibold text-[#f3f6fb] mb-2">
                {shift.from} <span className="text-[#5a6377]">→</span> {shift.to}
              </h3>
              <p className="text-xs text-[#9da8bb] leading-6 mb-3">{shift.summary}</p>
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-[11px] leading-5 text-[#d8e0ec]">
                {shift.implication}
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-[rgba(67,97,238,0.12)] mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.22em] mb-2">HISTORY AS METHOD</div>
              <h3 className="text-lg md:text-xl font-semibold text-[#f3f6fb] mb-2">
                实验史不是名人墙，而是控制逻辑的增长史
              </h3>
              <p className="text-xs md:text-sm text-[#8a92a3] max-w-2xl leading-relaxed">
                下面这条时间轴不是简单罗列人物，而是追踪一个更重要的问题：科学共同体是怎样一步步学会
                设计条件、管理偏差、利用变异，并最终把实验组织成闭环搜索系统的。
              </p>
            </div>
            <div className="rounded-full border border-[rgba(0,245,212,0.14)] px-3 py-1 text-[10px] font-mono text-[#00f5d4]">
              从观察到闭环
            </div>
          </div>

          <ExperimentHistorySpine milestones={historicalMilestones} />
        </div>

        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-[rgba(0,245,212,0.12)] mb-8">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <div className="text-[10px] text-[#00f5d4] font-mono tracking-[0.22em] mb-2">MSE BRIDGE</div>
              <h3 className="text-lg font-semibold text-[#f3f6fb]">这条历史线为什么会汇入 MSE</h3>
            </div>
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(67,97,238,0.16)] px-3 py-1.5 text-[10px] font-mono text-[#8a92a3] no-underline hover:border-[#00f5d4] hover:text-[#00f5d4] transition-colors"
            >
              延伸阅读与资源 →
            </Link>
          </div>
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-5 max-w-3xl">
            这份外部参考材料最有价值的地方，不是多给了几个历史点，而是提醒我们：
            MSE 里的实验从来不是孤立动作。它同时承担发现、制备、表征、测量和决策五层任务，
            因而比很多基础学科更早暴露出实验设计、校准标准和闭环优化的复杂性。
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {mseBridgeCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-[rgba(67,97,238,0.1)] bg-[rgba(255,255,255,0.02)] p-5">
                <h4 className="text-sm font-semibold text-[#d0d4dc] mb-2">{card.title}</h4>
                <p className="text-xs text-[#8a92a3] leading-6 mb-3">{card.body}</p>
                <p className="text-[11px] text-[#d8e0ec] leading-5 mb-3">{card.implication}</p>
                <div className="flex flex-wrap gap-2">
                  {card.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[rgba(0,245,212,0.14)] bg-[rgba(0,245,212,0.05)] px-2.5 py-1 text-[10px] font-mono text-[#00f5d4]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-[rgba(67,97,238,0.1)] bg-[rgba(6,22,42,0.72)] p-4">
            <div className="text-[10px] font-mono tracking-[0.18em] text-[#5a6377] mb-2">建议放进 PPT 的一句话</div>
            <p className="text-sm text-[#f3f6fb] leading-6">
              “SDL 不是凭空出现的新技术，它是实验史上第三次组织方式跃迁在 MSE 中的集中体现。”
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(67,97,238,0.08)] bg-[rgba(255,255,255,0.015)] p-4 mb-6">
          <div className="text-[10px] text-[#5a6377] font-mono tracking-[0.18em] mb-2">RESOURCE PREVIEW</div>
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
            讲座站不应该把参考书目孤立地放在最后。这里先给出本单元最相关的四个入口，完整阅读架构见资源页。
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {curatedResources.slice(0, 4).map((resource) => (
              <div key={resource.title} className="rounded-xl border border-[rgba(67,97,238,0.08)] p-3">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="text-xs font-semibold text-[#d0d4dc]">{resource.title}</div>
                  <span className="text-[10px] font-mono text-[#00f5d4]">{resource.year}</span>
                </div>
                <div className="text-[10px] text-[#5a6377] mb-2">{resource.author}</div>
                <p className="text-[11px] text-[#8a92a3] leading-5">{resource.whyRead}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 实验史索引视图 */}
        <h3 className="text-sm font-semibold text-[#d0d4dc] mb-4">实验史索引视图</h3>
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

        <div className="relative mb-10">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[rgba(67,97,238,0.15)]" />
          <div className="space-y-1">
            {filteredTimeline.map((event: TimelineEvent) => {
              const content = (
                <>
                  <span
                    className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full border-2 border-[#000d1d]"
                    style={{ background: CATEGORY_COLORS[event.category] }}
                  />
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-xs font-mono text-[#00f5d4] w-20 flex-shrink-0">{event.year}</span>
                    <span className={`text-sm font-medium ${event.route ? 'text-[#00f5d4] group-hover:underline' : 'text-[#d0d4dc]'}`}>
                      {event.label}
                      {event.route && (
                        <span className="ml-1.5 text-[9px] text-[#5a6377] font-normal group-hover:text-[#00f5d4] transition-colors">→</span>
                      )}
                    </span>
                    <span className="text-[10px] text-[#8a92a3]">{event.labelEn}</span>
                  </div>
                  <p className="text-xs text-[#8a92a3] mt-1 leading-relaxed max-w-2xl">
                    {event.description}
                  </p>
                </>
              );

              if (event.route) {
                return (
                  <Link key={event.year + event.labelEn} to={event.route}
                    className="relative pl-12 py-3 group block no-underline hover:bg-[rgba(0,245,212,0.02)] transition-colors rounded-r">
                    {content}
                  </Link>
                );
              }
              return (
                <div key={event.year + event.labelEn} className="relative pl-12 py-3 group">
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* 范式演化概览：从实验史到方法论变迁 */}
        <h3 className="text-sm font-semibold text-[#d0d4dc] mb-4">从实验史到方法论变迁：科学范式的演化</h3>
        <div className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.1)] mb-6">
          <p className="text-xs text-[#8a92a3] leading-relaxed mb-4">
            上面梳理了实验本身的历史。更进一步的问题是：科学研究<strong>组织实验的方式</strong>——
            即知识生产的方法论——本身是如何演化的？理解这一演化脉络，是理解 SDL 为何出现在今天，
            以及它改变了什么、没改变什么的前提。
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

        {/* 科学范式 → 独立页面链接 */}
        <div id="sec-science-paradigms">
          <div className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.12)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-[rgba(0,245,212,0.1)] border border-[rgba(0,245,212,0.2)] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-mono text-[#00f5d4]">¶</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">
                  科学范式：从 Kuhn 到 Gray 再到第五范式
                </h3>
                <p className="text-xs text-[#8a92a3] leading-relaxed mb-3">
                  上面从实验方法的角度讲了四个演化阶段。如果想从科学哲学的角度更系统地理解——
                  什么是"范式"？Thomas Kuhn 的范式转移理论、Karl Popper 的可证伪性标准、
                  Jim Gray 的科学四范式框架，以及正在展开的 AI/自治科学第五范式之争——
                  请阅读独立单元。
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-3">
                  <span className="px-2 py-0.5 rounded bg-[rgba(254,68,0,0.06)] text-[#fee440] border border-[rgba(254,68,0,0.1)]">Kuhn · 范式转移</span>
                  <span className="px-2 py-0.5 rounded bg-[rgba(67,97,238,0.06)] text-[#4361ee] border border-[rgba(67,97,238,0.1)]">Popper · 可证伪性</span>
                  <span className="px-2 py-0.5 rounded bg-[rgba(0,245,212,0.06)] text-[#00f5d4] border border-[rgba(0,245,212,0.1)]">Gray · 四范式</span>
                  <span className="px-2 py-0.5 rounded bg-[rgba(255,107,107,0.06)] text-[#ff6b6b] border border-[rgba(255,107,107,0.1)]">第五范式之争</span>
                </div>
                <Link
                  to="/paradigms"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono text-[#000d1d] no-underline"
                  style={{ background: 'linear-gradient(135deg, #00f5d4, #4361ee)' }}
                >
                  阅读完整单元 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Section B: MSE 实验图谱与目录学 */}
      {/* ================================================================ */}

      <div className="mb-16" id="mse-map">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-[#00f5d4] font-mono tracking-wider">B</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">MSE 实验图谱与目录学</h2>
        </div>

        {/* Visual paradigm × scale matrix */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-[11px] font-mono min-w-[580px]">
            <thead>
              <tr>
                <th className="p-2 text-left text-[#5a6377] font-normal border-b border-r border-[rgba(67,97,238,0.15)] w-28">
                  范式 ╲ 尺度
                </th>
                {[['量子/电子','Å'], ['原子/纳米','nm'], ['微观','μm'], ['宏观','mm–m']].map(([label, unit]) => (
                  <th key={label} className="p-2 text-center text-[#8a92a3] font-normal border-b border-[rgba(67,97,238,0.15)]">
                    <div>{label}</div>
                    <div className="text-[#5a6377]">{unit}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { paradigm: '第一范式', sub: '经验/实验室', color: '#8a92a3',
                  cells: ['XPS\n电子结构', 'TEM / APT\nAFM', 'SEM / XRD\n光学', '力学测试\n器件表征'] },
                { paradigm: '第二范式', sub: '理论驱动', color: '#4361ee',
                  cells: ['DFT\n量子化学', '分子动力学\nMC 模拟', '相场法\n晶体塑性', '有限元\n连续介质'] },
                { paradigm: '第三范式', sub: '计算科学', color: '#00b4d8',
                  cells: ['GW / TDDFT\n高精度', 'AIMD / ReaxFF', 'CALPHAD\n热力学库', '多尺度耦合'] },
                { paradigm: '第四范式', sub: '数据驱动+AI', color: '#00f5d4', sdl: true,
                  cells: ['ML 势函数\n图神经网络', '高通量 DFT\nMatProj', 'ML 辅助 XRD\n成分优化', '★ SDL 闭环\n自动化合成'] },
              ].map((row) => (
                <tr key={row.paradigm} className="border-b border-[rgba(67,97,238,0.08)]">
                  <td className="p-2 border-r border-[rgba(67,97,238,0.15)]" style={{ color: row.color }}>
                    <div className="font-semibold">{row.paradigm}</div>
                    <div className="text-[#5a6377] text-[10px]">{row.sub}</div>
                  </td>
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className="p-2 text-center leading-5 whitespace-pre-line"
                      style={{
                        color: row.sdl && ci === 3 ? '#00f5d4' : '#8a92a3',
                        background: row.sdl && ci === 3 ? 'rgba(0,245,212,0.06)' : undefined,
                      }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-[#5a6377] mt-2 leading-5">
            ★ SDL 的典型落点（宏观 × 数据驱动），但实际横跨多个格——闭环需要跨尺度信息流。
          </p>
        </div>

        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-2xl">
          以实验目的为框架，将 MSE 实验分为八大类——展开查看各类的典型问题、代表技术和与 SDL 的关系：
        </p>

        <div className="space-y-3">
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

      <div className="mb-16" id="ofat-to-sdl">
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
      {/* INTERACTIVE BLOCK 1: SDL 闭环步进演示 */}
      {/* ================================================================ */}

      <div className="mb-16" id="interactive-loop">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#f59e0b] font-mono tracking-wider">互动</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">SDL 闭环步进演示</h2>
        </div>
        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          贝叶斯优化在 2D 参数空间中的 7 步搜索过程。背景热图显示真实目标函数（实验中不可见）；
          绿色点为当前最优；黄色虚线圆为下一推荐点。观察模型如何从"探索未知"转向"精炼最优区域"。
        </p>
        <SDLLoopStepper />
      </div>

      {/* ================================================================ */}
      {/* Section D: SDL 核心概念 */}
      {/* ================================================================ */}

      <div id="sdl-concepts">
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

      {/* ================================================================ */}
      {/* INTERACTIVE BLOCK 2: Acquisition Function 探索器 */}
      {/* ================================================================ */}

      <div className="mt-16" id="interactive-af">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#f59e0b] font-mono tracking-wider">互动</span>
          <h2 className="text-lg font-semibold text-[#d0d4dc]">Acquisition Function 探索器</h2>
        </div>
        <p className="text-xs text-[#8a92a3] leading-relaxed mb-4 max-w-3xl">
          上图：GP 代理模型的后验均值（蓝线）与置信带（±2σ）。灰色点为已观测，绿色点为当前最优。<br />
          下图：UCB 采集函数，最大值处（黄色虚线）即为下一推荐实验点。<br />
          拖动 β 滑块，观察推荐点如何随探索–利用权衡改变。
        </p>
        <AcquisitionExplorer />
      </div>
    </div>
  );
}
