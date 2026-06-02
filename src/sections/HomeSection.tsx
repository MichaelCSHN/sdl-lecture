import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import CharReveal from '../components/CharReveal';

const EFFICIENCY_DATA = [
  { metric: '文献调研', traditional: 480, sdl: 60, unit: '小时' },
  { metric: '实验设计', traditional: 120, sdl: 2, unit: '小时' },
  { metric: '合成执行', traditional: 72, sdl: 4, unit: '小时/样品' },
  { metric: '表征分析', traditional: 48, sdl: 1, unit: '小时/样品' },
  { metric: '结果迭代', traditional: 336, sdl: 0.5, unit: '小时/轮' },
];

const NAV_ITEMS = [
  { id: 'background', label: '背景知识', labelEn: 'Background', num: '02' },
  { id: 'concept', label: 'SDL 核心概念', labelEn: 'Core Concepts', num: '03' },
  { id: 'casestudy', label: 'A-Lab 案例', labelEn: 'Case Study', num: '04' },
  { id: 'demos', label: '互动演示', labelEn: 'Interactive Demos', num: '05' },
  { id: 'challenges', label: '挑战与未来', labelEn: 'Challenges', num: '06' },
  { id: 'resources', label: '资源与总结', labelEn: 'Resources', num: '07' },
];

export default function HomeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(180deg, #000d1d 0%, #06162a 100%)' }}
    >
      {/* Hero area */}
      <div className="relative pt-32 pb-20 px-6">
        {/* Speaker info badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-8"
        >
          <div className="inline-flex items-center gap-3 glass-panel px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
            <span className="text-xs text-[#8a92a3] font-mono">
              2026.06 — 材料科学研究生专题讲座
            </span>
          </div>
        </motion.div>

        {/* Main title */}
        <div className="max-w-5xl mx-auto">
          <CharReveal
            text="AUTONOMOUS LABS"
            as="h1"
            className="text-[48px] md:text-[72px] font-semibold tracking-[-2px] leading-[1.05] mb-4 font-mono-title uppercase"
            delay={0.3}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-2xl md:text-3xl font-medium mb-3"
            style={{ color: '#d0d4dc' }}
          >
            自主实验室与闭环发现
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-sm md:text-base max-w-2xl leading-relaxed mb-8"
            style={{ color: '#8a92a3' }}
          >
            从试错法到算法驱动的闭环。探索 AI、机器人与高通量实验如何重塑材料科学的未来。
            以 A-Lab 为核心案例，系统讲解 SDL 的概念、技术栈与前沿进展。
          </motion.p>
        </div>

        {/* Video placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="relative aspect-video rounded-lg overflow-hidden border border-[rgba(67,97,238,0.2)] bg-[#06162a]">
            <img
              src="/assets/hero-robot-arm.jpg"
              alt="A-Lab Robot"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#00f5d4] flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-[rgba(0,245,212,0.1)] transition-colors">
                  <svg className="w-6 h-6 text-[#00f5d4] ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-xs text-[#8a92a3] font-mono">A-Lab 自主实验室运作视频</p>
                <p className="text-[10px] text-[#8a92a3]/60 font-mono mt-1">Video placeholder — to be replaced before lecture</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Efficiency comparison chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold font-mono text-[#d0d4dc]">
                  传统实验室 vs 自主实验室
                </h3>
                <p className="text-xs text-[#8a92a3] font-mono mt-1">效率对比（对数坐标，单位：小时）</p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#8a92a3]/40" />
                  <span className="text-[#8a92a3]">传统</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#00f5d4]" />
                  <span className="text-[#00f5d4]">SDL</span>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {EFFICIENCY_DATA.map((item, i) => {
                const maxVal = Math.max(...EFFICIENCY_DATA.map(d => Math.log10(d.traditional)));
                const tradWidth = (Math.log10(item.traditional) / maxVal) * 100;
                const sdlWidth = (Math.log10(Math.max(item.sdl, 0.1)) / maxVal) * 100;
                const speedup = Math.round(item.traditional / item.sdl);

                return (
                  <div
                    key={item.metric}
                    className="relative"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-xs text-[#8a92a3] font-mono text-right flex-shrink-0">
                        {item.metric}
                      </span>
                      <div className="flex-1 relative h-8 flex items-center">
                        {/* Traditional bar */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${tradWidth}%` } : {}}
                          transition={{ duration: 0.8, delay: 2 + i * 0.1 }}
                          className="absolute left-0 h-5 rounded-sm bg-[#8a92a3]/30"
                        />
                        {/* SDL bar */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${Math.max(sdlWidth, 3)}%` } : {}}
                          transition={{ duration: 0.8, delay: 2.2 + i * 0.1 }}
                          className="absolute left-0 h-5 rounded-sm bg-[#00f5d4]/70"
                        />
                        {/* Value labels */}
                        {hoveredBar === i && (
                          <div className="absolute left-0 top-6 text-[10px] font-mono z-10">
                            <span className="text-[#8a92a3]">{item.traditional}h</span>
                            <span className="text-[#8a92a3] mx-1">→</span>
                            <span className="text-[#00f5d4]">{item.sdl}h</span>
                            <span className="text-[#fee440] ml-1">({speedup}x)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-xs text-[#8a92a3] font-mono mb-4 tracking-wider">QUICK NAVIGATION</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="group glass-panel p-4 text-left hover:border-[rgba(0,245,212,0.3)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-[#00f5d4] font-mono mb-1">{item.num}</div>
                    <div className="text-sm text-[#d0d4dc] font-medium group-hover:text-[#00f5d4] transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#8a92a3] font-mono mt-0.5">{item.labelEn}</div>
                  </div>
                  <svg className="w-4 h-4 text-[#8a92a3] group-hover:text-[#00f5d4] transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="section-divider" />
    </section>
  );
}
