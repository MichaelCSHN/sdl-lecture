import LedCaseView from '@/components/LedCaseView';

export default function LedCalibrationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-3">遥感定标（Remote Sensing Calibration）</div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 text-[#f3f6fb]">
        多通道 LED 定标工作台
      </h1>
      <p className="text-[#8a92a3] text-sm mb-6 max-w-3xl">
        独立页面和案例工作台（Case Studio）现在共用同一套优化内核与交互：统一支持代理模型、采集函数、单目标、线性组合与 Pareto
        任务。
      </p>
      <LedCaseView />
    </div>
  );
}
