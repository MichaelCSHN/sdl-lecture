import { Link } from 'react-router';

export default function GpBoCaseBridge() {
  return (
    <section className="mb-6 rounded-2xl border border-[rgba(67,97,238,0.12)] bg-[rgba(6,22,42,0.74)] p-4">
      <div className="mb-2 text-[10px] font-mono tracking-[0.18em] text-[#8a92a3]">案例桥接（Case Bridge）</div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <div className="mb-1 text-sm font-semibold text-[#d0d4dc]">Branin 基准（benchmark）</div>
          <p className="text-xs leading-5 text-[#8a92a3]">
            适合讲随机种子敏感性、全局搜索，以及低维条件下一个“干净”的 GP 后验（posterior）应该长什么样。
          </p>
        </div>
        <div>
          <div className="mb-1 text-sm font-semibold text-[#d0d4dc]">LED 定标（LED calibration）</div>
          <p className="text-xs leading-5 text-[#8a92a3]">
            这是一个多通道工程任务，线性组合（Weighted Sum）与 Pareto 视图都能直接映射到真实操作中的权衡关系。
          </p>
        </div>
        <div>
          <div className="mb-1 text-sm font-semibold text-[#d0d4dc]">光学薄膜（Optical thin-film）</div>
          <p className="text-xs leading-5 text-[#8a92a3]">
            这是一个由模拟器驱动的设计问题，特别适合展示 hypervolume、reference point 与前沿导出（frontier export）。
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/case-studio"
          className="rounded-full border border-[rgba(0,245,212,0.24)] px-3 py-1.5 text-[11px] font-mono text-[#00f5d4] transition-colors hover:bg-[rgba(0,245,212,0.08)]"
        >
          打开案例工作台（Case Studio）
        </Link>
        <Link
          to="/led-calibration"
          className="rounded-full border border-[rgba(67,97,238,0.24)] px-3 py-1.5 text-[11px] font-mono text-[#d0d4dc] transition-colors hover:border-[rgba(0,245,212,0.24)] hover:text-[#00f5d4]"
        >
          打开 LED 定标（LED calibration）
        </Link>
      </div>
    </section>
  );
}
