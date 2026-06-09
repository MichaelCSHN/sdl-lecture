type LabMode = 'single' | 'scalarized' | 'pareto';

interface GpBoModeGuideProps {
  activeMode: LabMode;
}

const MODE_CARDS: Array<{
  id: LabMode;
  title: string;
  label: string;
  detail: string;
}> = [
  {
    id: 'single',
    title: '单目标（Single Objective）',
    label: '一个分数，一个最优点',
    detail:
      '当任务可以归结为一个单独指标，或本身就是 benchmark 目标时，使用这一模式最合适。这也是进入 GP-BO 直觉最干净的入口。',
  },
  {
    id: 'scalarized',
    title: '线性组合（Weighted Sum）',
    label: '多个指标，固定偏好',
    detail:
      '当你已经知道各指标之间的权重偏好时，使用这一模式。优化器看到的是单一标量目标，但底层观测仍然保留多目标结构。',
  },
  {
    id: 'pareto',
    title: 'Pareto 前沿（Pareto）',
    label: '多个指标，没有固定偏好',
    detail:
      '当偏好在事前并不明确时，使用这一模式。目标不再是单一最优点，而是一条非支配解前沿，这里用 hypervolume 指标跟踪其质量。',
  },
];

export default function GpBoModeGuide({ activeMode }: GpBoModeGuideProps) {
  return (
    <section className="mb-6 grid gap-3 md:grid-cols-3">
      {MODE_CARDS.map((mode) => {
        const active = mode.id === activeMode;
        return (
          <div
            key={mode.id}
            className="rounded-2xl border p-4 transition-colors"
            style={{
              borderColor: active ? 'rgba(0,245,212,0.28)' : 'rgba(67,97,238,0.12)',
              background: active ? 'rgba(0,245,212,0.08)' : 'rgba(6,22,42,0.74)',
            }}
          >
            <div className="mb-1 text-[10px] font-mono tracking-[0.12em] text-[#5a6377]">{mode.label}</div>
            <h2 className="mb-2 text-base font-semibold text-[#d0d4dc]">{mode.title}</h2>
            <p className="text-xs leading-5 text-[#8a92a3]">{mode.detail}</p>
          </div>
        );
      })}
    </section>
  );
}
