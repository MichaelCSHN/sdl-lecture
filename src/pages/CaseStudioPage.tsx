/**
 * CaseStudioPage — Two-case SDL demo.
 *
 * Case A: Branin function   — 2D mathematical benchmark, 3 global optima, SVG heatmap
 * Case B: LED Spectral Calibration — multi-channel multi-objective real-world SDL
 */

import { useState } from 'react';
import { useLecture } from '@/contexts/LectureContext';
import BraninCaseView from '@/components/BraninCaseView';
import LedCaseView from '@/components/LedCaseView';

type CaseId = 'branin' | 'led';

const CASES = [
  {
    id: 'branin' as CaseId,
    label: 'Branin 函数',
    labelEn: 'Branin Function',
    tag: '数学基准 · 2D · 3 全局最优',
    accent: '#4361ee',
    desc: '经典2D贝叶斯优化基准，三个等效全局最优。观察 BO 如何在不同 seed 下收敛到不同最优点，理解 exploration vs exploitation 的直觉。',
  },
  {
    id: 'led' as CaseId,
    label: 'LED 光谱定标',
    labelEn: 'LED Spectral Calibration',
    tag: '遥感地面定标 · 多通道 · 多目标',
    accent: '#00f5d4',
    desc: '用 400–1000 nm LED 阵列拟合地物反射光谱。高维连续参数空间（各通道强度），多目标权衡（RMSE + 成本 + 功耗 + 通道数）。',
  },
] as const;

export default function CaseStudioPage() {
  const [activeCase, setActiveCase] = useState<CaseId>('branin');
  const { isLectureMode } = useLecture();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-2">案例工作台</div>
        <h1 className="text-3xl font-semibold tracking-tight mb-3 text-[#f3f6fb]">SDL 闭环演示</h1>
        <p className="text-[#8a92a3] text-sm max-w-2xl leading-relaxed mb-6">
          两个不同层次的 SDL 案例：数学基准（验证直觉）与工程应用（感受现实复杂度）。
          所有计算在浏览器内完成，不依赖外部 API。
        </p>

        {/* Case tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          {CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(c.id)}
              className="flex-1 text-left rounded-xl border p-4 transition-all"
              style={{
                borderColor: activeCase === c.id ? c.accent : 'rgba(67,97,238,0.15)',
                background: activeCase === c.id ? `${c.accent}10` : 'rgba(255,255,255,0.01)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-semibold" style={{ color: activeCase === c.id ? c.accent : '#d0d4dc' }}>
                  {c.label}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: `${c.accent}18`, color: c.accent }}>
                  {c.labelEn}
                </span>
              </div>
              <div className="text-[10px] font-mono mb-1.5" style={{ color: activeCase === c.id ? c.accent : '#5a6377' }}>
                {c.tag}
              </div>
              <p className="text-[11px] text-[#8a92a3] leading-5">{c.desc}</p>
            </button>
          ))}
        </div>

        {/* Lecture note */}
        {isLectureMode && (
          <div className="mt-3 p-3 rounded border border-amber-800 bg-[rgba(120,53,15,0.12)]">
            <p className="text-[10px] text-amber-300 font-mono leading-relaxed">
              <strong>讲者提示：</strong>
              {activeCase === 'branin'
                ? 'Branin 有 3 个等效最优——运行 Reset 后换 seed（例如改成 7 或 123）再跑，观察收敛到不同最优点。这是讲"BO 结果依赖初始化与随机性"的最直观方式。'
                : 'LED 案例适合讲完代理模型对比后切换：先用 GP，运行 10 步，记录 RMSE；再 Reset、换 RF、同样 10 步——直接比较两个模型的收敛曲线。目标权重滑块可以现场演示"多目标定义影响优化行为"。'}
            </p>
          </div>
        )}
      </div>

      {/* Case views */}
      {activeCase === 'branin' && <BraninCaseView />}
      {activeCase === 'led'    && <LedCaseView />}
    </div>
  );
}
