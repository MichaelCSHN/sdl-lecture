/**
 * CaseStudioPage - interactive SDL case collection.
 */

import { useState } from 'react';
import { useLecture } from '@/contexts/LectureContext';
import BraninCaseView from '@/components/BraninCaseView';
import LedCaseView from '@/components/LedCaseView';
import ThinFilmCaseView from '@/components/ThinFilmCaseView';

type CaseId = 'branin' | 'led' | 'thinFilm';

const CASES = [
  {
    id: 'branin' as CaseId,
    label: 'Branin',
    labelEn: 'Branin Function',
    tag: '数学基准 / 单目标 / 线性组合 / Pareto',
    accent: '#4361ee',
    desc:
      '一个干净的 2D 基准，用来展示同一搜索空间在单目标、线性组合与 Pareto 三种任务定义下会如何表现。',
  },
  {
    id: 'led' as CaseId,
    label: 'LED 定标',
    labelEn: 'LED Spectral Calibration',
    tag: '遥感工程 / 线性组合 / Pareto / 工程权衡',
    accent: '#00f5d4',
    desc:
      '利用 400-1000 nm LED 阵列去匹配目标光谱，并同时权衡拟合质量、成本、功耗、硬件复杂度与寿命。',
  },
  {
    id: 'thinFilm' as CaseId,
    label: '光学薄膜',
    labelEn: 'Thin-Film Absorber',
    tag: '物理模拟器 / Pareto / 已支持 hypervolume',
    accent: '#ff6b6b',
    desc:
      '一个由模拟器驱动的光学设计案例：在追求带内吸收的同时，保留带外透过与厚度约束。',
  },
] as const;

export default function CaseStudioPage() {
  const [activeCase, setActiveCase] = useState<CaseId>('branin');
  const { isLectureMode } = useLecture();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-2">案例工作台（Case Studio）</div>
        <h1 className="text-3xl font-semibold tracking-tight mb-3 text-[#f3f6fb]">SDL 闭环案例演示</h1>
        <p className="text-[#8a92a3] text-sm max-w-2xl leading-relaxed mb-6">
          三个案例，共用一套优化语言：每个案例都以同样的任务模式框架呈现单目标、线性组合与 Pareto
          优化，同时保留各自不同的黑盒物理或工程背景。
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {CASES.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCase(item.id)}
              className="flex-1 text-left rounded-xl border p-4 transition-all"
              style={{
                borderColor: activeCase === item.id ? item.accent : 'rgba(67,97,238,0.15)',
                background: activeCase === item.id ? `${item.accent}10` : 'rgba(255,255,255,0.01)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: activeCase === item.id ? item.accent : '#d0d4dc' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: `${item.accent}18`, color: item.accent }}
                >
                  {item.labelEn}
                </span>
              </div>
              <div
                className="text-[10px] font-mono mb-1.5"
                style={{ color: activeCase === item.id ? item.accent : '#5a6377' }}
              >
                {item.tag}
              </div>
              <p className="text-[11px] text-[#8a92a3] leading-5">{item.desc}</p>
            </button>
          ))}
        </div>

        {isLectureMode && (
          <div className="mt-3 p-3 rounded border border-amber-800 bg-[rgba(120,53,15,0.12)]">
            <p className="text-[10px] text-amber-300 font-mono leading-relaxed">
              <strong>讲授提示（Lecture Cue）</strong>{' '}
              {activeCase === 'branin'
                ? '先在同一个案例里切换单目标、线性组合与 Pareto 模式，再讨论优化器本身。'
                : activeCase === 'led'
                  ? '固定目标光谱，再切换代理模型、权重或 Pareto 坐标轴，展示工程偏好如何改变推荐照明系统。'
                  : '用这个案例强调：即便是真实模拟器，也可以落入同一套 GP-BO 任务语言，包括 hypervolume 与前沿导出。'}
            </p>
          </div>
        )}
      </div>

      {activeCase === 'branin' && <BraninCaseView />}
      {activeCase === 'led' && <LedCaseView />}
      {activeCase === 'thinFilm' && <ThinFilmCaseView />}
    </div>
  );
}
